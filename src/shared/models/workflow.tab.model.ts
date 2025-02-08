import { IDataExplorationQuery } from "./dataexploration.model";
import { IDataExploration } from "./tasks/data-exploration-task.model";
import { IExplainability } from "./tasks/explainability.model";
import { IModelAnalysis } from "./tasks/model-analysis.model";
import { IUserInteraction } from "./tasks/user-interaction.model";
import { Task } from "./workflow.model";

export interface IWorkflowTabModel {
    workflowId: string;
    workflowName: string;
    workflowConfiguration: {
        data: Task[] | null
        loading: boolean;
    }
    workflowMetrics: {
        data: { name: string, value: number, avgDiff: number, avgValue: number}[] | null
        loading: boolean;
    }
    workflowSvg: {
        data: {tasks: Task[], start: string, end: string} | null
        loading: boolean;
    }
    workflowTasks: {
        modelAnalysis?: IModelAnalysis;
        dataExploration?: IDataExploration;
        explainabilityTask?: IExplainability;
        userInteraction?: IUserInteraction;
    }
}

export const defaultWorkflowTabModel: IWorkflowTabModel = {
    workflowId: "0",
    workflowName: "",
    workflowConfiguration: {
        data: null,
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