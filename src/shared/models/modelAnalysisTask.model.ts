import { IPlotModel } from "./plotmodel.model"

export interface IModelAnalysisTask {
  featureNames: string[]
  loading: boolean
  workflowId: number | null
  plots: {
    [key: string]: { data: IPlotModel | null; loading: boolean; error: null | string }
  }
  tables: {
    [key: string]: { data: IPlotModel | null; loading: boolean; error: null | string }
  }
  modelInstances: { data: any | null; columns: any | null; loading: boolean; error: null | string }
  modelConfusionMatrix: { data: any | null; columns: any | null; loading: boolean; error: null | string }
}

export const defaultModelAnalysisTask: IModelAnalysisTask = {
  featureNames: [],
  loading: false,
  workflowId: null,
  plots: {
    pdp: { data: null, loading: false, error: null },
    ale: { data: null, loading: false, error: null },
  },
  tables: {
    counterfactuals: { data: null, loading: false, error: null },
    prototypes: { data: null, loading: false, error: null },
  },
  modelInstances: { data: null, columns: null, loading: false, error: null },
  modelConfusionMatrix: { data: null, columns: null, loading: false, error: null },
}
