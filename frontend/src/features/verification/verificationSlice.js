import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const verifyCode = createAsyncThunk(
  'verification/verifyCode',
  async ({ files, targetRepoId }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/guardian/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files, targetRepoId })
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || 'Verification failed');
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const verificationSlice = createSlice({
  name: 'verification',
  initialState: {
    loading: false,
    reportId: null,
    error: null,
    statusMessage: '',
  },
  reducers: {
    clearVerification: (state) => {
      state.loading = false;
      state.reportId = null;
      state.error = null;
      state.statusMessage = '';
    },
    setVerificationStatus: (state, action) => {
      state.statusMessage = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyCode.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.reportId = null;
        state.statusMessage = 'Starting verification...';
      })
      .addCase(verifyCode.fulfilled, (state, action) => {
        state.loading = false;
        state.reportId = action.payload.reportId;
        state.statusMessage = 'Verification completed';
      })
      .addCase(verifyCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.statusMessage = 'Verification failed';
      });
  },
});

export const { clearVerification, setVerificationStatus } = verificationSlice.actions;
export default verificationSlice.reducer;
