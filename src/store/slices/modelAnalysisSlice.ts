import { createAsyncThunk } from '@reduxjs/toolkit';
import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import type { fetchAffectedRequest } from '../../shared/models/dataexploration.model';
import type { IWorkflowPage } from './workflowPageSlice';
import { api, experimentApi } from '../../app/api/api';
import type { AxiosError } from 'axios';

interface LoadableSection<T = unknown> {
  data?: T;
  loading: boolean;
  error: string | null;
}

function parseRocCsv(csv: string): {
  fpr: number[];
  tpr: number[];
  thresholds?: number[];
  auc?: number;
} {
  const lines = csv.trim().split(/\r?\n/);
  const [headerLine, ...dataLines] = lines;

  const headers = headerLine.split(',').map((h) => h.trim());

  const fprIdx = headers.indexOf('fpr');
  const tprIdx = headers.indexOf('tpr');
  const thrIdx = headers.indexOf('threshold');
  const aucIdx = headers.indexOf('auc');

  const fpr: number[] = [];
  const tpr: number[] = [];
  const thresholds: number[] = [];

  const parseNum = (value: string): number => {
    const v = value.trim();

    if (v === 'Infinity') return 1e9;
    if (v === '-Infinity') return -1e9;
    const n = Number(v);

    return n;
  };

  dataLines.forEach((line) => {
    if (!line.trim()) return;
    const cols = line.split(',').map((c) => c.trim());

    if (fprIdx >= 0) fpr.push(parseNum(cols[fprIdx]));
    if (tprIdx >= 0) tpr.push(parseNum(cols[tprIdx]));
    if (thrIdx >= 0) thresholds.push(parseNum(cols[thrIdx]));
  });

  let auc: number | undefined;

  if (aucIdx >= 0 && dataLines.length > 0) {
    const firstCols = dataLines[0].split(',').map((c) => c.trim());
    const aucVal = Number(firstCols[aucIdx]);

    if (!Number.isNaN(aucVal)) {
      auc = aucVal;
    }
  }

  return {
    fpr,
    tpr,
    thresholds: thresholds.length ? thresholds : undefined,
    ...(auc !== undefined ? { auc } : {})
  };
};

// Thunks
export const fetchAffected = createAsyncThunk(
  'modelAnalysis/fetch_affected',
  async (payload: fetchAffectedRequest) => {
    const response = await api.get('/explainability/affected');

    return response.data;
  }
);

export const getLabelTestInstances = createAsyncThunk(
  'modelAnalysis/get_test_instances',
  async ({ experimentId, runId, offset = 0, limit = 1000 }: { experimentId: string; runId: string; offset?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await experimentApi.get(`${experimentId}/runs/${runId}/evaluation/test-instances`, {
        params: { offset, limit },
      });

      return response.data;
    } catch (err) {
      const error = err as AxiosError;

      if (error.response) {
        return rejectWithValue(error.response.data);
      }

      return rejectWithValue(error.message || 'Unknown error occurred');
    }
  }
);

export const fetchConfusionMatrix = createAsyncThunk(
  'modelAnalysis/fetch_confusion_matrix',
  async ({ experimentId, runId }: { experimentId: string; runId: string }) => {
    const response = await experimentApi.get(`${experimentId}/runs/${runId}/evaluation/confusion-matrix`);

    return response.data;
  }
);

export const fetchRocCurve = createAsyncThunk(
  'modelAnalysis/fetch_roc_curve',
  async ({ experimentId, runId }: { experimentId: string; runId: string }) => {
    const response = await experimentApi.get(`${experimentId}/runs/${runId}/evaluation/roc-curve`);

    return response.data;
  }
);

export const fetchModelSummary = createAsyncThunk(
  'modelAnalysis/fetch_model_summary',
  async ({ experimentId, runId }: { experimentId: string; runId: string }) => {
    const response = await experimentApi.get(`${experimentId}/runs/${runId}/evaluation/summary`);

    return response.data;
  }
);

// Helpers
const getTask = (state: IWorkflowPage, workflowId: string) =>
  state.tab?.workflowId === workflowId ? state.tab.workflowTasks.modelAnalysis : null;

const assignResult = <T>(section: LoadableSection<T>, data: T) => {
  section.data = data;
  section.loading = false;
  section.error = null;
};

const assignError = (section: LoadableSection, message: string) => {
  section.loading = false;
  section.error = message;
};

// Reducers
export const modelAnalysisReducers = (builder: ActionReducerMapBuilder<IWorkflowPage>) => {
  builder
    .addCase(fetchAffected.pending, (state, action) => {
      const task = getTask(state, action.meta.arg.workflowId);

      if (task) task.affected.loading = true;
    })
    .addCase(fetchAffected.fulfilled, (state, action) => {
      const task = getTask(state, action.meta.arg.workflowId);

      if (task) assignResult(task.affected, action.payload);
    })
    .addCase(fetchAffected.rejected, (state, action) => {
      const task = getTask(state, action.meta.arg.workflowId);

      if (task) assignError(task.affected, 'Failed to fetch data');
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

      if (task) assignError(task.modelConfusionMatrix, 'Failed to fetch confusion matrix');
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

      if (task) {
        const data = Array.isArray(action.payload)
          ? action.payload.map((instance, index) => ({ ...instance, instanceId: index }))
          : action.payload;

        assignResult(task.modelInstances, data);
      }
    })
    .addCase(getLabelTestInstances.rejected, (state) => {
      const task = state.tab?.workflowTasks.modelAnalysis;

      if (task) assignError(task.modelInstances, 'Failed to fetch test instances');
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
        let rawData: any;

        if (typeof action.payload === 'string') {
          const trimmed = action.payload.trim();

          // Heuristic: JSON if starts with { or [
          if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            rawData = JSON.parse(
              trimmed
                .replace(/\bInfinity\b/g, '1e9')
                .replace(/\b-Infinity\b/g, '-1e9')
            );
          } else {
            // Treat as CSV
            rawData = parseRocCsv(trimmed);
          }
        } else {
          rawData = action.payload;
        }
        if (Array.isArray(rawData.thresholds)) {
          rawData.thresholds = (rawData.thresholds as Array<string | number>).map(
            (t): number => {
              if (t === Infinity || t === 'Infinity') return 1e9;
              if (t === -Infinity || t === '-Infinity') return -1e9;

              return Number(t);
            }
          );
        }

        assignResult(task.modelRocCurve, rawData);
      }
    })
    .addCase(fetchRocCurve.rejected, (state, action) => {
      const task = getTask(state, action.meta.arg.runId);

      if (task) assignError(task.modelRocCurve, 'Failed to fetch ROC curve');
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

      if (task) assignError(task.modelSummary, 'Failed to fetch classification summary');
    });
};
