import { createSlice } from "@reduxjs/toolkit";

const urlSlice = createSlice({
  name:"serverUrl",
  initialState:{
    url:"https://c5d09a34-a349-452a-9793-8770b639ec47-00-kz54gc95g93g.pike.replit.dev:3000",
  },

})

export default urlSlice.reducer;
