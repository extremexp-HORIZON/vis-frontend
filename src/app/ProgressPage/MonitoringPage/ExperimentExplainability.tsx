import { Box, Grid } from '@mui/material';
import FeatureImportancePlot from '../../Tasks/ModelAnalysisTask/plots/feature-importance-plot';
import type { RootState } from '../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { useEffect } from 'react';
import { initTab, resetWorkflowTab } from '../../../store/slices/workflowPageSlice';
import PdpPlot from '../../Tasks/ModelAnalysisTask/plots/pdp-plot';
import AlePlot from '../../Tasks/ModelAnalysisTask/plots/ale-plot';
import Contourplot from '../../Tasks/ModelAnalysisTask/plots/2dpdp-plot';
import Loader from '../../../shared/components/loader';

const ExperimentExplainability = () => {
  const { workflows } = useAppSelector(
    (state: RootState) => state.progressPage,
  );
  const { isTabInitialized, tab } = useAppSelector((state: RootState) => state.workflowPage);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if(!isTabInitialized || (tab && tab.workflowId !== 'none')) dispatch(initTab({ tab: 'none', workflows }));

    return () => {
      dispatch(resetWorkflowTab());
    };

  }, []);

  if(!isTabInitialized || (tab && tab.workflowId !== 'none')) return <Loader />;

  return (
    <Box>
      <Grid
        container
        spacing={2}
      >
        <Grid item xs={12}>
          <FeatureImportancePlot explanation_type="experimentExplanation" />
        </Grid>
        <Grid item xs={6}>
          <PdpPlot explanation_type="experimentExplanation" />
        </Grid>
        <Grid item xs={6}>
          <AlePlot explanation_type="experimentExplanation" />
        </Grid>
        <Grid item xs={12}>
          <Contourplot explanation_type="experimentExplanation" />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ExperimentExplainability;
