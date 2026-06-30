import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../../features/auth/store/authSlice";
import cartReducer from "../../features/cart/store/cartSlice";

const rootReducer = combineReducers({
  user: authReducer,
  cart: cartReducer,
});

export default rootReducer;
