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
  builder.addCase(fetchExplainabilityPlot.fulfilled, (state, action) => {
    const compareCompletedTask = state.tabs.find(
      tab => tab.workflowId === "compare-completed",
    )?.compareCompletedTasks.explainabilityTask
    switch (action.payload.explanationMethod) {
      case "2dpdp":
        if (compareCompletedTask) {
          compareCompletedTask["2dpdp"].data = action.payload
          compareCompletedTask["2dpdp"].loading = false
          compareCompletedTask["2dpdp"].error = null
        }
        break
      case "pdp":
        if (compareCompletedTask) {
          compareCompletedTask["pdp"].data = action.payload
          compareCompletedTask["pdp"].loading = false
          compareCompletedTask["pdp"].error = null
        }
        break
      case "ale":
        if (compareCompletedTask) {
          compareCompletedTask["ale"].data = action.payload
          compareCompletedTask["ale"].loading = false
          compareCompletedTask["ale"].error = null
        }
        break
    }
  })
  .addCase(fetchExplainabilityPlot.pending, (state, action) => {
    const compareCompletedTask = state.tabs.find(
      tab => tab.workflowId === "compare-completed",
    )?.compareCompletedTasks.explainabilityTask
    switch (action.meta.arg.explanationMethod) {
      case "2dpdp":
        if (compareCompletedTask) {
          compareCompletedTask["2dpdp"].loading = true
        }
        break
      case "pdp":
        if (compareCompletedTask) {
          compareCompletedTask["pdp"].loading = true
        }
        break
      case "ale":
        if (compareCompletedTask) {
          compareCompletedTask["ale"].loading = true
        }
        break
    }
  })
  .addCase(fetchExplainabilityPlot.rejected, (state, action) => {
    const compareCompletedTask = state.tabs.find(
      tab => tab.workflowId === "compare-completed",
    )?.compareCompletedTasks.explainabilityTask
    switch (action.meta.arg.explanationMethod) {
      case "2dpdp":
        if (compareCompletedTask) {
          compareCompletedTask["2dpdp"].loading = false
          compareCompletedTask["2dpdp"].error = "failed to fetch data"
        }
        break
      case "pdp":
        if (compareCompletedTask) {
          compareCompletedTask["pdp"].loading = false
          compareCompletedTask["pdp"].error = "failed to fetch data"
        }
        break
      case "ale":
        if (compareCompletedTask) {
          compareCompletedTask["ale"].loading = false
          compareCompletedTask["ale"].error = "failed to fetch data"
        }
        break
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
}

export const fetchExplainabilityPlot = createAsyncThunk(
    "workflowTabs/explainability/fetch_explainability_plot",
    async (payload: FetchExplainabilityPlotPayload) => {
        const requestUrl = "/api/explainability"
        return axios.post<any>(requestUrl, payload).then(response => response.data)
    },
)
