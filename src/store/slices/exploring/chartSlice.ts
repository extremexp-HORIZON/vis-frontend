import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AggregateFunctionType } from '../../../shared/models/exploring/enum/aggregate-function-type.model';
import type { AppStartListening } from '../../listenerMiddleware';
import { shallowEqual } from 'react-redux';
import { executeQuery, setCategoricalFilters } from './datasetSlice';
import { updateAnalysisResults } from './statsSlice';
import type { IVisQueryResults } from '../../../shared/models/exploring/vis-query-results.model';

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
    resetChartState: () => {
      return initialState;
    },
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

export const chartListeners = (startApplistening: AppStartListening) => {
  startApplistening({
    actionCreator: triggerChartUpdate,
    effect: async (_, { dispatch, getState }) => {
      const state = getState();
      const datasetId = state.dataset.dataset.id;

      if (datasetId) {
        const newFilters: Record<string, unknown> = {
          ...state.dataset.categoricalFilters,
        };

        state.chart.groupByCols.forEach(col => delete newFilters[col]);

        const queryBody = {
          categoricalFilters:
            newFilters !== state.dataset.categoricalFilters
              ? newFilters
              : state.dataset.categoricalFilters,
          aggType: state.chart.aggType,
          groupByCols: state.chart.groupByCols,
          measureCol: state.chart.measureCol,
          rect: state.map.drawnRect || state.map.viewRect,
        };

        try {
          const action = await dispatch(
            executeQuery({ body: queryBody }),
          );

          if (executeQuery.fulfilled.match(action)) {
            const result = action.payload as IVisQueryResults;

            dispatch(
              updateAnalysisResults({
                rectStats: result.rectStats,
                series: result.series,
              }),
            );
            if (!shallowEqual(newFilters, state.dataset.categoricalFilters)) {
              dispatch(setCategoricalFilters(newFilters));
            }
          }
        } catch (error) {
          console.error(
            'Error executing query after triggerChartUpdate:',
            error,
          );
        }
      }
    },
  });
};

export const {
  resetChartState,
  setAggType,
  setChartType,
  setGroupByCols,
  setMeasureCol,
  triggerChartUpdate,
} = chartSlice.actions;
