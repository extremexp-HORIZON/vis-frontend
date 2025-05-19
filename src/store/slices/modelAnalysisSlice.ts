import { createAsyncThunk } from "@reduxjs/toolkit";
import type { ActionReducerMapBuilder } from "@reduxjs/toolkit";
import type { fetchAffectedRequest } from "../../shared/models/dataexploration.model";
import { IWorkflowPage } from "./workflowPageSlice";
import { IModelAnalysis } from "../../shared/models/tasks/model-analysis.model";
import { api, experimentApi } from "../../app/api/api";

// Thunks
export const fetchAffected = createAsyncThunk(
  "modelAnalysis/fetch_affected",
  async (payload: fetchAffectedRequest) => {
    const response = await api.get("affected");
    return response.data;
  }
);

export const getLabelTestInstances = createAsyncThunk(
  "modelAnalysis/get_test_instances",
  async ({ experimentId, runId, offset = 0, limit = 1000 }: { experimentId: string; runId: string; offset?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await experimentApi.get(`${experimentId}/runs/${runId}/evaluation/test-instances`, {
        params: { offset, limit },
      });
      return response.data;
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        return rejectWithValue((error as any).response?.data || (error as any).message);
      }
      return rejectWithValue("Unknown error occurred");
    }
  }
);

export const fetchConfusionMatrix = createAsyncThunk(
  "modelAnalysis/fetch_confusion_matrix",
  async ({ experimentId, runId }: { experimentId: string; runId: string }) => {
    const response = await experimentApi.get(`${experimentId}/runs/${runId}/evaluation/confusion-matrix`);
    return response.data;
  }
);

export const fetchRocCurve = createAsyncThunk(
  "modelAnalysis/fetch_roc_curve",
  async ({ experimentId, runId }: { experimentId: string; runId: string }) => {
    const response = await experimentApi.get(`${experimentId}/runs/${runId}/evaluation/roc-curve`);
    return response.data;
  }
);

export const fetchModelSummary = createAsyncThunk(
  "modelAnalysis/fetch_model_summary",
  async ({ experimentId, runId }: { experimentId: string; runId: string }) => {
    const response = await experimentApi.get(`${experimentId}/runs/${runId}/evaluation/summary`);
    return response.data;
  }
);

// Helpers
const getTask = (state: IWorkflowPage, workflowId: string) =>
  state.tab?.workflowId === workflowId ? state.tab.workflowTasks.modelAnalysis : null;

const assignResult = (section: any, data: any) => {
  section.data = data;
  section.loading = false;
  section.error = null;
};

const assignError = (section: any, message: string) => {
  section.loading = false;
  section.error = message;
};

// Reducers
export const modelAnalysisReducers = (builder: ActionReducerMapBuilder<IWorkflowPage>) => {
  builder
    .addCase(fetchAffected.pending, (state, action) => {
      const task = getTask(state, action.meta.arg.workflowId);
      const plotType = action.meta.arg.queryCase as keyof IModelAnalysis;
      if (task && plotType !== "featureNames") {
        task[plotType].loading = true;
      }
    })
    .addCase(fetchAffected.fulfilled, (state, action) => {
      const task = getTask(state, action.meta.arg.workflowId);
      const plotType = action.meta.arg.queryCase as keyof IModelAnalysis;
      if (task && plotType !== "featureNames") {
        assignResult(task[plotType], action.payload);
      }
    })
    .addCase(fetchAffected.rejected, (state, action) => {
      const task = getTask(state, action.meta.arg.workflowId);
      const plotType = action.meta.arg.queryCase as keyof IModelAnalysis;
      if (task && plotType !== "featureNames") {
        assignError(task[plotType], "Failed to fetch data");
      }
    })

    .addCase(fetchConfusionMatrix.pending, (state, action) => {
      const task = getTask(state, action.meta.arg.runId);
      if (task) task.modelConfusionMatrix.loading = true;
    })
    .addCase(fetchConfusionMatrix.fulfilled, (state, action) => {
      const task = getTask(state, action.meta.arg.runId);
      if (task) assignResult(task.modelConfusionMatrix, action.payload);
    })
    .addCase(fetchConfusionMatrix.rejected, (state, action) => {
      const task = getTask(state, action.meta.arg.runId);
      if (task) assignError(task.modelConfusionMatrix, "Failed to fetch confusion matrix");
    })

    .addCase(getLabelTestInstances.pending, (state) => {
      const task = state.tab?.workflowTasks.modelAnalysis;
      if (task) {
        task.modelInstances.loading = true;
        task.modelInstances.error = null;
      }
    })
    .addCase(getLabelTestInstances.fulfilled, (state, action) => {
      const task = state.tab?.workflowTasks.modelAnalysis;
      if (task) assignResult(task.modelInstances, action.payload);
    })
    .addCase(getLabelTestInstances.rejected, (state) => {
      const task = state.tab?.workflowTasks.modelAnalysis;
      if (task) assignError(task.modelInstances, "Failed to fetch test instances");
    })

    .addCase(fetchRocCurve.pending, (state, action) => {
      const task = getTask(state, action.meta.arg.runId);
      if (task) {
        task.modelRocCurve.loading = true;
        task.modelRocCurve.error = null;
      }
    })
    .addCase(fetchRocCurve.fulfilled, (state, action) => {
      const task = getTask(state, action.meta.arg.runId);
      if (task) {
        let rawData = typeof action.payload === "string"
          ? JSON.parse(
              action.payload
                .replace(/\bInfinity\b/g, "1e9")
                .replace(/\b-Infinity\b/g, "-1e9")
            )
          : action.payload;

        if (Array.isArray(rawData.thresholds)) {
          rawData.thresholds = rawData.thresholds.map((t: any) =>
            t === Infinity || t === "Infinity"
              ? 1e9
              : t === -Infinity || t === "-Infinity"
              ? -1e9
              : t
          );
        }

        assignResult(task.modelRocCurve, rawData);
      }
    })
    .addCase(fetchRocCurve.rejected, (state, action) => {
      const task = getTask(state, action.meta.arg.runId);
      if (task) assignError(task.modelRocCurve, "Failed to fetch ROC curve");
    })

    .addCase(fetchModelSummary.pending, (state, action) => {
      const task = getTask(state, action.meta.arg.runId);
      if (task) {
        task.modelSummary.loading = true;
        task.modelSummary.error = null;
      }
    })
    .addCase(fetchModelSummary.fulfilled, (state, action) => {
      const task = getTask(state, action.meta.arg.runId);
      if (task) assignResult(task.modelSummary, action.payload);
    })
    .addCase(fetchModelSummary.rejected, (state, action) => {
      const task = getTask(state, action.meta.arg.runId);
      if (task) assignError(task.modelSummary, "Failed to fetch classification summary");
    });
};
