// src/features/attendance/attendanceSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { attendanceService } from '../../services/api';

const initialState = {
  currentSession: null,
  attendanceRecords: [],
  status: 'idle',
  error: null,
};

export const createAttendanceSession = createAsyncThunk(
  'attendance/createSession',
  async (sessionData) => {
    const response = await attendanceService.createAttendance(sessionData);
    return response.data;
  }
);

export const fetchAttendanceRecords = createAsyncThunk(
  'attendance/fetchRecords',
  async (moduleId) => {
    const response = await attendanceService.getModuleAttendance(moduleId);
    return response.data;
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearAttendanceError: (state) => {
      state.error = null;
    },
    clearCurrentSession: (state) => {
      state.currentSession = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createAttendanceSession.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createAttendanceSession.fulfilled, (state, action) => {
        state.status = 'idle';
        state.currentSession = action.payload;
      })
      .addCase(createAttendanceSession.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.error.message;
      })
      .addCase(fetchAttendanceRecords.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAttendanceRecords.fulfilled, (state, action) => {
        state.status = 'idle';
        state.attendanceRecords = action.payload;
      })
      .addCase(fetchAttendanceRecords.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.error.message;
      });
  },
});

export const { clearAttendanceError, clearCurrentSession } = attendanceSlice.actions;
export const attendanceReducer = attendanceSlice.reducer;