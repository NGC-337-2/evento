import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import uiReducer from '../features/ui/uiSlice';
import eventsReducer from '../features/events/eventsSlice';
import bookingReducer from '../features/bookings/bookingSlice';
import userReducer from '../features/users/userSlice';
import statsReducer from '../features/stats/statsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    events: eventsReducer,
    bookings: bookingReducer,
    users: userReducer,
    stats: statsReducer,
  },

  devTools: process.env.NODE_ENV !== 'production',
});
