export interface IDataExplorationRequest {
    // data(data: any): unknown;
    datasetId: string;
    columns: string[];
    filters: IFilter[];
    aggFunction?: string;
    limit?: number;
    scaler?: string;
}

export interface IFilter {
    column: string;
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
    aggFunction: '',
    filters: [],
    limit: 1000,
    scaler: '',
    // data: function (data: any): unknown {
    //     throw new Error("Function not implemented.");
    // }
};