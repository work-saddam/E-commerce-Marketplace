import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../../features/auth/store/authSlice";

const rootReducer = combineReducers({
  user: authReducer,
  // Add other features (e.g. cart, products) as they are built
});

export default rootReducer;
