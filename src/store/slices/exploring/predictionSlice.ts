import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { IPredictionResult } from '../../../shared/models/exploring/prediction-result.model';
import type { AppStartListening } from '../../listenerMiddleware';
import type { RootState } from '../../store';
import { setZone } from './zoneSlice';

interface predictionState {
  predictionDisplay: boolean;
  zoneIds: string[];
  results: Record<string, IPredictionResult[]>;
  timestamps: Record<string, string>;
  intervals: Record<string, number>;
  // Timeline control state
  selectedTimeIndex: number; // 0-based index for 10-min intervals
  selectedHeight: number | null; // selected height value (10, 20, 30, etc.)
  selectedZoneId: string | null; // selected zone for timeline display
}

const initialState: predictionState = {
  predictionDisplay: false,
  zoneIds: [],
  results: {},
  timestamps: {},
  intervals: {},
  selectedTimeIndex: 0,
  selectedHeight: null,
  selectedZoneId: null,
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
    setSelectedTimeIndex: (state, action: PayloadAction<number>) => {
      state.selectedTimeIndex = action.payload;
    },
    setSelectedHeight: (state, action: PayloadAction<number | null>) => {
      state.selectedHeight = action.payload;
    },
    setSelectedZoneId: (state, action: PayloadAction<string | null>) => {
      state.selectedZoneId = action.payload;
    },
    resetPredictionState: () => {
      return initialState;
    },
  },
});

export const predictionListeners = (startAppListening: AppStartListening) => {
  // setSelectedZoneIdListener
  startAppListening({
    actionCreator: setSelectedZoneId,
    effect: async (action, { dispatch, getState }) => {
      const state = getState() as RootState;
      const { zone, zones } = state.zone;

      const aux = zones.find(zone => zone.id === action.payload);

      if (aux && zone.id !== aux.id) {
        dispatch(setZone(aux));
      }
    },
  });
};

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
  setSelectedTimeIndex,
  setSelectedHeight,
  setSelectedZoneId,
  resetPredictionState,
} = predictionSlice.actions;
