import { useState } from 'react';
import { Box, Button, ButtonGroup, Grid } from '@mui/material';
import PdpPlot from '../../Tasks/ModelAnalysisTask/plots/pdp-plot';
import AlePlot from '../../Tasks/ModelAnalysisTask/plots/ale-plot';

const HyperparameterImpact = () => {
  const [isMosaic, setIsMosaic] = useState(true);

  return (
    <Box>
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
      >
        <Grid item xs={isMosaic ? 6 : 12}>
          <Box sx={{ minHeight: { md: 305, xl: 500 } }}>
            <PdpPlot explanation_type="hyperparameterExplanation" />
          </Box>
        </Grid>
        <Grid item xs={isMosaic ? 6 : 12}>
          <Box sx={{ minHeight: { md: 305, xl: 500 } }}>
            <AlePlot explanation_type="hyperparameterExplanation" />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );

};

export default HyperparameterImpact;
