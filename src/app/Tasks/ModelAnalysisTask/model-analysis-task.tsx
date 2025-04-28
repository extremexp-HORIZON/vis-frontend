import { Box, Button, ButtonGroup, Grid } from "@mui/material"
import PdpPlot from "./plots/pdp-plot"
import AlePlot from "./plots/ale-plot"
import { useState } from "react"

const ModelAnalysisTask = () => {
    //TODO: fetch from api
    const workflowDataset = "metadata/datasets/phising.csv"
    const workflowModels = ["metadata/proxy_data_models/I2Cat_workflow12.pkl"]
    const trainIndexMetric = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120]
    const testIndexMetric: number[] = [45, 46, 47]
    const targetColumnMetric = "label"
  
    const [isMosaic, setIsMosaic] = useState(true)

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
            <Box sx={{ minHeight: 400 }}>
              <PdpPlot 
                model={workflowModels} 
                data={workflowDataset} 
                train_index={trainIndexMetric} 
                test_index={testIndexMetric}
                target_column={targetColumnMetric}
              />
            </Box>
          </Grid>
          <Grid item xs={isMosaic ? 6 : 12}>
            <Box sx={{ minHeight: 400 }}>
              <AlePlot 
                model={workflowModels} 
                data={workflowDataset} 
                train_index={trainIndexMetric} 
                test_index={testIndexMetric}
                target_column={targetColumnMetric}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    )
}

export default ModelAnalysisTask