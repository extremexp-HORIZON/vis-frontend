import { createSlice, createAsyncThunk, isFulfilled, isPending, isRejected } from "@reduxjs/toolkit";
import axios from "axios";
import { IFilter, IDataExplorationRequest } from "../../shared/models/dataexploration.model";
// Define the interface for the slice state
interface IExploration {  
    loading: boolean;
    initLoading: boolean;
    dataExploration: {data: any, [key: string]: any} | null;
    error: string | null;
}

// Define the initial state of the slice
const initialState: IExploration = {
    loading: false,
    initLoading: false,
    dataExploration: null, 
    error: null,
};

// Define the API path
const apiPath = 'api/';

// Create an async thunk for fetching data exploration
export const fetchDataExploration = createAsyncThunk(
    'dataExploration/fetchData',
    async (payload: IDataExplorationRequest) => {
        const requestUrl = `${apiPath}visualization/data`;
        return axios.post<any>(requestUrl, payload).then((response) => response.data);
        
    }
);

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
                state.error = null;  // Clearing error on success

                
            })
            .addCase(fetchDataExploration.pending, (state) => {
                state.loading = true;
                state.error = null;  // Resetting the error on new request


              
            })
            .addCase(fetchDataExploration.rejected, (state, action) => {
                state.initLoading = false;
                state.error = action.error.message || "Failed to fetch data";
            });
    }
});

// Export the actions and reducer
export const { } = dataExplorationSlice.actions
export default dataExplorationSlice.reducer;
