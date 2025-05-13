import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import type { IExperiment } from "../../shared/models/experiment/experiment.model"
import type { IRun } from "../../shared/models/experiment/run.model"
import type { IMetric } from "../../shared/models/experiment/metric.model"
import { api, experimentApi } from "../../app/api/api"
import axios from "axios"
import { getCache, setCache } from "../../shared/utils/localStorageCache"

const workflowMetricsPreparation = (workflow: any, workflowId: string) => {
  if (!workflow.metrics) {
    return { ...workflow, workflowId };
  }
  const ok = {
    ...workflow,
    workflowId,
    metrics: workflow.metrics.map((item: any) => {
      const metricId = Object.keys(item)[0]
      const metricData = item[metricId]
      return {
        ...metricData,
        metricId,
      }
    })
  }
  return ok
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
    data: "",
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
}

export const progressPageSlice = createSlice({
  name: "ProgressPage",
  initialState,
  reducers: {
    setProgressBarData: (state, action) => {
      state.progressBar = action.payload
    },
    setIntialization: (state, action) => {
      state.initialization = action.payload
    },
    setMenuOptions: (state, action) => {
      state.menuOptions = action.payload
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchExperiment.fulfilled, (state, action) => {
        state.experiment.data = action.payload
        state.experiment.loading = false
        state.experiment.error = null
      })
      .addCase(fetchExperimentWorkflows.fulfilled, (state, action) => {
        state.workflows.data = action.payload
        state.workflows.loading = false
        state.workflows.error = null
      })
      .addCase(workflowsReordering.fulfilled, (state, action) => {
        state.workflows.data = action.payload
        state.workflows.loading = false
        state.workflows.error = null
      })
      .addCase(stateController.fulfilled, (state, action) => {
        state.statusController.data = action.payload
        state.statusController.loading = false
        state.statusController.error = null
      })
      .addCase(fetchExperimentWorkflows.pending, state => {
        state.workflows.loading = true
      })
      .addCase(fetchExperiment.pending, state => {
        state.experiment.loading = true
      })
      .addCase(workflowsReordering.pending, state => {
        state.workflows.loading = true
      })
      .addCase(stateController.pending, state => {
        state.statusController.loading = true
      })
      .addCase(fetchExperimentWorkflows.rejected, (state, action) => {
        state.workflows.loading = false
        state.workflows.error =
          action.error.message || "Error while fetching data"
      })
      .addCase(fetchExperiment.rejected, (state, action) => {
        state.experiment.loading = false
        state.experiment.error =
          action.error.message || "Error while fetching data"
      })
      .addCase(workflowsReordering.rejected, (state, action) => {
        state.workflows.loading = false
        state.workflows.error =
          action.error.message || "Error while fetching data"
      })
      .addCase(stateController.rejected, (state, action) => {
        state.statusController.loading = false
        state.statusController.error =
          action.error.message || "Error while fetching data"
      })
      .addCase(fetchUserEvaluation.fulfilled, (state, action) => {
        state.workflowEvaluation.loading = false;
        state.workflowEvaluation.error = null;
      
        if (action.payload?.status === "success") {
          const { experimentId, runId, data } = action.meta.arg;
          const workflowIndex = state.workflows.data.findIndex(w => w.id === runId);
        
          if (workflowIndex !== -1) {
            const currentWorkflow = state.workflows.data[workflowIndex];
            const metrics = currentWorkflow.metrics ?? [];
            const ratingMetricIndex = metrics.findIndex(m => m.name === "rating");
          
            if (ratingMetricIndex !== -1) {
              metrics[ratingMetricIndex].value = data.rating;
            } else {
              metrics.push({
                name: "rating",
                value: data.rating,
              } as IMetric);
            }
          
            const updatedWorkflow: IRun = {
              ...currentWorkflow,
              metrics: [...metrics],
            };
          
            state.workflows.data[workflowIndex] = updatedWorkflow;
          
            const key = `workflows-${experimentId}`;
            const cached = getCache<IRun[]>(key);
            if (cached) {
              const updatedList = [...cached];
              const cachedIndex = updatedList.findIndex(w => w.id === runId);
              if (cachedIndex !== -1) {
                updatedList[cachedIndex] = updatedWorkflow;
                setCache(key, updatedList);
              }
            }
          }
        }
      })
      .addCase(fetchUserEvaluation.pending, (state, action) => {
        state.workflowEvaluation.loading = true
      })
      .addCase(fetchUserEvaluation.rejected, (state, action) => {
        state.workflowEvaluation.loading = false
        state.workflowEvaluation.error = action.error.message || "Error while fetching data"
      })
      .addCase(fetchWorkflowWithRating.fulfilled, (state, action) => {
        const { workflow }: {workflow: IRun} = action.payload;
        const index = state.workflows.data.findIndex(w => w.id === workflow.id);
      
        if (index !== -1) {
          const currentWorkflow = state.workflows.data[index];
      
          const currentRating = currentWorkflow.metrics.find(m => m.name === "rating")?.value;
          const newRating = workflow.metrics.find(m => m.name === "rating")?.value;
      
          const isRatingChanged = currentRating !== newRating && newRating !== undefined;
      
          if (isRatingChanged) {
            state.workflows.data[index] = workflow;
          }
          // Skip update if no relevant change (prevents flicker)
        } else {
          state.workflows.data.push(workflow);
        }
      
        state.workflows.loading = false;
        state.workflows.error = null;
      })
      .addCase(fetchWorkflowWithRating.pending, state => {
        state.workflows.loading = true;
      })
      .addCase(fetchWorkflowWithRating.rejected, (state, action) => {
        state.workflows.loading = false;
        state.workflows.error = action.error.message || "Error while fetching single workflow";
      })      
  },
})

//Thunk Calls for Experiment/Workflows fetching

export const fetchExperiment = createAsyncThunk(
  "progressPage/fetch_experiment",
  async (experimentId: string) => {
    const key = `experiment-${experimentId}`;
    const cached = getCache<IExperiment>(key);
    if (cached) return cached;

    const requestUrl = `${experimentId}`;
    const res = await experimentApi.get(requestUrl);
    setCache(key, res.data);
    return res.data;
  }
);

//remove workflows cache when live data is on or live data fetches are more sparce
export const fetchExperimentWorkflows = createAsyncThunk(
  "progressPage/fetch_experiment_workflows",
  async ({ experimentId, forceRefresh = false }: { experimentId: string; forceRefresh?: boolean }) => {
    const key = `workflows-${experimentId}`;
    if (!forceRefresh) {
      const cached = getCache<IRun[]>(key);
      if (cached) return cached;
    }

    const requestUrl = `${experimentId}/runs`;
    const res = await experimentApi.get(requestUrl);
    setCache(key, res.data);
    return res.data;
  }
);

// export const fetchExperimentWorkflows = createAsyncThunk(
//     "progressPage/fetch_experiment_workflows",
//     async (experimentId: string) => {
//         const requestUrl = `${experimentId}/runs`
//         return experimentApi.get(requestUrl).then(response => response.data)
// })

// Calls for Workflow Actions

export const fetchWorkflowWithRating = createAsyncThunk(
  "progressPage/fetch_workflow_with_rating",
  async ({ experimentId, workflowId }: { experimentId: string; workflowId: string }) => {
    const key = `workflows-${experimentId}`;
    const requestUrl = `${experimentId}/runs/${workflowId}`;
    const res = await experimentApi.get(requestUrl);
    const updatedWorkflow = res.data

    // Update the localStorage cache
    const cached = getCache<IRun[]>(key);
    if (cached) {
      const index = cached.findIndex(w => w.id === workflowId);
      let updatedList: IRun[];
    
      if (index !== -1) {
        const currentWorkflow = cached[index];
        const currentRating = currentWorkflow.metrics.find(m => m.name === "rating")?.value;
        const newRating = updatedWorkflow.metrics.find((m: IMetric) => m.name === "rating")?.value;
        const isRatingChanged = currentRating !== newRating && newRating !== undefined;

        if (isRatingChanged) {
          updatedList = [...cached];
          updatedList[index] = updatedWorkflow;
          setCache(key, updatedList);
        }
      } else {
        // Append new workflow
        updatedList = [...cached, updatedWorkflow];
        setCache(key, updatedList);
      }
    }

    return { experimentId, workflow: updatedWorkflow };
  }
);

// TODO: Test this once the reordering changes are done
export const workflowsReordering = createAsyncThunk(
  "progressPage/workflows_reordering",
  async (payload: { workflowId1: string; workflowId2: string, experimentId: string }) => {
    const { workflowId1, workflowId2, experimentId } = payload
    const requestUrl = ``
    const requestPayload = {
      precedence: {
        [workflowId1]: workflowId2,
      },
    }
    return experimentApi
      .post<IRun[]>(requestUrl, requestPayload)
      .then(response => response.data.map(workflow => workflowMetricsPreparation(workflow, workflow.id || "")))    
  }
)

// TODO: create this once state changes done
export const stateController = createAsyncThunk(
  "progressPage/state_controller",
  async (payload: {state: string, id: string, action: string}) => {
    const {state, id, action} = payload
    const requestUrl = `/exp/${state}/${action}/${id}`
    return axios
      .get(requestUrl)
      .then(response => response.data)
  },
)

// TODO: Test this once the table changes are done
// export const workflowRating = (payload: {metric: IMetric, newValue: number}) => {
//     const {metric, newValue} = payload
//     const requestUrl = `/metrics/metricId`
//     const requestPayload: Partial<IMetric> = {
//       ...metric,
//       value: newValue,
//     }
//     delete requestPayload.name
//     return axios.post<IRun[]>(requestUrl, requestPayload)
//   }


export const fetchUserEvaluation = createAsyncThunk(
  "workflowTasks/user_evaluation/fetch_data",
  async (
    payload: { experimentId: string; runId: string; data: any }
  ) => {
    const { experimentId, runId, data } = payload
    const requestUrl = `${experimentId}/runs/${runId}/user-evaluation`
    return experimentApi
      .post<any>(requestUrl, data)
      .then(response => response.data)
      
  },
)
//Reducer exports
export const {
  setProgressBarData,
  setIntialization,
  setMenuOptions
} = progressPageSlice.actions

export default progressPageSlice.reducer
