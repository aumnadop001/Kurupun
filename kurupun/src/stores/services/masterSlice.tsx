import { createSlice } from '@reduxjs/toolkit';


const initialState = {
  masters: [],  // เก็บข้อมูล master
};

const masterSlice = createSlice({
  name: 'master',
  initialState,
  reducers: {
    setMasters: (state, action) => {
      state.masters = action.payload.masters;
    },
    clearMasters: (state) => {
      state.masters = [];
    },
  },
});

export const { setMasters, clearMasters } = masterSlice.actions;
export default masterSlice.reducer;