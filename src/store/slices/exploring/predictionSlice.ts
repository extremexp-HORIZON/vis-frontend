import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { IPredictionResult } from '../../../shared/models/exploring/prediction-result.model';

interface predictionState {
  zoneId: string;
  results: IPredictionResult[];
  timestamp: string | null;
}

const initialState: predictionState = {
  zoneId: '',
  results: [],
  timestamp: null,
};

export const predictionSlice = createSlice({
  name: 'prediction',
  initialState,
  reducers: {
    setZoneId: (state, action: PayloadAction<string>) => {
      state.zoneId = action.payload;
    },
    setResults: (state, action: PayloadAction<IPredictionResult[]>) => {
      state.results = action.payload;
    },
    setTimestamp: (state, action: PayloadAction<string>) => {
      state.timestamp = action.payload;
    },
    resetPredictionState: () => {
      return initialState;
    },
  }
});

export const { setResults, setTimestamp, setZoneId, resetPredictionState } = predictionSlice.actions;
