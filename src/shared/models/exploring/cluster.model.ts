import type { IPointType } from '../../utils/clusterUtils';

export interface ICluster {
  geometry: {
    type: string;
    coordinates: number[];
  };
  id: number;
  properties: {
    totalCount: number;
    points: IPointType[];
    [key: string]: number | IPointType[];
  };
}
