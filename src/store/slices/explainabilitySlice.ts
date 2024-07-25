import { createSlice, createAsyncThunk, isFulfilled, isPending, isRejected } from "@reduxjs/toolkit";
import axios from "axios";
import type { IInitialization } from "../../shared/models/initialization.model";
import type { IPlotModel } from "../../shared/models/plotmodel.model";
import { defaultDataExplorationRequest, type IDataExplorationRequest } from "../../shared/models/dataexploration.model";
import { AddTask } from "@mui/icons-material";
import { FetchExplainabilityPlotPayload } from "../../shared/models/tasks/explainability.model";

const handleInitialization = (payload: IInitialization) => {
  const newPayload = {featureExplanation: {
    ...payload.featureExplanation, modelInstances: JSON.parse(payload.featureExplanation.modelInstances),
    modelConfusionMatrix: JSON.parse(payload.featureExplanation.modelConfusionMatrix)
  }, hyperparameterExplanation: {
    ...payload.hyperparameterExplanation, pipelineMetrics: JSON.parse(payload.hyperparameterExplanation.pipelineMetrics)
  }
}
  return newPayload
}

const handleGetExplanation = (
  initializationState: IInitialization | null,
  plotMod: IPlotModel,
) => {
  console.log(plotMod)
  if (initializationState) {
    const newState: IInitialization = {
      ...initializationState,
      [plotMod.explainabilityType as keyof IInitialization]: {
        ...initializationState[
          plotMod.explainabilityType as keyof IInitialization
        ],
        [plotMod.tableContents !== null ? "tables" : "plots"]: {
          ...initializationState[
            plotMod.explainabilityType as keyof IInitialization
          ][plotMod.tableContents !== null ? "tables" : "plots"],
          [plotMod.explanationMethod]: plotMod,
        },
      },
    }
    return newState
  } else {
    return null
  }
}

const handleMultiTimeSeriesData = (payload : any) => {
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
  return flatFileData;
}

const handleMultiTimeSeriesMetaData = (payload : any) => {
  const metadata = JSON.parse(payload.data);
  return metadata;

}

interface IExplainability {  
    loading: boolean;
    initLoading: boolean;
    explInitialization: IInitialization | null;
    error: string | null;
    tabs: any[];
    misclassifiedInstances: any[];
    counterfactuals: {data: IPlotModel | null, loading: boolean, error: String | null};
    confusionMatrix: any[];
    multipleTimeSeries: any[];
    multipleTimeSeriesMetadata: any;
}

const initialState: IExplainability = {
    loading: false,
    initLoading: false,
    explInitialization: null, 
    error: null,
    tabs: [],
    misclassifiedInstances: [],
    counterfactuals: {data: null, loading: false, error: null},
    confusionMatrix: [],
    multipleTimeSeries: [],
    multipleTimeSeriesMetadata: {},
};

// explainabilitySlice
export const explainabilitySlice = createSlice({
    name: "explainability",
    initialState,
    reducers: {
      addTab: (state, action) => {
        state.tabs = [...state.tabs, action.payload];
      },
      deleteTab: (state, action) => {
        state.tabs = state.tabs.filter((tab) => tab.id !== action.payload);
      }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchInitialization.fulfilled, (state, action) => {
            state.explInitialization = handleInitialization(action.payload);
            state.initLoading = false;
        })
        .addCase(fetchExplanation.fulfilled, (state, action) => {
            state.explInitialization = handleGetExplanation(state.explInitialization, action.payload);
            state.loading = false
        })
        .addCase(fetchConfusionMatrix.fulfilled, (state, action) => {
            state.confusionMatrix = JSON.parse(action.payload.data);
            state.initLoading = false
        })
        .addCase(fetchCounterfactuals.fulfilled, (state, action) => {
            state.counterfactuals.data = action.payload;
            state.counterfactuals.loading = false
            state.counterfactuals.error = null
        })
        .addCase(fetchMultipleTimeseries.fulfilled, (state, action) => {
          state.multipleTimeSeries = handleMultiTimeSeriesData(action.payload);
          state.loading = false
        })
        .addCase(fetchMultipleTimeseriesMetadata.fulfilled, (state, action) => {
          state.multipleTimeSeriesMetadata = handleMultiTimeSeriesMetaData(action.payload);
          state.loading = false
        })
        .addCase(fetchMultipleTimeseriesMetadata.pending, (state, action) => {
          state.loading = true
        })
        .addCase(fetchExplanation.pending, (state) => {
          state.loading = true;
        })
        .addCase(fetchExplanation.rejected, (state) => {
            state.loading = false;
        })
        .addCase(fetchCounterfactuals.pending, (state) => {
          state.counterfactuals.loading = true;
        })
        .addCase(fetchCounterfactuals.rejected, (state) => {
          state.counterfactuals.loading = false;
          state.counterfactuals.error = "Failed to fetch data";
        })
        .addMatcher(isPending(fetchInitialization, fetchConfusionMatrix), (state) => {
            state.initLoading = true;
        })
        .addMatcher(isRejected(fetchInitialization, fetchConfusionMatrix), (state) => {
            state.initLoading = false;
            state.error = "Failed to fetch data";
        })
    }
});

//Thunk Calls for fetching data

const apiPath = 'api/';

export const fetchInitialization = createAsyncThunk('explainability/fetch_initialization', 
  async (payload: {modelName: string, pipelineQuery: IDataExplorationRequest | null, modelInstancesQuery: IDataExplorationRequest | null, modelConfusionQuery: IDataExplorationRequest | null} ) => {
    const requestUrl = apiPath + "initialization";
    //TODO: This should be changed in order to make dynamic calls
    return axios.post<any>(requestUrl, payload).then((response) => response.data);
});

export const fetchExplanation = createAsyncThunk('explainability/fetch_explanation', 
  async (payload: {explanationType: string, explanationMethod: string, model: string, feature1: string, feature2: string, plotType: string} ) => {
    const requestUrl = apiPath + "explainability";
    return axios.post<any>(requestUrl, payload).then((response) => response.data);
});

export const fetchMultipleTimeseries = createAsyncThunk('explainability/fetch_multiple_timeseries',
  async (payload: {dataQuery: IDataExplorationRequest} ) => {
    const requestUrl = apiPath + "visualization/data";
    return axios.post<any>(requestUrl, payload.dataQuery).then((response) => response.data);
});

export const fetchMultipleTimeseriesMetadata = createAsyncThunk('explainability/fetch_multiple_timeseries_metadata',
  async (payload: {dataQuery: IDataExplorationRequest} ) => {
    const requestUrl = apiPath + "visualization/data";
    return axios.post<any>(requestUrl, payload.dataQuery).then((response) => response.data);
});
  
export const fetchConfusionMatrix = createAsyncThunk('explainability/fetch_misclassified_instances', 
async (payload: {experimentId: number | string, id: number | string}) => {
  const { id, experimentId } = payload;
    const request = {
      ...defaultDataExplorationRequest,
      datasetId:
        // `file:///${experimentId}/metrics/${experimentId}_confusion_matrix.csv`,
        `file:///I2Cat_phising/metrics/I2Cat_phising_confusion_matrix.csv`,
      filters: [
        {
          column: "id",
          type: "equals",
          value: id,
        },
      ],
    }
    const requestUrl = apiPath + "visualization/data";
    return axios.post<any>(requestUrl, request).then((response) => response.data);
});

export const fetchCounterfactuals = createAsyncThunk('explainability/fetch_counterfactuals', 
async (payload: {
  explanationType: string
  explanationMethod: string
  model: string
  modelId: number
  feature1: string
  feature2: string
}) => {
    const requestUrl = apiPath + "explainability";
    return axios.post<any>(requestUrl, payload).then((response) => response.data);
});


//Reducer exports

export const {addTab, deleteTab} = explainabilitySlice.actions

export default explainabilitySlice.reducer
