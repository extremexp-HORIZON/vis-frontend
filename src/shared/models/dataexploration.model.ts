export interface IDataExplorationQuery {
  datasetId: string
  columns?: string[]
  filters?: IFilter[]
  limit: number
  offset?: number
  groupBy?: string[] // Optional, added
  aggregation?: {
    // Optional, a map of columns to an array of aggregation functions
    [column: string]: string[] // Example: { column1: ["sum", "avg"], column2: ["min", "max"] }
  }
  type?: 'csv' | 'zenoh'
}

export interface IDataExplorationRequest {
  query: IDataExplorationQuery
  metadata: {
    workflowId: string
    queryCase: string
  }
}

export interface IMetaDataQuery{
  datasetId: string
  type?: 'csv' | 'zenoh'
}
export interface IMetaDataRequest {
  query: IMetaDataQuery
  metadata: {
    workflowId: string
    queryCase: string
    assetName?: string
  }
}

export interface fetchAffectedRequest{
    workflowId: string
    queryCase: string
}

export interface VisualColumn {
  name: string
  type: string
}

// Model for TabularResults
export interface IDataExplorationResponse {
  data: unknown
  totalItems: number
  querySize: number
  columns: VisualColumn[]

}
export interface IDataExplorationMetaDataResponse {
  datasetType: string
  fileNames: string[]
  originalColumns: VisualColumn[]
  totalItems: number
  uniqueColumnValues: Record<string, unknown[]>
  hasLatLonColumns:boolean
  timeColumn?: string[]
}

export interface IFilter {
  column: string;
  type: string;
  operator: string;
  value: number | string;
}

export const defaultDataExplorationQuery: IDataExplorationQuery = {
  datasetId: '',
  limit: 0,
  columns: [],
  filters: [],
  offset: 0,
  groupBy: [],
  aggregation: {},
  type: 'csv',
};
