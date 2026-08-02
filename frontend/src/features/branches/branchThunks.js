import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig.js';

export const fetchBranches = createAsyncThunk(
  'branches/fetchBranches',
  async (repoId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/repos/${repoId}/branches`);
      return response.data.branches;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch branches');
    }
  }
);

export const createBranch = createAsyncThunk(
  'branches/createBranch',
  async ({ repoId, name, sourceBranch }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/repos/${repoId}/branches`, { name, sourceBranch });
      return response.data.branch;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create branch');
    }
  }
);

export const renameBranch = createAsyncThunk(
  'branches/renameBranch',
  async ({ repoId, branchName, newName }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/repos/${repoId}/branches/${branchName}`, { newName });
      return { oldName: branchName, newName, branch: response.data.branch };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to rename branch');
    }
  }
);

export const deleteBranch = createAsyncThunk(
  'branches/deleteBranch',
  async ({ repoId, branchName }, { rejectWithValue }) => {
    try {
      await api.delete(`/repos/${repoId}/branches/${branchName}`);
      return branchName;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete branch');
    }
  }
);

export const mergeBranch = createAsyncThunk(
  'branches/mergeBranch',
  async ({ repoId, branchName }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/repos/${repoId}/branches/${branchName}/merge`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to merge branch');
    }
  }
);
