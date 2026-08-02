import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchRepositoryDNA = createAsyncThunk(
  'repositoryDna/fetchRepositoryDNA',
  async (repoId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/repository/${repoId}/dna`, {
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch Repository DNA');
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const repositoryDnaSlice = createSlice({
  name: 'repositoryDna',
  initialState: {
    repositoryDNA: null,
    filesProtected: 0,
    verificationReady: false,
    loading: false,
    error: null,
  },
  reducers: {
    clearRepositoryDNA: (state) => {
      state.repositoryDNA = null;
      state.filesProtected = 0;
      state.verificationReady = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRepositoryDNA.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRepositoryDNA.fulfilled, (state, action) => {
        state.loading = false;
        state.repositoryDNA = action.payload.repositoryDNA;
        state.filesProtected = action.payload.filesProtected;
        state.verificationReady = action.payload.verificationReady;
      })
      .addCase(fetchRepositoryDNA.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearRepositoryDNA } = repositoryDnaSlice.actions;
export default repositoryDnaSlice.reducer;
