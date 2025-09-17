import type { PayloadAction, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../../app/api/api';
import {
  defaultValue as zoneDefaultValue,
  type IZone,
} from '../../../shared/models/exploring/zone.model';
import { showError, showInfo, showSuccess } from '../../../shared/utils/toast';
import type { AppStartListening } from '../../listenerMiddleware';
import { setDrawnRect } from './mapSlice';
import ngeohash from 'ngeohash';
import { type RootState } from '../../store';
import { fetchColumnsValues } from './datasetSlice';
import type { IDataset } from '../../../shared/models/exploring/dataset.model';
import type { IRectangle } from '../../../shared/models/exploring/rectangle.model';

/**
 * Fetches height/altitude values for a dataset within a specified rectangle
 * @param dataset - The dataset to fetch heights from
 * @param rectangle - The geographical rectangle to filter data
 * @param dispatch - Redux dispatch function
 * @returns Promise<number[] | undefined> - Array of heights or undefined if no height column found
 */
export const fetchHeightsForDataset = async (
  dataset: IDataset,
  rectangle: IRectangle,
  dispatch: ThunkDispatch<unknown, unknown, UnknownAction>,
): Promise<number[] | undefined> => {
  // Dynamically determine the altitude/height column name
  const altitudeColumn = dataset.originalColumns?.find(
    column =>
      column.name.toLowerCase() === 'height' ||
      column.name.toLowerCase() === 'altitude',
  )?.name;

  if (!altitudeColumn) {
    return undefined;
  }

  const response = await dispatch(
    fetchColumnsValues({
      datasetId: dataset.id!,
      columnNames: [altitudeColumn],
      rectangle: rectangle,
      latCol: dataset.originalColumns?.find(column =>
        column.name.toLowerCase().includes('lat'),
      )?.name,
      lonCol: dataset.originalColumns?.find(column =>
        column.name.toLowerCase().includes('lon'),
      )?.name,
    }),
  );

  if (
    response.payload &&
    typeof response.payload === 'object' &&
    altitudeColumn in response.payload
  ) {
    return (response.payload[altitudeColumn] as number[]) || [];
  }

  return undefined;
};

interface exploringZoneState {
  zone: IZone;
  viewZone: IZone;
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
  viewZone: zoneDefaultValue,
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

export const getZones = createAsyncThunk<
  IZone[],
  void,
  { rejectValue: string }
>('api/getZones', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<IZone[]>('/zones');

    return response.data;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return rejectWithValue(errorMessage);
  }
});

export const getZonesByFileName = createAsyncThunk<
  IZone[],
  string,
  { rejectValue: string }
>('api/getZonesByFileName', async (fileName, { rejectWithValue }) => {
  try {
    const response = await api.get<IZone[]>(`/zones/file/${fileName}`);

    return response.data;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return rejectWithValue(errorMessage);
  }
});

export const postZone = createAsyncThunk<IZone, IZone, { rejectValue: string }>(
  'api/postZone',
  async (zone, { getState, dispatch, rejectWithValue }) => {
    const { dataset } = getState() as RootState;

    try {
      const includedGeohashes = zone.rectangle
        ? ngeohash.bboxes(
          zone.rectangle.lat[0],
          zone.rectangle.lon[0],
          zone.rectangle.lat[1],
          zone.rectangle.lon[1],
          9,
        )
        : [];

      const heights = await fetchHeightsForDataset(
        dataset.dataset,
        zone.rectangle!,
        dispatch,
      );

      const response = await api.post<IZone>('/zones', {
        ...zone,
        geohashes: includedGeohashes,
        heights,
      });

      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      return rejectWithValue(errorMessage);
    }
  },
);

export const deleteZone = createAsyncThunk<
  void,
  { fileName: string; id: string },
  { rejectValue: string }
>('api/deleteZone', async ({ fileName, id }, { rejectWithValue }) => {
  try {
    await api.delete(`/zones/file/${fileName}/id/${id}`);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return rejectWithValue(errorMessage);
  }
});

export const zoneSlice = createSlice({
  name: 'zone',
  initialState,
  reducers: {
    setZone: (state, action: PayloadAction<IZone>) => {
      state.zone = action.payload;
    },
    setViewZone: (state, action: PayloadAction<IZone>) => {
      state.viewZone = action.payload;
    },
    setModalOpen: (state, action: PayloadAction<boolean>) => {
      state.modalOpen = action.payload;
    },
    resetZoneState: () => {
      return initialState;
    },
  },
  extraReducers: builder => {
    builder
      // getZones
      .addCase(getZones.pending, state => {
        state.loading.getZones = true;
      })
      .addCase(getZones.fulfilled, (state, action) => {
        state.loading.getZones = false;
        state.zones = action.payload;
      })
      .addCase(getZones.rejected, (state, action) => {
        state.loading.getZones = false;
        state.error.getZones = action.payload || 'Failed to get zones';
        showError(action.payload || 'Failed to get zones');
      })
      // getZonesByFileName
      .addCase(getZonesByFileName.pending, state => {
        state.loading.getZones = true;
      })
      .addCase(getZonesByFileName.fulfilled, (state, action) => {
        state.loading.getZones = false;
        state.zones = action.payload;
      })
      .addCase(getZonesByFileName.rejected, (state, action) => {
        state.loading.getZones = false;
        state.error.getZones =
          action.payload || 'Failed to get zones by file name';
        showError(action.payload || 'Failed to get zones by file name');
      })
      // postZone
      .addCase(postZone.pending, state => {
        state.loading.postZone = true;
        showInfo('Creating zone...');
      })
      .addCase(postZone.fulfilled, (state, action) => {
        state.loading.postZone = false;
        state.zone = action.payload;
        state.viewZone = action.payload;
        // state.zones.push(action.payload);
        state.modalOpen = true;
        showSuccess('Zone created successfully!');
      })
      .addCase(postZone.rejected, (state, action) => {
        state.loading.postZone = false;
        state.error.postZone = action.payload || 'Failed to post zone';
        showError(action.payload || 'Failed to post zone');
      })
      // deleteZone
      .addCase(deleteZone.pending, state => {
        state.loading.deleteZone = true;
      })
      .addCase(deleteZone.fulfilled, (state, action) => {
        state.loading.deleteZone = false;
        state.zones = state.zones.filter(
          zone => zone.id !== action.meta.arg.id,
        );
        showSuccess('Zone deleted successfully!');
      })
      .addCase(deleteZone.rejected, (state, action) => {
        state.loading.deleteZone = false;
        state.error.deleteZone = action.payload || 'Failed to delete zone';
        showError(action.payload || 'Failed to delete zone');
      });
  },
});

export const zoneListeners = (startAppListening: AppStartListening) => {
  // setViewZoneListener
  startAppListening({
    actionCreator: setViewZone,
    effect: async (action, { dispatch }) => {
      const { rectangle, fileName } = action.payload;

      if (rectangle && fileName) {
        const bounds = {
          south: rectangle.lat[0],
          west: rectangle.lon[0],
          north: rectangle.lat[1],
          east: rectangle.lon[1],
        };

        dispatch(setDrawnRect({ id: fileName, bounds }));
      }
    },
  });
};

export const { setZone, setViewZone, setModalOpen, resetZoneState } = zoneSlice.actions;
