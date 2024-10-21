import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { defaultDataExplorationQuery } from "../../shared/models/dataexploration.model"
import axios from "axios"
import { set } from "lodash"

interface IWorkflowTab {
  workflows: {
    data: { [key: string]: any }[]
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
      .addCase(fetchExperimentWorkflows.fulfilled, (state, action) => {
        state.workflows.data = JSON.parse(action.payload.data)
        state.workflows.loading = false
        state.workflows.error = null
      })
      .addCase(fetchExperimentWorkflows.pending, state => {
        state.workflows.loading = true
      })
      .addCase(fetchExperimentWorkflows.rejected, state => {
        state.workflows.loading = false
        state.workflows.error = "Error fetching workflows"
      })
  },
})

//Thunk Calls for fetching data

const apiPath = "api/"

export const fetchExperimentWorkflows = createAsyncThunk(
  "progressPage/fetch_experiment_workflows",
  async (experimentId: string) => {
    const request = {
      ...defaultDataExplorationQuery,
      datasetId: `file://${experimentId}/workflows.json`,
      limit: 1000
    }
    const requestUrl = apiPath + "visualization/data"
    return axios.post<any>(requestUrl, request).then(response => response.data)
  },
)

//Reducer exports
export const {
  setProgressBarData,
  setProgressGauges,
  setProgressParallel,
  setProgressWokflowsTable,
  setProgressScheduledTable
} = progressPageSlice.actions

export default progressPageSlice.reducer
