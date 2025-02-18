import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit"
import { IPlotModel } from "../plotmodel.model"
import { IWorkflowTab } from "../../../store/slices/workflowTabsSlice"
import axios from "axios"
import {
  fetchAffectedRequest,
  IDataExplorationRequest,
  IDataExplorationResponse
} from "../dataexploration.model"
import { FetchExplainabilityPlotPayload } from "./explainability.model"

export const prepareDataExplorationResponse = (payload: IDataExplorationResponse) => ({
  ...payload,
  data: JSON.parse(payload.data),
})

export const handleMultiTimeSeriesData = (payload : any) => {
  const fileData = JSON.parse(payload.data);
  const seriesData = payload.fileNames;
  const flatFileData =  fileData.flatMap((file: any, id:number)=> {
    return file.map((row: any) => {
      return { 
        ...row,
        timestamp: new Date(row.timestamp), // Ensure timestamp is parsed as Date object
        value: +row.f3, // Ensure value is a number
        series: seriesData[id].replace('.csv', '') // Strip the .csv extension for series name
      };
    });
  });
  return {...payload, data: flatFileData};
}

export interface IModelAnalysis {
  featureNames: string[]
  pdp: { data: IPlotModel | null; loading: boolean; error: string | null }
  ale: { data: IPlotModel | null; loading: boolean; error: string | null }
  counterfactuals: {
    data: IPlotModel | null
    loading: boolean
    error: string | null
  }
  global_counterfactuals:{
    data: IPlotModel | null
    loading: boolean
    error: string | null
  }
  influenceFunctions: {
    data: IPlotModel | null
    loading: boolean
    error: string | null
  }
  modelInstances: { data: IDataExplorationResponse | null; loading: boolean; error: string | null }
  modelConfusionMatrix: {
    data: IDataExplorationResponse | null
    loading: boolean
    error: string | null
  }
  multipleTimeSeries: {
    data: IDataExplorationResponse | null
    loading: boolean
    error: string | null
  }
  multipleTimeSeriesMetadata: {
    data: IDataExplorationResponse | null
    loading: boolean
    error: string | null
  }
  affected: {
    data: any | null
    loading: boolean
    error: string | null
  }
}

export const modelAnalysisDefault: IModelAnalysis = {
  featureNames: [],
  pdp: { data: null, loading: false, error: null },
  ale: { data: null, loading: false, error: null },
  counterfactuals: { data: null, loading: false, error: null },
  global_counterfactuals: { data: null, loading: false, error: null },
  influenceFunctions: { data: null, loading: false, error: null },
  modelInstances: { data: null, loading: false, error: null },
  modelConfusionMatrix: { data: null, loading: false, error: null },
  multipleTimeSeries: { data: null, loading: false, error: null },
  multipleTimeSeriesMetadata: { data: null, loading: false, error: null },
  affected: { data: null, loading: false, error: null },
}

export const modelAnalysisReducers = (
  builder: ActionReducerMapBuilder<IWorkflowTab>,
) => {
  builder
    .addCase(
      fetchModelAnalysisExplainabilityPlot.fulfilled,
      (state, action) => {
        const compareCompletedTask = state.tabs.find(
          tab => tab.workflowId === `${action.meta.arg.metadata.workflowId}`,
        )?.workflowTasks.modelAnalysis
        const plotType = action.meta.arg.query.explanation_method as keyof IModelAnalysis;
        console.log(compareCompletedTask, plotType)
        if (compareCompletedTask && plotType !== 'featureNames') {
              compareCompletedTask[plotType].data = action.payload
              compareCompletedTask[plotType].loading = false
              compareCompletedTask[plotType].error = null
        }
      },
    )
    .addCase(fetchModelAnalysisData.fulfilled, (state, action) => {
      const compareCompletedTask = state.tabs.find(
        tab => tab.workflowId === action.meta.arg.metadata.workflowId,
      )?.workflowTasks.modelAnalysis
      const queryCase = action.meta.arg.metadata.queryCase as keyof IModelAnalysis
      if (compareCompletedTask && queryCase !== 'featureNames') {
        compareCompletedTask[queryCase].data = queryCase === "multipleTimeSeries" ? handleMultiTimeSeriesData(action.payload) : prepareDataExplorationResponse(action.payload)
        compareCompletedTask[queryCase].loading = false
        compareCompletedTask[queryCase].error = null
      }
    })
    .addCase(fetchModelAnalysisExplainabilityPlot.pending, (state, action) => {
      const compareCompletedTask = state.tabs.find(
        tab => tab.workflowId === `${action.meta.arg.metadata.workflowId}`,
      )?.workflowTasks.modelAnalysis
      const plotType = action.meta.arg.query.explanation_method as keyof IModelAnalysis;
        if (compareCompletedTask && plotType !== 'featureNames') {
              compareCompletedTask[plotType].loading = true
        }
    })
    .addCase(fetchModelAnalysisData.pending, (state, action) => {
      const compareCompletedTask = state.tabs.find(
        tab => tab.workflowId === action.meta.arg.metadata.workflowId,
      )?.workflowTasks.modelAnalysis
      const queryCase = action.meta.arg.metadata.queryCase as keyof IModelAnalysis
      if (compareCompletedTask && queryCase !== 'featureNames') {
        compareCompletedTask[queryCase].loading = true
      }
    })
    .addCase(fetchModelAnalysisExplainabilityPlot.rejected, (state, action) => {
      const compareCompletedTask = state.tabs.find(
        tab => tab.workflowId === `${action.meta.arg.metadata.workflowId}`,
      )?.workflowTasks.modelAnalysis
      const plotType = action.meta.arg.query.explanation_method as keyof IModelAnalysis;
        if (compareCompletedTask && plotType !== 'featureNames') {
              compareCompletedTask[plotType].loading = false
              compareCompletedTask[plotType].error = "Failed to fetch data"
        }
    })
    .addCase(fetchModelAnalysisData.rejected, (state, action) => {
      const compareCompletedTask = state.tabs.find(
        tab => tab.workflowId === action.meta.arg.metadata.workflowId,
      )?.workflowTasks.modelAnalysis
      const queryCase = action.meta.arg.metadata.queryCase as keyof IModelAnalysis
      if (compareCompletedTask && queryCase !== 'featureNames') {
        compareCompletedTask[queryCase].loading = false
        compareCompletedTask[queryCase].error = "Failed to fetch data"
      }
    })
    .addCase(
      fetchAffected.fulfilled,
      (state, action) => {
        const compareCompletedTask = state.tabs.find(
          tab => tab.workflowId === `${action.meta.arg.workflowId}`,
        )?.workflowTasks.modelAnalysis
        const plotType = action.meta.arg.queryCase as keyof IModelAnalysis;
        console.log(compareCompletedTask, plotType)
        if (compareCompletedTask && plotType !== 'featureNames' ) {
              compareCompletedTask[plotType].data = action.payload
              compareCompletedTask[plotType].loading = false
              compareCompletedTask[plotType].error = null
        }
      },
    )
    .addCase(fetchAffected.pending, (state, action) => {
      const compareCompletedTask = state.tabs.find(
        tab => tab.workflowId === `${action.meta.arg.workflowId}`,
      )?.workflowTasks.modelAnalysis
      const plotType = action.meta.arg.queryCase as keyof IModelAnalysis;
      if (compareCompletedTask && plotType !== 'featureNames') {
            compareCompletedTask[plotType].loading = true
      }
    })
    .addCase(fetchAffected.rejected, (state, action) => {
      const compareCompletedTask = state.tabs.find(
        tab => tab.workflowId === `${action.meta.arg.workflowId}`,
      )?.workflowTasks.modelAnalysis
      const plotType = action.meta.arg.queryCase as keyof IModelAnalysis;
      if (compareCompletedTask && plotType !== 'featureNames') {
            compareCompletedTask[plotType].loading = false
            compareCompletedTask[plotType].error = "Failed to fetch data"
      }
    })
}

export const fetchModelAnalysisExplainabilityPlot = createAsyncThunk(
  "workflowTasks/model_analysis/fetch_explainability_plot",
  async (payload: FetchExplainabilityPlotPayload) => {
    const requestUrl = "/api/explainability"
    return axios.post<any>(requestUrl, payload.query).then(response => response.data)
  },
)
export const fetchAffected = createAsyncThunk(
  "workflowTasks/model_analysis/fetch_affected",
  async (payload: fetchAffectedRequest) => {
    const requestUrl = "/api/affected"
    return axios.get<any>(requestUrl).then(response => response.data)
  },
)

export const fetchModelAnalysisData = createAsyncThunk(
  "workflowTasks/model_analysis/fetch_data",
  async (payload: IDataExplorationRequest) => {
    const requestUrl = "api/visualization/tabular"
    return axios
      .post<IDataExplorationResponse>(requestUrl, payload.query)
      .then(response => response.data)
  }
)
