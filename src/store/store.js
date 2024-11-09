// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from '../features/auth/authSlice';
import { modulesReducer } from '../features/modules/modulesSlice';
import { attendanceReducer } from '../features/attendance/attendanceSlice';
import { gradesReducer } from '../features/grades/gradesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    modules: modulesReducer,
    attendance: attendanceReducer,
    grades: gradesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/login/fulfilled', 'auth/register/fulfilled'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp', 'meta.arg'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user.createdAt', 'auth.user.updatedAt'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

