import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AggregateFunctionType } from '../../../shared/models/exploring/enum/aggregate-function-type.model';

interface ChartState {
  groupByCols: string[];
  measureCol: string | null;
  aggType: AggregateFunctionType;
  chartType: string;
}

const initialState: ChartState = {
  groupByCols: [],
  measureCol: null,
  aggType: 'COUNT',
  chartType: 'column',
};

export const chartSlice = createSlice({
  name: 'chart',
  initialState,
  reducers: {
    setAggType: (state, action: PayloadAction<AggregateFunctionType>) => {
      state.aggType = action.payload;
    },
    setChartType: (state, action: PayloadAction<string>) => {
      state.chartType = action.payload;
    },
    setGroupByCols: (state, action: PayloadAction<string[]>) => {
      state.groupByCols = action.payload;
    },
    setMeasureCol: (state, action: PayloadAction<string | null>) => {
      state.measureCol = action.payload;
    },
    triggerChartUpdate: () => {
      // No-op reducer: just used to trigger side effects via listeners
    },
  },
});

export const {
  setAggType,
  setChartType,
  setGroupByCols,
  setMeasureCol,
  triggerChartUpdate,
} = chartSlice.actions;
