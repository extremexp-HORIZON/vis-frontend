import { createSlice } from "@reduxjs/toolkit"
import {
  IWorkflowTabModel,
  defaultWorkflowTabModel,
} from "../../shared/models/workflow.tab.model"
import {
  explainabilityDefault,
  explainabilityReducers,
} from "../../shared/models/tasks/explainability.model"
import { IWorkflowResponse, Metric, MetricDetail } from "../../shared/models/workflow.model"
import { modelAnalysisDefault, modelAnalysisReducers } from "../../shared/models/tasks/model-analysis.model"
import { dataExplorationDefault, explainabilityExtraReducers } from "../../shared/models/tasks/data-exploration-task.model"

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
    // ...additionalReducers
  },
  extraReducers: builder => {
    explainabilityReducers(builder),
    modelAnalysisReducers(builder),
    explainabilityExtraReducers(builder)
  },
})

//Managing tabs logic

const workflowMetricsInitializer = ({
  metrics,
  workflows,
}: {
  metrics: MetricDetail[] | null
  workflows: {
    data: IWorkflowResponse[]
    loading: boolean
    error: string | null
  }
}) => {

  if (!metrics) return null

  const finishedWorkflowsMetrics = workflows.data
    .filter(workflow => workflow.status === "completed")
    .reduce<MetricDetail[]>((acc, workflow) => [...acc, ...workflow.metrics], [])

  return metrics.map(metric => {
    const filteredMetricsAll = finishedWorkflowsMetrics.filter(metricAll => metricAll.name === metric.name)
    const metricsSum = filteredMetricsAll.reduce((acc, metric) => acc + parseFloat(metric.value), 0)
    return {
      name: metric.name,
      value: parseFloat(metric.value),
      avgValue: metricsSum / filteredMetricsAll.length,
      avgDiff: (parseFloat(metric.value) * 100) / (metricsSum / filteredMetricsAll.length) - 100
    }
})

  // return Object.keys(metrics)
  //   .filter(metricName => metricNames.includes(metricName))
  //   .map(metric => {
  //     const metricsSum = finishedWorkflows.reduce((acc, workflow) => {
  //       return (
  //         acc +
  //         (workflow.metrics
  //           ? workflow.metrics[metric as keyof typeof workflow.metrics]
  //           : 0)
  //       )
  //     }, 0)
  //     return {
  //       name: metric,
  //       value: metrics[metric],
  //       avgValue: metricsSum / finishedWorkflows.length,
  //       avgDiff:
  //         (metrics[metric] * 100) / (metricsSum / finishedWorkflows.length) -
  //         100,
  //     }
  //   })
}

const initializeTab = ({
  workflowId,
  workflows,
}: {
  workflowId: string
  workflows: {
    data: IWorkflowResponse[]
    loading: boolean
    error: string | null
  }
}) => {
  const workflow = workflows.data.find(workflow => workflow.workflowId === workflowId)
  console.log("edw eimaii",workflow)
  const tab: IWorkflowTabModel = {
    ...defaultWorkflowTabModel,
    workflowName: workflow?.name || "",
    workflowId: workflow?.workflowId || "",
    workflowConfiguration: {
      data: workflow?.tasks || null,
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
      dataExploration: dataExplorationDefault
    }
  }
  return tab
}

const initializeCompareCompleteTab = () => {
  const tab: IWorkflowTabModel = {
    ...defaultWorkflowTabModel,
    workflowId: "compare-completed",
    workflowTasks: {
      explainabilityTask: explainabilityDefault,
    },
    workflowMetrics: {
      data: null,
      loading: false,
    }
  }
  return tab
}

//Reducer exports
export const { addTab, deleteTab, addCompareCompletedTab } =
  workflowTabsSlice.actions

export default workflowTabsSlice.reducer
