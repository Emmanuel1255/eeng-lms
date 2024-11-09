// src/features/grades/gradesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { gradeService } from '../../services/gradeService';

const initialState = {
  grades: {},
  statistics: null,
  status: 'idle',
  error: null,
};

export const fetchModuleGrades = createAsyncThunk(
  'grades/fetchModuleGrades',
  async (moduleId) => {
    const response = await gradeService.getModuleGrades(moduleId);
    return response.data;
  }
);

export const updateGrade = createAsyncThunk(
  'grades/updateGrade',
  async ({ moduleId, studentId, gradeData }) => {
    const response = await gradeService.updateGrade(moduleId, studentId, gradeData);
    return response.data;
  }
);

const gradesSlice = createSlice({
  name: 'grades',
  initialState,
  reducers: {
    clearGradesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchModuleGrades.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchModuleGrades.fulfilled, (state, action) => {
        state.status = 'idle';
        state.grades = action.payload;
      })
      .addCase(fetchModuleGrades.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.error.message;
      })
      .addCase(updateGrade.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateGrade.fulfilled, (state, action) => {
        state.status = 'idle';
        // Update the specific grade in the state
        state.grades = {
          ...state.grades,
          [action.payload.studentId]: action.payload.grade
        };
      })
      .addCase(updateGrade.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.error.message;
      });
  },
});

export const { clearGradesError } = gradesSlice.actions;
export const gradesReducer = gradesSlice.reducer;