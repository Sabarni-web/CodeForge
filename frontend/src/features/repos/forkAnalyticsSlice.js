import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

// While it's in the forks API, the backend implementation might be inside an explore or analytics controller.
// For now we assume we might need a dedicated endpoint, but in our backend plan, we didn't explicitly create it yet.
// Wait, the plan says Explore Page: Recently Forked, Most Forked.
// We can fetch from standard repository search endpoints if we modify the backend, or we can use the repository search slice.
// For now, let's just make a dummy slice or a specific endpoint if needed.
// Actually, `getRepositorySearchRoutes` in the backend could just filter by `isFork`.
// I will keep this slice simple, and we can populate it if we add the endpoint.

export const fetchTrendingForks = createAsyncThunk(
  'forkAnalytics/fetchTrending',
  async (_, thunkAPI) => {
    try {
      // Assuming we have an endpoint like this. If not, we will just use search
      const response = await api.get('/repos?isFork=true&sort=-forkCount&limit=10');
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  trendingForks: [],
  loading: false,
  error: null,
};

const forkAnalyticsSlice = createSlice({
  name: 'forkAnalytics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrendingForks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTrendingForks.fulfilled, (state, action) => {
        state.loading = false;
        state.trendingForks = action.payload.repositories || action.payload; // depending on pagination format
      })
      .addCase(fetchTrendingForks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default forkAnalyticsSlice.reducer;
