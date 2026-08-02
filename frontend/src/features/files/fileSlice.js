import { createSlice } from '@reduxjs/toolkit';
import { fetchFileTree, fetchFileContent, createFile, updateFile, deleteFile, fetchCommits } from './fileThunks';

const initialState = {
  tree: [],
  currentFile: null,
  commits: [],
  totalCommits: 0,
  loading: false,
  saving: false,
  error: null,
};

const fileSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    clearFileError: (state) => {
      state.error = null;
    },
    clearCurrentFile: (state) => {
      state.currentFile = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // File tree
      .addCase(fetchFileTree.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFileTree.fulfilled, (state, action) => {
        state.loading = false;
        state.tree = action.payload;
      })
      .addCase(fetchFileTree.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // File content
      .addCase(fetchFileContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFileContent.fulfilled, (state, action) => {
        state.loading = false;
        state.currentFile = action.payload;
      })
      .addCase(fetchFileContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create file
      .addCase(createFile.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createFile.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(createFile.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })

      // Update file
      .addCase(updateFile.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateFile.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(updateFile.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })

      // Delete file
      .addCase(deleteFile.fulfilled, (state) => {
        state.currentFile = null;
      })

      // Commits
      .addCase(fetchCommits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommits.fulfilled, (state, action) => {
        state.loading = false;
        state.commits = action.payload.commits;
        state.totalCommits = action.payload.total;
      })
      .addCase(fetchCommits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearFileError, clearCurrentFile } = fileSlice.actions;
export default fileSlice.reducer;
