import { createAsyncThunk } from '@reduxjs/toolkit';
import { getFileTreeAPI, getFileContentAPI, createFileAPI, updateFileAPI, deleteFileAPI, getCommitsAPI, uploadBulkFilesAPI } from '../../api/fileApi';

export const fetchFileTree = createAsyncThunk(
  'files/fetchFileTree',
  async ({ repoId, branch = 'main' }, { rejectWithValue }) => {
    try {
      const { data } = await getFileTreeAPI(repoId, branch);
      return data.tree;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchFileContent = createAsyncThunk(
  'files/fetchFileContent',
  async ({ repoId, fileId, branch = 'main' }, { rejectWithValue }) => {
    try {
      const { data } = await getFileContentAPI(repoId, fileId, branch);
      return data.file;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createFile = createAsyncThunk(
  'files/createFile',
  async ({ repoId, fileData, branch = 'main' }, { rejectWithValue }) => {
    try {
      const { data } = await createFileAPI(repoId, { ...fileData, branch });
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const uploadBulkFiles = createAsyncThunk(
  'files/uploadBulkFiles',
  async ({ repoId, files, branch = 'main' }, { rejectWithValue }) => {
    try {
      const { data } = await uploadBulkFilesAPI(repoId, files, branch);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateFile = createAsyncThunk(
  'files/updateFile',
  async ({ repoId, fileId, content, commitMessage, branch = 'main' }, { rejectWithValue }) => {
    try {
      const { data } = await updateFileAPI(repoId, fileId, { content, commitMessage, branch });
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteFile = createAsyncThunk(
  'files/deleteFile',
  async ({ repoId, fileId, branch = 'main' }, { rejectWithValue }) => {
    try {
      await deleteFileAPI(repoId, fileId, branch);
      return fileId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCommits = createAsyncThunk(
  'files/fetchCommits',
  async ({ repoId, page = 1, branch = 'main' }, { rejectWithValue }) => {
    try {
      const { data } = await getCommitsAPI(repoId, page, branch);
      return { commits: data.commits, total: data.total };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
