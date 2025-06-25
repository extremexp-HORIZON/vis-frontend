import type React from 'react';
import { useState } from 'react';
import type { RootState } from '../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import {
  Grid,
  Container,
  ButtonGroup,
  Button,
  Chip,
  Box
} from '@mui/material';
import InfoMessage from '../../../shared/components/InfoMessage';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { setSelectedModelComparisonChart } from '../../../store/slices/monitorPageSlice';
import WindowRoundedIcon from '@mui/icons-material/WindowRounded';
import RoundedCornerRoundedIcon from '@mui/icons-material/RoundedCornerRounded';
import ComparisonModelConfusion from './ModelComparison/comparison-model-confusion';
import BlurLinearIcon from '@mui/icons-material/BlurLinear';
import ComparisonModelInstance from './ModelComparison/comparison-model-instance';
import ComparisonModelRoc from './ModelComparison/comparison-model-roc';

const ComparisonModelsCharts: React.FC = () => {
  const dispatch = useAppDispatch();
  const { workflowsTable, selectedModelComparisonChart } = useAppSelector(
    (state: RootState) => state.monitorPage,
  );
  const [isMosaic, setIsMosaic] = useState(true);

  const selectedWorkflowIds = workflowsTable.selectedWorkflows;

  const options = [
    { label: 'confusionMatrix', name: 'Confusion Matrix', icon: <WindowRoundedIcon /> },
    { label: 'rocCurve', name: 'Roc Curve', icon: <RoundedCornerRoundedIcon /> },
    { label: 'instanceView', name: 'Instance View', icon: <BlurLinearIcon /> }
  ];

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
    <Container maxWidth={false} sx={{ padding: 2 }}>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ marginBottom: 2 }} gap={1}>

        {/* Left-aligned Button Group */}
        <Grid item>
          <Box
            display="flex"
            flexWrap="wrap"
            gap={1}
          >
            {options.map(option => (
              <Chip
                key={option.label}
                label={option.name}
                icon={option.icon}
                clickable
                color={selectedModelComparisonChart === option.label ? 'primary' : 'default'}
                variant={selectedModelComparisonChart === option.label ? 'filled' : 'outlined'}
                onClick={() => dispatch(setSelectedModelComparisonChart(option.label))}
              />
            ))}
          </Box>
        </Grid>
        <Grid item>
          <ButtonGroup variant="contained" aria-label="view mode" sx={{ height: '25px' }}>
            <Button
              variant={isMosaic ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => setIsMosaic(true)}
            >
            Mosaic
            </Button>
            <Button
              variant={!isMosaic ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => setIsMosaic(false)}
            >
            Stacked
            </Button>
          </ButtonGroup>
        </Grid>

      </Grid>

      <Grid container spacing={2} sx={{ width: '100%', margin: '0 auto', flexWrap: 'wrap' }}>
        {selectedModelComparisonChart === 'confusionMatrix' && <ComparisonModelConfusion isMosaic={isMosaic} />}
      </Grid>
      <Grid container spacing={2} sx={{ width: '100%', margin: '0 auto', flexWrap: 'wrap' }}>
        {selectedModelComparisonChart === 'rocCurve' && <ComparisonModelRoc isMosaic={isMosaic} />}
      </Grid>
      <Grid container spacing={2} sx={{ width: '100%', margin: '0 auto', flexWrap: 'wrap' }}>
        {selectedModelComparisonChart === 'instanceView' && <ComparisonModelInstance isMosaic={isMosaic} />}
      </Grid>
    </Container>
  );
};

export default ComparisonModelsCharts;
