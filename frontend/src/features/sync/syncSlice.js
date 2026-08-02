import { createSlice } from '@reduxjs/toolkit';
import { compareSync, commitSync, fetchRepositoryHistory, fetchFileVersionHistory, fetchRepositoryDiff } from './syncThunks';

const initialState = {
  diff: null,
  isComparing: false,
  isSyncing: false,
  syncError: null,
  
  repoHistory: [],
  isLoadingHistory: false,
  
  fileHistory: [],
  isLoadingFileHistory: false,

  currentDiff: null,
  isLoadingDiff: false,
};

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    clearSyncState: (state) => {
      state.diff = null;
      state.syncError = null;
    },
    clearCurrentDiff: (state) => {
      state.currentDiff = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // compareSync
      .addCase(compareSync.pending, (state) => {
        state.isComparing = true;
        state.syncError = null;
      })
      .addCase(compareSync.fulfilled, (state, action) => {
        state.isComparing = false;
        state.diff = action.payload; // { added: [], modified: [], deleted: [] }
      })
      .addCase(compareSync.rejected, (state, action) => {
        state.isComparing = false;
        state.syncError = action.payload;
      })
      
      // commitSync
      .addCase(commitSync.pending, (state) => {
        state.isSyncing = true;
        state.syncError = null;
      })
      .addCase(commitSync.fulfilled, (state) => {
        state.isSyncing = false;
        state.diff = null;
      })
      .addCase(commitSync.rejected, (state, action) => {
        state.isSyncing = false;
        state.syncError = action.payload;
      })

      // repoHistory
      .addCase(fetchRepositoryHistory.pending, (state) => {
        state.isLoadingHistory = true;
      })
      .addCase(fetchRepositoryHistory.fulfilled, (state, action) => {
        state.isLoadingHistory = false;
        state.repoHistory = action.payload;
      })
      .addCase(fetchRepositoryHistory.rejected, (state) => {
        state.isLoadingHistory = false;
      })

      // fileHistory
      .addCase(fetchFileVersionHistory.pending, (state) => {
        state.isLoadingFileHistory = true;
      })
      .addCase(fetchFileVersionHistory.fulfilled, (state, action) => {
        state.isLoadingFileHistory = false;
        state.fileHistory = action.payload;
      })
      .addCase(fetchFileVersionHistory.rejected, (state) => {
        state.isLoadingFileHistory = false;
      })

      // repoDiff
      .addCase(fetchRepositoryDiff.pending, (state) => {
        state.isLoadingDiff = true;
      })
      .addCase(fetchRepositoryDiff.fulfilled, (state, action) => {
        state.isLoadingDiff = false;
        state.currentDiff = action.payload;
      })
      .addCase(fetchRepositoryDiff.rejected, (state) => {
        state.isLoadingDiff = false;
      });
  },
});

export const { clearSyncState, clearCurrentDiff } = syncSlice.actions;
export default syncSlice.reducer;
