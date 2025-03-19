import { createSlice } from "@reduxjs/toolkit"
import {
  IWorkflowTabModel,
  defaultWorkflowTabModel,
} from "../../shared/models/workflow.tab.model"
import {
  explainabilityDefault,
  explainabilityReducers,
} from "../../shared/models/tasks/explainability.model"
import {
  IWorkflowResponse,
  Metric,
  MetricDetail,
} from "../../shared/models/workflow.model"
import {
  modelAnalysisDefault,
  modelAnalysisReducers,
} from "../../shared/models/tasks/model-analysis.model"
import {
  dataExplorationDefault,
  explainabilityExtraReducers,
} from "../../shared/models/tasks/data-exploration-task.model"
import UserInteractiveTask from "../../app/Tasks/UserInteractiveTask/user-interactive-task"
import { userInteractionDefault } from "../../shared/models/tasks/user-interaction.model"

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
    updateTabs: (state, action) => {
      state.tabs = updateActiveTabs(action.payload)
    },
    addCompareCompletedTab: (state, action) => {
      state.tabs = [...state.tabs, initializeCompareCompleteTab()]
    },
    setTabsOrder: (state, action) => {
      state.tabs = action.payload
    },
    deleteTab: (state, action) => {
      state.tabs = state.tabs.filter(tab => tab.workflowId !== action.payload)
    },
    initTabs: (state, action) => {
      state.tabs = addInitialTabs(action.payload)
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
    .reduce<
      MetricDetail[]
    >((acc, workflow) => workflow.metrics ? [...acc, ...workflow.metrics] : [...acc], [])

  return metrics.map(metric => {
    const filteredMetricsAll = finishedWorkflowsMetrics.filter(
      metricAll => metricAll.name === metric.name,
    )
    const metricsSum = filteredMetricsAll.reduce(
      (acc, metric) => acc + parseFloat(metric.value),
      0,
    )
    return {
      name: metric.name,
      value: parseFloat(metric.value),
      avgValue: metricsSum / filteredMetricsAll.length,
      avgDiff:
        (parseFloat(metric.value) * 100) /
          (metricsSum / filteredMetricsAll.length) -
        100,
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

const updateActiveTabs = ({
  workflows,
  tabs,
}: {
  workflows: {
    data: IWorkflowResponse[]
    loading: boolean
    error: string | null
  }
  tabs: IWorkflowTabModel[]
}) => {
  return tabs.map(tab => {
    const workflow = workflows.data.find(
      workflow => workflow.workflowId === tab.workflowId,
    )
    if (!workflow) return tab
    return {
      ...tab,
      workflowSvg: {
        data: workflow
          ? { tasks: workflow.tasks, start: workflow.start, end: workflow.end }
          : null,
        loading: false,
      },
      workflowConfiguration: {
        data: workflow?.tasks || null,
        loading: false,
      },
      workflowMetrics: {
        ...tab.workflowMetrics,
        data: workflowMetricsInitializer({
          metrics: workflow.metrics || null,
          workflows,
        }),
      },
    }
  })
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
  const workflow = workflows.data.find(
    workflow => workflow.workflowId === workflowId,
  )
  const tab: IWorkflowTabModel = {
    ...defaultWorkflowTabModel,
    workflowName: workflow?.name || "",
    workflowId: workflow?.workflowId || "",
    workflowSvg: {
      data: workflow
        ? { tasks: workflow.tasks, start: workflow.start, end: workflow.end }
        : null,
      loading: false,
    },
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
      dataExploration: dataExplorationDefault,
      userInteraction: userInteractionDefault,
    },
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
    },
  }
  return tab
}

const addInitialTabs = ({
  tabs,
  workflows,
}: {
  tabs: string | null
  workflows: {
    data: IWorkflowResponse[]
    loading: boolean
    error: string | null
  },
}) => {
  const tabsArray = tabs ? tabs.split(',') : []
  const uniqueTabs = [...(tabsArray || [])].filter((tab, index, self) => self.indexOf(tab) === index).
    filter(newTab => workflows.data.find(workflow => workflow.workflowId ===  newTab) || newTab === "compare-completed")
  
    const newTabs : IWorkflowTabModel[] = uniqueTabs.map(
    tabName => {
      if (tabName === "compare-completed") return initializeCompareCompleteTab()
      return initializeTab({ workflowId: tabName, workflows})
    }
  )
  return newTabs
}

//Reducer exports
export const { addTab, deleteTab, addCompareCompletedTab, setTabsOrder, updateTabs, initTabs } =
  workflowTabsSlice.actions

export default workflowTabsSlice.reducer
