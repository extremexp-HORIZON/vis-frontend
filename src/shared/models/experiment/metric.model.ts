export interface IMetric {
    /** The name of the metric (e.g., "accuracy", "loss"). */
    name: string;

    /** The recorded metric value. */
    value: number;

    /** Unix timestamp (in milliseconds) when the metric was logged. */
    timestamp: number;

    /** Optional: The step index associated with the metric (e.g., epoch number). */
    step?: number;

    task?: string;
  }
