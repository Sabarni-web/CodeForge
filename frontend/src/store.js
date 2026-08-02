import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import repoReducer from './features/repos/repoSlice';
import fileReducer from './features/files/fileSlice';
import aiReducer from './features/ai/aiSlice';
import uiReducer from './features/ui/uiSlice';
import userReducer from './features/users/userSlice';
import profileReducer from './features/profile/profileSlice';
import followReducer from './features/follow/followSlice';
import notificationReducer from './features/notifications/notificationSlice';
import repositoryCollaboratorReducer from './features/repos/repositoryCollaboratorSlice';
import repositoryPermissionReducer from './features/repos/repositoryPermissionSlice';
import repositorySearchReducer from './features/repos/repositorySearchSlice';
import repositorySettingsReducer from './features/repos/repositorySettingsSlice';
import forkReducer from './features/repos/forkSlice';
import forkNetworkReducer from './features/repos/forkNetworkSlice';
import forkAnalyticsReducer from './features/repos/forkAnalyticsSlice';
import syncReducer from './features/sync/syncSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    repos: repoReducer,
    files: fileReducer,
    ai: aiReducer,
    ui: uiReducer,
    users: userReducer,
    profile: profileReducer,
    follow: followReducer,
    notifications: notificationReducer,
    repositoryCollaborators: repositoryCollaboratorReducer,
    repositoryPermissions: repositoryPermissionReducer,
    repositorySearch: repositorySearchReducer,
    repositorySettings: repositorySettingsReducer,
    fork: forkReducer,
    forkNetwork: forkNetworkReducer,
    forkAnalytics: forkAnalyticsReducer,
    sync: syncReducer,
  },
  devTools: import.meta.env.DEV,
});

export default store;
