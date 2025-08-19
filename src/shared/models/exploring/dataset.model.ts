import type { VisualColumn } from '../dataexploration.model';
import type { DatasetType } from './enum/dataset-type.model';

export interface IDataset {
  id?: string;
  name?: string;
  type?: DatasetType;
  hasHeader?: boolean;
  headers?: string[];
  measure0?: string;
  measure1?: string;
  lat?: string;
  lon?: string;
  dataSource?: number;
  dimensions?: string[];
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  queryXMin?: number;
  queryXMax?: number;
  queryYMin?: number;
  queryYMax?: number;
  objectCount?: number;
  timeMin?: number;
  timeMax?: number;
  originalColumns?: VisualColumn[];
  timeColumn?: string[];
}

export const defaultValue: Readonly<IDataset> = {};

export type MapLayer = 'cluster' | 'heatmap' | 'geohash';
