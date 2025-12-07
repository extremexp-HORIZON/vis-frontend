import { Box, Typography } from '@mui/material';
import { CheckCircle as CheckCircleIcon, WarningAmberRounded as WarningAmberRoundedIcon, InfoOutlined as InfoOutlinedIcon } from '@mui/icons-material';
import type { RootState } from '../../../../store/store';
import { useAppSelector } from '../../../../store/store';
import { DetailsCard, DetailsCardItem } from '../../../../shared/components/details-card';
import UserInteractiveTask from '../../../../deprecated/UserInteractiveTask/user-interactive-task';
import type { IRun } from '../../../../shared/models/experiment/run.model';

type ParamStats =
  | { type: 'numeric'; min: number; max: number }
  | { type: 'categorical'; values: string[] };

const getParamStats = (
  workflows: IRun[],
  paramName: string,
  taskId?: string,
): ParamStats | null => {
  const allValues: string[] = [];

  workflows.forEach(run => {
    run.params
      .filter(p => p.name === paramName && (!taskId || p.task === taskId))
      .forEach(p => allValues.push(p.value));
  });

  if (allValues.length === 0) return null;

  const meaningfulValues = allValues.filter(v =>
    v !== null &&
    v !== undefined &&
    v.trim() !== ''
  );

  if (meaningfulValues.length === 0) {
    return {
      type: 'categorical',
      values: [],
    };
  }

  const numericValues: number[] = [];

  for (const v of meaningfulValues) {
    const n = Number(v);

    if (!Number.isFinite(n)) {
      return {
        type: 'categorical',
        values: Array.from(new Set(meaningfulValues)),
      };
    }
    numericValues.push(n);
  }

  return {
    type: 'numeric',
    min: Math.min(...numericValues),
    max: Math.max(...numericValues),
  };
};

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
  const { workflows } = useAppSelector(
    (state: RootState) => state.progressPage
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
            parameters.map(param => {
              const stats = getParamStats(
                workflows?.data,
                param.name,
              );

              let extraInfo: React.ReactNode = null;

              if (stats?.type === 'numeric') {
                extraInfo = (
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{ ml: 1, color: 'text.secondary' }}
                  >
                    (range: {stats.min} – {stats.max})
                  </Typography>
                );
              } else if (stats?.type === 'categorical') {
                const displayValues = stats.values.slice(0, 5);
                const moreCount = stats.values.length - displayValues.length;

                extraInfo = (
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{ ml: 1, color: 'text.secondary' }}
                  >
                    (values: {displayValues.join(', ')}
                    {moreCount > 0 && `, +${moreCount} more`})
                  </Typography>
                );
              }

              return (
                <DetailsCardItem
                  key={`param-${param.name}`}
                  label={param.name}
                  value={
                    <>
                      {param.value}
                      {extraInfo}
                    </>
                  }
                />
              );
            })
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
