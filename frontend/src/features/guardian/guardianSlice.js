import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const enableGuardian = createAsyncThunk(
  'guardian/enable',
  async (repoId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/repository/${repoId}/guardian/enable`, {}, { withCredentials: true });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to enable Guardian');
    }
  }
);

export const disableGuardian = createAsyncThunk(
  'guardian/disable',
  async (repoId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/repository/${repoId}/guardian/disable`, {}, { withCredentials: true });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to disable Guardian');
    }
  }
);

export const fetchGuardianStatus = createAsyncThunk(
  'guardian/fetchStatus',
  async (repoId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/repository/${repoId}/guardian/status`, { withCredentials: true });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch Guardian status');
    }
  }
);

const guardianSlice = createSlice({
  name: 'guardian',
  initialState: {
    status: {}, // map of repoId -> status
    loading: false,
    error: null,
  },
  reducers: {
    setGuardianStatus: (state, action) => {
      const { repoId, enabled } = action.payload;
      if (!state.status[repoId]) {
        state.status[repoId] = {};
      }
      state.status[repoId].guardianEnabled = enabled;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGuardianStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGuardianStatus.fulfilled, (state, action) => {
        state.loading = false;
        // The action.meta.arg contains the repoId passed to the thunk
        const repoId = action.meta.arg;
        state.status[repoId] = action.payload;
      })
      .addCase(fetchGuardianStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(enableGuardian.fulfilled, (state, action) => {
        const repoId = action.meta.arg;
        if (!state.status[repoId]) state.status[repoId] = {};
        state.status[repoId].guardianEnabled = true;
      })
      .addCase(disableGuardian.fulfilled, (state, action) => {
        const repoId = action.meta.arg;
        if (!state.status[repoId]) state.status[repoId] = {};
        state.status[repoId].guardianEnabled = false;
      });
  }
});

export const { setGuardianStatus } = guardianSlice.actions;
export default guardianSlice.reducer;
