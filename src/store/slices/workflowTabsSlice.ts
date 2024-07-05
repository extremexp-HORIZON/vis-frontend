import { createSlice, createAsyncThunk, isFulfilled, isPending, isRejected } from "@reduxjs/toolkit";
import { IWorkflowTabModel, defaultWorkflowTabModel } from "../../shared/models/workflow.tab.model";
import workflows from '../../shared/data/workflows.json';
import { add } from "lodash";

interface IWorkflowTab {  
    tabs: IWorkflowTabModel[]
}

const initialState: IWorkflowTab = {
    tabs: []
};

// explainabilitySlice
export const workflowTabsSlice = createSlice({
    name: "workflowTabs",
    initialState,
    reducers: {
        addTab: (state, action) => {
            state.tabs = [...state.tabs, initializeTab(action.payload)];
        },
        deleteTab: (state, action) => {
            state.tabs = state.tabs.filter((tab) => tab.workflowId !== action.payload);
        }
    },
    extraReducers: (builder) => {
        // .addCase(fetchExplanation.fulfilled, (state, action) => {
        //     state.explInitialization = handleGetExplanation(state.explInitialization, action.payload);
        //     state.loading = "false"
        // })
        // .addCase(fetchExplanation.pending, (state) => {
        //   state.loading = "true";
        // })
        // .addCase(fetchExplanation.rejected, (state) => {
        //     state.loading = "false";
        // })
    }
});

//Thunk Calls for fetching data

const apiPath = 'api/';

// export const fetchInitialization = createAsyncThunk('explainability/fetch_initialization', 
//   async (payload: {modelName: string, pipelineQuery: IDataExplorationRequest, modelInstancesQuery: IDataExplorationRequest, modelConfusionQuery: IDataExplorationRequest} ) => {
//     const requestUrl = apiPath + "initialization";
//     //TODO: This should be changed in order to make dynamic calls
    
//     return axios.post<any>(requestUrl, payload).then((response) => response.data);
// });


//Managing tabs logic

const initializeTab = (workflowId: number) => {
    const workflow = workflows.find((workflow) => workflow.workflowId === workflowId);
    const tab: IWorkflowTabModel = {...defaultWorkflowTabModel, workflowId: workflowId, 
        workflowDetails: {data : workflow?.variabilityPoints || null, loading: false},
        workflowMetrics: {data : workflow?.metrics || null, loading: false}};
    return tab
}

//Reducer exports
export const {addTab, deleteTab} = workflowTabsSlice.actions

export default workflowTabsSlice.reducer
