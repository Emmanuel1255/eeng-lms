// src/features/modules/modulesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { moduleService } from '../../services/api';

const initialState = {
  modules: [],
  currentModule: null,
  status: 'idle',
  error: null,
};

export const fetchModules = createAsyncThunk(
  'modules/fetchModules',
  async () => {
    const response = await moduleService.getLecturerModules();
    return response.data;
  }
);

export const fetchModuleById = createAsyncThunk(
  'modules/fetchModuleById',
  async (moduleId) => {
    const response = await moduleService.getModuleById(moduleId);
    return response.data;
  }
);

const modulesSlice = createSlice({
  name: 'modules',
  initialState,
  reducers: {
    clearModuleError: (state) => {
      state.error = null;
    },
    clearCurrentModule: (state) => {
      state.currentModule = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchModules.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchModules.fulfilled, (state, action) => {
        state.status = 'idle';
        state.modules = action.payload;
      })
      .addCase(fetchModules.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.error.message;
      })
      .addCase(fetchModuleById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchModuleById.fulfilled, (state, action) => {
        state.status = 'idle';
        state.currentModule = action.payload;
      })
      .addCase(fetchModuleById.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.error.message;
      });
  },
});

export const { clearModuleError, clearCurrentModule } = modulesSlice.actions;
export const modulesReducer = modulesSlice.reducer;