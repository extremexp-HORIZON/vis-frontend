import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../../app/api/api';
import {
  type IDataset,
  defaultValue as datasetDefaultValue,
} from '../../../shared/models/exploring/dataset.model';
import {
  type ITimeRange,
  defaultValue as timeRangeDefaultValue,
} from '../../../shared/models/exploring/time-range.model';
import { IDataSource } from '../../../shared/models/dataexploration.model';
import { setChartType, setGroupByCols, setMeasureCol } from './chartSlice';
import { setViewRect, updateClusters } from './mapSlice';
import { AppStartListening } from '../../listenerMiddleware';
import { IVisQueryResults } from '../../../shared/models/exploring/vis-query-results.model';
import { updateAnalysisResults } from './statsSlice';

interface exploringDatasetState {
  dataset: IDataset;
  datasets: IDataset[];
  row: string[];
  categoricalFilters: Record<string, unknown>;
  timeRange: ITimeRange;
  loading: {
    getDatasets: boolean;
    getDataset: boolean;
    getRow: boolean;
    postFileMeta: boolean;
    executeQuery: boolean;
    exeucuteTimeSeriesQuery: boolean;
  };
  error: {
    getDatasets: string | null;
    getDataset: string | null;
    getRow: string | null;
    postFileMeta: string | null;
    executeQuery: string | null;
    exeucuteTimeSeriesQuery: string | null;
  };
}

const initialState: exploringDatasetState = {
  dataset: datasetDefaultValue,
  datasets: [],
  row: [],
  categoricalFilters: {},
  timeRange: timeRangeDefaultValue,
  loading: {
    getDatasets: false,
    getDataset: false,
    getRow: false,
    postFileMeta: false,
    executeQuery: false,
    exeucuteTimeSeriesQuery: false,
  },
  error: {
    getDatasets: null,
    getDataset: null,
    getRow: null,
    postFileMeta: null,
    executeQuery: null,
    exeucuteTimeSeriesQuery: null,
  },
};

export const getRow = createAsyncThunk<
  string[],
  { datasetId: string; rowId: string },
  { rejectValue: string }
>('api/getRow', async ({ datasetId, rowId }, { rejectWithValue }) => {
  try {
    const response = await api.get<string[]>(
      `/data/fetch/${datasetId}/row/${rowId}`,
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

// postFileMeta
export const postFileMeta = createAsyncThunk<
  IDataset,
  { body: IDataSource },
  { rejectValue: string; dispatch: any }
>('api/postFileMeta', async ({ body }, { dispatch, rejectWithValue }) => {
  try {
    const response = await api.post<IDataset>(`/data/meta`, body);
    const dataset = response.data;

    dispatch(setGroupByCols([dataset.dimensions?.[0] ?? 'defaultDimension']));
    dispatch(setMeasureCol(dataset.measure0 ?? 'defaultMeasure0'));
    dispatch(
      setViewRect({
        lat: [dataset.queryYMin ?? 0, dataset.queryYMax ?? 0],
        lon: [dataset.queryXMin ?? 0, dataset.queryXMax ?? 0],
      }),
    );
    dispatch(setChartType('column'));
    dispatch(setTimeRange({ from: dataset.timeMin ?? 0, to: Date.now() }));

    return { ...dataset, id: body.fileName };
  } catch (error: any) {
    console.error('Error on postFileMeta', error);
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

// executeQuery
export const executeQuery = createAsyncThunk<
  unknown,
  { id: string; body: unknown },
  { rejectValue: string }
>('api/executeQuery', async ({ id, body }, { rejectWithValue }) => {
  try {
    const response = await api.post(`/data/fetch`, {
      ...(body || {}),
      dataSource: {
        sourceType: 'local',
        format: 'rawvis',
        source: `/opt/experiments/${id}/dataset/${id}.csv`,
        fileName: id,
      },
      dataType: 'map',
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

// exeucuteTimeSeriesQuery
export const exeucuteTimeSeriesQuery = createAsyncThunk<
  unknown,
  { id: string; body: unknown },
  { rejectValue: string }
>('api/exeucuteTimeSeriesQuery', async ({ id, body }, { rejectWithValue }) => {
  try {
    const response = await api.post(`/data/fetch`, {
      ...(body || {}),
      dataSource: {
        sourceType: 'local',
        format: 'rawvis',
        source: `/opt/experiments/${id}/dataset/${id}.csv`,
        fileName: id,
      },
      dataType: 'timeseries',
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const datasetSlice = createSlice({
  name: 'exploringDatasetSlice',
  initialState,
  reducers: {
    setCategoricalFilters: (
      state,
      action: PayloadAction<Record<string, unknown>>,
    ) => {
      state.categoricalFilters = action.payload;
    },
    setTimeRange: (state, action: PayloadAction<ITimeRange>) => {
      state.timeRange = action.payload;
    },
    triggerDatasetUiUpdate: () => {
      // No-op reducer: just used to trigger side effects via listeners
    },
  },
  extraReducers: builder => {
    // getRow
    builder
      .addCase(getRow.pending, state => {
        state.loading.getRow = true;
        state.error.getRow = null;
      })
      .addCase(getRow.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.loading.getRow = false;
        state.row = action.payload;
        // The result of getRow is not directly stored in the state, it's typically used ad-hoc.
      })
      .addCase(
        getRow.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading.getRow = false;
          state.error.getRow = action.payload || 'Failed to fetch row';
        },
      );

    // postFileMeta
    builder
      .addCase(postFileMeta.pending, state => {
        state.loading.postFileMeta = true;
        state.error.postFileMeta = null;
      })
      .addCase(
        postFileMeta.fulfilled,
        (state, action: PayloadAction<IDataset>) => {
          state.loading.postFileMeta = false;
          // You might want to add the new dataset to the datasets array or update it
          // For now, just set it as the selected dataset if applicable
          state.dataset = action.payload;
        },
      )
      .addCase(
        postFileMeta.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading.postFileMeta = false;
          state.error.postFileMeta =
            action.payload || 'Failed to post file metadata';
        },
      );

    // executeQuery
    builder
      .addCase(executeQuery.pending, state => {
        state.loading.executeQuery = true;
        state.error.executeQuery = null;
      })
      .addCase(executeQuery.fulfilled, state => {
        state.loading.executeQuery = false;
        // The result of executeQuery is not directly stored in the state, typically handled by other slices
      })
      .addCase(
        executeQuery.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading.executeQuery = false;
          state.error.executeQuery =
            action.payload || 'Failed to execute query';
        },
      );

    // exeucuteTimeSeriesQuery
    builder
      .addCase(exeucuteTimeSeriesQuery.pending, state => {
        state.loading.exeucuteTimeSeriesQuery = true;
        state.error.exeucuteTimeSeriesQuery = null;
      })
      .addCase(exeucuteTimeSeriesQuery.fulfilled, state => {
        state.loading.exeucuteTimeSeriesQuery = false;
        // The result of exeucuteTimeSeriesQuery is not directly stored in the state, typically handled by other slices
      })
      .addCase(
        exeucuteTimeSeriesQuery.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading.exeucuteTimeSeriesQuery = false;
          state.error.exeucuteTimeSeriesQuery =
            action.payload || 'Failed to execute time series query';
        },
      );
  },
});

export const datasetUiListeners = (startAppListening: AppStartListening) => {
  startAppListening({
    actionCreator: triggerDatasetUiUpdate,
    effect: async (_, { dispatch, getState }) => {
      const state = getState();
      const dataset = state.dataset;
      const datasetId = dataset.dataset.id;

      if (datasetId && state.dataset.timeRange.from != 0) {
        // Check if timeRange.from is initial value to not trigger updates
        const queryBody = {
          categoricalFilters: state.dataset.categoricalFilters,
          aggType: state.chart.aggType,
          groupByCols: state.chart.groupByCols,
          measureCol: state.chart.measureCol,
          rect: state.map.drawnRect || state.map.viewRect,
        };

        try {
          await dispatch(updateClusters(datasetId));
          if (state.map.drawnRect) {
            // dispatch(updateTimeSeries());
          }
        } catch (error) {
          console.error(
            'Error executingQuery after triggerDatasetUiUpdate:',
            error,
          );
        }
      }
    },
  });
};

export const { setCategoricalFilters, setTimeRange, triggerDatasetUiUpdate } =
  datasetSlice.actions;
