import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

export const compareSync = createAsyncThunk(
  'sync/compareSync',
  async ({ repoId, localFiles }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/repository/${repoId}/sync/compare`, { localFiles });
      return data.diff;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const commitSync = createAsyncThunk(
  'sync/commitSync',
  async ({ repoId, commitMessage, added, modified, deleted }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/repository/${repoId}/sync`, {
        commitMessage,
        added,
        modified,
        deleted,
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRepositoryHistory = createAsyncThunk(
  'sync/fetchRepositoryHistory',
  async (repoId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/repository/${repoId}/history`);
      return data.commits;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchFileVersionHistory = createAsyncThunk(
  'sync/fetchFileVersionHistory',
  async (fileId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/file/${fileId}/history`);
      return data.versions;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRepositoryDiff = createAsyncThunk(
  'sync/fetchRepositoryDiff',
  async ({ repoId, commitId }, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/repository/${repoId}/diff?commitId=${commitId}`);
      return data.diff;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
