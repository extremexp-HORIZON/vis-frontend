import { IDataExplorationRequest } from "./dataexploration.model";
import { IModelAnalysisTask } from "./modelAnalysisTask.model";

export interface IWorkflowTabModel {
    workflowId: null | string | number;
    workflowDetails: {
        data: {[key: string]: number | string} | null
        loading: boolean;
    }
    workflowMetrics: {
        data: {[key: string]: number | string} | null
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
    workflowId: null,
    workflowDetails: {
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