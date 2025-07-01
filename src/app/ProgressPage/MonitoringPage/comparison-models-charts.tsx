import type React from 'react';
import type { RootState } from '../../../store/store';
import { useAppSelector } from '../../../store/store';
import {
  Grid,
  Container,
} from '@mui/material';
import InfoMessage from '../../../shared/components/InfoMessage';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ComparisonModelConfusion from './ModelComparison/comparison-model-confusion';
import ComparisonModelInstance from './ModelComparison/comparison-model-instance';
import ComparisonModelRoc from './ModelComparison/comparison-model-roc';

const ComparisonModelsCharts: React.FC = () => {

  const { workflowsTable, selectedModelComparisonChart, showMisclassifiedOnly } = useAppSelector(
    (state: RootState) => state.monitorPage,
  );
  const isMosaic = useAppSelector(
    (state: RootState) => state.monitorPage.isMosaic,
  );
  const selectedWorkflowIds = workflowsTable.selectedWorkflows;

  if (selectedWorkflowIds.length === 0) {
    return (
      <InfoMessage
        message="Select Workflows to display comparisons over models."
        type="info"
        icon={<AssessmentIcon sx={{ fontSize: 40, color: 'info.main' }} />}
        fullHeight
      />
    );
  }

  return (
    <Container maxWidth={false} sx={{ p: 2 }}>
      <Grid container spacing={2} sx={{ width: '100%', margin: '0 auto', flexWrap: 'wrap' }}>
        {selectedModelComparisonChart === 'confusionMatrix' && <ComparisonModelConfusion isMosaic={isMosaic} />}
      </Grid>
      <Grid container spacing={2} sx={{ width: '100%', margin: '0 auto', flexWrap: 'wrap' }}>
        {selectedModelComparisonChart === 'rocCurve' && <ComparisonModelRoc isMosaic={isMosaic} />}
      </Grid>
      <Grid container spacing={2} sx={{ width: '100%', margin: '0 auto', flexWrap: 'wrap' }}>
        {selectedModelComparisonChart === 'instanceView' && <ComparisonModelInstance
          isMosaic={isMosaic}
          showMisclassifiedOnly={showMisclassifiedOnly}
        />}
      </Grid>
    </Container>
  );
};

export default ComparisonModelsCharts;
