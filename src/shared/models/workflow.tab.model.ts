import { IDataExplorationRequest } from "./dataexploration.model";
import { IModelAnalysisTask } from "./modelAnalysisTask.model";

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
        modelAnalysis?: IModelAnalysisTask;
        dataExploration?: IDataExplorationRequest;
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
    }
}