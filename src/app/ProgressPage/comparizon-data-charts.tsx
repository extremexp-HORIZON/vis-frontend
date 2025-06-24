import type React from 'react';
import { useState } from 'react';
import type { RootState } from '../../store/store';
import { useAppSelector } from '../../store/store';
import {
  Grid,
  Container,
  ButtonGroup,
  Button,
  Typography,
} from '@mui/material';
import ResponsiveCardVegaLite from '../../shared/components/responsive-card-vegalite';
import InfoMessage from '../../shared/components/InfoMessage';
import AssessmentIcon from '@mui/icons-material/Assessment';

interface BaseMetric {
  id: string
  name: string
  value: number
  [key: string]: string | number | boolean | null | undefined
}

const ComparisonDataCharts: React.FC = () => {
  const { workflowsTable, selectedWorkflowsMetrics } = useAppSelector(
    (state: RootState) => state.monitorPage,
  );
  const [isMosaic, setIsMosaic] = useState(true);
  const { hoveredWorkflowId } = workflowsTable;



  if (workflowsTable.selectedWorkflows.length === 0) {
    return (
      <InfoMessage
        message="Select Workflows to display comparisons over data."
        type="info"
        icon={<AssessmentIcon sx={{ fontSize: 40, color: 'info.main' }} />}
        fullHeight
      />
    );
  }

  return (
    <Container maxWidth={false} sx={{ padding: 2 }} >
      <Grid
        container
        justifyContent="flex-end" // Align to the right
        alignItems="center"
        sx={{ marginBottom: 2 }}
      >
        <ButtonGroup
          variant="contained"
          aria-label="view mode"
          sx={{
            height: '25px', // Ensure consistent height for the button group
          }}
        >
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
      <Grid
        container
        spacing={2}
        sx={{ width: '100%', margin: '0 auto', flexWrap: 'wrap' }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Comparisons
        </Typography>
       
      </Grid>
    </Container>
  );
};

export default ComparisonDataCharts;
