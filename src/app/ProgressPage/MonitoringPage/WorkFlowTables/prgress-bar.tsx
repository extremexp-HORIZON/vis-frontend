import LinearProgress from '@mui/material/LinearProgress';
import { useAppSelector } from '../../../../store/store';
import { Box, Typography } from '@mui/material';
import type { RootState } from '../../../../store/store';

export default function ProgressBar({ workflowStatus, workflowId } : {workflowStatus : string, workflowId : string}) {
  const { workflows } = useAppSelector(
    (state: RootState) => state.progressPage,
  );
  let progressValue;
  const workflow = workflows.data.find(workflow => workflow.id === workflowId);

  if (workflowStatus === 'COMPLETED' || workflowStatus === 'FAILED') {
    progressValue = 100;
  } else {
    if (workflow?.tasks == null) {
      progressValue = 0;
    } else {
      const completedTasks = workflow?.tasks.filter(task => task.endTime).length;

      progressValue = (completedTasks / workflow?.tasks.length) * 100;
    }
  }
  const color = workflowStatus === 'COMPLETED' ? 'success' : workflowStatus === 'RUNNING' ? 'primary' : workflowStatus === 'PENDING_INPUT' ? 'warning' : 'error';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', flexDirection: 'column', height: '100%' }}>
      <Typography variant="body2">{workflowStatus?.toLowerCase()}</Typography>
      <Box sx={{ width: '100%' }}>
        <LinearProgress sx={{ borderRadius: 4 }} color={color} value={progressValue} variant="determinate"/>
      </Box>
    </Box>
  );
}
