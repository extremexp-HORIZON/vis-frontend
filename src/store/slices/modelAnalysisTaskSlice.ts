import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { IModelAnalysisTask} from "../../shared/models/modelAnalysisTask.model";
import { defaultModelAnalysisTask } from "../../shared/models/modelAnalysisTask.model";
import axios from "axios";
import type { IDataExplorationRequest} from "../../shared/models/dataexploration.model";
import { defaultDataExplorationRequest } from "../../shared/models/dataexploration.model";
import { IPlotModel } from "../../shared/models/plotmodel.model";


const initialState: IModelAnalysisTask = defaultModelAnalysisTask

export const fetchModelInstances = createAsyncThunk('modelAnalysisTask/fetch_model_instances', 
    async (payload: {path: string} ) => {
      const request: IDataExplorationRequest = {
          ...defaultDataExplorationRequest,
          datasetId: payload.path,
          limit: 1000
        }
        const requestUrl = apiPath + "visualization/data";
      return axios.post<any>(requestUrl, request).then((response) => response.data);
  });
  
  export const fetchModelmetrics = createAsyncThunk('modelAnalysisTask/fetch_model_metrics', 
    async (payload: {path: string} ) => {
      const request: IDataExplorationRequest = {
          ...defaultDataExplorationRequest,
          datasetId: payload.path,
          limit: 100
        }
        const requestUrl = apiPath + "visualization/data";
      return axios.post<any>(requestUrl, request).then((response) => response.data);
  });
  
  export const fetchModelExplainability = createAsyncThunk('modelAnalysisTask/fetch_model_explainability', 
    async (payload: {modelName: string, modelId: number} ) => {
      const request = {
          modelName: payload.modelName,
          modelId: payload.modelId
        }
        const requestUrl = apiPath + "visualization/data";
      return axios.post<any>(requestUrl, request).then((response) => response.data);
  });
  
  export const fetchExplainabilitySingle = createAsyncThunk('modelAnalysisTask/fetch_explainability_single', 
    async (payload: {explanationType: string, explanationMethod: string, model: string, feature1: string, feature2: string, plotType: string} ) => {
        const requestUrl = apiPath + "explainability";
        return axios.post<any>(requestUrl, payload).then((response) => ({data: response.data, explanationType: payload.explanationType, plotType: payload.plotType, error: response.data.error}));
  });

// explainabilitySlice
export const modelAnalysisTaskSlice = createSlice({
    name: "modelAnalysisTask",
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {builder
        //FetchModelInstances
        .addCase(fetchModelInstances.fulfilled, (state, action) => {
            state.modelInstances = {data: JSON.parse(action.payload.data), columns: action.payload.columns, loading: false, error: null};
        })
        .addCase(fetchModelInstances.pending, (state) => {
            state.modelInstances = {...state.modelInstances, loading: true, error: null};
        })
        .addCase(fetchModelInstances.rejected, (state) => {
            state.modelInstances = {...state.modelInstances, loading: false, error: "Error fetching model instances"};
        })
        //FetchModelmetrics
        .addCase(fetchModelmetrics.fulfilled, (state, action) => {
            state.modelConfusionMatrix = {data: JSON.parse(action.payload.data), columns: action.payload.columns, loading: false, error: null};
        })
        .addCase(fetchModelmetrics.pending, (state) => {
          state.modelInstances = {...state.modelConfusionMatrix, loading: true, error: null};
        })
        .addCase(fetchModelmetrics.rejected, (state) => {
            state.modelInstances = {...state.modelConfusionMatrix, loading: false, error: "Error fetching model metrics"};
        })
        //FetchModelExplainability
        .addCase(fetchModelExplainability.fulfilled, (state, action) => {
            state = {...state, ...handleExplainabilityResponse(action.payload), loading: false};
        })
        .addCase(fetchModelExplainability.pending, (state) => {
            state = {...state, loading: true}
        })
        .addCase(fetchModelExplainability.rejected, (state) => {
            state = {...state, loading: false}
        })
        //FetchExplainabilitySingle
        .addCase(fetchExplainabilitySingle.fulfilled, (state, action) => {
            const {data, explanationType, plotType} = action.payload;
            state[plotType === "Table" ? "tables" : "plots"][explanationType] = 
            {data: data, loading: false, error: null};
        })
        .addCase(fetchExplainabilitySingle.pending, (state, action) => {
            if(action.payload){
                const {explanationType, plotType} = action.payload;
                state[plotType === "Table" ? "tables" : "plots"][explanationType] = 
                {...state[plotType === "Table" ? "tables" : "plots"][explanationType], loading: true}}
            })
        .addCase(fetchExplainabilitySingle.rejected, (state, action) => {
            if(action.payload){
                const {explanationType, plotType, error} = action.payload;
            state[plotType === "Table" ? "tables" : "plots"][explanationType] = 
            {...state[plotType === "Table" ? "tables" : "plots"][explanationType], loading: false, error: "Error fetching data"};
    }})
    }
});

//Thunk Calls for fetching data

const apiPath = 'api/modelAnalysisTask/';

const handleExplainabilityResponse = (response: any) => {
    return response
}

export const modelAnalysisTaskInitializer = (modelName: string, instancesPath: string, metricsPath: string) => {
    fetchModelInstances({path: instancesPath})
    fetchModelmetrics({path: metricsPath})
}

//Reducer exports
export const {} = modelAnalysisTaskSlice.actions

export default modelAnalysisTaskSlice.reducer
