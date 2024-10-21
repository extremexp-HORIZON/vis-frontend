import { ActionReducerMapBuilder, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import { IWorkflowTab } from "../../../store/slices/workflowTabsSlice"
import axios from "axios"
import {
  IDataExplorationRequest,
  IDataExplorationResponse,
  IFilter,
  VisualColumn,
} from "../dataexploration.model"
import {
  prepareDataExplorationResponse,
} from "./model-analysis.model"

export interface IDataExploration {
  multipleTimeSeries: any[]
  // filters: IFilter[]
  // columns: VisualColumn[]
  lineChart: {
    data: IDataExplorationResponse | null
    loading: boolean
    error: string | null
    // xAxis: string
    // yAxis: string[]
  }
  barChart: {
    data: IDataExplorationResponse | null
    loading: boolean
    error: string | null
    // aggregations: {
    //   xAxis: string
    //   yAxis: string[] | null
    //   groupFunction: string[]
    // }[]
  }
}

// Define the initial state of the slice
export const dataExplorationDefault: IDataExploration = {
  multipleTimeSeries: [],
  // filters: [],
  // columns: [],
  lineChart: {
    data: null,
    loading: false,
    error: null,
    // xAxis: "",
    // yAxis: [],
  },
  barChart: {
    data: null,
    loading: false,
    error: null,
    // aggregations: [],
  },
}

// export const additionalReducers = {
//   updateFilters: (state: IWorkflowTab, action: PayloadAction<{ filter: IFilter, workflowId: any }>) => {
//     const compareCompletedTask = state.tabs.find(
//       tab => tab.workflowId === action.payload.workflowId
//     )?.workflowTasks?.dataExploration;
//     if (compareCompletedTask) {
//       compareCompletedTask.filters = [...compareCompletedTask.filters, action.payload.filter];
//     }
//   },
//   updateColumns: (state: IWorkflowTab, action: PayloadAction<{ columns: VisualColumn[], workflowId: any }>) => {
//     const compareCompletedTask = state.tabs.find(
//       tab => tab.workflowId === action.payload.workflowId
//     )?.workflowTasks?.dataExploration;
//     if (compareCompletedTask) {
//       compareCompletedTask.columns = action.payload.columns;
//     }
//   },
//   updateChartData: (state: IWorkflowTab, action: PayloadAction<{ chartType: "lineChart" | "barChart", data: {xAxis?: string, yAxis?: string[], 
//     aggregations?: {
//     xAxis: string
//     yAxis: string[] | null
//     groupFunction: string[]
//   }[]}, workflowId: any }>) => {
//     const compareCompletedTask = state.tabs.find(
//       tab => tab.workflowId === action.payload.workflowId
//     )?.workflowTasks?.dataExploration;
//     if (compareCompletedTask && action.payload.chartType === "lineChart") {
//       compareCompletedTask[action.payload.chartType] = {...compareCompletedTask[action.payload.chartType], ...action.payload.data};
//     }else if (compareCompletedTask && action.payload.chartType === "barChart") {
//       compareCompletedTask[action.payload.chartType] = {...compareCompletedTask[action.payload.chartType], ...action.payload.data};
//     }
//   },
//   // Add more reducers as needed
// };

export const explainabilityExtraReducers = (
  builder: ActionReducerMapBuilder<IWorkflowTab>,
) => {
  builder.addCase(fetchDataExplorationData.fulfilled, (state, action) => {
    const dataExplorationTask = state.tabs.find(
      tab => tab.workflowId === action.meta.arg.metadata.workflowId,
    )?.workflowTasks.dataExploration
    const queryCase = action.meta.arg.metadata.queryCase as keyof IDataExploration
        if (dataExplorationTask && (queryCase === "lineChart" || queryCase === "barChart")) {
          dataExplorationTask[queryCase].data = prepareDataExplorationResponse(action.payload)
          dataExplorationTask[queryCase].loading = false
          dataExplorationTask[queryCase].error = null
        }
  })
  .addCase(fetchDataExplorationData.pending, (state, action) => {
    const dataExplorationTask = state.tabs.find(
      tab => tab.workflowId === action.meta.arg.metadata.workflowId,
    )?.workflowTasks.dataExploration
    const queryCase = action.meta.arg.metadata.queryCase as keyof IDataExploration
        if (dataExplorationTask && (queryCase === "lineChart" || queryCase === "barChart")) {
          dataExplorationTask[queryCase].loading = true
        }
  })
  .addCase(fetchDataExplorationData.rejected, (state, action) => {
    const dataExplorationTask = state.tabs.find(
      tab => tab.workflowId === action.meta.arg.metadata.workflowId,
    )?.workflowTasks.dataExploration
    const queryCase = action.meta.arg.metadata.queryCase as keyof IDataExploration
        if (dataExplorationTask && (queryCase === "lineChart" || queryCase === "barChart")) {
          dataExplorationTask[queryCase].loading = false
          dataExplorationTask[queryCase].error = "Failed to fetch data"
        }
  })
}

export const fetchDataExplorationData = createAsyncThunk(
  "workflowTasks/data_exploration/fetch_data",
  async (payload: IDataExplorationRequest) => {
    const requestUrl = "api/visualization/data"
    return axios
      .post<IDataExplorationResponse>(requestUrl, payload.query)
      .then(response => response.data)
  },
)
