export interface IParam {
    /** The name of the parameter (e.g., "learning_rate", "batch_size"). */
    name: string;

    /** The value assigned to the parameter (e.g., "0.001", "32", "RNN"). */
    value: string;

    /** The task this parameter is associated with, if applicable */
    task?: string;
  }
