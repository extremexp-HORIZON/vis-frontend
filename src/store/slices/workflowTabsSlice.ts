import {
  createSlice,
  createAsyncThunk,
  isFulfilled,
  isPending,
  isRejected,
} from "@reduxjs/toolkit"
import {
  IWorkflowTabModel,
  defaultWorkflowTabModel,
} from "../../shared/models/workflow.tab.model"
import { explainabilityDefault, explainabilityReducers } from "../../shared/models/tasks/explainability.model"
import { modelAnalysisDefault, modelAnalysisReducers } from "../../shared/models/tasks/model-analysis.model"

export interface IWorkflowTab {
  tabs: IWorkflowTabModel[]
}

const initialState: IWorkflowTab = {
  tabs: [],
}

// explainabilitySlice
export const workflowTabsSlice = createSlice({
  name: "workflowTabs",
  initialState,
  reducers: {
    addTab: (state, action) => {
      state.tabs = [...state.tabs, initializeTab(action.payload)]
    },
    addCompareCompletedTab: (state, action) => {
      state.tabs = [...state.tabs, initializeCompareCompleteTab()]
    },
    deleteTab: (state, action) => {
      state.tabs = state.tabs.filter(tab => tab.workflowId !== action.payload)
    },
  },
  extraReducers: builder => {
    explainabilityReducers(builder),
    modelAnalysisReducers(builder)
  },
})

//Managing tabs logic

const workflowMetricsInitializer = ({
  metrics,
  workflows,
}: {
  metrics: { [key: string]: number } | null
  workflows: {
    data: { [key: string]: any }[]
    loading: boolean
    error: string | null
  }
}) => {
  if (!metrics) return null
  const finishedWorkflows = workflows.data.filter(
    workflow => workflow.workflowInfo.status === "completed",
  )
  const metricNames = ["accuracy", "precision", "recall", "loss"]
  return Object.keys(metrics)
    .filter(metricName => metricNames.includes(metricName))
    .map(metric => {
      const metricsSum = finishedWorkflows.reduce((acc, workflow) => {
        return (
          acc +
          (workflow.metrics
            ? workflow.metrics[metric as keyof typeof workflow.metrics]
            : 0)
        )
      }, 0)
      return {
        name: metric,
        value: metrics[metric],
        avgValue: metricsSum / finishedWorkflows.length,
        avgDiff:
          (metrics[metric] * 100) / (metricsSum / finishedWorkflows.length) -
          100,
      }
    })
}

const initializeTab = ({
  workflowId,
  workflows,
}: {
  workflowId: string
  workflows: {
    data: { [key: string]: any }[]
    loading: boolean
    error: string | null
  }
}) => {
  const workflow = workflows.data.find(
    workflow => workflow.workflowId === workflowId,
  )
  const tab: IWorkflowTabModel = {
    ...defaultWorkflowTabModel,
    workflowId: workflowId,
    workflowConfiguration: {
      data: workflow?.variabilityPoints || null,
      loading: false,
    },
    workflowMetrics: {
      data: workflowMetricsInitializer({
        metrics: workflow?.metrics || null,
        workflows,
      }),
      loading: false,
    },
    workflowTasks: {
      modelAnalysis: modelAnalysisDefault,
    }
  }
  return tab
}

const initializeCompareCompleteTab = () => {
  const tab: IWorkflowTabModel = {
    ...defaultWorkflowTabModel,
    workflowId: "compare-completed",
    compareCompletedTasks: {
      explainabilityTask: explainabilityDefault,
    },
  }
  return tab
}

//Reducer exports
export const { addTab, deleteTab, addCompareCompletedTab } =
  workflowTabsSlice.actions

export default workflowTabsSlice.reducer
