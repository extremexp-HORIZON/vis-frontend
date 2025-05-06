import { useState } from "react";
import type { IRun } from "../../../shared/models/experiment/run.model";
import { RootState, useAppSelector } from "../../../store/store";
import { Box, Button, ButtonGroup, Grid } from "@mui/material";
import PdpPlot from "../../Tasks/ModelAnalysisTask/plots/pdp-plot";
import AlePlot from "../../Tasks/ModelAnalysisTask/plots/ale-plot";

const HyperparameterImpact = () => {
    const { workflows } = useAppSelector(
      (state: RootState) => state.progressPage,
    ) 

    const [isMosaic, setIsMosaic] = useState(true)
    const query = {hyper_configs: workflows.data.reduce((acc: {}, workflow: IRun) => {
    //   const savedModelDataset = workflow.tasks?.flatMap(task => [
    //     ...(workflow.dataAssets?.filter(asset => 
    //       asset.task === task.name
    //     ) || []),
    //   ]).find(dataset => dataset.name === "saved_model");
    const savedModelDataset = "metadata/proxy_data_models/I2Cat_workflow12.pkl"
      
      const workflowSavedModelParameters = workflow.params?.reduce((ac, param) => ({
        ...ac,
        [param.name]: {
      values: param.value,
        },
      }), {})
      //TODO: This should be an option for the user
      const workflowSelectedMetric = workflow.metrics[0].value
      return {
        ...acc,
        [savedModelDataset || ""]: {hyperparameter: workflowSavedModelParameters, metric_value: workflowSelectedMetric},
      }
    }, {})}
    
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
                  height: "25px", // Ensure consistent height for the button group
                }}
              >
                <Button
                  variant={isMosaic ? "contained" : "outlined"}
                  color="primary"
                  onClick={() => setIsMosaic(true)}
                >
                  Mosaic
                </Button>
                <Button
                  variant={!isMosaic ? "contained" : "outlined"}
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
              <Box sx={{ minHeight:{md: 305, xl: 500} }}>
                <PdpPlot query={query} explanation_type="hyperparameterExplanation" />
              </Box>
            </Grid>
            <Grid item xs={isMosaic ? 6 : 12}>
              <Box sx={{ minHeight:{md: 305, xl: 500} }}>
                <AlePlot query={query} explanation_type="hyperparameterExplanation" />
              </Box>
            </Grid>
          </Grid>
        </Box>
      )
  
}

export default HyperparameterImpact