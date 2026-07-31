import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { searchPublicReposAPI } from '../../api/repositorySearchApi';

export const searchPublicRepositories = createAsyncThunk(
  'search/publicRepos',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await searchPublicReposAPI(params);
      return data; // { repositories, total, page, totalPages }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  repositories: [],
  total: 0,
  page: 1,
  totalPages: 1,
  loading: false,
  error: null
};

const repositorySearchSlice = createSlice({
  name: 'repositorySearch',
  initialState,
  reducers: {
    clearSearchState: (state) => {
      state.repositories = [];
      state.total = 0;
      state.page = 1;
      state.totalPages = 1;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchPublicRepositories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchPublicRepositories.fulfilled, (state, action) => {
        state.loading = false;
        if (action.meta.arg.page > 1) {
          // Append for infinite scroll
          state.repositories = [...state.repositories, ...action.payload.repositories];
        } else {
          state.repositories = action.payload.repositories;
        }
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(searchPublicRepositories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearSearchState } = repositorySearchSlice.actions;
export default repositorySearchSlice.reducer;
