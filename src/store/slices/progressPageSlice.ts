import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { defaultDataExplorationQuery } from "../../shared/models/dataexploration.model"
import axios from "axios"
import { set } from "lodash"
import { IExperimentResponse } from "../../shared/models/experiment.model"
import { IWorkflowResponse } from "../../shared/models/workflow.model"

interface IWorkflowTab {
  experiment: {
    data: IExperimentResponse["experiment"] | null
    loading: boolean
    error: string | null
  }
  workflows: {
    data: IWorkflowResponse["workflow"][]
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
    accuracy: number
    precision: number
    recall: number
    runtime: number
  }
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
}

const initialState: IWorkflowTab = {
  experiment: { data: null, loading: false, error: null },
  workflows: { data: [], loading: false, error: null },
  progressBar: { total: 0, completed: 0, running: 0, failed: 0, progress: 0 },
  progressGauges: { accuracy: 0, precision: 0, recall: 0, runtime: 0 },
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
}

// explainabilitySlice
export const progressPageSlice = createSlice({
  name: "ProgressPage",
  initialState,
  reducers: {
    setProgressBarData: (state, action) => {
      state.progressBar = action.payload
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
      .addCase(fetchExperimentWorkflows.pending, state => {
        state.workflows.loading = true
      })
      .addCase(fetchExperiment.pending, state => {
        state.workflows.loading = true
      })
      .addCase(fetchExperimentWorkflows.rejected, (state, action) => {
        state.workflows.loading = false
        state.workflows.error =
          action.error.message || "Error while fetching data"
      })
      .addCase(fetchExperiment.rejected, (state, action) => {
        state.workflows.loading = false
        state.workflows.error =
          action.error.message || "Error while fetching data"
      })
  },
})

//Thunk Calls for fetching data

const apiPath = "https://api.expvis.smartarch.cz/api"
const apiKey = "3980f9c699c3e311f8d72bd0318038d976e5958a"

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

// export const fetchExperimentWorkflows = createAsyncThunk(
//   "progressPage/fetch_experiment_workflows",
//   async (experimentId: string) => {
//     const headers = {
//       "access-token": apiKey,
//     }
//     const requestUrl = apiPath + `/workflows-query`
//     return axios
//       .post<IWorkflowResponse[]>(requestUrl, { experimentId }, { headers })
//       .then(response => response.data)
//   },
// )

export const fetchExperimentWorkflows = createAsyncThunk(
  "progressPage/fetch_experiment_and_workflows",
  async (workflowIds: string[]) => {
    const allData = await Promise.all(
      workflowIds.map(async workflowId => {
        const workflowRequestUrl = apiPath + `/workflows/${workflowId}`
        const headers = {
          "access-token": apiKey,
        }
        const workflowsResponse = await axios
          .get<IWorkflowResponse>(workflowRequestUrl, {
            headers,
          })
          .then(response => response.data.workflow)
        return workflowsResponse
      }),
    )
    return allData
  },
)

//Reducer exports
export const {
  setProgressBarData,
  setProgressGauges,
  setProgressParallel,
  setProgressWokflowsTable,
  setProgressScheduledTable,
} = progressPageSlice.actions

export default progressPageSlice.reducer
