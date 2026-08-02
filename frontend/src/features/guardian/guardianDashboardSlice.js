import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchDashboard = createAsyncThunk(
  'guardianDashboard/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/guardian/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const guardianDashboardSlice = createSlice({
  name: 'guardianDashboard',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default guardianDashboardSlice.reducer;
