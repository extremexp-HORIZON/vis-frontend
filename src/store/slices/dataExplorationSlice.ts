import { createSlice, createAsyncThunk, isFulfilled, isPending, isRejected } from "@reduxjs/toolkit";
import axios from "axios";
import type { IDataExplorationRequest } from "../../shared/models/dataexploration.model";
import { IFilter } from "../../shared/models/dataexploration.model";

// Define the interface for the slice state
interface IExploration {  
    loading: boolean;
    initLoading: boolean;
    dataExploration: {data: any, [key: string]: any} | null;
    error: string | null;
    multipleTimeSeries: any[];
}

// Define the initial state of the slice
const initialState: IExploration = {
    loading: false,
    initLoading: true,
    dataExploration: null, 
    error: null,
    multipleTimeSeries: [],
};

// Define the API path
const apiPath = 'api/';

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
  
// Create an async thunk for fetching data exploration
export const fetchDataExploration = createAsyncThunk(
    'dataExploration/fetchData',
    async (payload: IDataExplorationRequest) => {
        const requestUrl = `${apiPath}visualization/data`;
        return axios.post<any>(requestUrl, payload).then((response) => response.data);
    }
);

export const fetchMultipleTimeseries = createAsyncThunk('dataExploration/fetch_multiple_timeseries',
    async (payload: {dataQuery: IDataExplorationRequest} ) => {
      const requestUrl = apiPath + "visualization/data";
      return axios.post<any>(requestUrl, payload.dataQuery).then((response) => response.data);
  });
  

// Create the slice
export const dataExplorationSlice = createSlice({
    name: "dataExploration",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDataExploration.fulfilled, (state, action) => {
                state.dataExploration = action.payload;
                state.loading = false;
                ////Added this
                state.initLoading = false;  // Update initLoading state
                state.error = null;  // Clearing error on success
            })
            .addCase(fetchDataExploration.pending, (state) => {
                state.loading = true;
                state.error = null;  // Resetting the error on new request
            })
            .addCase(fetchMultipleTimeseries.fulfilled, (state, action) => {
                state.loading = false;
                state.multipleTimeSeries = handleMultiTimeSeriesData(action.payload);
                state.initLoading = false;  // Update initLoading state
              })
              ////added this
              .addCase(fetchMultipleTimeseries.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchDataExploration.rejected, (state, action) => {
                state.initLoading = false;
                ////Added This
                state.loading = false;
                state.error = action.error.message || "Failed to fetch data";
            })
            ////Added This
            .addCase(fetchMultipleTimeseries.rejected, (state, action) => {
              state.loading = false;
              state.initLoading = false;
              state.error = action.error.message || "Failed to fetch timeseries data";
          });

            
    }
});

// Export the actions and reducer
export const { } = dataExplorationSlice.actions
export default dataExplorationSlice.reducer;
