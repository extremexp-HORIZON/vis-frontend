import type {
  ActionReducerMapBuilder,
} from "@reduxjs/toolkit";
import {
  createAsyncThunk,
} from "@reduxjs/toolkit";
import type { IWorkflowPage } from "./workflowPageSlice";
import type {
  IDataExplorationMetaDataResponse,
  IDataExplorationRequest,
  IDataExplorationResponse,
  IMetaDataRequest,
  VisualColumn,
} from "../../shared/models/dataexploration.model";
import type { IDataExploration } from "../../shared/models/tasks/data-exploration-task.model";
import { handleMultiTimeSeriesData, prepareDataExplorationResponse } from "../../shared/models/tasks/model-analysis.model";
import { api } from "../../app/api/api";

// Only keys that contain { data, loading, error }
type AsyncQueryKey = Exclude<keyof IDataExploration, "controlPanel">;

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
        asyncState.data = queryCase === "multipleTimeSeries"
          ? handleMultiTimeSeriesData(action.payload)
          : prepareDataExplorationResponse(action.payload);
        asyncState.loading = false;
        asyncState.error = null;

        if (queryCase === "dataTable") {
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
      if (task) getAsyncState(task, queryCase).loading = true;
    })
    .addCase(fetchDataExplorationData.rejected, (state, action) => {
      const task = state.tab?.workflowId === action.meta.arg.metadata.workflowId
        ? state.tab?.workflowTasks.dataExploration
        : null;
      const queryCase = action.meta.arg.metadata.queryCase as AsyncQueryKey;
      if (task) {
        const asyncState = getAsyncState(task, queryCase);
        asyncState.loading = false;
        asyncState.error = "Failed to fetch data";
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

      const stringCols = originalColumns.filter((col: VisualColumn) => col.type === "STRING");
      const intCol = originalColumns.find((col: VisualColumn) => col.type === "INTEGER");
      const doubleCol = originalColumns.find((col: VisualColumn) => col.type === "DOUBLE");

      if (stringCols[0]) task.controlPanel.barGroupBy = [stringCols[0].name];

      if (intCol) {
        task.controlPanel.barAggregation = {
          [intCol.name]: ["count"]
        };
      }

      const heatmapGroupBy = stringCols.slice(0, 2).map(col => col.name);
      if (heatmapGroupBy.length === 2) {
        task.controlPanel.barGroupByHeat = heatmapGroupBy;
      }

      if (doubleCol) {
        task.controlPanel.barAggregationHeat = {
          [doubleCol.name]: ["count"]
        };
      }
    })
    .addCase(fetchMetaData.pending, (state, action) => {
      const task = state.tab?.workflowId === action.meta.arg.metadata.workflowId
        ? state.tab?.workflowTasks.dataExploration
        : null;
      if (task) task.metaData.loading = true;
    })
    .addCase(fetchMetaData.rejected, (state, action) => {
      const task = state.tab?.workflowId === action.meta.arg.metadata.workflowId
        ? state.tab?.workflowTasks.dataExploration
        : null;
      if (task) {
        task.metaData.loading = false;
        task.metaData.error = "Failed to fetch metadata";
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
      if (task) task.umap.loading = true;
    })
    .addCase(fetchUmap.rejected, (state, action) => {
      const task = state.tab?.workflowId === action.meta.arg.metadata.workflowId
        ? state.tab?.workflowTasks.dataExploration
        : null;
      if (task) {
        task.umap.loading = false;
        task.umap.error = "Failed to fetch umap";
      }
    });
};

export const fetchDataExplorationData = createAsyncThunk(
  "workflowTasks/data_exploration/fetch_data",
  async (payload: IDataExplorationRequest) => {
    const requestUrl = "data/tabular";
    return api
      .post<IDataExplorationResponse>(requestUrl, payload.query)
      .then(response => response.data);
  },
);

export const fetchMetaData = createAsyncThunk(
  "workflowTasks/data_exploration/fetch_metadata",
  async (payload: IMetaDataRequest) => {
    const requestUrl = "data/metadata";
    return api
      .post<IDataExplorationMetaDataResponse>(requestUrl, payload.query)
      .then(response => response.data);
  },
);

export const fetchUmap = createAsyncThunk(
  "workflowTasks/data_exploration/fetch_umap",
  async (payload: { data: number[][]; metadata: any }) => {
    const requestUrl = "data/umap";
    return api
      .post<any>(requestUrl, payload.data)
      .then(response => response.data);
  },
);
