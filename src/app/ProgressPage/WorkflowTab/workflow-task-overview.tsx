import { Box, Typography } from '@mui/material';
import { CheckCircle as CheckCircleIcon, WarningAmberRounded as WarningAmberRoundedIcon, InfoOutlined as InfoOutlinedIcon } from '@mui/icons-material';
import type { RootState } from '../../../store/store';
import { useAppSelector } from '../../../store/store';
import { DetailsCard, DetailsCardItem } from '../../../shared/components/details-card';
import UserInteractiveTask from '../../../deprecated/UserInteractiveTask/user-interactive-task';
const StatusIndicator = ({ completed }: {completed: boolean}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'row',
      gap: 1,
      alignItems: 'center',
      backgroundColor: completed ? '#e6f4ea' : '#fdecea',
      padding: '6px 8px',
      borderRadius: 1,
    }}
  >
    <Typography variant="body1">
      Status: {completed ? 'completed' : 'not completed'}
    </Typography>
    {completed ? (
      <CheckCircleIcon fontSize="small" color="success" />
    ) : (
      <WarningAmberRoundedIcon fontSize="small" color="error" />
    )}
  </Box>
);

const EmptyState = () => (
  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
    <InfoOutlinedIcon fontSize="small" color="disabled" />
    <Typography variant="body1">
      No parameters defined for this task
    </Typography>
  </Box>
);

const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];

  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (s || parts.length === 0) parts.push(`${s}s`);

  return parts.join(' ');
};

const WorkflowTaskOverview = () => {
  const { tab } = useAppSelector((state: RootState) => state.workflowPage);
  const { selectedTask } = useAppSelector(
    state =>
      state.workflowPage.tab?.dataTaskTable ?? {
        selectedTask: null,
      },
  );

  const task = tab?.workflowConfiguration.tasks?.find(task => task.name === selectedTask?.task);

  const parameters = tab?.workflowConfiguration.params?.filter(param => param.task === selectedTask?.taskId);

  if (!task) return null;

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, width: '100%' }}>
        <DetailsCard title="Task Metadata">
          <StatusIndicator completed={!!task.endTime} />
          {task.startTime && (
            <DetailsCardItem
              label="Start time"
              value={new Date(task.startTime).toLocaleString()}
            />
          )}
          {task.endTime && (
            <DetailsCardItem
              label="End time"
              value={new Date(task.endTime).toLocaleString()}
            />
          )}
          {task.endTime && task.startTime && (
            <DetailsCardItem
              label="Duration"
              value={formatDuration((task.endTime - task.startTime) / 1000)}
            />
          )}
        </DetailsCard>

        <DetailsCard title="Task Parameters">
          {parameters?.length ? (
            parameters.map(param => (
              <DetailsCardItem
                key={`param-${param.name}`}
                label={param.name}
                value={param.value}
              />
            ))
          ) : (
            <EmptyState />
          )}
        </DetailsCard>
      </Box>
      <Box sx={{ mt: 2 }}>

        {task.tags?.type === 'interactive'  && task.tags?.URL && task?.endTime === null &&  (
          <UserInteractiveTask url={task.tags.URL} />
        )}

      </Box>

    </>

  );
};

export default WorkflowTaskOverview;
