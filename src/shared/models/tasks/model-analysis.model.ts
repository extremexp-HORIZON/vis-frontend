import type { IPlotModel } from "../plotmodel.model"
import type {
  IDataExplorationResponse
} from "../dataexploration.model"

export const prepareDataExplorationResponse = (payload: IDataExplorationResponse) => ({
  ...payload,
  data: JSON.parse(payload.data),
})

export const handleMultiTimeSeriesData = (payload : any) => {
  const fileData = JSON.parse(payload.data);
  const seriesData = payload.fileNames;
  const flatFileData =  fileData.flatMap((file: any, id:number)=> {
    return file.map((row: any) => {
      return { 
        ...row,
        timestamp: new Date(row.timestamp), // Ensure timestamp is parsed as Date object
        value: +row.f3, // Ensure value is a number
        series: seriesData[id].replace('.csv', '') // Strip the .csv extension for series name
      };
    });
  });
  return {...payload, data: flatFileData};
}

export interface IModelAnalysis {
  featureNames: string[]
  pdp: { data: IPlotModel | null; loading: boolean; error: string | null; selectedFeature: string | null; }
  ale: { data: IPlotModel | null; loading: boolean; error: string | null; selectedFeature: string | null; }
  counterfactuals: {
    data: IPlotModel | null
    loading: boolean
    error: string | null
  }
  global_counterfactuals:{
    data: IPlotModel | null
    loading: boolean
    error: string | null
  }
  influenceFunctions: {
    data: IPlotModel | null
    loading: boolean
    error: string | null
  }
  modelInstances: { data: any | null; loading: boolean; error: string | null }
  modelConfusionMatrix: {
    data: {labels: any, matrix: any} | null
    loading: boolean
    error: string | null
  }
  modelRocCurve: {
    data: {fpr: number[]; tpr: number[]; thresholds?: number[]; auc?: number} | null
    loading: boolean
    error: string | null
  }
  multipleTimeSeries: {
    data: IDataExplorationResponse | null
    loading: boolean
    error: string | null
  }
  multipleTimeSeriesMetadata: {
    data: IDataExplorationResponse | null
    loading: boolean
    error: string | null
  }
  affected: {
    data: any | null
    loading: boolean
    error: string | null
  }
  modelSummary: {
    data: {
      overallMetrics: Record<string, number>
      classificationReport: Array<Record<string, string | number>>
      numSamples: number
      numFeatures: number
      classLabels: string[]
      dataSplitSizes: Record<string, number>
    } | null
    loading: boolean
    error: string | null  
  }
}

export const modelAnalysisDefault: IModelAnalysis = {
  featureNames: [],
  pdp: { data: null, loading: false, error: null, selectedFeature: null },
  ale: { data: null, loading: false, error: null, selectedFeature: null },
  counterfactuals: { data: null, loading: false, error: null },
  global_counterfactuals: { data: null, loading: false, error: null },
  influenceFunctions: { data: null, loading: false, error: null },
  modelInstances: { data: null, loading: false, error: null },
  modelConfusionMatrix: { data: null, loading: false, error: null },
  modelRocCurve: {data: null, loading: false, error: null },
  multipleTimeSeries: { data: null, loading: false, error: null },
  multipleTimeSeriesMetadata: { data: null, loading: false, error: null },
  affected: { data: null, loading: false, error: null },
  modelSummary: { data: null, loading: false, error: null }
}