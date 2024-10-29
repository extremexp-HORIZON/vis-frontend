export interface IWorkflowResponse {
    workflow: {
        name: string;
        tasks: Task[];
        experimentId: string;
        status: string;
        metric_ids: string[];
        metrics: Metric[];
        workflowId: string;
    };
}

export interface Task {
    id: string;
    name: string;
    source_code: string;
    input_datasets?: InputDataset[];
    parameters?: Parameter[];
    variant?: string;
}

interface InputDataset {
    name: string;
    uri: string;
}

export interface Parameter {
    name: string;
    value: string;
    type: string;
}

export interface Metric {
    [key: string]: MetricDetail;
}

export interface MetricDetail {
    name: string;
    type: string;
    parent_id: string;
    parent_type: string;
    experimentId: string;
    value: string;
    aggregation: Aggregation;
}

interface Aggregation {}
