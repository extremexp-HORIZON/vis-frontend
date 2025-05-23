import type { IMetricDefinition } from './metric-definition.model';

export interface IExperiment {
    /** Unique identifier for the experiment. */
    id: string;

    /** Optional: Human-readable name of the experiment. */
    name?: string;

    /** Timestamp when the experiment was created (in ms). */
    creationTime: number;

    /** Optional: Timestamp of the last modification (in ms). */
    lastUpdateTime?: number;

    /** Optional: Metric definitions tracked within the experiment. */
    metricDefinitions?: IMetricDefinition[];

    /** Additional metadata as key-value pairs. */
    tags: Record<string, string>;
  }
