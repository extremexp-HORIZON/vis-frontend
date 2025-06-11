import { Box, IconButton, Typography, CircularProgress, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Button, Fade, useTheme, useMediaQuery, Tooltip } from '@mui/material';
import ProgressPageBar from './progress-page-bar';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { RootState } from '../../store/store';
import { useAppSelector, useAppDispatch } from '../../store/store';
import Rating from '@mui/material/Rating';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useEffect, useState } from 'react';
import { fetchUserEvaluation, setProgressBarData, stateController } from '../../store/slices/progressPageSlice';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import PauseCircleRoundedIcon from '@mui/icons-material/PauseCircleRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import StaticDirectedGraph from './WorkflowTab/worfklow-flow-chart';
import CloseIcon from '@mui/icons-material/Close';

const ExperimentControls = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const workflowId = searchParams.get('workflowId');
  const { progressBar, workflows } = useAppSelector(
    (state: RootState) => state.progressPage
  );
  const { experimentId } = useParams();
  const dispatch = useAppDispatch();
  const workflow = workflows.data.find(workflow => workflow.id === workflowId);
  const workflowStatus = workflow?.status;
  const completedTasks = workflow?.tasks?.filter(task => task.endTime).length;
  const taskLength = workflow?.tasks?.length;
  const workflowRating = workflow?.metrics?.find(metric => metric.name === 'rating')?.value ?? 0;
  const [isPolling, setPolling] = useState(false);
  const [localRating, setLocalRating] = useState<number | null>(null);
  const { tab } = useAppSelector((state: RootState) => state.workflowPage);
  const [dialogOpen, setDialogOpen] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleOpenDiagram = () => {
    setDialogOpen(true);
  };

  const handleCloseDiagram = () => {
    setDialogOpen(false);
  };

  let workflowIcon;

  switch (workflowStatus) {
    case 'COMPLETED':
      workflowIcon = <CheckCircleIcon fontSize="small" color="success" />;
      break;
    case 'FAILED':
    case 'KILLED':
      workflowIcon = <ErrorIcon fontSize="small" color="error" />;
      break;
    case 'RUNNING':
      workflowIcon = <AutorenewRoundedIcon fontSize="small" color="primary" />;
      break;
    case 'STOPPED':
      workflowIcon = <StopRoundedIcon fontSize="small" color="primary" />;
      break;
    case 'PAUSED':
      workflowIcon = <PauseCircleRoundedIcon fontSize="small" color="primary" />;
      break;
    default:
      break;
  }

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

  useEffect(() => {
    if (workflows.data.length > 0) {
      const total = workflows.data.length;
      const completed = workflows.data.filter(
        workflow => workflow.status === 'COMPLETED',
      ).length;
      const running =
          workflows.data.filter(
            workflow => workflow.status === 'SCHEDULED',
          ).length +
          workflows.data.filter(workflow => workflow.status === 'RUNNING')
            .length;
      const failed = workflows.data.filter(
        workflow => workflow.status === 'FAILED',
      ).length;
      const progress = Math.round(((completed + failed) / total) * 100);

      dispatch(setProgressBarData({ total, completed, running, failed, progress }));

    }
  }, [workflows]);

  const taskInfo = taskLength && (
    <Typography variant="body2">
        Completed Tasks: {completedTasks}/{taskLength}
    </Typography>
  );

  return (
    <Box
      sx={{
        borderColor: theme => theme.palette.customGrey.main,
        borderBottomWidth: 2,
        borderBottomStyle: 'solid',
        height: '64px', // Fixed height to match left menu header
        boxSizing: 'border-box',
        padding: 1,
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Box
        key={'progress-page-experiment-controls'}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          width: '100%',
          height: '100%'
        }}
      >
        {!workflowId ? (
          <>
            <Box className={'progress-page-bar'} sx={{ flex: 1, pr: 2 }}>
              <ProgressPageBar />
            </Box>
            { progressBar.progress !== 100 && (
              <Box className={'progress-page-actions'} >
                <IconButton onClick={() => dispatch(stateController({ experimentId: experimentId || '', runId: workflowId || '', action: 'pause' }))} color="primary">
                  <PauseIcon fontSize="large" />
                </IconButton>
                <IconButton onClick={() => dispatch(stateController({ experimentId: experimentId || '', runId: workflowId || '', action: 'stop' }))} color="primary">
                  <StopIcon fontSize="large" />
                </IconButton>
              </Box>
            )}
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 4 }}>
              <ArrowBackIcon
                sx={{ fontSize: 24, cursor: 'pointer', color: 'grey' }}
                onClick={() => navigate(`/${experimentId}/monitoring`)}
              />

              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                  <Chip
                    label={`Workflow: ${workflowId}`}
                    color="primary"
                    variant="outlined"
                    sx={{
                      border: 'none',
                      fontWeight: '600',
                      '& .MuiChip-label': {
                        fontSize: '1rem',
                        p: 0,
                      }
                    }}
                  />

                  {/* Add workflow diagram button after workflow name */}
                  {(tab?.workflowConfiguration?.tasks?.length ?? 0) > 0 && (
                    <Tooltip title="View workflow diagram">
                      <Button
                        size="small"
                        startIcon={<AccountTreeIcon />}
                        onClick={handleOpenDiagram}
                        color="primary"
                        variant="outlined"
                        sx={{
                          ml: 1,
                          textTransform: 'none',
                          height: '28px',
                          borderRadius: '14px',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}
                      >
                          View Diagram
                      </Button>
                    </Tooltip>
                  )}

                  <Typography variant="h5" sx={{ fontWeight: 600, ml: 1 }}>-</Typography>
                  <Rating
                    name="workflow-rating"
                    size="large"
                    value={ localRating !== null ? localRating : workflowRating}
                    disabled={isPolling}
                    onChange={(_, value) => {
                      if (value !== null) handleUserEvaluation(value);
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">Status: {workflowStatus?.toLowerCase()}</Typography>
                  {workflowIcon}
                  {taskInfo}
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress
                  variant="determinate"
                  value={progressBar.progress}
                  size={50}
                  thickness={5}
                  sx={{ color: (theme) => theme.palette.primary.main }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.6rem',
                    width: '100%',
                    height: '100%',
                  }}
                >
                  {`${Math.round(progressBar.progress)}%`}
                </Box>
              </Box>
              {progressBar.progress !== 100 && (
                <>
                  <IconButton onClick={() => dispatch(stateController({ experimentId: experimentId || '', runId: workflowId || '', action: 'pause' }))} color="primary">
                    <PauseIcon fontSize="large" />
                  </IconButton>
                  <IconButton onClick={() => dispatch(stateController({ experimentId: experimentId || '', runId: workflowId || '', action: 'stop' }))} color="primary">
                    <StopIcon fontSize="large" />
                  </IconButton>
                </>
              )}
            </Box>

            {/* Non-fullscreen Dialog for Workflow Diagram */}
            <Dialog
              fullScreen={fullScreen}
              maxWidth="xl"
              open={dialogOpen}
              onClose={handleCloseDiagram}
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 400 }}
              PaperProps={{
                sx: {
                  borderRadius: fullScreen ? 0 : '12px',
                  width: fullScreen ? '100%' : '90vw',
                  height: fullScreen ? '100%' : '90vh',
                  maxWidth: 'unset',
                  bgcolor: '#ffffff',
                  overflow: 'hidden',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                }
              }}
            >
              <DialogTitle
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'linear-gradient(to right, #f8f9fa, #edf2f7)',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                  px: 3,
                  py: 1.5,
                }}
              >
                <Typography
                  variant="h6"
                  component="div"
                  sx={{
                    fontWeight: 600,
                    color: '#2a3f5f',
                    letterSpacing: '0.3px',
                  }}
                >
                    Workflow Diagram
                </Typography>
                <IconButton
                  edge="end"
                  color="inherit"
                  onClick={handleCloseDiagram}
                  aria-label="close"
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent
                dividers
                sx={{
                  p: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  overflow: 'auto',
                }}
              >
                {tab?.workflowSvg?.data && (
                  <StaticDirectedGraph
                    workflowSvg={tab.workflowSvg.data}
                    params={tab.workflowConfiguration.params}
                  />
                )}
              </DialogContent>
              <DialogActions
                sx={{
                  p: 2,
                  borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                  background: '#f8f9fa',
                }}
              >
                <Button
                  onClick={handleCloseDiagram}
                  color="primary"
                  variant="contained"
                  size="small"
                >
                    Close
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Box>
    </Box>
  );
};

export default ExperimentControls;
