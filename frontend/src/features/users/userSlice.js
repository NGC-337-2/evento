import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

const initialState = {
  users: [],
  userProfile: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Get all users (Admin only)
export const getAllUsers = createAsyncThunk('users/getAll', async (_, thunkAPI) => {
  try {
    const response = await axiosClient.get('/users');
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Delete user (Admin only)
export const deleteUser = createAsyncThunk('users/delete', async (id, thunkAPI) => {
  try {
    const response = await axiosClient.delete(`/users/${id}`);
    return { id, message: response.data.message };
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Update user profile
export const updateProfile = createAsyncThunk('users/updateProfile', async (userData, thunkAPI) => {
  try {
    const response = await axiosClient.put(`/users/${userData.id}`, userData);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

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
        state.users = state.users.filter((user) => user._id !== action.payload.id);
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.userProfile = action.payload.data;
      });
  },
});

export const { resetUserState } = userSlice.actions;
export default userSlice.reducer;
