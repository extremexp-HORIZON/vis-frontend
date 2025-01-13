import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit"
import { IPlotModel } from "../plotmodel.model"
import { IWorkflowTab } from "../../../store/slices/workflowTabsSlice"
import axios from "axios"

export interface IExplainability {
  "2dpdp": {
    data: IPlotModel | null
    loading: boolean
    error: string | null
  }
  pdp: {
    data: IPlotModel | null
    loading: boolean
    error: string | null
  }
  ale: {
    data: IPlotModel | null
    loading: boolean
    error: string | null
  }
  hyperparametersNames: string[]
}

export const explainabilityDefault: IExplainability = {
  //TODO: these hyperparameters names should be populated from the response
  hyperparametersNames: [
    "model__units",
    "model__activation_function",
    "batch_size",
    "epochs",
  ],
  "2dpdp": {
    data: null,
    loading: false,
    error: null,
  },
  pdp: {
    data: null,
    loading: false,
    error: null,
  },
  ale: {
    data: null,
    loading: false,
    error: null,
  },
}

export const explainabilityReducers = (
  builder: ActionReducerMapBuilder<IWorkflowTab>,
) => {
  builder
    .addCase(fetchExplainabilityPlot.fulfilled, (state, action) => {
      const compareCompletedTask = state.tabs.find(
        tab => tab.workflowId === "compare-completed",
      )?.workflowTasks.explainabilityTask
      const plotType = action.meta.arg
        .explanationMethod as keyof IExplainability
      if (compareCompletedTask && plotType !== "hyperparametersNames") {
        compareCompletedTask[plotType].data = action.payload
        compareCompletedTask[plotType].loading = false
        compareCompletedTask[plotType].error = null
      }
    })
    .addCase(fetchExplainabilityPlot.pending, (state, action) => {
      const compareCompletedTask = state.tabs.find(
        tab => tab.workflowId === "compare-completed",
      )?.workflowTasks.explainabilityTask
      const plotType = action.meta.arg
        .explanationMethod as keyof IExplainability
      if (compareCompletedTask && plotType !== "hyperparametersNames") {
        compareCompletedTask[plotType].loading = true
      }
    })
    .addCase(fetchExplainabilityPlot.rejected, (state, action) => {
      const compareCompletedTask = state.tabs.find(
        tab => tab.workflowId === "compare-completed",
      )?.workflowTasks.explainabilityTask
      const plotType = action.meta.arg
        .explanationMethod as keyof IExplainability
      if (compareCompletedTask && plotType !== "hyperparametersNames") {
        compareCompletedTask[plotType].loading = false
        compareCompletedTask[plotType].error = "failed to fetch data"
      }
    })
}

export type FetchExplainabilityPlotPayload = {
  explanationType: string
  explanationMethod: string
  model: string
  feature1: string
  feature2: string
  modelId: number
  query: string
  target: string
  gcfSize: number
  cfGenerator: string
  clusterActionChoiceAlgo: string
}

export const fetchExplainabilityPlotPayloadDefault: FetchExplainabilityPlotPayload = {
  explanationType: "",
  explanationMethod: "",
  model: "",
  feature1: "",
  feature2: "",
  modelId: 0,
  query: "",
  target: "",
  gcfSize: 0,
  cfGenerator: "",
  clusterActionChoiceAlgo: "",
}

export const fetchExplainabilityPlot = createAsyncThunk(
  "workflowTabs/explainability/fetch_explainability_plot",
  async (payload: FetchExplainabilityPlotPayload) => {
    const requestUrl = "/api/explainability"
    return axios.post<any>(requestUrl, payload).then(response => response.data)
  },
)
