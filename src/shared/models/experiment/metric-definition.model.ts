export interface IMetricDefinition {
    /** The metric name (e.g., "accuracy", "loss"). */
    name: string;

    /** Optional: A brief explanation of what the metric represents. */
    description?: string;

    /** Optional: A standardized metric type (e.g., "accuracy", "precision"). */
    semanticType?: string;

    /** Optional: The unit of measurement (e.g., percentage, seconds). */
    unit?: string;

    /** Optional: Whether a higher value is considered better. */
    greaterIsBetter?: boolean;
  }
