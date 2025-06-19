import { DataAssetType } from "./experiment/data-asset.model"

export enum AggregationFunction {
  // Basic aggregations
  COUNT = "COUNT",
  COUNT_ALL = "COUNT_ALL",
  SUM = "SUM",
  AVG = "AVG",
  MIN = "MIN",
  MAX = "MAX",

  // Statistical functions
  STDDEV = "STDDEV",
  VARIANCE = "VARIANCE",
  MEDIAN = "MEDIAN",

  // Percentiles
  PERCENTILE = "PERCENTILE",

  // String aggregations
  STRING_AGG = "STRING_AGG",
  ARRAY_AGG = "ARRAY_AGG",

  // Advanced
  FIRST = "FIRST",
  LAST = "LAST",
  MODE = "MODE"
}

export interface IMetaDataRequest {
  query: IDatasetMeta
  metadata: {
    workflowId: string
    queryCase: string
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

export interface AggregationOptions {
  distinct?: boolean;               // Default: false
  percentileValue?: number;        // For percentile functions (0.0 to 1.0)
  separator?: string;              // For STRING_AGG
  orderBy?: string;                // For ordered aggregations like ARRAY_AGG
  orderDirection?: "ASC" | "DESC"; // ASC or DESC, default: "ASC"
}

export interface IAggregation {
  column: string;
  function: AggregationFunction;
  alias?: string;
  options?: AggregationOptions;
}


export const defaultDataRequestQuery: IDataRequestQuery = {
  datasetMeta: {
    source: '',
    projectId: '',
    fileName: '',
  },
  limit: 0,
  columns: [],
  filters: [],
  offset: 0,
  groupBy: [],
  aggregations: [],
};


export interface IDataRequestQuery {
    datasetMeta: IDatasetMeta;
    columns?: string[]
    limit?: number
    offset?: number
    groupBy?: string[]
    filters?: IFilter[]
    aggregations?: IAggregation[]
}

export interface IDatasetMeta {
    source: string;
    projectId?: string;
    fileName?: string;
    type?: DataAssetType;
}

export interface IDataRequest {
  query: IDataRequestQuery
  metadata: {
    workflowId: string
    queryCase: string
  }
}