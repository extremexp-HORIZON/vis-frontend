import { createSlice, createAsyncThunk, isFulfilled, isPending, isRejected } from "@reduxjs/toolkit";
import axios from "axios";
import type { IInitialization } from "../../shared/models/initialization.model";
import type { IPlotModel } from "../../shared/models/plotmodel.model";
import type { IDataExplorationRequest } from "../../shared/models/dataexploration.model";
import { AddTask } from "@mui/icons-material";

const handleInitialization = (payload: IInitialization) => {
  const newPayload = {featureExplanation: {
    ...payload.featureExplanation, modelInstances: JSON.parse(payload.featureExplanation.modelInstances)[0],
    modelConfusionMatrix: JSON.parse(payload.featureExplanation.modelConfusionMatrix)[0]
  }, hyperparameterExplanation: {
    ...payload.hyperparameterExplanation, pipelineMetrics: JSON.parse(payload.hyperparameterExplanation.pipelineMetrics)[0]
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
    loading: string;
    initLoading: boolean;
    explInitialization: IInitialization | null;
    error: string | null;
    tabs: any[];
    misclassifiedInstances: any[];
    multipleTimeSeries: any[];
    multipleTimeSeriesMetadata: any;
}

const initialState: IExplainability = {
    loading: "false",
    initLoading: false,
    explInitialization: null, 
    error: null,
    tabs: [],
    misclassifiedInstances: [],
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
            state.loading = "false"
        })
        .addCase(fetchMisclassifiedInstances.fulfilled, (state, action) => {
            state.misclassifiedInstances = action.payload;
            state.loading = "false"
        })
        .addCase(fetchMultipleTimeseries.fulfilled, (state, action) => {
          state.multipleTimeSeries = handleMultiTimeSeriesData(action.payload);
          state.loading = "false"
        })
        .addCase(fetchMultipleTimeseriesMetadata.fulfilled, (state, action) => {
          state.multipleTimeSeriesMetadata = handleMultiTimeSeriesMetaData(action.payload);
          state.loading = "false"
        })
        .addCase(fetchMultipleTimeseriesMetadata.pending, (state, action) => {
          state.loading = "true"
        })
        .addCase(fetchExplanation.pending, (state) => {
          state.loading = "true";
        })
        .addCase(fetchExplanation.rejected, (state) => {
            state.loading = "false";
        })
        .addMatcher(isPending(fetchInitialization, fetchMisclassifiedInstances), (state) => {
            state.initLoading = true;
        })
        .addMatcher(isRejected(fetchInitialization, fetchMisclassifiedInstances), (state) => {
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
  async () => {
    const payload = {
        datasetId: "folder://IDEKO/datasets",
        columns: [],
        filters: [],
      }
      const requestUrl = apiPath + "visualization/data";
    return axios.post<any>(requestUrl, payload).then((response) => response.data);
});

export const fetchMultipleTimeseriesMetadata = createAsyncThunk('explainability/fetch_multiple_timeseries_metadata',
  async () => {
    const payload = {
        datasetId: "file://IDEKO/metadata.csv",
        columns: [],
        filters: [],
      }
      const requestUrl = apiPath + "visualization/data";
    return axios.post<any>(requestUrl, payload).then((response) => response.data);
});
  
export const fetchMisclassifiedInstances = createAsyncThunk('explainability/fetch_misclassified_instances', 
async () => {
// TODO: make this dynamic
// async (payload: IDataExplorationRequest) => {
    const payload = {
      datasetId: "file:///home/pgidarakos/OLDIES/CSVSXXP/misclassified_instances.csv",
      columns: [],
      aggFunction:"ll",
      filters: [],
      scaler: "z",
      limit: 10
    }
    const requestUrl = apiPath + "visualization/data";
    return axios.post<any>(requestUrl, payload).then((response) => response.data);
});


//Reducer exports

export const {addTab, deleteTab} = explainabilitySlice.actions

export default explainabilitySlice.reducer
