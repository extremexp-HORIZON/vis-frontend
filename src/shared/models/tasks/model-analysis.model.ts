import type { ActionReducerMapBuilder} from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit"
import type { IPlotModel } from "../plotmodel.model"
import type { IWorkflowPage } from "../../../store/slices/workflowPageSlice"
import type {
  fetchAffectedRequest,
  IDataExplorationRequest,
  IDataExplorationResponse
} from "../dataexploration.model"
import type { FetchExplainabilityPlotPayload } from "./explainability.model"
import { api, experimentApi } from "../../../app/api/api"
import { createAction } from "@reduxjs/toolkit";

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
  pdp: { data: IPlotModel | null; loading: boolean; error: string | null; selectedFeature: string | null; }
  ale: { data: IPlotModel | null; loading: boolean; error: string | null; selectedFeature: string | null; }
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
  modelInstances: { data: any | null; loading: boolean; error: string | null }
  modelConfusionMatrix: {
    data: {labels: any, matrix: any} | null
    loading: boolean
    error: string | null
  }
  modelRocCurve: {
    data: {fpr: number[]; tpr: number[]; thresholds?: number[]; auc?: number} | null
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
  modelSummary: {
    data: {
      overallMetrics: Record<string, number>
      classificationReport: Array<Record<string, string | number>>
      numSamples: number
      numFeatures: number
      classLabels: string[]
      dataSplitSizes: Record<string, number>
    } | null
    loading: boolean
    error: string | null  
  }
}

export const modelAnalysisDefault: IModelAnalysis = {
  featureNames: [],
  pdp: { data: null, loading: false, error: null, selectedFeature: null },
  ale: { data: null, loading: false, error: null, selectedFeature: null },
  counterfactuals: { data: null, loading: false, error: null },
  global_counterfactuals: { data: null, loading: false, error: null },
  influenceFunctions: { data: null, loading: false, error: null },
  modelInstances: { data: null, loading: false, error: null },
  modelConfusionMatrix: { data: null, loading: false, error: null },
  modelRocCurve: {data: null, loading: false, error: null },
  multipleTimeSeries: { data: null, loading: false, error: null },
  multipleTimeSeriesMetadata: { data: null, loading: false, error: null },
  affected: { data: null, loading: false, error: null },
  modelSummary: { data: null, loading: false, error: null }
}

export const setSelectedFeature = createAction<{plotType: keyof IModelAnalysis; feature: string}>("modelAnalysis/set_selected_feature");

export const modelAnalysisReducers = (
  builder: ActionReducerMapBuilder<IWorkflowPage>,
) => {
  builder
  .addCase(fetchModelAnalysisExplainabilityPlot.fulfilled, (state, action) => {
      const compareCompletedTask = state.tab?.workflowId === `${action.meta.arg.metadata.workflowId}`
        ? state.tab.workflowTasks.modelAnalysis
        : null;
    
      const plotType = action.meta.arg.query.explanation_method as keyof IModelAnalysis;
    
      if (compareCompletedTask && plotType !== 'featureNames') {
        const plotSection = compareCompletedTask[plotType];
      
        // Check if 'selectedFeature' exists on the plotSection
        if ('selectedFeature' in plotSection) {
          (plotSection as { selectedFeature: string | null }).selectedFeature = action.payload.features.feature1;
        }
      
        (plotSection as { data: any; loading: boolean; error: string | null }).data = action.payload;
        (plotSection as { data: any; loading: boolean; error: string | null }).loading = false;
        (plotSection as { data: any; loading: boolean; error: string | null }).error = null;
      }
    })
      .addCase(fetchModelAnalysisData.fulfilled, (state, action) => {
      const compareCompletedTask = state.tab?.workflowId === action.meta.arg.metadata.workflowId ? state.tab.workflowTasks.modelAnalysis : null
      const queryCase = action.meta.arg.metadata.queryCase as keyof IModelAnalysis
      if (compareCompletedTask && queryCase !== 'featureNames') {
        compareCompletedTask[queryCase].data = queryCase === "multipleTimeSeries" ? handleMultiTimeSeriesData(action.payload) : prepareDataExplorationResponse(action.payload)
        compareCompletedTask[queryCase].loading = false
        compareCompletedTask[queryCase].error = null
      }
    })
    .addCase(fetchModelAnalysisExplainabilityPlot.pending, (state, action) => {
      const compareCompletedTask = state.tab?.workflowId === `${action.meta.arg.metadata.workflowId}` ? state.tab.workflowTasks.modelAnalysis : null
      const plotType = action.meta.arg.query.explanation_method as keyof IModelAnalysis;
        if (compareCompletedTask && plotType !== 'featureNames') {
              compareCompletedTask[plotType].loading = true
        }
    })
    .addCase(fetchModelAnalysisData.pending, (state, action) => {
      const compareCompletedTask = state.tab?.workflowId === action.meta.arg.metadata.workflowId ? state.tab.workflowTasks.modelAnalysis : null
      const queryCase = action.meta.arg.metadata.queryCase as keyof IModelAnalysis
      if (compareCompletedTask && queryCase !== 'featureNames') {
        compareCompletedTask[queryCase].loading = true
      }
    })
    .addCase(fetchModelAnalysisExplainabilityPlot.rejected, (state, action) => {
      const compareCompletedTask = state.tab?.workflowId === `${action.meta.arg.metadata.workflowId}` ? state.tab.workflowTasks.modelAnalysis : null
      const plotType = action.meta.arg.query.explanation_method as keyof IModelAnalysis;
        if (compareCompletedTask && plotType !== 'featureNames') {
              compareCompletedTask[plotType].loading = false
              compareCompletedTask[plotType].error = "Failed to fetch data"
        }
    })
    .addCase(fetchModelAnalysisData.rejected, (state, action) => {
      const compareCompletedTask = state.tab?.workflowId === action.meta.arg.metadata.workflowId ? state.tab.workflowTasks.modelAnalysis : null
      const queryCase = action.meta.arg.metadata.queryCase as keyof IModelAnalysis
      if (compareCompletedTask && queryCase !== 'featureNames') {
        compareCompletedTask[queryCase].loading = false
        compareCompletedTask[queryCase].error = "Failed to fetch data"
      }
    })
    .addCase(
      fetchAffected.fulfilled,
      (state, action) => {
        const compareCompletedTask = state.tab?.workflowId === `${action.meta.arg.workflowId}` ? state.tab.workflowTasks.modelAnalysis : null
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
      const compareCompletedTask = state.tab?.workflowId === `${action.meta.arg.workflowId}` ? state.tab.workflowTasks.modelAnalysis : null
      const plotType = action.meta.arg.queryCase as keyof IModelAnalysis;
      if (compareCompletedTask && plotType !== 'featureNames') {
            compareCompletedTask[plotType].loading = true
      }
    })
    .addCase(fetchAffected.rejected, (state, action) => {
      const compareCompletedTask = state.tab?.workflowId === `${action.meta.arg.workflowId}` ? state.tab.workflowTasks.modelAnalysis : null
      const plotType = action.meta.arg.queryCase as keyof IModelAnalysis;
      if (compareCompletedTask && plotType !== 'featureNames') {
            compareCompletedTask[plotType].loading = false
            compareCompletedTask[plotType].error = "Failed to fetch data"
      }
    })
    .addCase(setSelectedFeature, (state, action) => {
      const { plotType, feature } = action.payload;
      const modelAnalysis = state.tab?.workflowTasks.modelAnalysis;

      if (modelAnalysis && plotType in modelAnalysis && plotType !== 'featureNames') {
        const section = modelAnalysis[plotType] as
          | { selectedFeature: string | null }
          | { data: any; loading: boolean; error: string | null; selectedFeature?: string | null };

        if ('selectedFeature' in section) {
          section.selectedFeature = feature;
        }
      }
    })
    .addCase(
      fetchConfusionMatrix.fulfilled,
      (state, action) => {
        const compareCompletedTask = state.tab?.workflowId === `${action.meta.arg.runId}` ? state.tab.workflowTasks.modelAnalysis : null
        if(compareCompletedTask) {
          compareCompletedTask.modelConfusionMatrix.loading = false
          compareCompletedTask.modelConfusionMatrix.data = action.payload
          compareCompletedTask.modelConfusionMatrix.error = null
        }
      },
    )
    .addCase(fetchConfusionMatrix.pending, (state, action) => {
      const compareCompletedTask = state.tab?.workflowId === `${action.meta.arg.runId}` ? state.tab.workflowTasks.modelAnalysis : null
      if(compareCompletedTask) compareCompletedTask.modelConfusionMatrix.loading = true
    })
    .addCase(fetchConfusionMatrix.rejected, (state, action) => {
      const compareCompletedTask = state.tab?.workflowId === `${action.meta.arg.runId}` ? state.tab.workflowTasks.modelAnalysis : null
      if(compareCompletedTask) {
        compareCompletedTask.modelConfusionMatrix.loading = false
        compareCompletedTask.modelConfusionMatrix.error = action.error.message || "Failed to fetch confusion matrix"
      }
    })
    .addCase(getLabelTestInstances.pending, (state, action) => {
      const compareCompletedTask = state.tab?.workflowTasks.modelAnalysis;
      if (compareCompletedTask) {
        compareCompletedTask.modelInstances.loading = true;
        compareCompletedTask.modelInstances.error = null;
      }
    })
    .addCase(getLabelTestInstances.fulfilled, (state, action) => {
      const compareCompletedTask = state.tab?.workflowTasks.modelAnalysis;
      if (compareCompletedTask) {
        compareCompletedTask.modelInstances.data = action.payload; // treat as any
        compareCompletedTask.modelInstances.loading = false;
        compareCompletedTask.modelInstances.error = null;
      }
    })
    .addCase(getLabelTestInstances.rejected, (state, action) => {
      const compareCompletedTask = state.tab?.workflowTasks.modelAnalysis;
      if (compareCompletedTask) {
        compareCompletedTask.modelInstances.loading = false;
        compareCompletedTask.modelInstances.error = "Failed to fetch test instances";
      }
    })
    .addCase(fetchRocCurve.pending, (state, action) => {
      const compareCompletedTask =
        state.tab?.workflowId === `${action.meta.arg.runId}`
          ? state.tab.workflowTasks.modelAnalysis
          : null;
      if (compareCompletedTask) {
        compareCompletedTask.modelRocCurve.loading = true;
        compareCompletedTask.modelRocCurve.error = null;
      }
    })
    .addCase(fetchRocCurve.fulfilled, (state, action) => {
      const compareCompletedTask =
        state.tab?.workflowId === `${action.meta.arg.runId}`
          ? state.tab.workflowTasks.modelAnalysis
          : null;
      if (compareCompletedTask) {

        let rawData = typeof action.payload === "string"
        ? JSON.parse(action.payload.replace(/\bInfinity\b/g, "1e9").replace(/\b-Infinity\b/g, "-1e9"))
        : action.payload
  
      if (Array.isArray(rawData.thresholds)) {
        rawData.thresholds = rawData.thresholds.map((t: number | string) =>
          t === Infinity || t === "Infinity" ? 1e9 :
          t === -Infinity || t === "-Infinity" ? -1e9 :
          t
        );
      }  
        compareCompletedTask.modelRocCurve.data = rawData;
        compareCompletedTask.modelRocCurve.loading = false;
        compareCompletedTask.modelRocCurve.error = null;
      }
    })
    .addCase(fetchRocCurve.rejected, (state, action) => {
      const compareCompletedTask =
        state.tab?.workflowId === `${action.meta.arg.runId}`
          ? state.tab.workflowTasks.modelAnalysis
          : null;
      if (compareCompletedTask) {
        compareCompletedTask.modelRocCurve.loading = false;
        compareCompletedTask.modelRocCurve.error =
          action.error.message || "Failed to fetch ROC curve";
      }
    })
    .addCase(fetchModelSummary.pending, (state, action) => {
      const compareCompletedTask = state.tab?.workflowId === `${action.meta.arg.runId}`
        ? state.tab.workflowTasks.modelAnalysis
        : null;
      if (compareCompletedTask) {
        compareCompletedTask.modelSummary.loading = true;
        compareCompletedTask.modelSummary.error = null;
      }
    })
    .addCase(fetchModelSummary.fulfilled, (state, action) => {
      const compareCompletedTask = state.tab?.workflowId === `${action.meta.arg.runId}`
        ? state.tab.workflowTasks.modelAnalysis
        : null;
      if (compareCompletedTask) {
        compareCompletedTask.modelSummary.data = action.payload;
        compareCompletedTask.modelSummary.loading = false;
        compareCompletedTask.modelSummary.error = null;
      }
    })
    .addCase(fetchModelSummary.rejected, (state, action) => {
      const compareCompletedTask = state.tab?.workflowId === `${action.meta.arg.runId}`
        ? state.tab.workflowTasks.modelAnalysis
        : null;
      if (compareCompletedTask) {
        compareCompletedTask.modelSummary.loading = false;
        compareCompletedTask.modelSummary.error = action.error.message || "Failed to fetch classification summary";
      }
    })    
}

export const fetchModelAnalysisExplainabilityPlot = createAsyncThunk(
  "workflowTasks/model_analysis/fetch_explainability_plot",
  async (payload: FetchExplainabilityPlotPayload) => {
    const requestUrl = `explainability/${payload.metadata.experimentId}/${payload.metadata.workflowId}`
    return api.post<any>(requestUrl, payload.query).then(response => response.data)
  },
)
export const fetchAffected = createAsyncThunk(
  "workflowTasks/model_analysis/fetch_affected",
  async (payload: fetchAffectedRequest) => {
    const requestUrl = "affected"
    return api.get<any>(requestUrl).then(response => response.data)
  },
)

export const fetchModelAnalysisData = createAsyncThunk(
  "workflowTasks/model_analysis/fetch_data",
  async (payload: IDataExplorationRequest) => {
    const requestUrl = "data/tabular"
    return api
      .post<IDataExplorationResponse>(requestUrl, payload.query)
      .then(response => response.data)
  }
)


export const getLabelTestInstances = createAsyncThunk(
  'evaluation/getLabelTestInstances',
  async ({ experimentId, runId, offset = 0, limit = 100000 }: { experimentId: string; runId: string; offset?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await experimentApi.get(
        `${experimentId}/runs/${runId}/evaluation/test-instances`,
        {
          params: { offset, limit },
        }
      );
      console.log('Response:', response.data); // Log the response data
      return response.data;
    } catch (error) {
      // Customize the error handling as needed
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


export const fetchConfusionMatrix = createAsyncThunk(
  "workflowTasks/model_analysis/fetch_confusion_matrix",
  async (payload: {experimentId: string, runId: string}) => {
    const { experimentId, runId } = payload;
    const requestUrl = `${experimentId}/runs/${runId}/evaluation/confusion-matrix`
    return experimentApi.get<any>(requestUrl).then(response => response.data)
  }
)

export const fetchRocCurve = createAsyncThunk(
  "workflowTasks/model_analysis/fetch_roc_data",
  async (payload: {experimentId: string, runId: string}) => {
    const { experimentId, runId } = payload;
    const requestUrl = `${experimentId}/runs/${runId}/evaluation/roc-curve`
    return experimentApi.get<any>(requestUrl).then(response => response.data)
  }
)

export const fetchModelSummary = createAsyncThunk(
  "workflowTasks/model_analysis/fetch_classification_summary",
  async (payload: { experimentId: string; runId: string }) => {
    const { experimentId, runId } = payload;
    const requestUrl = `${experimentId}/runs/${runId}/evaluation/summary`;
    const response = await experimentApi.get(requestUrl);
    return response.data;
  }
)