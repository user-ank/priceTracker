import { createSlice } from "@reduxjs/toolkit";
import {
  clearLcoalCache,
  getItemFromLocalCache,
  setItemInLocalCache,
} from "../cache/localStorage";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userInfo: getItemFromLocalCache("userInfo"),
    isLoggedIn: getItemFromLocalCache("isLoggedIn") === null ? false : true,
    isPending: false,
    isErrors: false,
    errorMessage: {
      authForms: "",
    },
    allProducts: [],
  },
  reducers: {
    AuthStart: (state) => {
      state.isPending = true;
    },
    AuthSuccess: (state, action) => {
      state.isPending = false;
      state.userInfo = action.payload;
      state.isLoggedIn = true;
      setItemInLocalCache("userInfo", action.payload);
      setItemInLocalCache("isLoggedIn", true);
    },
    AuthError: (state, action) => {
      state.isErrors = true;
      state.isPending = false;
      state.errorMessage.authForms = action.payload.data.message;
    },
    SignOutStart: (state) => {
      state.isErrors = false;
      state.isPending = true;
    },
    SignOutSuccess: (state, action) => {
      state.isErrors = false;
      state.isPending = false;
      state.userInfo = null;
      state.isLoggedIn = false;
      clearLcoalCache();
    },
    SignOutError: (state) => {
      state.isErrors = true;
      state.isPending = false;
    },
    MeStart: (state) => {
      state.isPending = true;
    },
    MeSuccess: (state, action) => {
      state.isPending = false;
      state.isLoggedIn = true;
      state.isErrors = false;
      state.userInfo = action.payload;
      setItemInLocalCache("userInfo", action.payload);
      setItemInLocalCache("isLoggedIn", true);
    },
    MeError: (state, action) => {
      state.userInfo = null;
      state.isLoggedIn = false;
      state.isPending = false;
      clearLcoalCache();
    },
    AddProductStart: (state) => {
      state.isPending = true;
      state.addproductSuccess = false;
      state.addproductError = false;
      state.addproductErrorMessage = "";
    },
    AddProductSuccess: (state, action) => {
      state.isErrors = false;
      state.isPending = false;
      state.allProducts.unshift(action.payload);
      state.addproductSuccess = true;
    },
    AddProductError: (state, action) => {
      state.isErrors = true;
      state.isPending = false;
      state.addproductError = true;
      state.addproductErrorMessage = action.payload.data.message;
    },
    fetchAllProductsStart: (state) => {
      state.isPending = true;
    },
    fetchAllProductsSuccess: (state, action) => {
      state.isErrors = false;
      state.isPending = false;
      state.allProducts = action.payload;
    },
    fetchAllProductsError: (state, action) => {
      state.isErrors = true;
      state.isPending = false;
    },
    profilePicUploadSuccess: (state, action) => {
      state.isErrors = false;
      state.userInfo.profile_pic = action.payload;
    },
    removeAddProductStatus: (state) => {
      state.addproductError = false;
      state.addproductSuccess = false;
      state.addproductErrorMessage = "";
    },
  },
});
export const {
  AuthStart,
  AuthSuccess,
  AuthError,
  SignOutError,
  SignOutStart,
  SignOutSuccess,
  MeStart,
  MeSuccess,
  MeError,
  AddProductError,
  AddProductStart,
  removeAddProductStatus,
  AddProductSuccess,
  fetchAllProductsError,
  fetchAllProductsStart,
  fetchAllProductsSuccess,
  profilePicUploadSuccess,
} = userSlice.actions;
export const selectUser = (state) => state.user.userInfo;
export const UserState = (state) => state.user;

export default userSlice.reducer;
