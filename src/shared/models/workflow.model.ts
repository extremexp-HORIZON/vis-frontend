export interface IWorkflowResponse {
    workflow: {
        name: string;
        tasks: Task[];
        experimentId: string;
        status: string;
        metric_ids: string[];
        metrics: Metric[];
    };
}

interface Task {
    id: string;
    name: string;
    source_code: string;
    input_datasets?: InputDataset[];
    parameters?: Parameter[];
}

interface InputDataset {
    name: string;
    uri: string;
}

interface Parameter {
    name: string;
    value: string;
    type: string;
}

interface Metric {
    [key: string]: MetricDetail;
}

interface MetricDetail {
    name: string;
    type: string;
    parent_id: string;
    parent_type: string;
    experimentId: string;
    value: string;
    aggregation: Aggregation;
}

interface Aggregation {}
