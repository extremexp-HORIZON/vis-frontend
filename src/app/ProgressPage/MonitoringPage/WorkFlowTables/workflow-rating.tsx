import { Rating } from "@mui/material";
import { useState } from "react";
import { useAppDispatch } from "../../../../store/store";
import {
  fetchUserEvaluation,
  fetchWorkflowWithRating,
} from "../../../../store/slices/progressPageSlice";
import type { IRun } from "../../../../shared/models/experiment/run.model";
import { updateWorkflowRatingLocally } from "../../../../store/slices/monitorPageSlice";

interface WorkflowRatingProps {
  currentRating: number;
  workflowId: string;
  experimentId: string;
}

const WorkflowRating = ({
  currentRating,
  workflowId,
  experimentId,
}: WorkflowRatingProps) => {
  const dispatch = useAppDispatch();
  const [isPolling, setPolling] = useState(false);

  const handleUserEvaluation = async (value: number | null) => {
    if (!experimentId || !workflowId) return;
    setPolling(true);

    // Optimistically update Redux state
    dispatch(updateWorkflowRatingLocally({ workflowId, rating: value }));

    const updateResult = await dispatch(
      fetchUserEvaluation({
        experimentId,
        runId: workflowId,
        data: { rating: value },
      })
    );

    if (!fetchUserEvaluation.fulfilled.match(updateResult)) {
      setPolling(false);
      return;
    }

    // Retry until rating metric is updated in backend
    for (let i = 0; i < 5; i++) {
      const result = await dispatch(
        fetchWorkflowWithRating({ experimentId, workflowId })
      );

      if (fetchWorkflowWithRating.fulfilled.match(result)) {
        const updatedWorkflow: IRun = result.payload.workflow;
        const ratingMetric = updatedWorkflow.metrics.find(
          (m) => m.name === "rating"
        );
        const fetchedRating = ratingMetric?.value;
        if (fetchedRating === value) break;
      }

      await new Promise((res) => setTimeout(res, 200));
    }

    setPolling(false);
  };

  return (
    <Rating
      sx={{ verticalAlign: "middle" }}
      value={currentRating}
      size="small"
      disabled={isPolling}
      onChange={(_, value) => {if (value !== null) handleUserEvaluation(value)}}
    />
  );
};

export default WorkflowRating;
