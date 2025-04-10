import { createSlice } from "@reduxjs/toolkit"
import {
  IWorkflowPageModel,
  defaultWorkflowPageModel,
} from "../../shared/models/workflow.tab.model"
import {
  explainabilityDefault,
  explainabilityReducers,
} from "../../shared/models/tasks/explainability.model"
import {
  modelAnalysisDefault,
  modelAnalysisReducers,
} from "../../shared/models/tasks/model-analysis.model"
import {
  dataExplorationDefault,
  explainabilityExtraReducers,
} from "../../shared/models/tasks/data-exploration-task.model"
import { userInteractionDefault } from "../../shared/models/tasks/user-interaction.model"
import { IRun } from "../../shared/models/experiment/run.model"
import { IMetric } from "../../shared/models/experiment/metric.model"

export interface IWorkflowPage {
  tab: IWorkflowPageModel | null
}

const initialState: IWorkflowPage = {
  tab: null,
}

// explainabilitySlice
export const workflowPageSlice = createSlice({
  name: "workflowPage",
  initialState,
  reducers: {
    initTab: (state, action) => {
      state.tab = setTab(action.payload)
    }
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
  metrics: IMetric[] | null
  workflows: {
    data: IRun[]
    loading: boolean
    error: string | null
  }
}) => {
  if (!metrics) return null

  const finishedWorkflowsMetrics = workflows.data
    .filter(workflow => workflow.status === "COMPLETED")
    .reduce<
      IMetric[]
    >((acc, workflow) => workflow.metrics ? [...acc, ...workflow.metrics] : [...acc], [])

  return metrics.map(metric => {
    const filteredMetricsAll = finishedWorkflowsMetrics.filter(
      metricAll => metricAll.name === metric.name,
    )
    const metricsSum = filteredMetricsAll.reduce(
      (acc, metric) => acc + metric.value,
      0,
    )
    return {
      name: metric.name,
      value: metric.value,
      avgValue: metricsSum / filteredMetricsAll.length,
      avgDiff:
        (metric.value * 100) /
          (metricsSum / filteredMetricsAll.length) -
        100,
      task: metric.task
    }
  })

}

const initializeTab = ({
  workflowId,
  workflows,
}: {
  workflowId: string
  workflows: {
    data: IRun[]
    loading: boolean
    error: string | null
  }
}) => {
  const workflow = workflows.data.find(
    workflow => workflow.id === workflowId,
  )
  const tab: IWorkflowPageModel = {
    ...defaultWorkflowPageModel,
    workflowName: workflow?.name || "",
    workflowId: workflow?.id || "",
    workflowSvg: {
      data: workflow
        ? { tasks: workflow.tasks, start: workflow.startTime, end: workflow.endTime }
        : null,
      loading: false,
    },
    workflowConfiguration: {
      tasks: workflow?.tasks || null,
      dataAssets: workflow?.dataAssets || null,
      params: workflow?.params || null,
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
      dataExploration: dataExplorationDefault,
      userInteraction: userInteractionDefault,
    },
  }
  return tab
}

const initializeCompareCompleteTab = () => {
  const tab: IWorkflowPageModel = {
    ...defaultWorkflowPageModel,
    workflowId: "compare-completed",
    workflowTasks: {
      explainabilityTask: explainabilityDefault,
    },
    workflowMetrics: {
      data: null,
      loading: false,
    },
  }
  return tab
}

const setTab = ({
  tab,
  workflows,
}: {
  tab: string | null
  workflows: {
    data: IRun[]
    loading: boolean
    error: string | null
  },
}) => {
  if(tab === "compare-completed") return initializeCompareCompleteTab()
  else if (tab !== null) return initializeTab({ workflowId: tab, workflows})
  else return null
}

//Reducer exports
export const { initTab } =
  workflowPageSlice.actions

export default workflowPageSlice.reducer
