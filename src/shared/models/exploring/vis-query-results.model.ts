import { IPointType } from '../../utils/clusterUtils';
import type { IFacet } from './facet.model';
import { IGroupedStats } from './grouped-stats.model';
import { IRectStats } from './rect-stats.model';

export interface IVisQueryResults {
  points: IPointType[];
  facets: IFacet;
  series: IGroupedStats[];
  rectStats: IRectStats;
  fullyContainedTileCount: number;
  tileCount: number;
  pointCount: number;
  ioCount: number;
  totalTileCount: number;
  totalPointCount: number;
}
