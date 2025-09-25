import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { IPredictionResult } from '../../../shared/models/exploring/prediction-result.model';

interface predictionState {
  predictionDisplay: boolean;
  zoneIds: string[];
  results: Record<string, IPredictionResult[]>;
  timestamps: Record<string, string>;
  intervals: Record<string, number>;
}

const initialState: predictionState = {
  predictionDisplay: false,
  zoneIds: [],
  results: {},
  timestamps: {},
  intervals: {},
};

export const predictionSlice = createSlice({
  name: 'prediction',
  initialState,
  reducers: {
    setPredictionDisplay: (state, action: PayloadAction<boolean>) => {
      state.predictionDisplay = action.payload;
    },
    addZoneId: (state, action: PayloadAction<string>) => {
      state.zoneIds.push(action.payload);
    },
    removeZoneId: (state, action: PayloadAction<string>) => {
      state.zoneIds = state.zoneIds.filter(id => id !== action.payload);
    },
    addResults: (
      state,
      action: PayloadAction<{ zoneId: string; results: IPredictionResult[] }>,
    ) => {
      state.results[action.payload.zoneId] = action.payload.results;
    },
    removeResults: (state, action: PayloadAction<string>) => {
      delete state.results[action.payload];
    },
    addTimestamp: (
      state,
      action: PayloadAction<{ zoneId: string; timestamp: string }>,
    ) => {
      state.timestamps[action.payload.zoneId] = action.payload.timestamp;
    },
    removeTimestamp: (state, action: PayloadAction<string>) => {
      delete state.timestamps[action.payload];
    },
    addIntervals: (
      state,
      action: PayloadAction<{ zoneId: string; intervals: number }>,
    ) => {
      state.intervals[action.payload.zoneId] = action.payload.intervals;
    },
    removeIntervals: (state, action: PayloadAction<string>) => {
      delete state.intervals[action.payload];
    },
    resetPredictionState: () => {
      return initialState;
    },
  },
});

export const {
  setPredictionDisplay,
  addResults,
  removeResults,
  addTimestamp,
  removeTimestamp,
  addZoneId,
  removeZoneId,
  addIntervals,
  removeIntervals,
  resetPredictionState,
} = predictionSlice.actions;
