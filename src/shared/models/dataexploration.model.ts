import { IModelAnalysis } from "./tasks/model-analysis.model"

export interface IDataExplorationQuery {
  datasetId: string
  columns: string[]
  filters: IFilter[]
  aggFunction?: string
  limit?: number
  scaler?: string
}

export interface IDataExplorationRequest {
  query: IDataExplorationQuery
  metadata: {
    workflowId: string | number
    queryCase: keyof IModelAnalysis
  }
}

export interface IDataExplorationResponse {
  data: any
  columns: { name: string; type: string }[]
  fileNames: string[]
  timestampColumn: string | null
}

export interface IFilter {
  column: string
  type: string
  value:
    | {
        min?: number | string
        max?: number | string
        value?: number | string
      }
    | number
    | string
}

export const defaultDataExplorationQuery: IDataExplorationQuery = {
  datasetId: "",
  columns: [],
  aggFunction: "",
  filters: [],
  limit: 1000,
  scaler: "",
}
