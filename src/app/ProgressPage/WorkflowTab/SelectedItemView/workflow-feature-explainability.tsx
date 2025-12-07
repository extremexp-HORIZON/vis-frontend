import { Box, Grid } from '@mui/material';
import PdpPlot from '../../../Tasks/ModelAnalysisTask/plots/pdp-plot';
import AlePlot from '../../../Tasks/ModelAnalysisTask/plots/ale-plot';
import { useState } from 'react';

import Contourplot from '../../../Tasks/ModelAnalysisTask/plots/2dpdp-plot';
import FeatureImportancePlot from '../../../Tasks/ModelAnalysisTask/plots/feature-importance-plot';
import AttributionHeatmaps from '../../../Tasks/ModelAnalysisTask/plots/attribution-heatmap';
import ShapPlot from '../../../Tasks/ModelAnalysisTask/plots/shap-plot';
import type { RootState } from '../../../../store/store';
import { useAppSelector } from '../../../../store/store';
import { IDataAsset } from '../../../../shared/models/experiment/data-asset.model';

const FeatureExplainability = () => {
  const { tab } = useAppSelector((state: RootState) => state.workflowPage);

  // Check if any data asset has name "model.pt"
  const hasModelPt = tab?.workflowConfiguration.dataAssets?.some(
    asset => asset.name === 'model.pt'
  );

  const isSpecialExperiment = hasModelPt || tab?.workflowId === 'KvJ97JkBYAWZyMn0wGW2';
  const [isMosaic, setIsMosaic] = useState(true);

  return (
    <Box>
      <Grid container spacing={2}>

        {isSpecialExperiment ? (
          <>
            <Grid item xs={12}>
              <AttributionHeatmaps />
            </Grid>
            <Grid item xs={12}>
              <FeatureImportancePlot max_height={250}/>
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
