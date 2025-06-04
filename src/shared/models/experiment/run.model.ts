import type { IParam } from './param.model';
import type { IMetric } from './metric.model';
import type { IDataAsset } from './data-asset.model';
import type { ITask } from './task.model';

export type RunStatus = 'RUNNING' | 'SCHEDULED' | 'COMPLETED' | 'FAILED' | 'PAUSED' | 'STOPPED' | 'KILLED' | 'PENDING_INPUT';

export interface IRun {
  /** Unique identifier for the run. */
  id: string;

  /** Optional: The name of the run. */
  name?: string;

  /** The experiment this run belongs to. */
  experimentId: string;

  /** Status of the run. */
  status: RunStatus;

  /** Optional: Unix timestamp of when the run started (ms). */
  startTime?: number;

  /** Optional: Unix timestamp of when the run ended (ms). */
  endTime?: number;

  /** Parameters used for the run. */
  params: IParam[];

  /** Metrics collected during the run. */
  metrics: IMetric[];

  /** Input datasets and output artifacts. */
  dataAssets: IDataAsset[];

  /** Optional: List of tasks associated with the run. */
  tasks?: ITask[];

  /** Additional metadata for the run. */
  tags: Record<string, string>;
}
