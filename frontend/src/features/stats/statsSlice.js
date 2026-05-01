import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

const initialState = {
  adminStats: null,
  organizerStats: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Get Admin Stats
export const getAdminStats = createAsyncThunk(
  'stats/getAdmin',
  async (_, thunkAPI) => {
    try {
      const response = await axiosClient.get('/stats/dashboard');
      return response.data;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    resetStatsState: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAdminStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAdminStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.adminStats = action.payload.data;
      })
      .addCase(getAdminStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetStatsState } = statsSlice.actions;
export default statsSlice.reducer;
