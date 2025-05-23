import type { IDataAsset } from './experiment/data-asset.model';
import type { IMetric } from './experiment/metric.model';
import type { IParam } from './experiment/param.model';
import type { ITask } from './experiment/task.model';
import type { IDataExploration } from './tasks/data-exploration-task.model';
import type { IExplainability } from './tasks/explainability.model';
import type { IModelAnalysis } from './tasks/model-analysis.model';
import type { IUserInteraction } from './tasks/user-interaction.model';

type SelectedItem = {
  type: string;
  data: {
    param?: IParam;
    dataset?: IDataAsset;
    metric?: {
        name: string;
        value: number;
        avgDiff: number;
        avgValue: number;
        maxValue: number;
        minValue: number;
        task?: string;
        step?: number;
        timestamp: number;
    }
    variant?: string;
    model?: string;
  }
} | null;

export interface IWorkflowPageModel {
    workflowId: string;
    workflowName: string;
    workflowConfiguration: {
        tasks: ITask[] | null;
        dataAssets: IDataAsset[] | null;
        params: IParam[] | null
        loading: boolean;
    }
    workflowMetrics: {
        data: { name: string, value: number, avgDiff: number, avgValue: number, maxValue: number; minValue: number; task?: string; step?: number; timestamp: number;}[] | null
        loading: boolean;
    }
    workflowSeriesMetrics: {
        data: {name: string; seriesMetric: IMetric[]}[]
        loading: boolean;
        error: string | null;
    }
    workflowSvg: {
        data: {tasks: ITask[] | undefined, start: number | undefined, end: number | undefined} | null
        loading: boolean;
    }
    workflowTasks: {
        modelAnalysis?: IModelAnalysis | null;
        dataExploration?: IDataExploration | null;
        explainabilityTask?: IExplainability | null;
        userInteraction?: IUserInteraction | null;
    }
    dataTaskTable: {
        selectedItem: SelectedItem
        selectedTask:  {role: string; task: string; taskId: string; variant: string; } | null
        selectedId: string | null
    }
}

export const defaultWorkflowPageModel: IWorkflowPageModel = {
  workflowId: '0',
  workflowName: '',
  workflowConfiguration: {
    tasks: null,
    dataAssets: null,
    params: null,
    loading: true
  },
  workflowMetrics: {
    data: null,
    loading: true
  },
  workflowSeriesMetrics: {
    data: [],
    loading: true,
    error: null
  },
  workflowSvg: {
    data: null,
    loading: true
  },
  workflowTasks: {
    modelAnalysis: null,
    dataExploration: null,
    explainabilityTask: null,
    userInteraction: null
  },
  dataTaskTable: {
    selectedItem: null,
    selectedTask: null,
    selectedId: null
  }
};
