import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/forks';

export const forkRepository = createAsyncThunk(
  'fork/forkRepository',
  async (repoId, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/${repoId}/fork`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchUserForks = createAsyncThunk(
  'fork/fetchUserForks',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/user`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchRepositoryForks = createAsyncThunk(
  'fork/fetchRepositoryForks',
  async (repoId, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/${repoId}/forks`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const checkIsFork = createAsyncThunk(
  'fork/checkIsFork',
  async (repoId, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/${repoId}/is-fork`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  forks: [],
  userForks: [],
  isForkStatus: null,
  loading: false,
  error: null,
};

const forkSlice = createSlice({
  name: 'fork',
  initialState,
  reducers: {
    clearForkError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fork Repository
      .addCase(forkRepository.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forkRepository.fulfilled, (state, action) => {
        state.loading = false;
        state.userForks.unshift(action.payload.repository);
      })
      .addCase(forkRepository.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch User Forks
      .addCase(fetchUserForks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserForks.fulfilled, (state, action) => {
        state.loading = false;
        state.userForks = action.payload;
      })
      .addCase(fetchUserForks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Repo Forks
      .addCase(fetchRepositoryForks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRepositoryForks.fulfilled, (state, action) => {
        state.loading = false;
        state.forks = action.payload;
      })
      .addCase(fetchRepositoryForks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Check Is Fork
      .addCase(checkIsFork.fulfilled, (state, action) => {
        state.isForkStatus = action.payload;
      });
  },
});

export const { clearForkError } = forkSlice.actions;
export default forkSlice.reducer;
