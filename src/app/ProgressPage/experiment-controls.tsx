import { Box, IconButton, Typography, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, Fade, useTheme, useMediaQuery, Tooltip, Stack, Divider, LinearProgress, alpha } from '@mui/material';
import ProgressPageBar from './progress-page-bar';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { RootState } from '../../store/store';
import { useAppSelector, useAppDispatch } from '../../store/store';
import Rating from '@mui/material/Rating';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useEffect, useMemo, useState } from 'react';
import { fetchUserEvaluation, setExperimentStatus, setProgressBarData, stateController } from '../../store/slices/progressPageSlice';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import PauseCircleRoundedIcon from '@mui/icons-material/PauseCircleRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import StaticDirectedGraph from './WorkflowTab/worfklow-flow-chart';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';

const formatDuration = (ms: number) => {
  if (!isFinite(ms) || ms < 0) return '—';
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
};

const ExperimentControls = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const workflowId = searchParams.get('workflowId');
  const { progressBar, workflows, experiment } = useAppSelector(
    (state: RootState) => state.progressPage
  );
  const { experimentId } = useParams();
  const dispatch = useAppDispatch();
  const workflow = workflows.data?.find(workflow => workflow.id === workflowId);
  const workflowStatus = workflow?.status;
  const completedTasks = workflow?.tasks?.filter(task => task.endTime).length ?? 0;
  const taskLength = workflow?.tasks?.length ?? 0;
  const taskProgress = taskLength > 0 ? (completedTasks / taskLength) * 100 : 0;
  const workflowRating = workflow?.metrics?.find(metric => metric.name === 'rating')?.value ?? 0;
  const [isPolling, setPolling] = useState(false);
  const [localRating, setLocalRating] = useState<number | null>(null);
  const { tab } = useAppSelector((state: RootState) => state.workflowPage);
  const [dialogOpen, setDialogOpen] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const isRunning = workflowStatus === 'RUNNING';
  const isPaused = experiment?.data?.status === 'paused';
  const isKilled = workflowId
    ? workflowStatus === 'KILLED' || workflowStatus === 'FAILED'
    : experiment?.data?.status === 'killed' || experiment?.data?.status === 'failed';
  const isComplete = progressBar.progress === 100;

  // Tick every second while a workflow is actively running so duration updates live.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!isRunning || workflow?.endTime) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isRunning, workflow?.endTime]);

  const duration = useMemo(() => {
    if (!workflow?.startTime) return null;
    const end = workflow.endTime ?? now;
    return formatDuration(end - workflow.startTime);
  }, [workflow?.startTime, workflow?.endTime, now]);

  const handleOpenDiagram = () => setDialogOpen(true);
  const handleCloseDiagram = () => setDialogOpen(false);

  const statusStyle = useMemo(() => {
    switch (workflowStatus) {
      case 'COMPLETED':
        return { color: theme.palette.success.main, label: 'COMPLETED', icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> };
      case 'FAILED':
        return { color: theme.palette.error.main, label: 'Failed', icon: <ErrorIcon sx={{ fontSize: 14 }} /> };
      case 'KILLED':
        return { color: theme.palette.error.main, label: 'Killed', icon: <ErrorIcon sx={{ fontSize: 14 }} /> };
      case 'RUNNING':
        return { color: theme.palette.primary.main, label: 'Running', icon: <AutorenewRoundedIcon sx={{ fontSize: 14, animation: 'ec-spin 2s linear infinite', '@keyframes ec-spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} /> };
      case 'PAUSED':
        return { color: theme.palette.warning.main, label: 'Paused', icon: <PauseCircleRoundedIcon sx={{ fontSize: 14 }} /> };
      case 'STOPPED':
        return { color: theme.palette.warning.main, label: 'Stopped', icon: <StopRoundedIcon sx={{ fontSize: 14 }} /> };
      case 'SCHEDULED':
        return { color: theme.palette.info.main, label: 'SCHEDULED', icon: <ScheduleRoundedIcon sx={{ fontSize: 14 }} /> };
      default:
        return { color: theme.palette.text.secondary, label: workflowStatus ?? 'Unknown', icon: null };
    }
  }, [workflowStatus, theme]);

  const ringColor = isKilled || workflowStatus === 'FAILED' || workflowStatus === 'KILLED'
    ? theme.palette.error.main
    : isComplete
      ? theme.palette.success.main
      : theme.palette.primary.main;

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

  const handlePausePlay = () => {
    if (isPaused) {
      dispatch(setExperimentStatus('resumed'));
      dispatch(stateController({ experimentId: experimentId || '', runId: null, action: 'resume' }));
    } else {
      dispatch(setExperimentStatus('paused'));
      dispatch(stateController({ experimentId: experimentId || '', runId: null, action: 'pause' }));
    }
  };

  const handleStop = () => {
    dispatch(setExperimentStatus('killed'));
    dispatch(stateController({ experimentId: experimentId || '', runId: null, action: 'kill' }));
  };

  useEffect(() => {
    if (workflows.data.length > 0) {
      const total = workflows.data.length;
      const completed = workflows.data.filter(w => w.status === 'COMPLETED').length;
      const running =
          workflows.data.filter(w => w.status === 'SCHEDULED').length +
          workflows.data.filter(w => w.status === 'RUNNING').length;
      const failed = workflows.data.filter(w => w.status === 'FAILED' || w.status === 'KILLED').length;
      const progress = Math.round(((completed + failed) / total) * 100);
      dispatch(setProgressBarData({ total, completed, running, failed, progress }));
    }
  }, [workflows]);

  const showActions = !isComplete && !isKilled;

  const StatusPill = (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        py: 0.25,
        borderRadius: '999px',
        bgcolor: alpha(statusStyle.color, 0.12),
        color: statusStyle.color,
        fontSize: '0.72rem',
        fontWeight: 600,
        letterSpacing: '0.3px',
        textTransform: 'uppercase',
        border: `1px solid ${alpha(statusStyle.color, 0.25)}`,
        lineHeight: 1,
      }}
    >
      {statusStyle.icon}
      {statusStyle.label}
    </Box>
  );

  const LiveDot = (
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        bgcolor: theme.palette.primary.main,
        boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0.7)}`,
        animation: 'ec-pulse 1.6s ease-out infinite',
        '@keyframes ec-pulse': {
          '0%':   { boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0.55)}` },
          '70%':  { boxShadow: `0 0 0 6px ${alpha(theme.palette.primary.main, 0)}` },
          '100%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0)}` },
        },
      }}
    />
  );

  const ActionButtons = (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
      <Tooltip title={isPaused ? 'Resume experiment' : 'Pause experiment'} arrow>
        <IconButton
          onClick={handlePausePlay}
          size="medium"
          sx={{
            color: isPaused ? theme.palette.success.main : theme.palette.primary.main,
            bgcolor: alpha(isPaused ? theme.palette.success.main : theme.palette.primary.main, 0.08),
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: alpha(isPaused ? theme.palette.success.main : theme.palette.primary.main, 0.18),
              transform: 'translateY(-1px)',
            },
          }}
        >
          {isPaused ? <PlayArrowIcon /> : <PauseIcon />}
        </IconButton>
      </Tooltip>
      <Tooltip title="Stop experiment" arrow>
        <IconButton
          onClick={handleStop}
          size="medium"
          sx={{
            color: theme.palette.error.main,
            bgcolor: alpha(theme.palette.error.main, 0.08),
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: alpha(theme.palette.error.main, 0.18),
              transform: 'translateY(-1px)',
            },
          }}
        >
          <StopIcon />
        </IconButton>
      </Tooltip>
    </Stack>
  );

  return (
    <Box
      sx={{
        height: '64px',
        boxSizing: 'border-box',
        px: 2,
        display: 'flex',
        alignItems: 'center',
        background: theme.palette.customSurface.cardHeader,
        borderBottom: `1px solid ${theme.palette.customGrey.main}`,
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: -1,
          height: 2,
          background: isKilled
            ? theme.palette.customGradient.killedGradient
            : theme.palette.customGradient.gradient,
          opacity: 0.85,
        },
      }}
    >
      <Box
        key={'progress-page-experiment-controls'}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          width: '100%',
          height: '100%',
        }}
      >
        {!workflowId ? (
          <>
            <Box className={'progress-page-bar'} sx={{ flex: 1, pr: 2 }}>
              <ProgressPageBar />
            </Box>
            {showActions && ActionButtons}
          </>
        ) : (
          <>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
              <Tooltip title="Back to monitoring" arrow>
                <IconButton
                  size="small"
                  onClick={() => navigate(`/${experimentId}/monitoring`)}
                  sx={{
                    color: theme.palette.text.secondary,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: theme.palette.primary.main,
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      transform: 'translateX(-2px)',
                    },
                  }}
                >
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, gap: 0.25 }}>
                {/* Top row: workflow id, live dot, status pill, view diagram */}
                <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                  <Typography variant="mono"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      color: theme.palette.text.primary,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: 280,
                      lineHeight: 1.2,
                    }}>
                    Workflow
                  </Typography>
                  <Typography
                    variant="mono"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      color: theme.palette.text.primary,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: 280,
                      lineHeight: 1.2,
                    }}
                    title={workflowId ?? ''}
                  >
                    {workflowId}
                  </Typography>

                  {isRunning && (
                    <Tooltip title="Run is live" arrow>
                      <Box sx={{ display: 'inline-flex' }}>{LiveDot}</Box>
                    </Tooltip>
                  )}

                  {StatusPill}

                  {(tab?.workflowConfiguration?.tasks?.length ?? 0) > 0 && (
                    <Tooltip title="View workflow diagram" arrow>
                      <Button
                        size="small"
                        startIcon={<AccountTreeIcon sx={{ fontSize: 16 }} />}
                        onClick={handleOpenDiagram}
                        color="primary"
                        variant="outlined"
                        sx={{
                          textTransform: 'none',
                          height: '24px',
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          px: 1.25,
                          borderColor: alpha(theme.palette.primary.main, 0.4),
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                          },
                        }}
                      >
                        Diagram
                      </Button>
                    </Tooltip>
                  )}
                </Stack>

                {/* Bottom row: tasks progress, duration, rating */}
                <Stack
                  direction="row"
                  spacing={1.25}
                  alignItems="center"
                  divider={<Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />}
                  sx={{ color: theme.palette.text.secondary }}
                >
                  {taskLength > 0 && (
                    <Tooltip title={`${completedTasks} of ${taskLength} tasks complete`} arrow>
                      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
                        <Typography variant="statLabel" sx={{ whiteSpace: 'nowrap' }}>
                          {completedTasks}/{taskLength} tasks
                        </Typography>
                        <Box sx={{ width: 56 }}>
                          <LinearProgress
                            variant="determinate"
                            value={taskProgress}
                            sx={{
                              height: 4,
                              borderRadius: 2,
                              bgcolor: theme.palette.customSurface.barTrack,
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 2,
                                background: theme.palette.customGradient.gradient,
                              },
                            }}
                          />
                        </Box>
                      </Stack>
                    </Tooltip>
                  )}

                  {duration && (
                    <Tooltip title={workflow?.endTime ? 'Total duration' : 'Elapsed time'} arrow>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <TimerOutlinedIcon sx={{ fontSize: 14 }} />
                        <Typography variant="statLabel">
                          {duration}
                        </Typography>
                      </Stack>
                    </Tooltip>
                  )}

                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
                      Rate
                    </Typography>
                    <Rating
                      name="workflow-rating"
                      size="small"
                      value={localRating !== null ? localRating : workflowRating}
                      disabled={isPolling}
                      onChange={(_, value) => {
                        if (value !== null) handleUserEvaluation(value);
                      }}
                      sx={{ fontSize: '1rem' }}
                    />
                  </Stack>
                </Stack>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Tooltip title={`Overall experiment progress: ${Math.round(progressBar.progress)}%`} arrow>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={44}
                    thickness={4}
                    sx={{ color: alpha(ringColor, 0.15) }}
                  />
                  <CircularProgress
                    variant="determinate"
                    value={progressBar.progress}
                    size={44}
                    thickness={4}
                    sx={{
                      color: ringColor,
                      position: 'absolute',
                      left: 0,
                      transition: 'color 0.3s ease',
                      '& .MuiCircularProgress-circle': {
                        strokeLinecap: 'round',
                      },
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.65rem',
                      color: ringColor,
                    }}
                  >
                    {`${Math.round(progressBar.progress)}%`}
                  </Box>
                </Box>
              </Tooltip>
              {showActions && ActionButtons}
            </Stack>

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
                  bgcolor: 'background.paper',
                  overflow: 'hidden',
                  boxShadow: theme => theme.customShadows.popover,
                },
              }}
            >
              <DialogTitle
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: theme => theme.palette.customSurface.cardHeader,
                  borderBottom: theme => `1px solid ${theme.palette.divider}`,
                  px: 3,
                  py: 1.5,
                }}
              >
                <Typography
                  variant="h6"
                  component="div"
                  sx={{ fontWeight: 600, color: 'text.primary', letterSpacing: '0.3px' }}
                >
                  Workflow Diagram
                </Typography>
                <IconButton edge="end" color="inherit" onClick={handleCloseDiagram} aria-label="close">
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
                    onClose={handleCloseDiagram}
                  />
                )}
              </DialogContent>
              <DialogActions
                sx={{
                  p: 2,
                  borderTop: theme => `1px solid ${theme.palette.divider}`,
                  background: theme => theme.palette.customSurface.footer,
                }}
              >
                <Button onClick={handleCloseDiagram} color="primary" variant="contained" size="small">
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
