import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "user", // Named "user" for selector compatibility
  initialState: {
    user: null,
    loading: false,
  },
  reducers: {
    addUser: (state, action) => {
      state.user = action.payload;
      state.loading = false;
    },
    removeUser: (state) => {
      state.user = null;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { addUser, removeUser, setLoading } = authSlice.actions;
export default authSlice.reducer;
