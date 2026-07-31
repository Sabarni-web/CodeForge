import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { searchUsersAPI } from '../../api/socialApi';

export const searchUsers = createAsyncThunk(
  'users/search',
  async ({ q, page, limit }, { rejectWithValue }) => {
    try {
      const { data } = await searchUsersAPI(q, page, limit);
      return data; // { success, users, total, page, totalPages }
    } catch (error) {
      return rejectWithValue(error.message || 'Search failed');
    }
  }
);

const initialState = {
  users: [],
  total: 0,
  page: 1,
  totalPages: 1,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearSearch: (state) => {
      state.users = [];
      state.total = 0;
      state.page = 1;
      state.totalPages = 1;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSearch } = userSlice.actions;
export default userSlice.reducer;
