import { Box, Grid } from '@mui/material';
import PdpPlot from '../../../Tasks/ModelAnalysisTask/plots/pdp-plot';
import AlePlot from '../../../Tasks/ModelAnalysisTask/plots/ale-plot';
import { useState } from 'react';

import Contourplot from '../../../Tasks/ModelAnalysisTask/plots/2dpdp-plot';
import FeatureImportancePlot from '../../../Tasks/ModelAnalysisTask/plots/feature-importance-plot';
import AttributionHeatmaps from '../../../Tasks/ModelAnalysisTask/plots/attribution-heatmap';
import ShapPlot from '../../../Tasks/ModelAnalysisTask/plots/shap-plot';
import { RootState, useAppSelector } from '../../../../store/store';

const FeatureExplainability = () => {
    const { tab } = useAppSelector((state: RootState) => state.workflowPage);
    console.log("Current tab:", tab.workflowId); // Debugging line to check the value of tab

  const isSpecialExperiment = tab.workflowId === "KvJ97JkBYAWZyMn0wGW2";
  console.log("isSpecialExperiment:", isSpecialExperiment);

  const [isMosaic, setIsMosaic] = useState(true);

 return (
    <Box>
      <Grid container spacing={2}>

        {isSpecialExperiment ? (
          <>
           <Grid item xs={12}>
            <FeatureImportancePlot />
          </Grid>
          <Grid item xs={12}>
            <AttributionHeatmaps />
          </Grid>
          </>
        ) : (
          <> <Grid item xs={6}>
          <FeatureImportancePlot />
        </Grid>
         <Grid item xs={6}>
          <ShapPlot />
        </Grid>
            <Grid item xs={isMosaic ? 6 : 12}>
              <PdpPlot explanation_type="featureExplanation" />
            </Grid>
            <Grid item xs={isMosaic ? 6 : 12}>
              <AlePlot explanation_type="featureExplanation"/>
            </Grid>
            <Grid item xs={12}>
              <Contourplot explanation_type="featureExplanation"/>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default FeatureExplainability;