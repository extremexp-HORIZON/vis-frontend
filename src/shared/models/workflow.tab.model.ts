import { IDataAsset } from "./experiment/data-asset.model";
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
        data: { name: string, value: number, avgDiff: number, avgValue: number}[] | null
        loading: boolean;
    }
    workflowSvg: {
        data: {tasks: ITask[] | undefined, start: number | undefined, end: number | undefined} | null
        loading: boolean;
    }
    workflowTasks: {
        modelAnalysis?: IModelAnalysis;
        dataExploration?: IDataExploration;
        explainabilityTask?: IExplainability;
        userInteraction?: IUserInteraction;
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
    workflowSvg: {
        data: null,
        loading: true
    },
    workflowTasks: {
    },
}