import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

const initialState = {
  bookings: [],
  booking: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Create booking (checkout)
export const createBooking = createAsyncThunk(
  'bookings/create',
  async (bookingData, thunkAPI) => {
    try {
      const response = await axiosClient.post('/bookings', bookingData);
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

// Get my bookings
export const getMyBookings = createAsyncThunk(
  'bookings/getMy',
  async (_, thunkAPI) => {
    try {
      const response = await axiosClient.get('/bookings');
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

// Get all bookings (Admin)
export const getAllBookings = createAsyncThunk(
  'bookings/getAll',
  async (_, thunkAPI) => {
    try {
      const response = await axiosClient.get('/bookings/admin/all');
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

// Cancel booking
export const cancelBooking = createAsyncThunk(
  'bookings/cancel',
  async (id, thunkAPI) => {
    try {
      const response = await axiosClient.put(`/bookings/${id}/cancel`);
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

export const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    resetBookingState: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Redirect logic handled in component
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getMyBookings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.bookings = action.payload.data;
      })
      .addCase(getMyBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getAllBookings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.bookings = action.payload.data;
      })
      .addCase(getAllBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.bookings = state.bookings.map((booking) =>
          booking._id === action.payload.data._id
            ? action.payload.data
            : booking
        );
      });
  },
});

export const { resetBookingState } = bookingSlice.actions;
export default bookingSlice.reducer;
