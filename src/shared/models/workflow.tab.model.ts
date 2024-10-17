import { IDataExplorationQuery } from "./dataexploration.model";
import { IExplainability } from "./tasks/explainability.model";
import { IModelAnalysis } from "./tasks/model-analysis.model";

export interface IWorkflowTabModel {
    workflowId: string | number;
    workflowConfiguration: {
        data: {[key: string]: number | string} | null
        loading: boolean;
    }
    workflowMetrics: {
        data: { name: string, value: number, avgDiff: number, avgValue: number}[] | null
        loading: boolean;
    }
    workflowSvg: {
        data: string | null
        loading: boolean;
    }
    workflowTasks: {
        modelAnalysis?: IModelAnalysis;
        dataExploration?: IDataExplorationQuery;
        explainabilityTask?: IExplainability;
    }
}

export const defaultWorkflowTabModel: IWorkflowTabModel = {
    workflowId: 0,
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