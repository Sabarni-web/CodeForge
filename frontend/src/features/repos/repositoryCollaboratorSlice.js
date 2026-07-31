import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  inviteUserAPI,
  acceptInvitationAPI,
  rejectInvitationAPI,
  removeCollaboratorAPI,
  transferOwnershipAPI,
  getMembersAPI
} from '../../api/repositoryCollaboratorApi';

export const inviteUser = createAsyncThunk(
  'collaborators/invite',
  async ({ repoId, username, role }, { rejectWithValue }) => {
    try {
      const { data } = await inviteUserAPI(repoId, username, role);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const acceptInvitation = createAsyncThunk(
  'collaborators/acceptInvitation',
  async (invitationId, { rejectWithValue }) => {
    try {
      const { data } = await acceptInvitationAPI(invitationId);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const rejectInvitation = createAsyncThunk(
  'collaborators/rejectInvitation',
  async (invitationId, { rejectWithValue }) => {
    try {
      const { data } = await rejectInvitationAPI(invitationId);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeCollaborator = createAsyncThunk(
  'collaborators/remove',
  async ({ repoId, userId }, { rejectWithValue }) => {
    try {
      await removeCollaboratorAPI(repoId, userId);
      return userId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const transferOwnership = createAsyncThunk(
  'collaborators/transferOwnership',
  async ({ repoId, username }, { rejectWithValue }) => {
    try {
      const { data } = await transferOwnershipAPI(repoId, username);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMembers = createAsyncThunk(
  'collaborators/fetchMembers',
  async (repoId, { rejectWithValue }) => {
    try {
      const { data } = await getMembersAPI(repoId);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  owner: null,
  collaborators: [],
  loading: false,
  error: null,
  success: false
};

const repositoryCollaboratorSlice = createSlice({
  name: 'repositoryCollaborators',
  initialState,
  reducers: {
    resetCollaboratorState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch members
      .addCase(fetchMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.owner = action.payload.owner;
        state.collaborators = action.payload.collaborators;
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Invite user
      .addCase(inviteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(inviteUser.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(inviteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Remove collaborator
      .addCase(removeCollaborator.fulfilled, (state, action) => {
        state.collaborators = state.collaborators.filter(c => c.user._id !== action.payload);
      })

      // Transfer ownership
      .addCase(transferOwnership.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(transferOwnership.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(transferOwnership.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetCollaboratorState } = repositoryCollaboratorSlice.actions;
export default repositoryCollaboratorSlice.reducer;
