import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

const initialState = {
  users: [],
  userProfile: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
  savedEvents: [],
};

// Get all users (Admin only)
export const getAllUsers = createAsyncThunk(
  'users/getAll',
  async (_, thunkAPI) => {
    try {
      const response = await axiosClient.get('/users');
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

// Delete user (Admin only)
export const deleteUser = createAsyncThunk(
  'users/delete',
  async (id, thunkAPI) => {
    try {
      const response = await axiosClient.delete(`/users/${id}`);
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

// Update user profile
export const updateProfile = createAsyncThunk(
  'users/updateProfile',
  async (userData, thunkAPI) => {
    try {
      const response = await axiosClient.put(`/users/${userData.id}`, userData);
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

// Toggle Save Event
export const toggleSaveEvent = createAsyncThunk(
  'users/toggleSaveEvent',
  async (eventId, thunkAPI) => {
    try {
      const response = await axiosClient.patch(`/users/save-event/${eventId}`);
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

// Get Saved Events
export const getSavedEvents = createAsyncThunk(
  'users/getSavedEvents',
  async (_, thunkAPI) => {
    try {
      const response = await axiosClient.get('/users/saved-events');
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

// Update Password
export const updatePassword = createAsyncThunk(
  'users/updatePassword',
  async (passwordData, thunkAPI) => {
    try {
      const response = await axiosClient.put(
        `/users/${passwordData.id}/password`,
        passwordData
      );
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

export const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    resetUserState: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.users = action.payload.data;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(
          (user) => user._id !== action.payload.id
        );
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.userProfile = action.payload.data;
      })
      .addCase(getSavedEvents.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSavedEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.savedEvents = action.payload.data;
      })
      .addCase(getSavedEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(toggleSaveEvent.fulfilled, (state, action) => {
        // If we are in the saved events view, we might want to update the list
        // But usually we just update the auth user's savedEvents array if it's there
        // or just refetch. For now, let's just update the savedEvents if it matches
        state.isSuccess = true;
      });
  },
});

export const { resetUserState } = userSlice.actions;
export default userSlice.reducer;
