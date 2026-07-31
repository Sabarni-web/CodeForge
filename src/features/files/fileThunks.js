import { createAsyncThunk } from '@reduxjs/toolkit';
import { getFileTreeAPI, getFileContentAPI, createFileAPI, updateFileAPI, deleteFileAPI, getCommitsAPI, uploadBulkFilesAPI } from '../../api/fileApi';

export const fetchFileTree = createAsyncThunk(
  'files/fetchFileTree',
  async (repoId, { rejectWithValue }) => {
    try {
      const { data } = await getFileTreeAPI(repoId);
      return data.tree;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchFileContent = createAsyncThunk(
  'files/fetchFileContent',
  async ({ repoId, fileId }, { rejectWithValue }) => {
    try {
      const { data } = await getFileContentAPI(repoId, fileId);
      return data.file;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createFile = createAsyncThunk(
  'files/createFile',
  async ({ repoId, fileData }, { rejectWithValue }) => {
    try {
      const { data } = await createFileAPI(repoId, fileData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const uploadBulkFiles = createAsyncThunk(
  'files/uploadBulkFiles',
  async ({ repoId, files }, { rejectWithValue }) => {
    try {
      const { data } = await uploadBulkFilesAPI(repoId, files);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateFile = createAsyncThunk(
  'files/updateFile',
  async ({ repoId, fileId, content, commitMessage }, { rejectWithValue }) => {
    try {
      const { data } = await updateFileAPI(repoId, fileId, { content, commitMessage });
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteFile = createAsyncThunk(
  'files/deleteFile',
  async ({ repoId, fileId }, { rejectWithValue }) => {
    try {
      await deleteFileAPI(repoId, fileId);
      return fileId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCommits = createAsyncThunk(
  'files/fetchCommits',
  async ({ repoId, page = 1 }, { rejectWithValue }) => {
    try {
      const { data } = await getCommitsAPI(repoId, page);
      return { commits: data.commits, total: data.total };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
