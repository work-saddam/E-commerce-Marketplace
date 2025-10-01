import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: [],
  reducers: {
    addToCart: (state, action) => {
      const existing = state.find((item) => item._id === action.payload._id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.push({ ...action.payload, quantity: 1 });
      }
    },
    removeFromCart: (state, action) => {
      const existing = state.find((item) => item._id === action.payload._id);
      if (existing) {
        existing.quantity -= 1;
        if (existing.quantity <= 0) {
          return state.filter((item) => item._id !== action.payload._id);
        }
      }
    },
  },
});

export const { addToCart, removeFromCart } = cartSlice.actions;
export default cartSlice.reducer;
