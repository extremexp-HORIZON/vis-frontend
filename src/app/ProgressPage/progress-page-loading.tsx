import Grid from '@mui/material/Grid';
import type { RootState } from '../../store/store';
import { useAppDispatch, useAppSelector } from '../../store/store';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import { useEffect, useState } from 'react';
import {
  fetchExperiment,
  fetchExperimentWorkflows,
  setIntialization,
} from '../../store/slices/progressPageSlice';
import '../../index.css';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const ProgressPageLoading = () => {
  const { workflows, experiment } = useAppSelector(
    (state: RootState) => state.progressPage,
  );
  const dispatch = useAppDispatch();
  const [progress, setProgress] = useState(0);
  const [searchParams] = useSearchParams();
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Get experimentId from either path params or query params
  const experimentId = params.experimentId || searchParams.get('experimentId');

  useEffect(() => {
    if (experimentId && experimentId !== experiment.data?.id) {
      dispatch(fetchExperiment(experimentId));
    }
  }, []);

  useEffect(() => {
    if (!experiment.loading && experiment.data) {
      dispatch(fetchExperimentWorkflows(experimentId ?? ''));
    }
  }, [experiment]);

  useEffect(() => {
    if (!experiment.loading && experiment.data) {
      setProgress(50);
    }
    if (!workflows.loading && workflows.data.length > 0) {
      setProgress(100);
    }
    if (
      !experiment.loading &&
      experiment.data &&
      workflows.data.length > 0 &&
      !workflows.loading
    ) {
      setTimeout(() => {
        dispatch(setIntialization(true));
        const pathParts = location.pathname.split('/').filter(Boolean);

        if (pathParts.length === 1) {
          navigate(`/${experimentId}/monitoring`, { replace: true });
        }
        if (
          location.pathname.includes('workflow') &&
          !searchParams.has('workflowId')
        )
          navigate(`/${experimentId}/monitoring`, { replace: true });
      }, 600);
    }
  }, [workflows, experiment]);

  return (
    <>
      <Grid
        id={'error-page'}
        sx={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Grid sx={{ display: 'flex', rowGap: 2, flexDirection: 'column' }}>
          <img
            src="/images/extremexp-logo.png"
            height={130}
            style={{ objectFit: 'contain' }}
            alt="extremexp logo"
          />
          <Typography variant="h4">Initializing Progress Page</Typography>
          {!experiment.data && experiment.loading && (
            <Typography variant="h6">Fetching Experiment Data...</Typography>
          )}
          {workflows.data.length === 0 &&
            workflows.loading &&
            experiment.data && (
            <Typography variant="h6">Fetching Workflows...</Typography>
          )}
          {((workflows.error && !workflows.loading) ||
            (experiment.error && !workflows.loading)) && (
            <Typography variant="h6" color="error">
              {experiment.error || experiment.error}
            </Typography>
          )}
          {workflows.data.length > 0 &&
            !workflows.loading &&
            experiment.data &&
            !experiment.loading && <Typography variant="h6">Done!</Typography>}
          <LinearProgress
            variant="determinate"
            value={progress}
            color={
              workflows.data.length > 0 && !workflows.loading
                ? 'success'
                : (workflows.error && !workflows.loading) ||
                    (experiment.error && !workflows.loading)
                  ? 'error'
                  : 'primary'
            }
          />
        </Grid>
      </Grid>
    </>
  );
};

export default ProgressPageLoading;
