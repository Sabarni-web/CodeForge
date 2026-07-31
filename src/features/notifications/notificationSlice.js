import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getNotificationsAPI,
  markNotificationReadAPI,
  deleteNotificationAPI,
} from '../../api/socialApi';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getNotificationsAPI();
      return data.notifications;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch notifications');
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await markNotificationReadAPI(id);
      return data.notification;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to mark read');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (id, { rejectWithValue }) => {
    try {
      await deleteNotificationAPI(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete notification');
    }
  }
);

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotificationFromSocket: (state, action) => {
      // Avoid duplicate adds
      const exists = state.notifications.some((n) => n._id === action.payload._id);
      if (!exists) {
        state.notifications.unshift(action.payload);
        if (!action.payload.isRead) {
          state.unreadCount += 1;
        }
      }
    },
    updateNotificationFromSocket: (state, action) => {
      const idx = state.notifications.findIndex((n) => n._id === action.payload._id);
      if (idx !== -1) {
        const wasRead = state.notifications[idx].isRead;
        state.notifications[idx] = action.payload;
        if (action.payload.isRead && !wasRead && state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
      }
    },
    deleteNotificationFromSocket: (state, action) => {
      const id = action.payload._id;
      const notification = state.notifications.find((n) => n._id === id);
      if (notification) {
        if (!notification.isRead && state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
        state.notifications = state.notifications.filter((n) => n._id !== id);
      }
    },
    clearNotificationsState: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Mark Read
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const idx = state.notifications.findIndex((n) => n._id === action.payload._id);
        if (idx !== -1) {
          state.notifications[idx] = action.payload;
        }
        state.unreadCount = state.notifications.filter((n) => !n.isRead).length;
      })

      // Delete
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const id = action.payload;
        const notification = state.notifications.find((n) => n._id === id);
        if (notification && !notification.isRead && state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
        state.notifications = state.notifications.filter((n) => n._id !== id);
      });
  },
});

export const {
  addNotificationFromSocket,
  updateNotificationFromSocket,
  deleteNotificationFromSocket,
  clearNotificationsState,
} = notificationSlice.actions;
export default notificationSlice.reducer;
