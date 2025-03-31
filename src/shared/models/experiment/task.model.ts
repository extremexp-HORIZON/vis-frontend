export interface ITask {
    /** The name of the task. */
    name: string;
  
    /** The type of the task. */
    type: string;
  
    /** Optional: Unix timestamp (milliseconds) when the task started. */
    startTime?: number;
  
    /** Optional: Unix timestamp (milliseconds) when the task ended. */
    endTime?: number;
  
    /** Optional: Additional metadata associated with the task. */
    tags?: Record<string, string>;
  }
  