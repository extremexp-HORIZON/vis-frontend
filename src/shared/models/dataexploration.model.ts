export const AggregationFunction = {
  COUNT: 'COUNT',
  COUNT_ALL: 'COUNT_ALL',
  SUM: 'SUM',
  AVG: 'AVG',
  MIN: 'MIN',
  MAX: 'MAX',
  STDDEV: 'STDDEV',
  VARIANCE: 'VARIANCE',
  MEDIAN: 'MEDIAN',
  PERCENTILE: 'PERCENTILE',
  STRING_AGG: 'STRING_AGG',
  ARRAY_AGG: 'ARRAY_AGG',
  FIRST: 'FIRST',
  LAST: 'LAST',
  MODE: 'MODE',
} as const;

export type AggregationFunction = typeof AggregationFunction[keyof typeof AggregationFunction];

export interface AggregationOptions {
  distinct?: boolean;               // Default: false
  percentileValue?: number;        // For percentile functions (0.0 to 1.0)
  separator?: string;              // For STRING_AGG
  orderBy?: string;                // For ordered aggregations like ARRAY_AGG
  orderDirection?: 'ASC' | 'DESC'; // ASC or DESC, default: "ASC"
}

export interface IAggregation {
  column: string;
  function: AggregationFunction;
  alias?: string;
  options?: AggregationOptions;
}

export interface IDataSource {
  source: string
  format: string
  sourceType: string
  fileName: string
}

export interface IDataExplorationQuery {
  dataSource: IDataSource
  columns?: string[]
  filters?: IFilter[]
  limit?: number
  offset?: number
  groupBy?: string[] // Optional, added
  aggregations?: IAggregation[]
}

export interface IDataExplorationRequest {
  query: IDataExplorationQuery
  metadata: {
    workflowId: string
    queryCase: string
  }
}

export interface IMetaDataQuery{
  source: string
  format: string
  sourceType: string
  fileName: string
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
  dataSource: {
    source: '',
    format: '',
    sourceType: '',
    fileName: '',
  },
  limit: 0,
  columns: [],
  filters: [],
  offset: 0,
  groupBy: [],
  aggregations: [],
};
