import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

// Get user from localStorage
const userStr = localStorage.getItem('evento_user');
const user = (userStr && userStr !== 'undefined') ? JSON.parse(userStr) : null;
const token = localStorage.getItem('evento_token');

const initialState = {
  user: user,
  token: token,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};


// Register user
export const register = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try {
    const response = await axiosClient.post('/auth/register', userData);
    if (response.data && response.data.data) {
      localStorage.setItem('evento_user', JSON.stringify(response.data.data.user));
      localStorage.setItem('evento_token', response.data.data.token);
    }

    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Login user
export const login = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
  try {
    const response = await axiosClient.post('/auth/login', userData);
    if (response.data && response.data.data) {
      localStorage.setItem('evento_user', JSON.stringify(response.data.data.user));
      localStorage.setItem('evento_token', response.data.data.token);
    }

    return response.data;
  } catch (error) {

    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Logout user
export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('evento_user');
  localStorage.removeItem('evento_token');
});



export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.data.user;
        state.token = action.payload.data.token;
      })


      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.data.user;
        state.token = action.payload.data.token;
      })


      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;
