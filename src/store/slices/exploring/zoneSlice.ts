import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../../app/api/api';
import { defaultValue as zoneDefaultValue, type IZone } from '../../../shared/models/exploring/zone.model';

interface exploringZoneState {
  zone: IZone;
  zones: IZone[];
  modalOpen: boolean;
  loading: {
    getZones: boolean;
    getZone: boolean;
    postZone: boolean;
    putZone: boolean;
    deleteZone: boolean;
  };
  error: {
    getZones: string | null;
    getZone: string | null;
    postZone: string | null;
    putZone: string | null;
    deleteZone: string | null;
  };
}

const initialState: exploringZoneState = {
  zone: zoneDefaultValue,
  zones: [],
  modalOpen: false,
  loading: {
    getZones: false,
    getZone: false,
    postZone: false,
    putZone: false,
    deleteZone: false,
  },
  error: {
    getZones: null,
    getZone: null,
    postZone: null,
    putZone: null,
    deleteZone: null,
  },
};

export const getZones = createAsyncThunk<IZone[], void, { rejectValue: string }>(
  'api/getZones',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<IZone[]>('/zones');

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getZonesByFileName = createAsyncThunk<IZone[], string, { rejectValue: string }>(
  'api/getZonesByFileName',
  async (fileName, { rejectWithValue }) => {
    try {
      const response = await api.get<IZone[]>(`/zones/file/${fileName}`);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const postZone = createAsyncThunk<IZone, IZone, { rejectValue: string }>(
  'api/postZone',
  async (zone, { rejectWithValue }) => {
    try {
      const response = await api.post<IZone>('/zones', zone);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const deleteZone = createAsyncThunk<void, { fileName: string; id: string }, { rejectValue: string }>(
  'api/deleteZone',
  async ({ fileName, id }, { rejectWithValue }) => {
    try {
      await api.delete(`/zones/file/${fileName}/id/${id}`);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const zoneSlice = createSlice({
  name: 'zone',
  initialState,
  reducers: {
    setZone: (state, action: PayloadAction<IZone>) => {
      state.zone = action.payload;
    },
    setModalOpen: (state, action: PayloadAction<boolean>) => {
      state.modalOpen = action.payload;
    },
    reset: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // getZones
      .addCase(getZones.pending, (state) => {
        state.loading.getZones = true;
      })
      .addCase(getZones.fulfilled, (state, action) => {
        state.loading.getZones = false;
        state.zones = action.payload;
      })
      .addCase(getZones.rejected, (state, action) => {
        state.loading.getZones = false;
        state.error.getZones = action.payload || 'Failed to get zones';
      })
      // getZonesByFileName
      .addCase(getZonesByFileName.pending, (state) => {
        state.loading.getZones = true;
      })
      .addCase(getZonesByFileName.fulfilled, (state, action) => {
        state.loading.getZones = false;
        state.zones = action.payload;
      })
      .addCase(getZonesByFileName.rejected, (state, action) => {
        state.loading.getZones = false;
        state.error.getZones = action.payload || 'Failed to get zones by file name';
      })
      // postZone
      .addCase(postZone.pending, (state) => {
        state.loading.postZone = true;
      })
      .addCase(postZone.fulfilled, (state, action) => {
        state.loading.postZone = false;
        state.zone = action.payload;
        // state.zones.push(action.payload);
        state.modalOpen = true;
      })
      .addCase(postZone.rejected, (state, action) => {
        state.loading.postZone = false;
        state.error.postZone = action.payload || 'Failed to post zone';
      })
      // deleteZone
      .addCase(deleteZone.pending, (state) => {
        state.loading.deleteZone = true;
      })
      .addCase(deleteZone.fulfilled, (state, action) => {
        state.loading.deleteZone = false;
        state.zones = state.zones.filter((zone) => zone.id !== action.meta.arg.id);
      })
      .addCase(deleteZone.rejected, (state, action) => {
        state.loading.deleteZone = false;
        state.error.deleteZone = action.payload || 'Failed to delete zone';
      });
  },
});

export const { setZone, setModalOpen, reset } = zoneSlice.actions;
