import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchVerificationReport = createAsyncThunk(
  'guardianReport/fetchReport',
  async (reportId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/guardian/report/${reportId}`);
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch report');
      }
      return data.report;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const guardianReportSlice = createSlice({
  name: 'guardianReport',
  initialState: {
    report: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearReport: (state) => {
      state.report = null;
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVerificationReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVerificationReport.fulfilled, (state, action) => {
        state.loading = false;
        state.report = action.payload;
      })
      .addCase(fetchVerificationReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReport } = guardianReportSlice.actions;
export default guardianReportSlice.reducer;
