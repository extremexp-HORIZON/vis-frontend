import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { CustomGridColDef } from '../../shared/types/table-types';
import type { IMetric } from '../../shared/models/experiment/metric.model';
import { api, experimentApi } from '../../app/api/api';
import type { MetricFetchResult } from './workflowPageSlice';
import type { ConfusionMatrixResult, TestInstance } from '../../shared/models/tasks/model-analysis.model';
import type { AxiosError } from 'axios';
import type { IDataAsset } from '../../shared/models/experiment/data-asset.model';
import type { IDataExplorationMetaDataResponse, IMetaDataRequest, VisualColumn } from '../../shared/models/dataexploration.model';

export interface WorkflowTableRow {
  id: string;
  workflowId: string;
  status?: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface ScheduleTableRow {
  id: number;
  workflowId: string;
  status?: string;
  [key: string]: string | number | boolean | null | undefined;
}

export type CommonDataAssets = {
  [assetName: string]: {
    workflowId: string;
    dataAsset: IDataAsset;
  }[];
};

export type DataAssetsMetaData = {
  [assetName: string]: {
    [workflowId: string]: {
      meta: {
        data: IDataExplorationMetaDataResponse | null;
        loading: boolean;
        error: string | null;
      }
    }
  }
}
// only for bar charts
export type DataAssetsControlPanel = {
  [assetName: string]: {
    commonColumns: VisualColumn[]
  }
}

interface IMonitoringPageSlice {
    parallel: {
        data: Record<string, string | number | boolean | null | undefined>[]
        options: string[]
        selected: string
      }
      workflowsTable: {
        order: 'asc' | 'desc'
        orderBy: string
        page: number
        rowsPerPage: number
        selectedWorkflows: string[]
        workflowColors: { [key: string]: string } // New mapping for workflow colors
        hoveredWorkflowId: string | number | null; // Add this field

        filters: { column: string; operator: string; value: string }[]
        rows: WorkflowTableRow[]
        filteredRows: WorkflowTableRow[]
        filtersCounter: number
        visibleRows: WorkflowTableRow[]
        columns: CustomGridColDef[]
        visibleColumns: CustomGridColDef[]
        columnsVisibilityModel: { [field: string]: boolean }
        aggregatedRows: WorkflowTableRow[]
        groupBy: string[]
        grouppedWorkflows: Record<string, string[]>
        uniqueMetrics: string[]
        uniqueParameters: string[]
        uniqueTasks: string[]
        initialized: boolean
      }
      scheduledTable: {
        order: 'asc' | 'desc'
        orderBy: string
        page: number
        rowsPerPage: number
        selectedWorkflows: number[]
        filters: { column: string; operator: string; value: string }[]
        rows: ScheduleTableRow[]
        filteredRows: ScheduleTableRow[]
        filtersCounter: number
        visibleRows: ScheduleTableRow[]
        columns: CustomGridColDef[]
        columnsVisibilityModel: { [field: string]: boolean },
        uniqueParameters: string[]
        uniqueTasks: string[]
      }
      visibleTable: string
      selectedTab: number
      selectedComparisonTab: number
      isMosaic: boolean
      showMisclassifiedOnly: boolean
      selectedWorkflowsMetrics: {
        data: {[key: string]: {name: string; seriesMetric: IMetric[]}[]}
        loading: boolean
        error: string | null
      }
      comparativeModelConfusionMatrix: {
        [workflowId: string]: {
          data: ConfusionMatrixResult | null
          loading: boolean
          error: string | null
        }
      }
      comparativeModelRocCurve: {
        [workflowId: string]: {
          data: {fpr: number[]; tpr: number[]; thresholds?: number[]; auc?: number} | null
          loading: boolean
          error: string | null
        }
      }
      comparativeModelInstance: {
        [workflowId: string]: { data: TestInstance[] | null; loading: boolean; error: string | null }
      }
      selectedModelComparisonChart: string
      comparativeDataExploration: {
        commonDataAssets: CommonDataAssets
        dataAssetsMetaData: DataAssetsMetaData
        dataAssetsControlPanel: DataAssetsControlPanel
      }
      comparativeModelInstanceControlPanel: {
         xAxisOption: string
         yAxisOption: string
         options: string[]

      }
}

const generateUniqueColor = (existingColors: Set<string>) => {
  const colors = [
    '#1F77B4',
    '#FF7F0E',
    '#2CA02C',
    '#D62728',
    '#9467BD', // Purple
    '#8C564B', // Brown
    '#E377C2', // Pink
    '#17BECF', // Cyan
    '#AEC7E8', // Light Blue
    '#FFBB78', // Light Orange
    '#98DF8A', // Light Green
    '#FF9896', // Light Red
    '#C5B0D5', // Light Purple
    '#C49C94', // Light Brown
    '#F7B6D2', // Light Pink
    '#9EDAE5', // Light Cyan
  ];

  const availableColors = colors.filter(color => !existingColors.has(color));

  // If all colors are used, recycle but prioritize uniqueness
  if (availableColors.length === 0) return colors[Math.floor(Math.random() * colors.length)];

  const newColor = availableColors[Math.floor(Math.random() * availableColors.length)];

  return newColor;
};
const initialState: IMonitoringPageSlice = {
  parallel: { data: [], options: [], selected: '' },
  workflowsTable: {
    order: 'asc',
    orderBy: 'id',
    page: 0,
    rowsPerPage: 50,
    selectedWorkflows: [],
    workflowColors: {}, // Initialize the color mapping
    hoveredWorkflowId: null, // Initialize as null

    filters: [{ column: '', operator: '', value: '' }],
    rows: [],
    filteredRows: [],
    filtersCounter: 0,
    visibleRows: [],
    columns: [],
    visibleColumns: [],
    columnsVisibilityModel: {},
    aggregatedRows: [],
    groupBy: [],
    grouppedWorkflows: {},
    uniqueMetrics: [],
    uniqueParameters: [],
    uniqueTasks: [],
    initialized: false,
  },
  scheduledTable: {
    order: 'asc',
    orderBy: 'id',
    page: 0,
    rowsPerPage: 50,
    selectedWorkflows: [],
    filters: [{ column: '', operator: '', value: '' }],
    rows: [],
    filteredRows: [],
    filtersCounter: 0,
    visibleRows: [],
    columns: [],
    columnsVisibilityModel: {},
    uniqueParameters: [],
    uniqueTasks: []
  },
  visibleTable: 'workflows',
  selectedTab: 0,
  selectedComparisonTab: 0,
  isMosaic: true,
  showMisclassifiedOnly: false,
  selectedWorkflowsMetrics: {
    data: {},
    loading: false,
    error: null
  },
  comparativeModelConfusionMatrix: {},
  comparativeModelRocCurve: {},
  comparativeModelInstance: {},
  selectedModelComparisonChart: 'confusionMatrix',
  comparativeDataExploration: {
    commonDataAssets: {},
    dataAssetsMetaData: {},
    dataAssetsControlPanel: {}
  },
  comparativeModelInstanceControlPanel: {
    xAxisOption: '',
    yAxisOption: '',
    options: []
  }
};

export const monitoringPageSlice = createSlice({
  name: 'monitoringPage',
  initialState,
  reducers: {
    setParallel: (state, action) => {
      state.parallel = { ...state.parallel, ...action.payload };
    },
    setWorkflowsTable: (state, action) => {
      const { rows = [], ...rest } = action.payload;

      // If rows are included in the payload, assign colors
      if (rows.length > 0) {
        const existingColors = new Set(Object.values(state.workflowsTable.workflowColors));
        const newWorkflowColors = { ...state.workflowsTable.workflowColors };

        rows.forEach((row: WorkflowTableRow) => {
          const workflowId = row.id; // Adjust if your workflow ID field has a different name

          if (!newWorkflowColors[workflowId]) {
            newWorkflowColors[workflowId] = generateUniqueColor(existingColors);
            existingColors.add(newWorkflowColors[workflowId]);
          }
        });

        state.workflowsTable.workflowColors = newWorkflowColors;
      }

      state.workflowsTable = {
        ...state.workflowsTable,
        ...rest,
        ...(rows.length > 0 && { rows }) // only overwrite rows if included
      };
    },

    setScheduledTable: (state, action) => {
      state.scheduledTable = {
        ...state.scheduledTable,
        ...action.payload,
      };
    },
    setVisibleTable: (state, action) => {
      state.visibleTable = action.payload;
    },
    setSelectedTab: (state, action) => {
      state.selectedTab = action.payload;
    },
    setSelectedComparisonTab: (state, action) => {
      state.selectedComparisonTab = action.payload;
    },
    setIsMosaic: (state, action) => {
      state.isMosaic = action.payload;
    },
    setShowMisclassifiedOnly: (state, action) => {
      state.showMisclassifiedOnly = action.payload;
    },
    toggleWorkflowSelection: (state, action) => {
      const workflowId = action.payload;
      const index = state.workflowsTable.selectedWorkflows.indexOf(workflowId);

      if (index === -1) {
        // Add workflow and assign a unique color
        state.workflowsTable.selectedWorkflows.push(workflowId);

        const existingColors = new Set(Object.values(state.workflowsTable.workflowColors));

        if (!state.workflowsTable.workflowColors[workflowId]) {
          state.workflowsTable.workflowColors[workflowId] = generateUniqueColor(existingColors);
        }
      } else {
        // Remove workflow but keep its color mapping
        state.workflowsTable.selectedWorkflows.splice(index, 1);
      }
    },
    bulkToggleWorkflowSelection: (state, action) => {
      const workflowIds: string[] = action.payload;

      const existingColors = new Set(Object.values(state.workflowsTable.workflowColors));

      workflowIds.forEach((workflowId) => {
        const index = state.workflowsTable.selectedWorkflows.indexOf(workflowId);

        if (index === -1) {
          state.workflowsTable.selectedWorkflows.push(workflowId);

          if (!state.workflowsTable.workflowColors[workflowId]) {
            state.workflowsTable.workflowColors[workflowId] = generateUniqueColor(existingColors);
            existingColors.add(state.workflowsTable.workflowColors[workflowId]); // Avoid duplicates
          }
        }
      });
    },
    setGroupBy: (state, action) => {
      state.workflowsTable.groupBy = action.payload;
    },
    setHoveredWorkflow: (state, action) => {
      state.workflowsTable.hoveredWorkflowId = action.payload;
    },
    updateWorkflowRatingLocally: (state, action) => {
      const { workflowId, rating } = action.payload;

      const updateRowRating = (rows: WorkflowTableRow[]) =>
        rows.map((row) =>
          row.workflowId === workflowId
            ? { ...row, rating }
            : row
        );

      state.workflowsTable.rows = updateRowRating(state.workflowsTable.rows);
      state.workflowsTable.filteredRows = updateRowRating(state.workflowsTable.filteredRows);
      state.workflowsTable.visibleRows = updateRowRating(state.workflowsTable.visibleRows);
    },
    setSelectedModelComparisonChart: (state, action) => {
      state.selectedModelComparisonChart = action.payload;
    },
    setComparativeModelInstanceControlPanel: (
      state,
      action: {
    payload: {
      xAxisOption?: string;
      yAxisOption?: string;
      options?: string[];
    };
  }
    ) => {
      state.comparativeModelInstanceControlPanel = {
        ...state.comparativeModelInstanceControlPanel,
        ...action.payload,
      };
    },
    setCommonDataAssets: (state, action) => {
      state.comparativeDataExploration.commonDataAssets = action.payload;
    },
    setDataAssetsControlPanel: (state, action: {
      payload: {
        assetName: string;
        controlPanel: {
          commonColumns: VisualColumn[];
        };
      };
    }) => {
      state.comparativeDataExploration.dataAssetsControlPanel[action.payload.assetName] =
        action.payload.controlPanel;
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchWorkflowMetrics.fulfilled, (state, action) => {
      const { workflowId } = action.meta.arg;
      const fetchedMetrics = action.payload;

      if (!(workflowId in state.selectedWorkflowsMetrics.data)) {
        state.selectedWorkflowsMetrics.data[workflowId] = [];
      }

      const currentMetrics = state.selectedWorkflowsMetrics.data[workflowId];

      const metricMap = new Map(currentMetrics.map(m => [m.name, m]));

      for (const metric of fetchedMetrics) {
        metricMap.set(metric.name, {
          name: metric.name,
          seriesMetric: metric.data,
        });
      }

      state.selectedWorkflowsMetrics.data[workflowId] = Array.from(metricMap.values());

      state.selectedWorkflowsMetrics.loading = false;
      state.selectedWorkflowsMetrics.error = null;
    })
      .addCase(fetchWorkflowMetrics.pending, state => {
        state.selectedWorkflowsMetrics.loading = true;
      })
      .addCase(fetchWorkflowMetrics.rejected, (state, action) => {
        state.selectedWorkflowsMetrics.loading = false;
        state.selectedWorkflowsMetrics.error =
          action.error.message || 'Error while fetching data';
      })
      .addCase(fetchComparativeConfusionMatrix.pending, (state, action) => {
        const runId = action.meta.arg.runId;

        if (!state.comparativeModelConfusionMatrix[runId]) {
          state.comparativeModelConfusionMatrix[runId] = {
            data: null,
            loading: true,
            error: null,
          };
        } else {
          state.comparativeModelConfusionMatrix[runId].loading = true;
          state.comparativeModelConfusionMatrix[runId].error = null;
        }
      })

      .addCase(fetchComparativeConfusionMatrix.fulfilled, (state, action) => {
        const runId = action.meta.arg.runId;

        state.comparativeModelConfusionMatrix[runId] = {
          data: action.payload,
          loading: false,
          error: null,
        };
      })

      .addCase(fetchComparativeConfusionMatrix.rejected, (state, action) => {
        const runId = action.meta.arg.runId;

        if (!state.comparativeModelConfusionMatrix[runId]) {
          state.comparativeModelConfusionMatrix[runId] = {
            data: null,
            loading: false,
            error: 'Failed to fetch confusion matrix',
          };
        } else {
          state.comparativeModelConfusionMatrix[runId].loading = false;
          state.comparativeModelConfusionMatrix[runId].error = 'Failed to fetch confusion matrix';
        }
      })
      .addCase(fetchComparativeRocCurve.pending, (state, action) => {
        const runId = action.meta.arg.runId;

        if (!state.comparativeModelRocCurve[runId]) {
          state.comparativeModelRocCurve[runId] = {
            data: null,
            loading: true,
            error: null,
          };
        } else {
          state.comparativeModelRocCurve[runId].loading = true;
          state.comparativeModelRocCurve[runId].error = null;
        }
      })
      .addCase(fetchComparativeRocCurve.fulfilled, (state, action) => {
        const runId = action.meta.arg.runId;

        let rawData = typeof action.payload === 'string'
          ? JSON.parse(
            action.payload
              .replace(/\bInfinity\b/g, '1e9')
              .replace(/\b-Infinity\b/g, '-1e9')
          )
          : action.payload;

        if (Array.isArray(rawData.thresholds)) {
          rawData.thresholds = (rawData.thresholds as Array<string | number>).map((t): number => {
            if (t === Infinity || t === 'Infinity') return 1e9;
            if (t === -Infinity || t === '-Infinity') return -1e9;

            return Number(t);
          });
        }

        state.comparativeModelRocCurve[runId] = {
          data: rawData,
          loading: false,
          error: null,
        };

      })
      .addCase(fetchComparativeRocCurve.rejected, (state, action) => {
        const runId = action.meta.arg.runId;

        if (!state.comparativeModelRocCurve[runId]) {
          state.comparativeModelRocCurve[runId] = {
            data: null,
            loading: false,
            error: 'Failed to fetch roc curve',
          };
        } else {
          state.comparativeModelRocCurve[runId].loading = false;
          state.comparativeModelRocCurve[runId].error = 'Failed to fetch roc curve';
        }
      })
      .addCase(fetchComparativeModelInstances.pending, (state, action) => {
        const runId = action.meta.arg.runId;

        if (!state.comparativeModelInstance[runId]) {
          state.comparativeModelInstance[runId] = {
            data: null,
            loading: true,
            error: null,
          };
        } else {
          state.comparativeModelInstance[runId].loading = true;
          state.comparativeModelInstance[runId].error = null;
        }
      })

      .addCase(fetchComparativeModelInstances.fulfilled, (state, action) => {
        const runId = action.meta.arg.runId;

        state.comparativeModelInstance[runId] = {
          data: action.payload,
          loading: false,
          error: null,
        };
      })

      .addCase(fetchComparativeModelInstances.rejected, (state, action) => {
        const runId = action.meta.arg.runId;

        if (!state.comparativeModelInstance[runId]) {
          state.comparativeModelInstance[runId] = {
            data: null,
            loading: false,
            error: 'Failed to fetch instances',
          };
        } else {
          state.comparativeModelInstance[runId].loading = false;
          state.comparativeModelInstance[runId].error = 'Failed to fetch instances';
        }
      })
      .addCase(fetchMetaData.fulfilled, (state, action) => {
        const workflowId = action.meta.arg.metadata.workflowId;
        const assetName = action.meta.arg.metadata?.assetName;

        if(!assetName) return;

        if(!state.comparativeDataExploration.dataAssetsMetaData[assetName]) {
          state.comparativeDataExploration.dataAssetsMetaData[assetName] = {};
        };
        state.comparativeDataExploration.dataAssetsMetaData[assetName][workflowId] = {
          meta: {
            data: action.payload,
            loading: false,
            error: null,
          }
        };
      })
      .addCase(fetchMetaData.pending, (state, action) => {
        const { workflowId, assetName } = action.meta.arg.metadata;

        if(!assetName) return;

        if (!state.comparativeDataExploration.dataAssetsMetaData[assetName]) {
          state.comparativeDataExploration.dataAssetsMetaData[assetName] = {};
        }

        state.comparativeDataExploration.dataAssetsMetaData[assetName][workflowId] = {
          meta: {
            data: null,
            loading: true,
            error: null,
          }
        };
      })
      .addCase(fetchMetaData.rejected, (state, action) => {
        const { workflowId, assetName } = action.meta.arg.metadata;

        if(!assetName) return;

        if (!state.comparativeDataExploration.dataAssetsMetaData[assetName]) {
          state.comparativeDataExploration.dataAssetsMetaData[assetName] = {};
        }

        state.comparativeDataExploration.dataAssetsMetaData[assetName][workflowId] = {
          meta: {
            data: null,
            loading: false,
            error: 'Failed to fetch metadata',
          }
        };
      });
  }
});

export const fetchWorkflowMetrics = createAsyncThunk(
  'monitoringPage/fetchWorkflowMetrics',
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

export const fetchComparativeConfusionMatrix = createAsyncThunk(
  'monitoringPage/fetch_comparative_confusion_matrix',
  async ({ experimentId, runId }: { experimentId: string; runId: string }) => {
    const response = await experimentApi.get(`${experimentId}/runs/${runId}/evaluation/confusion-matrix`);

    return response.data;
  });

export const fetchComparativeModelInstances = createAsyncThunk(
  'monitoringPage/fetch_comparative_model_instances',
  async ({ experimentId, runId, offset = 0, limit = 1000 }: { experimentId: string; runId: string; offset?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await experimentApi.get(`${experimentId}/runs/${runId}/evaluation/test-instances`, {
        params: { offset, limit },
      });

      return response.data;
    } catch (err) {
      const error = err as AxiosError;

      if (error.response) {
        return rejectWithValue(error.response.data);
      }

      return rejectWithValue(error.message || 'Unknown error occurred');
    }
  }
);

export const fetchComparativeRocCurve = createAsyncThunk(
  'monitoringPage/fetch_comparative_roc_curve',
  async ({ experimentId, runId }: { experimentId: string; runId: string }) => {
    const response = await experimentApi.get(`${experimentId}/runs/${runId}/evaluation/roc-curve`);

    return response.data;
  }
);

export const fetchMetaData = createAsyncThunk(
  'monitoringPage/fetch_metadata',
  async (payload: IMetaDataRequest) => {
    const requestUrl = 'data/meta';

    return api
      .post<IDataExplorationMetaDataResponse>(requestUrl, payload.query)
      .then(response => response.data);
  },
);

export const { setParallel, setWorkflowsTable, setScheduledTable, setVisibleTable, setSelectedTab, setSelectedComparisonTab, toggleWorkflowSelection, bulkToggleWorkflowSelection, setGroupBy,
  setHoveredWorkflow, updateWorkflowRatingLocally, setSelectedModelComparisonChart, setCommonDataAssets, setDataAssetsControlPanel, setIsMosaic, setShowMisclassifiedOnly, setComparativeModelInstanceControlPanel
} = monitoringPageSlice.actions;
