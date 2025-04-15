import { IDataAsset } from "./experiment/data-asset.model";
import { IMetric } from "./experiment/metric.model";
import { IParam } from "./experiment/param.model";
import { ITask } from "./experiment/task.model";
import { IDataExploration } from "./tasks/data-exploration-task.model";
import { IExplainability } from "./tasks/explainability.model";
import { IModelAnalysis } from "./tasks/model-analysis.model";
import { IUserInteraction } from "./tasks/user-interaction.model";

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
        data: { name: string, value: number, avgDiff: number, avgValue: number, task?: string}[] | null
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
        selectedDataset: {id: number; source: string;} | null
        dataRows: { [key: string]: any }[]
        parameters: { [key: string]: any }[]
        metrics: { [key: string]: any }[]
        selectedItem: { [key: string]: any } | null
        selectedTask:  { [key: string]: any } | null

    }
}

export const defaultWorkflowPageModel: IWorkflowPageModel = {
    workflowId: "0",
    workflowName: "",
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
        selectedDataset: null,
        dataRows: [],
        parameters: [],
        metrics: [],
        selectedItem: null, 
        selectedTask: null, 


    }
}