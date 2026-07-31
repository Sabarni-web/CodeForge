import { createSlice } from '@reduxjs/toolkit';
import { fetchUserRepos, createRepo, deleteRepo, fetchRepoById, toggleStar } from './repoThunks';

const initialState = {
  repositories: [],
  currentRepo: null,
  loading: false,
  error: null,
};

const repoSlice = createSlice({
  name: 'repos',
  initialState,
  reducers: {
    clearRepoError: (state) => {
      state.error = null;
    },
    clearCurrentRepo: (state) => {
      state.currentRepo = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user repos
      .addCase(fetchUserRepos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserRepos.fulfilled, (state, action) => {
        state.loading = false;
        state.repositories = action.payload;
      })
      .addCase(fetchUserRepos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create repo
      .addCase(createRepo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRepo.fulfilled, (state, action) => {
        state.loading = false;
        state.repositories.unshift(action.payload);
      })
      .addCase(createRepo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete repo
      .addCase(deleteRepo.fulfilled, (state, action) => {
        state.repositories = state.repositories.filter((r) => r._id !== action.payload);
      })

      // Fetch single repo
      .addCase(fetchRepoById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRepoById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRepo = action.payload;
      })
      .addCase(fetchRepoById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Toggle star
      .addCase(toggleStar.fulfilled, (state, action) => {
        if (state.currentRepo && state.currentRepo._id === action.payload.repoId) {
          state.currentRepo.starred = action.payload.starred;
          state.currentRepo.stars = action.payload.starred
            ? [...(state.currentRepo.stars || []), 'temp']
            : (state.currentRepo.stars || []).slice(0, -1);
        }
      });
  },
});

export const { clearRepoError, clearCurrentRepo } = repoSlice.actions;
export default repoSlice.reducer;
