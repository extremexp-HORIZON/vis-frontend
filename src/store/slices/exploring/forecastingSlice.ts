import { v4 as uuidV4 } from 'uuid';
import { api } from '../../../app/api/api';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IForecastingResults } from '../../../shared/models/exploring/forecasting-results.model';
import {
  IForecastingForm,
  IModel,
  IForecastingDefault,
} from '../../../shared/models/exploring/forecasting.model';
import { RootState } from '../../store';

interface ForecastingState {
  isInTrainStepper: boolean;
  forecastingForm: IForecastingForm;
  loading: boolean;
  newTrain: boolean;
  predictions: any[];
  results: IForecastingResults | null;
  savedModels: IModel[];
}

const initialState: ForecastingState = {
  isInTrainStepper: false,
  forecastingForm: IForecastingDefault,
  loading: false,
  newTrain: false,
  predictions: [],
  results: null,
  savedModels: [],
};

export const startTraining = createAsyncThunk(
  'forecasting/startTraining',
  async (_, thunkApi) => {
    const state = thunkApi.getState() as RootState;

    const id = uuidV4();
    localStorage.setItem('id', id);
    const { data } = state.timeSeries;
    const { forecastingForm } = state.forecasting;
    const config = JSON.stringify(forecastingForm);

    // TODO: Add endpoint to backend
    const response = await api.post(
      '/forecasting/train',
      {
        id,
        config,
        dataPoints: data,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (response.status !== 200) {
      throw new Error('Failed to start training');
    }

    const result = response.data;
    thunkApi.dispatch(setResults(result));
    return result;
  },
);

export const forecastingSlice = createSlice({
  name: 'forecasting',
  initialState,
  reducers: {
    deleteModel: (state, action: PayloadAction<string>) => {
      state.savedModels = state.savedModels.filter(
        model => model['model_name'] !== action.payload,
      );
    },
    saveModel: (state, action: PayloadAction<IModel>) => {
      state.savedModels = [...state.savedModels, action.payload];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setForecastingForm: (state, action: PayloadAction<IForecastingForm>) => {
      state.forecastingForm = action.payload;
    },
    setNewTrain: (state, action: PayloadAction<boolean>) => {
      state.newTrain = action.payload;
    },
    setResults: (state, action: PayloadAction<IForecastingResults | null>) => {
      state.results = action.payload;
    },
    setPredictions: (state, action: PayloadAction<unknown[]>) => {
      state.predictions = action.payload;
    },
    setIsInTrainStepper: (state, action: PayloadAction<boolean>) => {
      state.isInTrainStepper = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(startTraining.pending, state =>
      console.log('Started Training: ', state.forecastingForm),
    );
    builder.addCase(startTraining.fulfilled, state =>
      console.log('Finished Training: ', state),
    );
    builder.addCase(startTraining.rejected, (state, action) =>
      console.log('Error on Training: ', state, action.error),
    );
  },
});

export const {
  deleteModel,
  saveModel,
  setLoading,
  setForecastingForm,
  setNewTrain,
  setResults,
  setPredictions,
  setIsInTrainStepper,
} = forecastingSlice.actions;
