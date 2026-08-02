import { createSlice } from '@reduxjs/toolkit';
import { fetchBranches, createBranch, renameBranch, deleteBranch, mergeBranch } from './branchThunks';

const initialState = {
  branches: [],
  currentBranch: 'main',
  loading: false,
  error: null,
};

const branchSlice = createSlice({
  name: 'branches',
  initialState,
  reducers: {
    setCurrentBranch: (state, action) => {
      state.currentBranch = action.payload;
    },
    clearBranches: (state) => {
      state.branches = [];
      state.currentBranch = 'main';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranches.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = action.payload;
      })
      .addCase(fetchBranches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.branches.unshift(action.payload);
        state.currentBranch = action.payload.name;
      })
      .addCase(createBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(renameBranch.fulfilled, (state, action) => {
        const { oldName, newName, branch } = action.payload;
        const index = state.branches.findIndex(b => b.name === oldName);
        if (index !== -1) {
          state.branches[index] = branch;
        }
        if (state.currentBranch === oldName) {
          state.currentBranch = newName;
        }
      })
      .addCase(deleteBranch.fulfilled, (state, action) => {
        const branchName = action.payload;
        state.branches = state.branches.filter(b => b.name !== branchName);
        if (state.currentBranch === branchName) {
          state.currentBranch = 'main';
        }
      })
      .addCase(mergeBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(mergeBranch.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(mergeBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setCurrentBranch, clearBranches } = branchSlice.actions;
export default branchSlice.reducer;
