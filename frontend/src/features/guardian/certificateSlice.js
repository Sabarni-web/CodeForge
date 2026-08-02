import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchFileCertificate = createAsyncThunk(
  'certificate/fetchFileCertificate',
  async (fileId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/file/${fileId}/certificate`, { withCredentials: true });
      return response.data.certificate;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch certificate');
    }
  }
);

const certificateSlice = createSlice({
  name: 'certificate',
  initialState: {
    certificates: {}, // map of fileId -> certificate data
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFileCertificate.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFileCertificate.fulfilled, (state, action) => {
        state.loading = false;
        const fileId = action.meta.arg;
        state.certificates[fileId] = action.payload;
      })
      .addCase(fetchFileCertificate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default certificateSlice.reducer;
