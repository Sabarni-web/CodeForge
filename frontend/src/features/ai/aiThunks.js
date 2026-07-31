import { createAsyncThunk } from '@reduxjs/toolkit';
import { generateSiteAPI, getMySitesAPI, getSiteByIdAPI, deleteSiteAPI } from '../../api/aiApi';

export const generateSite = createAsyncThunk(
  'ai/generateSite',
  async (promptData, { rejectWithValue }) => {
    try {
      const { data } = await generateSiteAPI(promptData);
      return data.site;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMySites = createAsyncThunk(
  'ai/fetchMySites',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getMySitesAPI();
      return data.sites;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSiteById = createAsyncThunk(
  'ai/fetchSiteById',
  async (siteId, { rejectWithValue }) => {
    try {
      const { data } = await getSiteByIdAPI(siteId);
      return data.site;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteSite = createAsyncThunk(
  'ai/deleteSite',
  async (siteId, { rejectWithValue }) => {
    try {
      await deleteSiteAPI(siteId);
      return siteId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
