import { useState } from 'react';
import { Box, Grid } from '@mui/material';
import PdpPlot from '../../../Tasks/ModelAnalysisTask/plots/pdp-plot';
import AlePlot from '../../../Tasks/ModelAnalysisTask/plots/ale-plot';
import Contourplot from '../../../Tasks/ModelAnalysisTask/plots/2dpdp-plot';

const HyperparameterImpact = () => {
  const [isMosaic, setIsMosaic] = useState(true);

  return (
    <Box>
      {/* <Grid
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
      </Grid> */}

      <Grid
        container
        spacing={2}
      >
        <Grid item xs={isMosaic ? 6 : 12}>
          <PdpPlot explanation_type="hyperparameterExplanation" />
        </Grid>
        <Grid item xs={isMosaic ? 6 : 12}>
          <AlePlot explanation_type="hyperparameterExplanation" />
        </Grid>
        <Grid item xs={12}>
          <Contourplot explanation_type="hyperparameterExplanation" />
        </Grid>
      </Grid>
    </Box>
  );

};

export default HyperparameterImpact;
