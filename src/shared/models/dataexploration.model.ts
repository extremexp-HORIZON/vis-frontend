import { IModelAnalysis } from "./tasks/model-analysis.model"

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
  type?: "csv" | "zenoh"
}

export interface IDataExplorationRequest {
  query: IDataExplorationQuery
  metadata: {
    workflowId: string | number
    queryCase: any
  }
}

export interface fetchAffectedRequest{
    workflowId: string | number
    queryCase: any
}

export interface VisualColumn {
  name: string
  type: string
  // Add any other properties specific to the column metadata
}

// Model for TabularResults
export interface IDataExplorationResponse {
  data: any
  fileNames: string[]
  columns: VisualColumn[]
  originalColumns: VisualColumn[]
  timestampColumn?: string
  totalItems: number
  querySize: number
  uniqueColumnValues: any
}

export interface IFilter {
  column: string;
  type: string;
  value?: number | string; // For "equals" type
  min?: number | string;   // For "range" type
  max?: number | string;   // For "range" type
}


export const defaultDataExplorationQuery: IDataExplorationQuery = {
  datasetId: "",
  limit: 0,
  columns: [],
  filters: [],
  offset: 0,
  groupBy: [],
  aggregation: {},
  type: "csv",
}
