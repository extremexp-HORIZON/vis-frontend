import { ActionReducerMapBuilder, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import { IWorkflowPage } from "../../../store/slices/workflowPageSlice"
import {
  IDataExplorationRequest,
  IDataExplorationResponse,
} from "../dataexploration.model"
import {
  handleMultiTimeSeriesData,
  prepareDataExplorationResponse,
} from "./model-analysis.model"
import { api } from "../../../app/api/api"

export interface IDataExploration {
  multipleTimeSeries: {
    data: IDataExplorationResponse | null, 
    loading: boolean, 
    error: string | null
  }
  dataTable:{
    data: IDataExplorationResponse | null
    loading: boolean
    error: string | null
  }
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
  scatterChart:{
    data: IDataExplorationResponse | null
    loading: boolean
    error: string | null

  }
  mapChart:{
    data: IDataExplorationResponse | null
    loading: boolean
    error: string | null
  }
  metaData:{
    data: IDataExplorationResponse | null
    loading: boolean
    error: string | null

  }
}

// Define the initial state of the slice
export const dataExplorationDefault: IDataExploration = {
  multipleTimeSeries: {
    data: null,
    loading: false,
    error: null
  },
  
  dataTable: {
    data: null,
    loading: false,
    error: null
  },
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
  scatterChart:{
    data: null,
    loading: false,
    error:  null

  },
  mapChart:{
    data: null,
    loading: false,
    error:  null
  },
  metaData:{

    data: null,
    loading: false,
    error:  null

  }
}

// export const additionalReducers = {
//   updateFilters: (state: IWorkflowPage, action: PayloadAction<{ filter: IFilter, workflowId: any }>) => {
//     const compareCompletedTask = state.tabs.find(
//       tab => tab.workflowId === action.payload.workflowId
//     )?.workflowTasks?.dataExploration;
//     if (compareCompletedTask) {
//       compareCompletedTask.filters = [...compareCompletedTask.filters, action.payload.filter];
//     }
//   },
//   updateColumns: (state: IWorkflowPage, action: PayloadAction<{ columns: VisualColumn[], workflowId: any }>) => {
//     const compareCompletedTask = state.tabs.find(
//       tab => tab.workflowId === action.payload.workflowId
//     )?.workflowTasks?.dataExploration;
//     if (compareCompletedTask) {
//       compareCompletedTask.columns = action.payload.columns;
//     }
//   },
//   updateChartData: (state: IWorkflowPage, action: PayloadAction<{ chartType: "lineChart" | "barChart", data: {xAxis?: string, yAxis?: string[], 
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
  builder: ActionReducerMapBuilder<IWorkflowPage>,
) => {
  builder.addCase(fetchDataExplorationData.fulfilled, (state, action) => {
    const dataExplorationTask = state.tab?.workflowId === action.meta.arg.metadata.workflowId ?
      state.tab?.workflowTasks.dataExploration : null
    const queryCase = action.meta.arg.metadata.queryCase as keyof IDataExploration
    console.log("Data exploration task:", dataExplorationTask); // Debugging log

        if (dataExplorationTask) {
          dataExplorationTask[queryCase].data = queryCase === "multipleTimeSeries" ? handleMultiTimeSeriesData(action.payload) : prepareDataExplorationResponse(action.payload)
          dataExplorationTask[queryCase].loading = false
          dataExplorationTask[queryCase].error = null
        }
  })
  .addCase(fetchDataExplorationData.pending, (state, action) => {
    const dataExplorationTask = state.tab?.workflowId === action.meta.arg.metadata.workflowId ?
      state.tab?.workflowTasks.dataExploration : null
    const queryCase = action.meta.arg.metadata.queryCase as keyof IDataExploration
        if (dataExplorationTask) {
          dataExplorationTask[queryCase].loading = true
        }
  })
  .addCase(fetchDataExplorationData.rejected, (state, action) => {
    const dataExplorationTask = state.tab?.workflowId === action.meta.arg.metadata.workflowId ?
      state.tab?.workflowTasks.dataExploration : null
    const queryCase = action.meta.arg.metadata.queryCase as keyof IDataExploration
        if (dataExplorationTask) {
          dataExplorationTask[queryCase].loading = false
          dataExplorationTask[queryCase].error = "Failed to fetch data"
        }
  })

  .addCase(fetchMetaData.fulfilled, (state, action) => {
    const dataExplorationTask = state.tab?.workflowId === action.meta.arg.metadata.workflowId ?
      state.tab?.workflowTasks.dataExploration : null
      if (dataExplorationTask) {
        dataExplorationTask.metaData.data = action.payload;
        dataExplorationTask.metaData.loading = false;
        dataExplorationTask.metaData.error = null;
      }
    })
    .addCase(fetchMetaData.pending, (state, action) => {
      const dataExplorationTask = state.tab?.workflowId === action.meta.arg.metadata.workflowId ?
      state.tab?.workflowTasks.dataExploration : null
      if (dataExplorationTask) {
        dataExplorationTask.metaData.loading = true;
      }
    })
    .addCase(fetchMetaData.rejected, (state, action) => {
      const dataExplorationTask = state.tab?.workflowId === action.meta.arg.metadata.workflowId ?
      state.tab?.workflowTasks.dataExploration : null
      if (dataExplorationTask) {
        dataExplorationTask.metaData.loading = false;
        dataExplorationTask.metaData.error = "Failed to fetch metadata";
      }
    });
}

export const fetchDataExplorationData = createAsyncThunk(
  "workflowTasks/data_exploration/fetch_data",
  async (payload: IDataExplorationRequest) => {
    const requestUrl = "data/tabular"
    return api
      .post<IDataExplorationResponse>(requestUrl, payload.query)
      .then(response => response.data)
  },
)

export const fetchMetaData=createAsyncThunk(
  "workflowTasks/data_exploration/fetch_metadata",
  async(payload:IDataExplorationRequest)=>{
    const requestUrl="data/metadata"
    return api
    .post<IDataExplorationResponse>(requestUrl, payload.query)
      .then(response => response.data)
  }
)
