import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import { useEffect, useState } from "react"
import { RootState, useAppDispatch, useAppSelector } from "../../../store/store"
import grey from "@mui/material/colors/grey"
import Typography from "@mui/material/Typography"
import _ from "lodash"
import {
  fetchAffected,
  fetchModelAnalysisExplainabilityPlot,
} from "../../../shared/models/tasks/model-analysis.model"
import {
  explainabilityQueryDefault,
} from "../../../shared/models/tasks/explainability.model"
import LinePlot from "../../Tasks/SharedItems/Plots/line-plot"
import { initTab } from "../../../store/slices/workflowPageSlice"

const DummyExplains = () => {
  const { workflows } = useAppSelector(state => state.progressPage)
  const { tab, isTabInitialized } = useAppSelector((state: RootState) => state.workflowPage)
  const [plotRequestMetadata, setPlotRequestMetadata] = useState<{
    model: string[]
    data: string
    train_index: any[]
    test_index: any[]
    target_column: string
  }>({ model: [], data: "", train_index: [], test_index: [], target_column: "" })

  const dispatch = useAppDispatch()

    useEffect(() => {
      dispatch(initTab({ tab: workflows.data[0].id, workflows }))
    }, [])

  useEffect(() => {
    const fetchData = async () => {
        if (tab) {
        const workflowContent = workflows.data.find(
          w => w.id === tab.workflowId,
        )
        const workflowDataset = "metadata/datasets/phising.csv"
        const workflowModels = "metadata/proxy_data_models/I2Cat_workflow12.pkl"
        const trainIndexMetric = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120]
        const testIndexMetric: number[] = [45, 46, 47]
        const targetColumnMetric = "label"

        setPlotRequestMetadata({
          model: [workflowModels],
          data: workflowDataset,
          train_index: trainIndexMetric,
          test_index: testIndexMetric,
          target_column: targetColumnMetric,
        })
          await dispatch(
            fetchModelAnalysisExplainabilityPlot({
              query: {
                ...explainabilityQueryDefault,
                explanation_type: "featureExplanation",
                explanation_method: "pdp",
                model: [workflowModels],
                data: workflowDataset,
                train_index: trainIndexMetric,
                test_index: testIndexMetric,
                target_column: targetColumnMetric,
              },
              metadata: {
                workflowId: tab.workflowId,
                queryCase: "pdp",
              },
            }),
          )
          await dispatch(
            fetchModelAnalysisExplainabilityPlot({
              query: {
                ...explainabilityQueryDefault,
                explanation_type: "featureExplanation",
                explanation_method: "ale",
                model: [workflowModels],
                data: workflowDataset,
                train_index: trainIndexMetric,
                test_index: testIndexMetric,
                target_column: targetColumnMetric,
              },
              metadata: {
                workflowId: tab.workflowId,
                queryCase: "ale",
              },
            }),
          )
          await dispatch(
            fetchAffected({
              workflowId: tab.workflowId,
              queryCase: "affected",
            }),
          )
        }
    }
    fetchData()
  }, [isTabInitialized])

  console.log(plotRequestMetadata)

  return (
    <>
      <Grid
        sx={{
          flexDirection: "column",
          display: "flex",
          justifyContent: "center",
          textAlign: "center",
          border: `1px solid ${grey[400]}`,
          borderRadius: 3,
          overflow: "auto"
        }}
      >
        <Box
          sx={{
            bgcolor: grey[300],
            display: "flex",
            height: "3.5rem",
            alignItems: "center",
            textAlign: "left",
            px: 2,
          }}
        >
          <Typography fontSize={"1.2rem"}>Model Training Task</Typography>
          <Box sx={{ flex: 1 }} />
        </Box>
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
                <LinePlot
                  key={`pdp-plot`}
                  plotModel={
                    tab?.workflowTasks.modelAnalysis?.pdp || null
                  }
                  options={
                    tab?.workflowTasks.modelAnalysis?.pdp.data
                      ?.featureList || null
                  }
                  plotRequestMetadata={plotRequestMetadata}
                  fetchFunction={fetchModelAnalysisExplainabilityPlot}
                  workflowId={tab?.workflowId}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <LinePlot
                  key={`ale-plot`}
                  plotModel={
                    tab?.workflowTasks.modelAnalysis?.ale || null
                  }
                  options={
                    tab?.workflowTasks.modelAnalysis?.ale.data
                      ?.featureList || null
                  }
                  plotRequestMetadata={plotRequestMetadata}
                  fetchFunction={fetchModelAnalysisExplainabilityPlot}
                  workflowId={tab.workflowId}
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
