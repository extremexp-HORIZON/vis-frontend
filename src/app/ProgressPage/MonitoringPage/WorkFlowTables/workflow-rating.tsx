import { Rating } from '@mui/material';
import { useState } from 'react';
import { useAppDispatch } from '../../../../store/store';
import {
  fetchUserEvaluation,
} from '../../../../store/slices/progressPageSlice';

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
  const [localRating, setLocalRating] = useState<number | null>(null);

  const handleUserEvaluation = async (value: number | null) => {
    if (!experimentId || !workflowId) return;

    setPolling(true);
    setLocalRating(value);

    await dispatch(
      fetchUserEvaluation({
        experimentId,
        runId: workflowId,
        data: { rating: value },
      })
    );

    setLocalRating(null);
    setPolling(false);
  };

  return (
    <Rating
      sx={{ verticalAlign: 'middle' }}
      value={localRating !== null ? localRating : currentRating}
      size="small"
      disabled={isPolling}
      onChange={(_, value) => { if (value !== null) handleUserEvaluation(value); }}
    />
  );
};

export default WorkflowRating;
