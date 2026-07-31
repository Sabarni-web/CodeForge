import { createSlice } from '@reduxjs/toolkit';
import { fetchMembers } from './repositoryCollaboratorSlice';
import { fetchRepoById } from './repoThunks';

const initialState = {
  role: null,
  isOwner: false,
  isMaintainer: false,
  isContributor: false,
  isViewer: false
};

const repositoryPermissionSlice = createSlice({
  name: 'repositoryPermissions',
  initialState,
  reducers: {
    clearPermissions: () => initialState,
    setPermissions: (state, action) => {
      const { user, repo, collaborators } = action.payload;
      if (!user || !repo) {
        return initialState;
      }

      const userId = user._id;

      if (repo.owner && (repo.owner._id === userId || repo.owner === userId)) {
        state.role = 'Owner';
        state.isOwner = true;
        state.isMaintainer = true;
        state.isContributor = true;
        state.isViewer = true;
        return;
      }

      // Find accepted collaborator entry
      const collab = collaborators?.find(c => c.user._id === userId && c.status === 'Accepted');
      if (collab) {
        state.role = collab.role;
        state.isOwner = false;
        state.isMaintainer = collab.role === 'Maintainer';
        state.isContributor = ['Maintainer', 'Contributor'].includes(collab.role);
        state.isViewer = ['Maintainer', 'Contributor', 'Viewer'].includes(collab.role);
      } else {
        // If public repository and not collaborator, user has Viewer access (read-only)
        const visibilityStr = repo.visibility || (repo.isPrivate ? 'private' : 'public');
        if (visibilityStr === 'public') {
          state.role = 'Viewer';
          state.isOwner = false;
          state.isMaintainer = false;
          state.isContributor = false;
          state.isViewer = true;
        } else {
          return initialState;
        }
      }
    }
  },
  extraReducers: (builder) => {
    // Automatically set permissions when members list is fetched
    builder.addCase(fetchMembers.fulfilled, (state, action) => {
      // Handled reactively in components or inside this builder if we pass user
    });
  }
});

export const { clearPermissions, setPermissions } = repositoryPermissionSlice.actions;
export default repositoryPermissionSlice.reducer;
