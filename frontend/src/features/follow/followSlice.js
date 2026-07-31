import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  sendFollowRequestAPI,
  cancelFollowRequestAPI,
  acceptFollowRequestAPI,
  rejectFollowRequestAPI,
  getFollowStatusAPI,
} from '../../api/socialApi';

export const sendFollowRequest = createAsyncThunk(
  'follow/send',
  async (receiverId, { rejectWithValue }) => {
    try {
      const { data } = await sendFollowRequestAPI(receiverId);
      return data; // { success, request }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to send follow request');
    }
  }
);

export const cancelFollowRequest = createAsyncThunk(
  'follow/cancel',
  async (requestId, { rejectWithValue }) => {
    try {
      const { data } = await cancelFollowRequestAPI(requestId);
      return data; // { success }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to cancel follow request');
    }
  }
);

export const acceptFollowRequest = createAsyncThunk(
  'follow/accept',
  async (requestId, { rejectWithValue }) => {
    try {
      const { data } = await acceptFollowRequestAPI(requestId);
      return data; // { success }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to accept follow request');
    }
  }
);

export const rejectFollowRequest = createAsyncThunk(
  'follow/reject',
  async (requestId, { rejectWithValue }) => {
    try {
      const { data } = await rejectFollowRequestAPI(requestId);
      return data; // { success }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to reject follow request');
    }
  }
);

export const fetchFollowStatus = createAsyncThunk(
  'follow/status',
  async (receiverId, { rejectWithValue }) => {
    try {
      const { data } = await getFollowStatusAPI(receiverId);
      return data; // { isFollowing, isPending, requestId }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch status');
    }
  }
);

const initialState = {
  isFollowing: false,
  isPending: false,
  requestId: null,
  loading: false,
  error: null,
};

const followSlice = createSlice({
  name: 'follow',
  initialState,
  reducers: {
    resetFollowState: (state) => {
      state.isFollowing = false;
      state.isPending = false;
      state.requestId = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Status
      .addCase(fetchFollowStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFollowStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isFollowing = action.payload.isFollowing;
        state.isPending = action.payload.isPending;
        state.requestId = action.payload.requestId;
      })
      .addCase(fetchFollowStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Send Request
      .addCase(sendFollowRequest.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendFollowRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.isPending = true;
        state.requestId = action.payload.request._id;
      })
      .addCase(sendFollowRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Cancel Request
      .addCase(cancelFollowRequest.fulfilled, (state) => {
        state.isPending = false;
        state.requestId = null;
      });
  },
});

export const { resetFollowState } = followSlice.actions;
export default followSlice.reducer;
