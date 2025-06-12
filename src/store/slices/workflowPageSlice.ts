import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type {
  IWorkflowPageModel } from '../../shared/models/workflow.tab.model';
import {
  defaultWorkflowPageModel,
} from '../../shared/models/workflow.tab.model';
import {
  modelAnalysisDefault,
} from '../../shared/models/tasks/model-analysis.model';
import {
  dataExplorationDefault,
} from '../../shared/models/tasks/data-exploration-task.model';
import { userInteractionDefault } from '../../shared/models/tasks/user-interaction.model';
import type { IRun } from '../../shared/models/experiment/run.model';
import type { IMetric } from '../../shared/models/experiment/metric.model';
import { experimentApi } from '../../app/api/api';
import { dataExplorationReducers } from './dataExplorationSlice';
import { modelAnalysisReducers } from './modelAnalysisSlice';
import { explainabilityReducers } from './explainabilitySlice';

export type MetricFetchResult = {
  name: string;
  data: IMetric[];
};

export interface IWorkflowPage {
  tab: IWorkflowPageModel | null
  isTabInitialized: boolean;
}

const initialState: IWorkflowPage = {
  tab: null,
  isTabInitialized: false
};

// explainabilitySlice
export const workflowPageSlice = createSlice({
  name: 'workflowPage',
  initialState,
  reducers: {
    initTab: (state, action) => {
      const { tab, workflows } = action.payload;

      state.tab = initializeTab({ workflowId: tab, workflows });
      state.isTabInitialized = true;
    },
    resetWorkflowTab: (state) => {
      state.tab = null;
      state.isTabInitialized = false;
    },
    setDataTable: (state, action) => {
      if(!state.tab) return;
      state.tab.dataTaskTable = {
        ...state.tab.dataTaskTable,
        ...action.payload,
      };
    },
    setSelectedItem: (state, action) => {
      if (!state.tab) return;
      state.tab.dataTaskTable.selectedItem = action.payload;
      state.tab.dataTaskTable.selectedTask = null;
    },
    setControls: (state, action) => {
      if (!state.tab?.workflowTasks.dataExploration) return;
      state.tab.workflowTasks.dataExploration.controlPanel = {
        ...state.tab?.workflowTasks.dataExploration?.controlPanel,
        ...action.payload
      };
    },
    setCurrentPage: (state, action) => {
      if (!state.tab?.workflowTasks.dataExploration) return;
      state.tab.workflowTasks.dataExploration.controlPanel.currentPage = action.payload;
    },
    setTotalSize: (state, action) => {
      if (!state.tab?.workflowTasks.dataExploration) return;
      state.tab.workflowTasks.dataExploration.controlPanel.totalPages = action.payload;
      state.tab.workflowTasks.dataExploration.controlPanel.currentPage = 1;
    },
    setMetaData: (state, action) => {
      if (!state.tab?.workflowTasks.dataExploration) return;
      state.tab.workflowTasks.dataExploration.metaData = {
        ...state.tab?.workflowTasks.dataExploration?.metaData,
        ...action.payload
      };
    },
    setSelectedTask: (state, action) => {
      if (!state.tab) return;
      state.tab.dataTaskTable.selectedTask = action.payload;
      state.tab.dataTaskTable.selectedItem = null;
    },
    setSelectedId: (state, action) => {
      if (!state.tab) return;
      state.tab.dataTaskTable.selectedId = action.payload;
    }
  },
  extraReducers: builder => {
    explainabilityReducers(builder);
    modelAnalysisReducers(builder);
    dataExplorationReducers(builder);
    builder
      .addCase(fetchWorkflowMetrics.fulfilled, (state, action) => {
        const newMetrics = action.payload; // this is an array of { name, data }

        if (!state.tab) return;

        const tab = state.tab;

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
        state.tab.workflowSeriesMetrics.error = null;
      })
      .addCase(fetchWorkflowMetrics.pending, state => {
        if (!state.tab) return;

        state.tab.workflowSeriesMetrics.loading = true;
      })
      .addCase(fetchWorkflowMetrics.rejected, (state, action) => {
        if (!state.tab) return;

        state.tab.workflowSeriesMetrics.loading = false;
        state.tab.workflowSeriesMetrics.error =
            action.error.message || 'Error while fetching data';
      });

  },
});

// Managing tabs logic

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
  if (!metrics) return null;

  const completedMetrics = workflows.data
    .filter(run => run.status === 'COMPLETED' && run.metrics)
    .flatMap(run => run.metrics!);

  return metrics.map(metric => {
    const matchingMetrics = completedMetrics.filter(
      m => m.name === metric.name
    );

    const values = matchingMetrics.map(m => m.value);
    const total = values.reduce((sum, val) => sum + val, 0);
    const count = values.length;
    const avg = count > 0 ? total / count : 0;

    return {
      ...metric,
      avgValue: avg,
      avgDiff: avg ? (metric.value * 100) / avg - 100 : 0,
      maxValue: count > 0 ? Math.max(...values) : 0,
      minValue: count > 0 ? Math.min(...values) : 0,
    };
  });
};

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
}): IWorkflowPageModel => {
  const workflow = workflows.data.find(w => w.id === workflowId);

  const workflowName = workflow?.name ?? '';
  const workflowSvg = workflow
    ? {
      tasks: workflow.tasks,
      start: workflow.startTime,
      end: workflow.endTime,
    }
    : null;

  return {
    ...defaultWorkflowPageModel,
    workflowId: workflow?.id ?? '',
    workflowName,
    workflowSvg: {
      data: workflowSvg,
      loading: false,
    },
    workflowConfiguration: {
      tasks: workflow?.tasks ?? null,
      dataAssets: workflow?.dataAssets ?? null,
      params: workflow?.params ?? null,
      loading: false,
    },
    workflowMetrics: {
      data: workflowMetricsInitializer({
        metrics: workflow?.metrics ?? null,
        workflows,
      }),
      loading: false,
    },
    workflowTasks: {
      modelAnalysis: modelAnalysisDefault,
      dataExploration: dataExplorationDefault,
      userInteraction: userInteractionDefault,
    },
  };
};

export const fetchWorkflowMetrics = createAsyncThunk(
  'progressPage/fetchWorkflowMetrics',
  async ({ experimentId, workflowId, metricNames }: { experimentId: string; workflowId: string; metricNames: string[] }) => {

    const results = await Promise.allSettled(
      metricNames.map((name) => {
        const requestUrl = `${experimentId}/runs/${workflowId}/metrics-all/${name}`;

        return experimentApi.get(requestUrl).then((response) => ({
          name,
          data: response.data as IMetric[],
        }));
      })
    );

    const successful = results.filter(
      (res): res is PromiseFulfilledResult<MetricFetchResult> => res.status === 'fulfilled'
    );

    if (successful.length === 0) {
      throw new Error('Failed to fetch all metrics');
    }

    return successful.map(res => res.value);
  });

// Reducer exports
export const { initTab, resetWorkflowTab, setControls, setMetaData, setDataTable, setSelectedItem, setSelectedTask, setSelectedId, setCurrentPage, setTotalSize } =
  workflowPageSlice.actions;

export default workflowPageSlice.reducer;
