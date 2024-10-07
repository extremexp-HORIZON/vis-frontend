export interface IDataExplorationRequest {
    // data(data: any): unknown;
    datasetId: string;
    columns?: string[];
    filters?: IFilter[];
    limit: number;
    offset?:number;
    groupBy?: string[]; // Optional, added

    aggregation?: {      // Optional, a map of columns to an array of aggregation functions
        [column: string]: string[]; // Example: { column1: ["sum", "avg"], column2: ["min", "max"] }
    };
}




export interface IFilter {
    column?: string;
    type: string;
    value: {
        min?: number | string;
        max?: number | string;
        value?: number | string;
    } | number | string;
}

export const defaultDataExplorationRequest: IDataExplorationRequest = {
    datasetId: '',
    columns: [],
    filters: [],
    limit: 2000,
    offset: 0,       // Adding default for `offset`
    groupBy: [],     // Adding default for `groupBy`
    aggregation: {}  // Adding default for `aggregation`
};