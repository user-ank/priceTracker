import atexit
import traceback
import asyncio
import psycopg2 as pg
from app.product.scrapers import Scraper
from datetime import datetime
import uuid
from app.creds import DATABASE_URL
import time


class Tracker:
    def __init__(self) -> None:
        # create scraper object
        self.scraper = Scraper()

        # connect to db
        try:
            self.conn = pg.connect(DATABASE_URL)
        except Exception:
            traceback.print_exc()

        # register a clean up function to be called on exit
        atexit.register(self.free_resources)

    def free_resources(self):
        # close the connection to db
        self.conn.close()
        print('closed the connection to db..')

    async def scrape_all_urls(self, urls):
        start = time.perf_counter()
        tasks = []
        for url in urls:
            task = asyncio.create_task(self.scraper.scrape_price(url))
            tasks.append(task)

        print(f'Started scraping price for {len(urls)} urls..')
        prices = await asyncio.gather(*tasks)

        end = time.perf_counter()
        print(
            f'Finished scraping price for {len(urls)} urls in {end - start} seconds...')
        return prices

    async def track_price(self):
        print(f'Started tracking price at {datetime.now()} ....')
        start = time.time()
        # First fetch the data from db
        cursor = self.conn.cursor()
        cursor.execute(
            'SELECT id, current_price, product_link FROM "Products"')
        urls, old_prices, ids = [], [], []
        for row in cursor.fetchall():
            id, price, url = row
            ids.append(id)
            urls.append(url)
            old_prices.append(price)

        # Scrape the new price and update in db if new price is not equal to old price
        batch_size = 8
        cursor = self.conn.cursor()

        i = 0
        while i < len(urls):
            urls_batch = urls[i: i + batch_size]
            # print(urls_batch)
            new_prices = await self.scrape_all_urls(urls=urls_batch)
            for j in range(i, i + len(urls_batch)):
                if new_prices[j - i] is not None and new_prices[j - i] != old_prices[j]:
                    formatted_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

                    try:
                        cursor.execute(
                            'INSERT INTO "PriceAlter" ("id", "price", "date", "productsId") VALUES (%s, %s, %s, %s)', (str(uuid.uuid4()), str(new_prices[j - i]), str(formatted_time), str(ids[j]),))
                    except Exception as e:
                        print(
                            f'Error occured while inserting data to PriceAlter. {e}')
                        # handle the error
                        pass

                    try:
                        cursor.execute(
                            'UPDATE "Products" SET current_price = %s WHERE id = %s',
                            (str(new_prices[j - i]), str(ids[j]),))
                    except Exception as e:
                        print(
                            f'Error occured while updating Products. {e}')
                        # handle the error
                        pass

            i += batch_size
        self.conn.commit()

        cursor.close()

        end = time.time()
        print(f'Finished tracking at {datetime.now()} ...')
        print(f'Total time taken {end - start} seconds...')
