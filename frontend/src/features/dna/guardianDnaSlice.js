import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchFileDNA = createAsyncThunk(
  'guardianDna/fetchFileDNA',
  async (fileId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/file/${fileId}/dna`, {
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch File DNA');
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const guardianDnaSlice = createSlice({
  name: 'guardianDna',
  initialState: {
    fileDNA: null,
    functions: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearFileDNA: (state) => {
      state.fileDNA = null;
      state.functions = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFileDNA.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFileDNA.fulfilled, (state, action) => {
        state.loading = false;
        state.fileDNA = action.payload.fileDNA;
        state.functions = action.payload.functions;
      })
      .addCase(fetchFileDNA.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearFileDNA } = guardianDnaSlice.actions;
export default guardianDnaSlice.reducer;
