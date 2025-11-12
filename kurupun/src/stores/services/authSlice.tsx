// src/redux/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,  // เก็บข้อมูล user
  accessToken: null, // เก็บ JWT token
  refreshToken: null,
  isLoggedIn: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      console.log('here ->', action.payload);

      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isLoggedIn = true;
    },
    profileLogin: (state, action) => {
      state.user = action.payload.user;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isLoggedIn = false;
    },
  },
});

export const { loginSuccess, profileLogin, logout } = authSlice.actions;
export default authSlice.reducer;
