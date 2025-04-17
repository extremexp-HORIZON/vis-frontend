import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
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
import { experimentApi } from "../../app/api/api"

export interface IWorkflowPage {
  tab: IWorkflowPageModel | null
  isTabInitialized: boolean;
}

const initialState: IWorkflowPage = {
  tab: null,
  isTabInitialized: false
}

// explainabilitySlice
export const workflowPageSlice = createSlice({
  name: "workflowPage",
  initialState,
  reducers: {
    initTab: (state, action) => {
      state.tab = setTab(action.payload)
      state.isTabInitialized = true
    },
    resetWorkflowTab: (state) => {
      state.tab = null
      state.isTabInitialized = false
    },
    setDataTable: (state, action) => {
      if(!state.tab) return
      state.tab.dataTaskTable = state.tab.dataTaskTable = {
        ...state.tab.dataTaskTable,
        ...action.payload,
      }    
    },
    setSelectedItem: (state, action) => {
      if (!state.tab) return
      state.tab.dataTaskTable.selectedItem = action.payload
      state.tab.dataTaskTable.selectedTask = null
    },
    // ...additionalReducers
    setControls: (state, action) => {
      if (!state.tab?.workflowTasks.dataExploration) return
      state.tab.workflowTasks.dataExploration.controlPanel = {
        ...state.tab?.workflowTasks.dataExploration?.controlPanel,
         ...action.payload}
      },
      setMetaData: (state, action) => {
        if (!state.tab?.workflowTasks.dataExploration) return
        state.tab.workflowTasks.dataExploration.metaData = {
          ...state.tab?.workflowTasks.dataExploration?.metaData,
           ...action.payload}
      } ,
      setSelectedTask: (state, action) => {
        if (!state.tab) return
        state.tab.dataTaskTable.selectedTask = action.payload
        state.tab.dataTaskTable.selectedItem = null
      }
  },
  extraReducers: builder => {
    explainabilityReducers(builder),
      modelAnalysisReducers(builder),
      explainabilityExtraReducers(builder),
      builder
        .addCase(fetchWorkflowMetrics.fulfilled, (state, action) => {
            const newMetrics = action.payload; // this is an array of { name, data }
            if (!state.tab) return;
            
            const tab = state.tab

            newMetrics.forEach(({ name, data }) => {
              const newItem = {
                name,
                seriesMetric: data,
              };


              const existingIndex = tab.workflowSeriesMetrics.data.findIndex(
                (item) => item.name === name
              );
            
              if (existingIndex !== -1) {
                tab.workflowSeriesMetrics.data[existingIndex] = newItem;
              } else {
                tab.workflowSeriesMetrics.data.push(newItem);
              }
            });
        
          state.tab.workflowSeriesMetrics.loading = false;
        })
        .addCase(fetchWorkflowMetrics.pending, state => {
          if (!state.tab) return

          state.tab.workflowSeriesMetrics.loading = true
        })
        .addCase(fetchWorkflowMetrics.rejected, (state, action) => {
          if (!state.tab) return

          state.tab.workflowSeriesMetrics.loading = false
          state.tab.workflowSeriesMetrics.error =
            action.error.message || "Error while fetching data"
        })

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
    const maxValue = Math.max(...filteredMetricsAll.map(metric => metric.value))
    const minValue = Math.min(...filteredMetricsAll.map(metric => metric.value))
    return {
      name: metric.name,
      value: metric.value,
      avgValue: (metricsSum / filteredMetricsAll.length),
      avgDiff:
        (metric.value * 100) /
          (metricsSum / filteredMetricsAll.length) -
        100,
        maxValue: maxValue,
        minValue: minValue,
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


export const fetchWorkflowMetrics = createAsyncThunk(
  "progressPage/fetchWorkflowMetrics",
  async ({ experimentId, workflowId, metricNames }: { experimentId: string; workflowId: string; metricNames: string[] }) => {
      
    const results = await Promise.allSettled(
      metricNames.map((name) => {
        const requestUrl = `${experimentId}/runs/${workflowId}/metrics-all/${name}`;
        return experimentApi.get(requestUrl).then((response) => ({
          name,
          data: response.data,
        }));
      })
    );
    
    const successful = results.filter(
      (res): res is PromiseFulfilledResult<{ name: string; data: any }> => res.status === "fulfilled"
    );
    
    if (successful.length === 0) {
      throw new Error("Failed to fetch all metrics");
    }
    
    return successful.map(res => res.value);
})


//Reducer exports
export const { initTab,resetWorkflowTab, setControls,setMetaData,setDataTable,setSelectedItem,setSelectedTask } =
  workflowPageSlice.actions

export default workflowPageSlice.reducer

