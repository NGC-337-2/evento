import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

const initialState = {
  events: [],
  event: null, // Single selected event
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  },
  filters: {
      keyword: '',
      category: '',
      sortBy: 'newest'
  }
};

// Get events
export const getEvents = createAsyncThunk('events/getAll', async (searchParams = {}, thunkAPI) => {
  try {
    // searchParams could be { page: 1, keyword: 'concert', category: 'music' }
    const params = new URLSearchParams(searchParams);
    const response = await axiosClient.get(`/events?${params.toString()}`);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Get single event by id
export const getEventById = createAsyncThunk('events/getById', async (id, thunkAPI) => {
    try {
      const response = await axiosClient.get(`/events/${id}`);
      return response.data;
    } catch (error) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
});

export const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    resetEventsState: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = '';
      state.event = null;
    },
    setFilters: (state, action) => {
        state.filters = { ...state.filters, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      // Get All Events
      .addCase(getEvents.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.events = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get Single Event
      .addCase(getEventById.pending, (state) => {
        state.isLoading = true;
        state.event = null; // clear previous
      })
      .addCase(getEventById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.event = action.payload.data;
      })
      .addCase(getEventById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetEventsState, setFilters } = eventsSlice.actions;
export default eventsSlice.reducer;
