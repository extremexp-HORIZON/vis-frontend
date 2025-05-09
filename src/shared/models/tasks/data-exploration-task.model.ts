import type {
  ActionReducerMapBuilder} from "@reduxjs/toolkit";
import {
  createAsyncThunk,
  PayloadAction,
} from "@reduxjs/toolkit"
import type { IWorkflowPage } from "../../../store/slices/workflowPageSlice"
import type {
  IDataExplorationMetaDataResponse,
  IDataExplorationRequest,
  IDataExplorationResponse,
  IFilter,
  IMetaDataRequest,
  VisualColumn,
} from "../dataexploration.model"
import {
  handleMultiTimeSeriesData,
  prepareDataExplorationResponse,
} from "./model-analysis.model"
import { api } from "../../../app/api/api"

export interface IDataExploration {
  multipleTimeSeries: {
    data: IDataExplorationResponse | null
    loading: boolean
    error: string | null
  }
  dataTable: {
    data: IDataExplorationResponse | null
    loading: boolean
    error: string | null
  }
  lineChart: {
    data: IDataExplorationResponse | null
    loading: boolean
    error: string | null
  }
  barChart: {
    data: IDataExplorationResponse | null
    loading: boolean
    error: string | null
  }
  scatterChart: {
    data: IDataExplorationResponse | null
    loading: boolean
    error: string | null
  }
  mapChart: {
    data: IDataExplorationResponse | null
    loading: boolean
    error: string | null
  }
  heatChart: {
    data: IDataExplorationResponse | null
    loading: boolean
    error: string | null
  }
  
  metaData: {
    data: IDataExplorationMetaDataResponse | null
    loading: boolean
    error: string | null
  }
  controlPanel: {
    chartType: string
    selectedColumns: VisualColumn[]
    filters: IFilter[]
    viewMode: "overlay" | "stacked"
    selectedDataset: string
    currentPage: number
    timestampField: string | null

    //Line
    xAxis: VisualColumn
    yAxis: VisualColumn[]
    //Bar
    barGroupBy: string[]
    barAggregation: any
    selectedMeasureColumn: null,

    //Scatter
    xAxisScatter: VisualColumn
    yAxisScatter: VisualColumn[]
    colorBy: VisualColumn
    umap: boolean
    //Heatmap
    barGroupByHeat: string[]
    barAggregationHeat: any
    selectedMeasureColumnHeat: null,

    //Map
    colorByMap: string
    segmentBy: string[]
    lat: string
    lon: string
    heatmap: boolean
    tripsMode: boolean
    selectedColumnsMap: string[]

  }
  chart: {
    data: IDataExplorationResponse | null
    loading: boolean
    error: string | null
  }
  umap: {
    data: any | null
    loading: boolean
    error: string | null
  }
}

// Define the initial state of the slice
export const dataExplorationDefault: IDataExploration = {
  multipleTimeSeries: {
    data: null,
    loading: false,
    error: null,
  },

  dataTable: {
    data: null,
    loading: false,
    error: null,
  },
  lineChart: {
    data: null,
    loading: false,
    error: null,
  },
  barChart: {
    data: null,
    loading: false,
    error: null,
  },
  heatChart: {
    data: null,
    loading: false,
    error: null,
  },
  scatterChart: {
    data: null,
    loading: false,
    error: null,
  },
  mapChart: {
    data: null,
    loading: false,
    error: null,
  },
  metaData: {
    data: null,
    loading: false,
    error: null,
  },
  controlPanel: {
    chartType: "datatable",
    selectedColumns: [],
    filters: [],
    xAxis: { name: "", type: "" },
    xAxisScatter: { name: "", type: "" },
    yAxis: [],
    yAxisScatter: [],
    barGroupBy: [],
    barAggregation: {},
    viewMode: "overlay",
    colorBy: { name: "", type: "" },
    colorByMap: "None",
    tripsMode: false,
    selectedColumnsMap: [],
    selectedDataset: "",
    currentPage: 1,
    lat: "",
    lon: "",
    umap: false,
    segmentBy: [],
    timestampField: null,
    selectedMeasureColumn: null,
    heatmap: false,
    barGroupByHeat: [],
    barAggregationHeat: {},
    selectedMeasureColumnHeat: null,

    
  },
  
  chart: {
    data: null,
    loading: false,
    error: null,
  },
  umap: {
    data: null,
    loading: false,
    error: null,
  },
}

export const explainabilityExtraReducers = (
  builder: ActionReducerMapBuilder<IWorkflowPage>,
) => {
  builder
    .addCase(fetchDataExplorationData.fulfilled, (state, action) => {
      const dataExplorationTask =
        state.tab?.workflowId === action.meta.arg.metadata.workflowId
          ? state.tab?.workflowTasks.dataExploration
          : null
      const queryCase = action.meta.arg.metadata
        .queryCase as keyof IDataExploration
      console.log("Data exploration task:", dataExplorationTask) // Debugging log

      if (dataExplorationTask) {
        dataExplorationTask[queryCase].data =
          queryCase === "multipleTimeSeries"
            ? handleMultiTimeSeriesData(action.payload)
            : prepareDataExplorationResponse(action.payload)
        dataExplorationTask[queryCase].loading = false
        dataExplorationTask[queryCase].error = null
      }
    })
    .addCase(fetchDataExplorationData.pending, (state, action) => {
      const dataExplorationTask =
        state.tab?.workflowId === action.meta.arg.metadata.workflowId
          ? state.tab?.workflowTasks.dataExploration
          : null
      const queryCase = action.meta.arg.metadata
        .queryCase as keyof IDataExploration
      if (dataExplorationTask) {
        dataExplorationTask[queryCase].loading = true
      }
    })
    .addCase(fetchDataExplorationData.rejected, (state, action) => {
      const dataExplorationTask =
        state.tab?.workflowId === action.meta.arg.metadata.workflowId
          ? state.tab?.workflowTasks.dataExploration
          : null
      const queryCase = action.meta.arg.metadata
        .queryCase as keyof IDataExploration
      if (dataExplorationTask) {
        dataExplorationTask[queryCase].loading = false
        dataExplorationTask[queryCase].error = "Failed to fetch data"
      }
    })

    .addCase(fetchMetaData.fulfilled, (state, action) => {
      const dataExplorationTask =
        state.tab?.workflowId === action.meta.arg.metadata.workflowId
          ? state.tab?.workflowTasks.dataExploration
          : null
      if (dataExplorationTask) {
        dataExplorationTask.metaData.data = action.payload
        dataExplorationTask.metaData.loading = false
        dataExplorationTask.metaData.error = null
        dataExplorationTask.controlPanel.selectedColumns =
          action.payload.originalColumns?.slice(0, 5) ?? []

        if (action.payload.originalColumns[0]) {
          dataExplorationTask.controlPanel.xAxis = action.payload.originalColumns[0]
        }

        const defaultYAxis = action.payload.originalColumns.length > 1 ? 
          [action.payload.originalColumns[1]] : [action.payload.originalColumns[0]].filter(Boolean)
        dataExplorationTask.controlPanel.yAxis = defaultYAxis
      }
    })
    .addCase(fetchMetaData.pending, (state, action) => {
      const dataExplorationTask =
        state.tab?.workflowId === action.meta.arg.metadata.workflowId
          ? state.tab?.workflowTasks.dataExploration
          : null
      if (dataExplorationTask) {
        dataExplorationTask.metaData.loading = true
      }
    })
    .addCase(fetchMetaData.rejected, (state, action) => {
      const dataExplorationTask =
        state.tab?.workflowId === action.meta.arg.metadata.workflowId
          ? state.tab?.workflowTasks.dataExploration
          : null
      if (dataExplorationTask) {
        dataExplorationTask.metaData.loading = false
        dataExplorationTask.metaData.error = "Failed to fetch metadata"
      }
    })
    .addCase(fetchUmap.fulfilled, (state, action) => {
      const dataExplorationTask =
        state.tab?.workflowId === action.meta.arg.metadata.workflowId
          ? state.tab?.workflowTasks.dataExploration
          : null
      if (dataExplorationTask) {
        dataExplorationTask.umap.data = action.payload
        dataExplorationTask.umap.loading = false
        dataExplorationTask.umap.error = null
      }
    })
    .addCase(fetchUmap.pending, (state, action) => {
      const dataExplorationTask =
        state.tab?.workflowId === action.meta.arg.metadata.workflowId
          ? state.tab?.workflowTasks.dataExploration
          : null
      if (dataExplorationTask) {
        dataExplorationTask.umap.loading = true
      }
    })
    .addCase(fetchUmap.rejected, (state, action) => {
      const dataExplorationTask =
        state.tab?.workflowId === action.meta.arg.metadata.workflowId
          ? state.tab?.workflowTasks.dataExploration
          : null
      if (dataExplorationTask) {
        dataExplorationTask.umap.loading = false
        dataExplorationTask.umap.error = "Failed to fetch umap"
      }
    })
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

export const fetchMetaData = createAsyncThunk(
  "workflowTasks/data_exploration/fetch_metadata",
  async (payload: IMetaDataRequest) => {
    const requestUrl = "data/metadata"
    return api
      .post<IDataExplorationMetaDataResponse>(requestUrl, payload.query)
      .then(response => response.data)
  },
)
export const fetchUmap = createAsyncThunk(
  "workflowTasks/data_exploration/fetch_umap",
  async (payload: { data: number[][]; metadata: any }) => {
    const requestUrl = "data/umap"
    // Send just the array data directly as request body
    return api
      .post<any>(requestUrl, payload.data)
      .then(response => response.data)
  },
)
