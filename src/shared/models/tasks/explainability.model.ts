import type { ActionReducerMapBuilder} from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit"
import type { IPlotModel } from "../plotmodel.model"
import type { IWorkflowPage } from "../../../store/slices/workflowPageSlice"
import { api } from "../../../app/api/api"
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
  global_counterfactuals: {
    data: IPlotModel | null
    loading: boolean
    error: string | null
  }

  hyperparametersNames: string[]
}

export const explainabilityDefault: IExplainability = {
  //TODO: these hyperparameters names should be populated from the response
  hyperparametersNames: [],
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
  global_counterfactuals: {
    data: null,
    loading: false,
    error: null,
  },
}

export const explainabilityReducers = (
  builder: ActionReducerMapBuilder<IWorkflowPage>,
) => {
  builder
    .addCase(fetchExplainabilityPlot.fulfilled, (state, action) => {
      const compareCompletedTask = state.tab?.workflowId === "compare-completed" ? state.tab.workflowTasks.explainabilityTask : null
      const plotType = action.meta.arg.metadata
        .queryCase as keyof IExplainability
      if (compareCompletedTask && plotType !== "hyperparametersNames") {
        compareCompletedTask[plotType].data = action.payload
        compareCompletedTask[plotType].loading = false
        compareCompletedTask[plotType].error = null
      }
    })
    .addCase(fetchExplainabilityPlot.pending, (state, action) => {
      const compareCompletedTask = state.tab?.workflowId === "compare-completed" ? state.tab.workflowTasks.explainabilityTask : null
      const plotType = action.meta.arg.metadata
      .queryCase as keyof IExplainability
      if (compareCompletedTask && plotType !== "hyperparametersNames") {
        compareCompletedTask[plotType].loading = true
      }
    })
    .addCase(fetchExplainabilityPlot.rejected, (state, action) => {
      const compareCompletedTask = state.tab?.workflowId === "compare-completed" ? state.tab.workflowTasks.explainabilityTask : null
      const plotType = action.meta.arg.metadata
      .queryCase as keyof IExplainability
      if (compareCompletedTask && plotType !== "hyperparametersNames") {
        compareCompletedTask[plotType].loading = false
        compareCompletedTask[plotType].error = "failed to fetch data"
      }
    })
}

export type IHyperparameters = {
  [key: string]: {
    metric_value: number
    hyperparameter: { values: string; type: string }
  }
}

export type ExplainabilityQuery = {
  explanation_type?: string
  explanation_method?: string
  model?: string[]
  data?: string
  train_index?: number[]
  test_index?: number[]
  target_column?: string
  hyper_configs?: IHyperparameters
  feature1?: string
  feature2?: string
  query?: string
  gcf_size?: number
  cf_generator?: string
  cluster_action_choice_algo?: string
}

export const explainabilityQueryDefault: ExplainabilityQuery = {
  explanation_type: "",
  explanation_method: "",
  model: [],
  data: "",
  train_index: [],
  test_index: [],
  target_column: "",
  hyper_configs: {},
  feature1: "",
  feature2: "",
  query: "",
  gcf_size: 0,
  cf_generator: "",
  cluster_action_choice_algo: "",
}

export type FetchExplainabilityPlotPayload = {
  query: ExplainabilityQuery
  metadata: {
    workflowId: string | number
    queryCase: any
  }
}

export const fetchExplainabilityPlotPayloadDefault: FetchExplainabilityPlotPayload =
  {
    query: explainabilityQueryDefault,
    metadata: {
      workflowId: "",
      queryCase: "",
    },
  }  

export const fetchExplainabilityPlot = createAsyncThunk(
  "workflowPage/explainability/fetch_explainability_plot",
  async (payload: FetchExplainabilityPlotPayload) => {
    const requestUrl = "explainability"
    return api
      .post<any>(requestUrl, payload.query)
      .then(response => response.data)
  },
)
