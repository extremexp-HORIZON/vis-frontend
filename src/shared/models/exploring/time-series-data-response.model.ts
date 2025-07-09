import type { VisualColumn } from '../dataexploration.model';
import type { IUnivariateDataPoint } from './univariate-datapoint.model';

export interface ITimeSeriesDataResponse {
  data: string;
  columns: VisualColumn[];
  totalitems: number;
  querySize: number;
  timeSeriesPoints: IUnivariateDataPoint[];
}
