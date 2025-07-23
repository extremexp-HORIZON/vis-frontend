import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { IUnivariateDataPoint } from '../../../shared/models/exploring/univariate-datapoint.model';
import type { RootState } from '../../store';
import type { ITimeSeriesDataResponse } from '../../../shared/models/exploring/time-series-data-response.model';
import { exeucuteTimeSeriesQuery } from './datasetSlice';
import type { AppStartListening } from '../../listenerMiddleware';

interface TimeSeriesState {
  data: IUnivariateDataPoint[] | null;
  frequency: number;
  loading: boolean;
  measureCol: string | null;
}

const initialState: TimeSeriesState = {
  data: null,
  frequency: 900,
  loading: false,
  measureCol: null,
};

export const updateTimeSeries = createAsyncThunk(
  'timeSeries/updateTimeSeries',
  async (_, thunkApi) => {
    const state = thunkApi.getState() as RootState;

    const { drawnRect } = state.map;
    const { frequency, measureCol } = state.timeSeries;
    const { timeRange, categoricalFilters } = state.dataset;
    // const datasetId = Object.keys(state.api.queries).find((key) => key.startsWith('getDataset('));
    const datasetId = state.dataset.dataset.id;

    if (datasetId && drawnRect) {
      if (!measureCol)
        thunkApi.dispatch(setMeasureCol(state.chart.measureCol!));
      const timeSeriesBody = {
        from: timeRange.from,
        to: timeRange.to,
        measureCol: measureCol || state.chart.measureCol,
        frequency,
        rect: drawnRect,
        categoricalFilters,
      };

      const action = await thunkApi.dispatch(
        exeucuteTimeSeriesQuery({
          id: datasetId,
          body: timeSeriesBody,
        }),
      );

      if (exeucuteTimeSeriesQuery.fulfilled.match(action)) {
        const result = action.payload as ITimeSeriesDataResponse;

        return result.timeSeriesPoints;
      } else {
        // Handle error
        return thunkApi.rejectWithValue('TimeSeries Query failed');
      }
    }

    return [];
  },
);

export const timeSeriesSlice = createSlice({
  name: 'timeSeries',
  initialState,
  reducers: {
    resetTimeSeriesState: () => {
      return initialState;
    },
    setFrequency: (state, action: PayloadAction<number>) => {
      state.frequency = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setMeasureCol: (state, action: PayloadAction<string>) => {
      state.measureCol = action.payload;
    },
    triggerTimeSeriesUpdate: () => {
      // No-op reducer: just used to trigger side effects via listeners
    },
  },
  extraReducers: builder => {
    builder.addCase(updateTimeSeries.pending, state => {
      state.loading = true;
    });
    builder.addCase(updateTimeSeries.fulfilled, (state, action) => {
      state.data = action.payload;
      state.loading = false;
    });
    builder.addCase(updateTimeSeries.rejected, (state, action) => {
      state.loading = false;
      console.log('rejected state', state);
      console.log('Rejection reason:', action.error);
    });
  },
});

export const timeSeriesListeners = (startAppListening: AppStartListening) => {
  startAppListening({
    actionCreator: triggerTimeSeriesUpdate,
    effect: async (_, { dispatch }) => {
      dispatch(updateTimeSeries());
    },
  });
};

export const {
  resetTimeSeriesState,
  setFrequency,
  setLoading,
  setMeasureCol,
  triggerTimeSeriesUpdate,
} = timeSeriesSlice.actions;
