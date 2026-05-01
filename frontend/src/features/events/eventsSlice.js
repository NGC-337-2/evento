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
    pages: 0,
  },
  filters: {
    keyword: '',
    category: '',
    sortBy: 'newest',
  },
};

// Get events
export const getEvents = createAsyncThunk(
  'events/getAll',
  async (searchParams = {}, thunkAPI) => {
    try {
      // searchParams could be { page: 1, keyword: 'concert', category: 'music' }
      const params = new URLSearchParams(searchParams);
      const response = await axiosClient.get(`/events?${params.toString()}`);
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

// Get single event by id
export const getEventById = createAsyncThunk(
  'events/getById',
  async (id, thunkAPI) => {
    try {
      const response = await axiosClient.get(`/events/${id}`);
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

// Create event
export const createEvent = createAsyncThunk(
  'events/create',
  async (eventData, thunkAPI) => {
    try {
      // eventData should be FormData for image upload
      const response = await axiosClient.post('/events', eventData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
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

// Update event
export const updateEvent = createAsyncThunk(
  'events/update',
  async ({ id, eventData }, thunkAPI) => {
    try {
      const response = await axiosClient.put(`/events/${id}`, eventData);
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

// Delete event
export const deleteEvent = createAsyncThunk(
  'events/delete',
  async (id, thunkAPI) => {
    try {
      const response = await axiosClient.delete(`/events/${id}`);
      return { id, message: response.data.message };
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
    },
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
      })
      // Create Event
      .addCase(createEvent.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.events.unshift(action.payload.data);
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update Event
      .addCase(updateEvent.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.event = action.payload.data;
        state.events = state.events.map((ev) =>
          ev._id === action.payload.data._id ? action.payload.data : ev
        );
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete Event
      .addCase(deleteEvent.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.events = state.events.filter(
          (ev) => ev._id !== action.payload.id
        );
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetEventsState, setFilters } = eventsSlice.actions;
export default eventsSlice.reducer;
