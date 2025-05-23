import type { IPlotModel } from '../plotmodel.model';
import type {
  IDataExplorationResponse
} from '../dataexploration.model';

interface RawRow {
  timestamp: string;
  f3: string;
  [key: string]: unknown;
}

interface ParsedRow extends Omit<RawRow, 'timestamp' | 'f3'> {
  timestamp: Date;
  value: number;
  // series: string;
}

export interface ParsedDataExplorationResponse extends IDataExplorationResponse {
  parsedData: ParsedRow[];
}

export interface ConfusionMatrixResult {
  labels: string[];
  matrix: number[][];
}

export type TestInstance = Record<string, string | number | boolean | null>;

export const prepareDataExplorationResponse = (payload: IDataExplorationResponse) => ({
  ...payload,
  data: JSON.parse(payload.data as string),
});

// TODO: fix this whit correct typings to support multiple timeseries
export const handleMultiTimeSeriesData = (payload : IDataExplorationResponse) => {
  const fileData: RawRow[][] = JSON.parse(payload.data as string);
  // const seriesData = payload.fileNames;
  const flatFileData: ParsedRow[] =  fileData.flatMap((file, id)=> {
    return file.map(row => {
      return {
        ...row,
        timestamp: new Date(row.timestamp), // Ensure timestamp is parsed as Date object
        value: +row.f3, // Ensure value is a number
        // series: seriesData[id].replace('.csv', '') // Strip the .csv extension for series name
      };
    });
  });

  return { ...payload, data: flatFileData };
};

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
  modelInstances: { data: TestInstance[] | null; loading: boolean; error: string | null }
  modelConfusionMatrix: {
    data: ConfusionMatrixResult | null
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
    data: unknown | null
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
  modelRocCurve: { data: null, loading: false, error: null },
  multipleTimeSeries: { data: null, loading: false, error: null },
  multipleTimeSeriesMetadata: { data: null, loading: false, error: null },
  affected: { data: null, loading: false, error: null },
  modelSummary: { data: null, loading: false, error: null }
};
