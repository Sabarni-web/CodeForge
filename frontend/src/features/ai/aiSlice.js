import { createSlice } from '@reduxjs/toolkit';
import { generateSite, fetchMySites, deleteSite, fetchSiteById } from './aiThunks';

const initialState = {
  sites: [],
  currentSite: null,
  generatedHtml: null,
  loading: false,
  generating: false,
  error: null,
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearAiError: (state) => {
      state.error = null;
    },
    clearGeneratedHtml: (state) => {
      state.generatedHtml = null;
      state.currentSite = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Generate site
      .addCase(generateSite.pending, (state) => {
        state.generating = true;
        state.error = null;
        state.generatedHtml = null;
      })
      .addCase(generateSite.fulfilled, (state, action) => {
        state.generating = false;
        state.currentSite = action.payload;
        state.generatedHtml = action.payload.html;
      })
      .addCase(generateSite.rejected, (state, action) => {
        state.generating = false;
        state.error = action.payload;
      })

      // Fetch my sites
      .addCase(fetchMySites.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMySites.fulfilled, (state, action) => {
        state.loading = false;
        state.sites = action.payload;
      })
      .addCase(fetchMySites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch single site
      .addCase(fetchSiteById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSiteById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSite = action.payload;
        state.generatedHtml = action.payload.html;
      })
      .addCase(fetchSiteById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete site
      .addCase(deleteSite.fulfilled, (state, action) => {
        state.sites = state.sites.filter((s) => s._id !== action.payload);
      });
  },
});

export const { clearAiError, clearGeneratedHtml } = aiSlice.actions;
export default aiSlice.reducer;
