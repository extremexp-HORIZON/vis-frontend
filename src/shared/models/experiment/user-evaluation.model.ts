export interface IUserEvaluation {
    /** The identifier of the user submitting the evaluation */
    user: string;

    /** Optional: A numerical score for the run (e.g., 1–5) */
    rating?: number;

    /** Optional: Whether the user marked this run as a favorite */
    favorite?: boolean;

    /** Optional: A free-text comment describing the user’s evaluation */
    comment?: string;
  }
