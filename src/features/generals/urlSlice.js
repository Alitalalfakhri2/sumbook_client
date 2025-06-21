import { createSlice } from "@reduxjs/toolkit";

const urlSlice = createSlice({
  name:"serverUrl",
  initialState:{
    url:"https://sumbook-server.vercel.app",
  },

})

export default urlSlice.reducer;
