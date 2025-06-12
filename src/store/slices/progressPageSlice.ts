import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { IExperiment } from '../../shared/models/experiment/experiment.model';
import type { IRun } from '../../shared/models/experiment/run.model';
import type { IMetric } from '../../shared/models/experiment/metric.model';
import { experimentApi } from '../../app/api/api';

interface IUserEvaluationResponse {
  status: string;
  message: string;
}

interface IProgressPage {
  initialization: boolean
  experiment: {
    data: IExperiment | null
    loading: boolean
    error: string | null
  }
  workflows: {
    data: IRun[]
    loading: boolean
    error: string | null
  }
  progressBar: {
    total: number
    completed: number
    running: number
    failed: number
    progress: number
  }
  statusController: {
    data: string;
    loading: boolean;
    error: string | null;
  }
  menuOptions: {
    selected: string | null
    collapsed: boolean
},
workflowEvaluation: {
  loading: boolean
  error: string | null
}
}

const initialState: IProgressPage = {
  initialization: false,
  experiment: { data: null, loading: false, error: null },
  workflows: { data: [], loading: false, error: null },
  progressBar: { total: 0, completed: 0, running: 0, failed: 0, progress: 0 },
  statusController: {
    data: '',
    loading: false,
    error: null,
  },
  menuOptions: {
    selected: null,
    collapsed: true
  },
  workflowEvaluation: {
    loading: false,
    error: null
  }
};

export const progressPageSlice = createSlice({
  name: 'ProgressPage',
  initialState,
  reducers: {
    setProgressBarData: (state, action) => {
      state.progressBar = action.payload;
    },
    setIntialization: (state, action) => {
      state.initialization = action.payload;
    },
    setMenuOptions: (state, action) => {
      state.menuOptions = action.payload;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchExperiment.fulfilled, (state, action) => {
        state.experiment.data = action.payload;
        state.experiment.loading = false;
        state.experiment.error = null;
      })
      .addCase(fetchExperimentWorkflows.fulfilled, (state, action) => {
        const incoming = action.payload;
        const existing = state.workflows.data;

        const isDifferent = JSON.stringify(existing) !== JSON.stringify(incoming);

        if (isDifferent) {
          state.workflows.data = incoming;
        }

        state.workflows.loading = false;
        state.workflows.error = null;
      })
      .addCase(workflowsReordering.fulfilled, (state, action) => {
        state.workflows.data = action.payload;
        state.workflows.loading = false;
        state.workflows.error = null;
      })
      .addCase(stateController.fulfilled, (state, action) => {
        state.statusController.data = action.payload;
        state.statusController.loading = false;
        state.statusController.error = null;
      })
      .addCase(fetchExperimentWorkflows.pending, state => {
        state.workflows.loading = true;
      })
      .addCase(fetchExperiment.pending, state => {
        state.experiment.loading = true;
      })
      .addCase(workflowsReordering.pending, state => {
        state.workflows.loading = true;
      })
      .addCase(stateController.pending, state => {
        state.statusController.loading = true;
      })
      .addCase(fetchExperimentWorkflows.rejected, (state, action) => {
        state.workflows.loading = false;
        state.workflows.error =
          action.error.message || 'Error while fetching data';
      })
      .addCase(fetchExperiment.rejected, (state, action) => {
        state.experiment.loading = false;
        state.experiment.error =
          action.error.message || 'Error while fetching data';
      })
      .addCase(workflowsReordering.rejected, (state, action) => {
        state.workflows.loading = false;
        state.workflows.error =
          action.error.message || 'Error while fetching data';
      })
      .addCase(stateController.rejected, (state, action) => {
        state.statusController.loading = false;
        state.statusController.error =
          action.error.message || 'Error while fetching data';
      })
      .addCase(fetchUserEvaluation.fulfilled, (state, action) => {
        state.workflowEvaluation.loading = false;
        state.workflowEvaluation.error = null;

        if (action.payload?.status === 'success') {
          const { runId, data } = action.meta.arg;

          if (data.rating === null) return;
          const workflowIndex = state.workflows.data.findIndex(w => w.id === runId);

          if (workflowIndex !== -1) {
            const currentWorkflow = state.workflows.data[workflowIndex];
            const metrics = currentWorkflow.metrics ?? [];
            const ratingMetricIndex = metrics.findIndex(m => m.name === 'rating');

            if (ratingMetricIndex !== -1) {
              metrics[ratingMetricIndex].value = data.rating;
            } else {
              metrics.push({
                name: 'rating',
                value: data.rating,
              } as IMetric);
            }

            const updatedWorkflow: IRun = {
              ...currentWorkflow,
              metrics: [...metrics],
            };

            state.workflows.data[workflowIndex] = updatedWorkflow;
          }
        }
      })
      .addCase(fetchUserEvaluation.pending, (state, action) => {
        state.workflowEvaluation.loading = true;
      })
      .addCase(fetchUserEvaluation.rejected, (state, action) => {
        state.workflowEvaluation.loading = false;
        state.workflowEvaluation.error = action.error.message || 'Error while fetching data';
      });
  },
});

// Thunk Calls for Experiment/Workflows fetching

export const fetchExperiment = createAsyncThunk(
  'progressPage/fetch_experiment',
  async (experimentId: string) => {
    const requestUrl = `${experimentId}`;
    const res = await experimentApi.get(requestUrl);

    return res.data;
  }
);

export const fetchExperimentWorkflows = createAsyncThunk(
  'progressPage/fetch_experiment_workflows',
  async (experimentId: string) => {
    const requestUrl = `${experimentId}/runs`;

    return experimentApi.get(requestUrl).then(response => response.data);
  });

// Calls for Workflow Actions

// TODO: Test this once the reordering changes are done
export const workflowsReordering = createAsyncThunk(
  'progressPage/workflows_reordering',
  async (payload: { workflowId1: string; workflowId2: string, experimentId: string }) => {
    const { workflowId1, workflowId2 } = payload;
    const requestUrl = '';
    const requestPayload = {
      precedence: {
        [workflowId1]: workflowId2,
      },
    };

    return experimentApi
      .post<IRun[]>(requestUrl, requestPayload)
      .then(response => response.data);
  }
);

// TODO: create this once state changes done
export const stateController = createAsyncThunk(
  'progressPage/state_controller',
  async (payload: { experimentId: string; runId: string; action: string }) => {
    return experimentApi
      .post<string>('/life-cycle', payload)
      .then(response => response.data);
  }
);

export const fetchUserEvaluation = createAsyncThunk(
  'workflowTasks/user_evaluation/fetch_data',
  async (
    payload: { experimentId: string; runId: string; data: {rating: number | null} }
  ) => {
    const { experimentId, runId, data } = payload;
    const requestUrl = `${experimentId}/runs/${runId}/user-evaluation`;

    return experimentApi
      .post<IUserEvaluationResponse>(requestUrl, data)
      .then(response => response.data);

  },
);
// Reducer exports
export const {
  setProgressBarData,
  setIntialization,
  setMenuOptions
} = progressPageSlice.actions;

export default progressPageSlice.reducer;
