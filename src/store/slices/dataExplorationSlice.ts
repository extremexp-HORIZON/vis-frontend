import type {
  ActionReducerMapBuilder,
} from '@reduxjs/toolkit';
import {
  createAsyncThunk,
} from '@reduxjs/toolkit';
import type { IWorkflowPage } from './workflowPageSlice';
import {
  AggregationFunction,
  type IDataExplorationMetaDataResponse,
  type IDataExplorationRequest,
  type IDataExplorationResponse,
  type IMetaDataRequest,
  type VisualColumn,
} from '../../shared/models/dataexploration.model';
import type { IDataExploration } from '../../shared/models/tasks/data-exploration-task.model';
import { handleMultiTimeSeriesData, prepareDataExplorationResponse } from '../../shared/models/tasks/model-analysis.model';
import { api } from '../../app/api/api';

// Only keys that contain { data, loading, error }
type AsyncQueryKey = Exclude<keyof IDataExploration, 'controlPanel' | 'umap'>;

function getAsyncState<T extends AsyncQueryKey>(task: IDataExploration, key: T) {
  return task[key];
}

export const dataExplorationReducers = (
  builder: ActionReducerMapBuilder<IWorkflowPage>,
) => {
  builder
    .addCase(fetchDataExplorationData.fulfilled, (state, action) => {
      const task = state.tab?.workflowId === action.meta.arg.metadata.workflowId
        ? state.tab?.workflowTasks.dataExploration
        : null;
      const queryCase = action.meta.arg.metadata.queryCase as AsyncQueryKey;

      if (task) {
        const asyncState = getAsyncState(task, queryCase);

        asyncState.data = queryCase === 'multipleTimeSeries'
          ? handleMultiTimeSeriesData(action.payload)
          : prepareDataExplorationResponse(action.payload);
        asyncState.loading = false;
        asyncState.error = null;

        if (queryCase === 'dataTable') {
          const totalItems = action.payload.querySize || 0;
          const { pageSize } = task.controlPanel;

          task.controlPanel.queryItems = totalItems;
          task.controlPanel.totalPages = Math.ceil(totalItems / pageSize);
        }
      }
    })
    .addCase(fetchDataExplorationData.pending, (state, action) => {
      const task = state.tab?.workflowId === action.meta.arg.metadata.workflowId
        ? state.tab?.workflowTasks.dataExploration
        : null;
      const queryCase = action.meta.arg.metadata.queryCase as AsyncQueryKey;

      if (task) {
        getAsyncState(task, queryCase).loading = true;
        getAsyncState(task, queryCase).error = null;
      }
    })
    .addCase(fetchDataExplorationData.rejected, (state, action) => {
      const task = state.tab?.workflowId === action.meta.arg.metadata.workflowId
        ? state.tab?.workflowTasks.dataExploration
        : null;
      const queryCase = action.meta.arg.metadata.queryCase as AsyncQueryKey;

      if (task) {
        const asyncState = getAsyncState(task, queryCase);

        asyncState.loading = false;
        asyncState.error = 'Failed to fetch data';
      }
    })
    .addCase(fetchMetaData.fulfilled, (state, action) => {
      const task = state.tab?.workflowId === action.meta.arg.metadata.workflowId
        ? state.tab?.workflowTasks.dataExploration
        : null;

      if (!task) return;

      const { originalColumns } = action.payload;

      task.metaData.data = action.payload;
      task.metaData.loading = false;
      task.metaData.error = null;

      task.controlPanel.selectedColumns = originalColumns?.slice(0, 5) ?? [];

      if (originalColumns[0]) {
        task.controlPanel.xAxis = originalColumns[0];
        task.controlPanel.xAxisScatter = originalColumns[0];
        task.controlPanel.colorBy = originalColumns[0];
      }

      const defaultYAxis = originalColumns.length > 1
        ? [originalColumns[1]]
        : [originalColumns[0]].filter(Boolean);

      task.controlPanel.yAxis = defaultYAxis;
      task.controlPanel.yAxisScatter = defaultYAxis;
      task.controlPanel.timestampField = task.metaData.data?.timeColumn || null;
      task.controlPanel.orderBy =  null;
      const stringCols = originalColumns.filter((col: VisualColumn) => col.type === 'STRING');
      const numericColumn = originalColumns.find((col: VisualColumn) =>
        col.type === 'INTEGER' || col.type === 'DOUBLE' || col.type === 'FLOAT' || col.type === 'BIGINT'
      );

      if (stringCols[0]) task.controlPanel.barGroupBy = [stringCols[0].name];

      if (numericColumn) {
        task.controlPanel.barAggregation.push({
          column: numericColumn.name,
          function: AggregationFunction.COUNT
        });
        task.controlPanel.selectedMeasureColumn = numericColumn.name;
      }

      const heatmapGroupBy = stringCols.slice(0, 2).map(col => col.name);

      if (heatmapGroupBy.length === 2) {
        task.controlPanel.barGroupByHeat = heatmapGroupBy;
      }

      if (numericColumn) {
        task.controlPanel.barAggregationHeat.push({
          column: numericColumn.name,
          function: AggregationFunction.COUNT
        });
        task.controlPanel.selectedMeasureColumnHeat = numericColumn.name;
      }
    })
    .addCase(fetchMetaData.pending, (state, action) => {
      const task = state.tab?.workflowId === action.meta.arg.metadata.workflowId
        ? state.tab?.workflowTasks.dataExploration
        : null;

      if (task) {
        task.metaData.loading = true;
        task.metaData.error = null;
      }
    })
    .addCase(fetchMetaData.rejected, (state, action) => {
      const task = state.tab?.workflowId === action.meta.arg.metadata.workflowId
        ? state.tab?.workflowTasks.dataExploration
        : null;

      if (task) {
        task.metaData.loading = false;
        task.metaData.error = 'Failed to fetch metadata';
      }
    })
    .addCase(fetchUmap.fulfilled, (state, action) => {
      const task = state.tab?.workflowId === action.meta.arg.metadata.workflowId
        ? state.tab?.workflowTasks.dataExploration
        : null;

      if (task) {
        task.umap.data = action.payload;
        task.umap.loading = false;
        task.umap.error = null;
      }
    })
    .addCase(fetchUmap.pending, (state, action) => {
      const task = state.tab?.workflowId === action.meta.arg.metadata.workflowId
        ? state.tab?.workflowTasks.dataExploration
        : null;

      if (task) {
        task.umap.loading = true;
        task.umap.error = null;
      }
    })
    .addCase(fetchUmap.rejected, (state, action) => {
      const task = state.tab?.workflowId === action.meta.arg.metadata.workflowId
        ? state.tab?.workflowTasks.dataExploration
        : null;

      if (task) {
        task.umap.loading = false;
        task.umap.error = 'Failed to fetch umap';
      }
    });
};

export const fetchDataExplorationData = createAsyncThunk(
  'workflowTasks/data_exploration/fetch_data',
  async (payload: IDataExplorationRequest) => {
    const requestUrl = 'data/fetch';

    return api
      .post<IDataExplorationResponse>(requestUrl, payload.query)
      .then(response => response.data);
  },
);

export const fetchMetaData = createAsyncThunk(
  'workflowTasks/data_exploration/fetch_metadata',
  async (payload: IMetaDataRequest) => {
    const requestUrl = 'data/meta';

    return api
      .post<IDataExplorationMetaDataResponse>(requestUrl, payload.query)
      .then(response => response.data);
  },
);

export const fetchUmap = createAsyncThunk(
  'workflowTasks/data_exploration/fetch_umap',
  async (payload: { data: number[][]; metadata: {workflowId: string; query: string;} }) => {
    const requestUrl = 'data/umap';

    return api
      .post<number[][]>(requestUrl, payload.data)
      .then(response => response.data);
  },
);
