export interface IWorkflowResponse {
        name: string;
        tasks: Task[];
        experimentId: string;
        status: string;
        metric_ids: string[];
        metrics?: MetricDetail[];
        workflowId: string;
        id?: string;
        start: string;
        end: string;
}

export interface Task {
    id: string;
    name: string;
    source_code: string;
    input_datasets?: InputDataset[];
    output_datasets?: InputDataset[];
    parameters?: Parameter[];
    variant?: string;
    metadata?: Metadata;
    start: string;
    end: string;
}

interface Metadata {
    prototypical_name: string;
    URL?: string;
    type?: string;
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
    metricId: string;
    producedByTask: string;
    semantic_type: string;
}

interface Aggregation {}
