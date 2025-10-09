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
    decreaseQuantity: (state, action) => {
      const existing = state.find((item) => item._id === action.payload._id);
      if (existing) {
        if (existing.quantity > 1) {
          existing.quantity -= 1;
        } else {
          return state.filter((item) => item._id !== action.payload._id);
        }
      }
    },
    removeFromCart: (state, action) => {
      return state.filter((item) => item._id !== action.payload._id);
    },
    clearCart: () => [],
  },
});

export const { addToCart, decreaseQuantity, removeFromCart, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
