import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/forks';

export const fetchRepositoryNetwork = createAsyncThunk(
  'forkNetwork/fetchRepositoryNetwork',
  async (repoId, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/${repoId}/network`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchUpstreamRepository = createAsyncThunk(
  'forkNetwork/fetchUpstreamRepository',
  async (repoId, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/${repoId}/upstream`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  network: [],
  upstream: null,
  loading: false,
  error: null,
};

const forkNetworkSlice = createSlice({
  name: 'forkNetwork',
  initialState,
  reducers: {
    clearNetworkData: (state) => {
      state.network = [];
      state.upstream = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Network
      .addCase(fetchRepositoryNetwork.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRepositoryNetwork.fulfilled, (state, action) => {
        state.loading = false;
        state.network = action.payload;
      })
      .addCase(fetchRepositoryNetwork.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Upstream
      .addCase(fetchUpstreamRepository.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchUpstreamRepository.fulfilled, (state, action) => {
        state.upstream = action.payload;
      })
      .addCase(fetchUpstreamRepository.rejected, (state, action) => {
        state.upstream = null;
      });
  },
});

export const { clearNetworkData } = forkNetworkSlice.actions;
export default forkNetworkSlice.reducer;
