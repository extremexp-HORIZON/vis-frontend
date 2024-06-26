import { IDataExplorationRequest } from "./dataexploration.model";
import { IInitialization } from "./initialization.model";

export interface workflowTabModel {
    workflowDetails: {
        data: {[key: string]: number}
        loading: boolean;
    }
    workflowMetrics: {
        data: {[key: string]: number}
        loading: boolean;
    }
    workflowSvg: {
        data: string;
        loading: boolean;
    }
    workflowTasks: {
        modelAnalysis?: IInitialization;
        dataExploration?: IDataExplorationRequest;
    }
}