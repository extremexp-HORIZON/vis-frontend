import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { defaultDataExplorationQuery, IDataExplorationQuery } from "../../shared/models/dataexploration.model"
import axios from "axios"
import { IExperimentResponse } from "../../shared/models/experiment.model"
import { IWorkflowResponse, MetricDetail } from "../../shared/models/workflow.model"

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

interface IWorkflowTab {
  initialization: boolean
  experiment: {
    data: IExperimentResponse["experiment"] | null
    loading: boolean
    error: string | null
  }
  workflows: {
    data: IWorkflowResponse[]
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
  progressGauges: {
    name: string
    type: string
    value: number
  }[]
  progressParallel: {
    data: { [key: string]: any }[]
    options: string[]
    selected: string
  }
  progressWokflowsTable: {
    order: "asc" | "desc"
    orderBy: string
    page: number
    rowsPerPage: number
    selectedWorkflows: number[]
    filters: { column: string; operator: string; value: string }[]
    rows: { [key: string]: any }[]
    filteredRows: { [key: string]: any }[]
    filtersCounter: number
    visibleRows: { [key: string]: any }[]
  }
  progressScheduledTable: {
    order: "asc" | "desc"
    orderBy: string
    page: number
    rowsPerPage: number
    selectedWorkflows: number[]
    filters: { column: string; operator: string; value: string }[]
    rows: { [key: string]: any }[]
    filteredRows: { [key: string]: any }[]
    filtersCounter: number
    visibleRows: { [key: string]: any }[]
  }
  statusController: {
    data: string;
    loading: boolean;
    error: string | null;
  }
}

const initialState: IWorkflowTab = {
  initialization: false,
  experiment: { data: null, loading: false, error: null },
  workflows: { data: [], loading: false, error: null },
  progressBar: { total: 0, completed: 0, running: 0, failed: 0, progress: 0 },
  progressGauges: [],
  progressParallel: { data: [], options: [], selected: "" },
  progressWokflowsTable: {
    order: "asc",
    orderBy: "id",
    page: 0,
    rowsPerPage: 10,
    selectedWorkflows: [],
    filters: [],
    rows: [],
    filteredRows: [],
    filtersCounter: 0,
    visibleRows: [],
  },
  progressScheduledTable: {
    order: "asc",
    orderBy: "id",
    page: 0,
    rowsPerPage: 10,
    selectedWorkflows: [],
    filters: [],
    rows: [],
    filteredRows: [],
    filtersCounter: 0,
    visibleRows: [],
  },
  statusController: {
    data: "",
    loading: false,
    error: null,
  }
}

// explainabilitySlice
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
    setProgressGauges: (state, action) => {
      state.progressGauges = action.payload
    },
    setProgressParallel: (state, action) => {
      state.progressParallel = { ...state.progressParallel, ...action.payload }
    },
    setProgressWokflowsTable: (state, action) => {
      state.progressWokflowsTable = {
        ...state.progressWokflowsTable,
        ...action.payload,
      }
    },
    setProgressScheduledTable: (state, action) => {
      state.progressScheduledTable = {
        ...state.progressScheduledTable,
        ...action.payload,
      }
    },
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
      // TODO: Remove this when no longer needed: Hard Coded Cases for testing
      .addCase(fetchExperimentTesting.fulfilled, (state, action) => {
        state.experiment.data = action.payload
        state.experiment.loading = false
        state.experiment.error = null
      })
      .addCase(fetchExperimentWorkflowsTesting.fulfilled, (state, action) => {
        state.workflows.data = action.payload
        state.workflows.loading = false
        state.workflows.error = null
      })
      .addCase(fetchExperimentWorkflowsTesting.pending, state => {
        state.workflows.loading = true
      })
      .addCase(fetchExperimentTesting.pending, state => {
        state.experiment.loading = true
      })
      .addCase(fetchExperimentWorkflowsTesting.rejected, (state, action) => {
        state.workflows.loading = false
        state.workflows.error =
          action.error.message || "Error while fetching data"
      })
      .addCase(fetchExperimentTesting.rejected, (state, action) => {
        state.experiment.loading = false
        state.experiment.error =
          action.error.message || "Error while fetching data"
      })

  },
})

//Thunk Calls for Experiment/Workflows fetching

const apiPath = "/ivis/api"
const apiKey = "67770b80c01a7a7c9ee031021c9500f825a8750b"

//TODO: Remove this when no longer needed
export const fetchExperimentTesting = createAsyncThunk(
  "progressPage/fetch_experiment_testing",
  async (experimentId: string) => {
    const request: IDataExplorationQuery = {...defaultDataExplorationQuery, 
      datasetId: `${experimentId}/metadata/experiment.json`
    }
    const requestUrl = `api/visualization/tabular`
    return axios
      .post<any>(requestUrl,request)
      .then(response => JSON.parse(response.data.data).experiment)
  },
)

//TODO: Remove this when no longer needed
export const fetchExperimentWorkflowsTesting = createAsyncThunk(
  "progressPage/fetch_experiment_workflows_testing",
  async (payload: {experimentId: string, workflowIds: string[]}) => {
    const {experimentId, workflowIds} = payload
    const allData = await Promise.all(
      workflowIds.map(async workflowId => {
        const workflowRequestUrl = `api/visualization/tabular`
        const workflowsResponse = await axios
          .post<any>(workflowRequestUrl, {
            ...defaultDataExplorationQuery,
            datasetId: `${experimentId}/metadata/${workflowId}.json`,
          })
          .then(response => (workflowMetricsPreparation(JSON.parse(response.data.data).workflow, workflowId)))
        return workflowsResponse
      }),
    )
    return allData
  },
)

export const fetchExperiment = createAsyncThunk(
  "progressPage/fetch_experiment",
  async (experimentId: string) => {
    const headers = {
      "access-token": apiKey,
    }
    const requestUrl = apiPath + `/experiments/${experimentId}`
    return axios
      .get<IExperimentResponse>(requestUrl, { headers })
      .then(response => response.data.experiment)
  },
)

export const fetchExperimentWorkflows = createAsyncThunk(
  "progressPage/fetch_experiment_workflows",
  async (experimentId: string) => {
    const headers = {
      "access-token": apiKey,
    }
    const requestUrl = apiPath + `/workflows-query`
    return axios
      .post<IWorkflowResponse[]>(requestUrl, { experimentId }, { headers })
      .then(response => response.data.map(workflow => workflowMetricsPreparation(workflow, workflow.id || "")))
  },
)

// Calls for Workflow Actions

// TODO: Test this once the reordering changes are done
export const workflowsReordering = createAsyncThunk(
  "progressPage/workflows_reordering",
  async (payload: { workflowId1: string; workflowId2: string, experimentId: string }) => {
    const { workflowId1, workflowId2, experimentId } = payload
    const headers = {
      "access-token": apiKey,
    }
    const requestUrl = apiPath + `/experiments-sort-workflows/${experimentId}`
    const requestPayload = {
      precedence: {
        [workflowId1]: workflowId2,
      },
    }
    return axios
      .post<IWorkflowResponse[]>(requestUrl, requestPayload, { headers })
      .then(response => response.data.map(workflow => workflowMetricsPreparation(workflow, workflow.id || "")))    
  }
)

// TODO: Test this once the table changes are done
export const stateController = createAsyncThunk(
  "progressPage/state_controller",
  async (payload: {state: string, id: string, action: string}) => {
    const {state, id, action} = payload
    const apiPath = `/exp/${state}/${action}/${id}`
    return axios
      .get(apiPath)
      .then(response => response.data)
  },
)

// TODO: Test this once the table changes are done
export const workflowRating = (payload: {metric: MetricDetail, newValue: string}) => {
    const {metric, newValue} = payload
    const headers = {
      "access-token": apiKey,
    }
    const requestUrl = apiPath + `/metrics/metricId`
    const requestPayload: Partial<MetricDetail> = {
      ...metric,
      value: newValue,
    }
    delete requestPayload.metricId
    return axios.post<IWorkflowResponse[]>(requestUrl, requestPayload, { headers })
  }

//Reducer exports
export const {
  setProgressBarData,
  setProgressGauges,
  setProgressParallel,
  setProgressWokflowsTable,
  setProgressScheduledTable,
  setIntialization
} = progressPageSlice.actions

export default progressPageSlice.reducer
