import type React from 'react';
import { useEffect, useRef } from 'react';
import { Box, Typography, Alert, Chip } from '@mui/material';
import { useTaskProgress } from '../hooks/useTaskProgress';
import { removeTask } from '../../store/slices/exploring/eusomeSlice';
import { useAppDispatch } from '../../store/store';

export type TaskType = 'train' | 'predict' | 'finetune' | 'other';

interface TaskProgressProps {
  taskId: string | null;
  isConnected: boolean;
  taskType?: TaskType;
  showTitle?: boolean;
  onTaskComplete?: (taskResult?: unknown) => void;
  onTaskFailed?: () => void;
  onTaskCanceled?: () => void;
}

const getTaskTypeLabel = (taskType: TaskType): string => {
  switch (taskType) {
    case 'train':
      return 'Training';
    case 'predict':
      return 'Prediction';
    case 'finetune':
      return 'Fine-tuning';
    case 'other':
    default:
      return 'Task';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'succeeded':
      return 'success';
    case 'failed':
      return 'error';
    case 'canceled':
      return 'warning';
    case 'running':
      return 'primary';
    case 'queued':
    default:
      return 'default';
  }
};

export const TaskProgress: React.FC<TaskProgressProps> = ({
  taskId,
  isConnected,
  taskType = 'other',
  showTitle = true,
  onTaskComplete,
  onTaskFailed,
  onTaskCanceled,
}) => {
  const { taskResult, hasCompleted, ...taskProgress } = useTaskProgress(
    taskId || '',
  );
  const hasCalledCompleteRef = useRef(false);
  const dispatch = useAppDispatch();

  // Handle task completion
  useEffect(() => {
    if (
      taskId &&
      hasCompleted &&
      !hasCalledCompleteRef.current
    ) {
      hasCalledCompleteRef.current = true;
      dispatch(removeTask(taskId));
      if (taskProgress.status === 'succeeded' && onTaskComplete) {
        onTaskComplete(taskResult);
      } else if (taskProgress.status === 'failed' && onTaskFailed) {
        onTaskFailed();
      } else if (taskProgress.status === 'canceled' && onTaskCanceled) {
        onTaskCanceled();
      }
    }
  }, [
    taskId,
    taskProgress.status,
    hasCompleted,
    onTaskComplete,
    onTaskFailed,
    onTaskCanceled,
    dispatch,
  ]);

  if (!taskId || !isConnected) {
    return null;
  }

  const taskLabel = getTaskTypeLabel(taskType);

  return (
    <Box sx={{ width: '100%' }}>
      {showTitle && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {taskLabel} Progress
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={taskProgress.status.toUpperCase()}
              size="small"
              color={getStatusColor(taskProgress.status)}
              variant="outlined"
            />
            <Typography variant="body2" color="text.secondary">
              {taskProgress.percent}%
            </Typography>
          </Box>
        </Box>
      )}

      <Box
        sx={{
          width: '100%',
          bgcolor: '#e0e0e0',
          borderRadius: 1,
          height: 8,
        }}
      >
        <Box
          sx={{
            width: `${taskProgress.percent}%`,
            bgcolor:
              taskProgress.status === 'failed' ? 'error.main' : 'primary.main',
            height: '100%',
            borderRadius: 1,
            transition: 'width 0.3s ease',
          }}
        />
      </Box>

      {taskProgress.step && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: 'block' }}
        >
          <strong>Step:</strong> {taskProgress.step}
        </Typography>
      )}

      {taskProgress.message && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.5, display: 'block' }}
        >
          {taskProgress.message}
        </Typography>
      )}

      {taskProgress.error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {taskProgress.error}
        </Alert>
      )}
    </Box>
  );
};

export default TaskProgress;
