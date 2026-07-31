import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getProfileAPI,
  updateProfileSocialAPI,
  getFollowersAPI,
  getFollowingAPI,
} from '../../api/socialApi';

export const fetchProfile = createAsyncThunk(
  'profile/fetch',
  async (username, { rejectWithValue }) => {
    try {
      const { data } = await getProfileAPI(username);
      return data.profile;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch profile');
    }
  }
);

export const updateProfileSocial = createAsyncThunk(
  'profile/update',
  async (profileData, { rejectWithValue }) => {
    try {
      const { data } = await updateProfileSocialAPI(profileData);
      return data.user;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

export const fetchFollowers = createAsyncThunk(
  'profile/fetchFollowers',
  async ({ username, search, sort, page, limit }, { rejectWithValue }) => {
    try {
      const { data } = await getFollowersAPI(username, { search, sort, page, limit });
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch followers');
    }
  }
);

export const fetchFollowing = createAsyncThunk(
  'profile/fetchFollowing',
  async ({ username, search, sort, page, limit }, { rejectWithValue }) => {
    try {
      const { data } = await getFollowingAPI(username, { search, sort, page, limit });
      return data; // { following, total, page, totalPages }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch following users');
    }
  }
);

const initialState = {
  profile: null,
  followers: [],
  following: [],
  followersTotal: 0,
  followersPage: 1,
  followersTotalPages: 1,
  followingTotal: 0,
  followingPage: 1,
  followingTotalPages: 1,
  loading: false,
  followersLoading: false,
  followingLoading: false,
  error: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.profile = null;
      state.followers = [];
      state.following = [];
      state.followersTotal = 0;
      state.followersPage = 1;
      state.followersTotalPages = 1;
      state.followingTotal = 0;
      state.followingPage = 1;
      state.followingTotalPages = 1;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Profile
      .addCase(updateProfileSocial.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfileSocial.fulfilled, (state, action) => {
        state.loading = false;
        if (state.profile && state.profile._id === action.payload._id) {
          state.profile = { ...state.profile, ...action.payload };
        }
      })
      .addCase(updateProfileSocial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Followers
      .addCase(fetchFollowers.pending, (state) => {
        state.followersLoading = true;
      })
      .addCase(fetchFollowers.fulfilled, (state, action) => {
        state.followersLoading = false;
        state.followers = action.payload.followers;
        state.followersTotal = action.payload.total;
        state.followersPage = action.payload.page;
        state.followersTotalPages = action.payload.totalPages;
      })
      .addCase(fetchFollowers.rejected, (state) => {
        state.followersLoading = false;
      })

      // Fetch Following
      .addCase(fetchFollowing.pending, (state) => {
        state.followingLoading = true;
      })
      .addCase(fetchFollowing.fulfilled, (state, action) => {
        state.followingLoading = false;
        state.following = action.payload.following;
        state.followingTotal = action.payload.total;
        state.followingPage = action.payload.page;
        state.followingTotalPages = action.payload.totalPages;
      })
      .addCase(fetchFollowing.rejected, (state) => {
        state.followingLoading = false;
      });
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
