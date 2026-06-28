import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [], // Array of { _id, quantity }
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const payload = action.payload;
      // Extract ID and quantity supporting raw IDs, objects with _id, or full product objects
      const _id = typeof payload === "string" ? payload : (payload?._id || payload?.id);
      const quantity = payload?.quantity || 1;

      if (!_id) return;

      const existingItem = state.items.find((item) => item._id === _id);

      if (!existingItem) {
        state.items.push({ _id, quantity });
      } else {
        existingItem.quantity += quantity;
      }
    },
    removeFromCart: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter((item) => item._id !== id);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find((item) => item._id === id);
      
      if (existingItem) {
        if (quantity <= 0) {
          state.items = state.items.filter((item) => item._id !== id);
        } else {
          existingItem.quantity = quantity;
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
