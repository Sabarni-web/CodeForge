import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig.js';

export const fetchAnalytics = createAsyncThunk(
  'guardianAnalytics/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/guardian/analytics');
      return response.data.analytics;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const guardianAnalyticsSlice = createSlice({
  name: 'guardianAnalytics',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default guardianAnalyticsSlice.reducer;
