import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { IPredictionResult } from '../../../shared/models/exploring/prediction-result.model';

interface predictionState {
  zoneIds: string[];
  results: Record<string, IPredictionResult[]>;
  timestamps: Record<string, string>;
}

const initialState: predictionState = {
  zoneIds: [],
  results: {},
  timestamps: {},
};

export const predictionSlice = createSlice({
  name: 'prediction',
  initialState,
  reducers: {
    addZoneId: (state, action: PayloadAction<string>) => {
      state.zoneIds.push(action.payload);
    },
    removeZoneId: (state, action: PayloadAction<string>) => {
      state.zoneIds = state.zoneIds.filter(id => id !== action.payload);
    },
    addResults: (state, action: PayloadAction<{zoneId: string, results: IPredictionResult[]}>) => {
      state.results[action.payload.zoneId] = action.payload.results;
    },
    removeResults: (state, action: PayloadAction<string>) => {
      delete state.results[action.payload];
    },
    addTimestamp: (state, action: PayloadAction<{zoneId: string, timestamp: string}>) => {
      state.timestamps[action.payload.zoneId] = action.payload.timestamp;
    },
    removeTimestamp: (state, action: PayloadAction<string>) => {
      delete state.timestamps[action.payload];
    },
    resetPredictionState: () => {
      return initialState;
    },
  }
});

export const { addResults, removeResults, addTimestamp, removeTimestamp, addZoneId, removeZoneId, resetPredictionState } = predictionSlice.actions;
