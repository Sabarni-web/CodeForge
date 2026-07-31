import { createAsyncThunk } from '@reduxjs/toolkit';
import { getUserReposAPI, createRepoAPI, deleteRepoAPI, getRepoByIdAPI, toggleStarAPI } from '../../api/repoApi';

export const fetchUserRepos = createAsyncThunk(
  'repos/fetchUserRepos',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getUserReposAPI();
      return data.repositories;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createRepo = createAsyncThunk(
  'repos/createRepo',
  async (repoData, { rejectWithValue }) => {
    try {
      const { data } = await createRepoAPI(repoData);
      return data.repository;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteRepo = createAsyncThunk(
  'repos/deleteRepo',
  async (repoId, { rejectWithValue }) => {
    try {
      await deleteRepoAPI(repoId);
      return repoId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRepoById = createAsyncThunk(
  'repos/fetchRepoById',
  async (repoId, { rejectWithValue }) => {
    try {
      const { data } = await getRepoByIdAPI(repoId);
      return data.repository;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleStar = createAsyncThunk(
  'repos/toggleStar',
  async (repoId, { rejectWithValue }) => {
    try {
      const { data } = await toggleStarAPI(repoId);
      return { repoId, starred: data.starred, starCount: data.starCount };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
