import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import { useEffect } from "react"
import { RootState, useAppDispatch, useAppSelector } from "../../../store/store"
import Typography from "@mui/material/Typography"
import _ from "lodash"
import { initTab } from "../../../store/slices/workflowPageSlice"
import AlePlot from "../../Tasks/ModelAnalysisTask/plots/ale-plot"
import PdpPlot from "../../Tasks/ModelAnalysisTask/plots/pdp-plot"

const DummyExplains = () => {
  const { workflows } = useAppSelector(state => state.progressPage)
  const { tab } = useAppSelector((state: RootState) => state.workflowPage)
  //TODO: fetch from api
  const workflowDataset = "metadata/datasets/phising.csv"
  const workflowModels = ["metadata/proxy_data_models/I2Cat_workflow12.pkl"]
  const trainIndexMetric = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120]
  const testIndexMetric: number[] = [45, 46, 47]
  const targetColumnMetric = "label"


  const dispatch = useAppDispatch()
    //TODO: remove when no longer needed
    useEffect(() => {
      dispatch(initTab({ tab: workflows.data[0].id, workflows }))
    }, [])

  return (
    <>
      <Grid
        sx={{
          flexDirection: "column",
          display: "flex",
          justifyContent: "center",
          textAlign: "center",
          overflow: "auto"
        }}
      >
          <Box
            sx={{
              px: 5,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              rowGap: 4,
              my: "3rem",
            }}
          >
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "start",
                columnGap: 1,
              }}
            >
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, fontSize: "1.5rem" }}
              >
                Expainability:
              </Typography>
              <Typography variant="body1">
                Feature based explanations for this variant
              </Typography>
            </Box>
            
            {tab && 
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
              <PdpPlot 
                  model={workflowModels} 
                  data={workflowDataset} 
                  train_index={trainIndexMetric} 
                  test_index={testIndexMetric}
                  target_column={targetColumnMetric}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <AlePlot 
                  model={workflowModels} 
                  data={workflowDataset} 
                  train_index={trainIndexMetric} 
                  test_index={testIndexMetric}
                  target_column={targetColumnMetric}
                />
              </Grid>
            </Grid>
            }
          </Box>
      </Grid>
    </>
  )
}
export default DummyExplains
