import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { IRectStats } from '../../../shared/models/exploring/rect-stats.model';
import type { IGroupedStats } from '../../../shared/models/exploring/grouped-stats.model';

interface StatsState {
  series: IGroupedStats[];
  rectStats: IRectStats | null;
}

const initialState: StatsState = {
  series: [],
  rectStats: null,
};

export const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    resetStatsState: () => {
      return initialState;
    },
    setRectStats: (state, action: PayloadAction<IRectStats>) => {
      state.rectStats = action.payload;
    },
    setSeries: (state, action: PayloadAction<IGroupedStats[]>) => {
      state.series = action.payload;
    },
    updateAnalysisResults: (
      state,
      action: PayloadAction<{ rectStats: IRectStats; series: IGroupedStats[] }>,
    ) => {
      const { rectStats, series } = action.payload;

      state.rectStats = rectStats;
      state.series = series;
    },
  },
});

export const {
  resetStatsState,
  setRectStats,
  setSeries,
  updateAnalysisResults,
} = statsSlice.actions;
