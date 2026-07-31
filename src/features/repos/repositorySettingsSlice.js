import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  updateSettingsAPI,
  updateVisibilityAPI,
  archiveRepoAPI,
  unarchiveRepoAPI,
  getStatisticsAPI
} from '../../api/repositorySettingsApi';

export const updateRepositorySettings = createAsyncThunk(
  'settings/update',
  async ({ repoId, settingsData }, { rejectWithValue }) => {
    try {
      const { data } = await updateSettingsAPI(repoId, settingsData);
      return data.repository;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateRepositoryVisibility = createAsyncThunk(
  'settings/visibility',
  async ({ repoId, visibility }, { rejectWithValue }) => {
    try {
      const { data } = await updateVisibilityAPI(repoId, visibility);
      return data.repository;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const archiveRepository = createAsyncThunk(
  'settings/archive',
  async (repoId, { rejectWithValue }) => {
    try {
      const { data } = await archiveRepoAPI(repoId);
      return data.repository;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const unarchiveRepository = createAsyncThunk(
  'settings/unarchive',
  async (repoId, { rejectWithValue }) => {
    try {
      const { data } = await unarchiveRepoAPI(repoId);
      return data.repository;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRepositoryStatistics = createAsyncThunk(
  'settings/statistics',
  async (repoId, { rejectWithValue }) => {
    try {
      const { data } = await getStatisticsAPI(repoId);
      return data.statistics;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  statistics: null,
  loading: false,
  error: null,
  success: false
};

const repositorySettingsSlice = createSlice({
  name: 'repositorySettings',
  initialState,
  reducers: {
    resetSettingsState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // General Settings Update
      .addCase(updateRepositorySettings.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateRepositorySettings.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(updateRepositorySettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Visibility Update
      .addCase(updateRepositoryVisibility.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateRepositoryVisibility.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(updateRepositoryVisibility.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Stats
      .addCase(fetchRepositoryStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload;
      });
  }
});

export const { resetSettingsState } = repositorySettingsSlice.actions;
export default repositorySettingsSlice.reducer;
