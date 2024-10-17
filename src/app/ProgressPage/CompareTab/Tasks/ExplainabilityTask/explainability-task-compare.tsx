import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import {
  RootState,
  useAppDispatch,
  useAppSelector,
} from "../../../../../store/store"
import ContourPlot from "../../../../Tasks/SharedItems/Plots/contour-plot"
import LinePlot from "../../../../Tasks/SharedItems/Plots/line-plot"
import { useEffect } from "react"
import Typography from "@mui/material/Typography"
import CircularProgress from "@mui/material/CircularProgress"
import {
  fetchExplainabilityPlot,
} from "../../../../../shared/models/tasks/explainability.model"
import { useParams } from "react-router-dom"
import { IWorkflowTabModel } from "../../../../../shared/models/workflow.tab.model"

interface IExplainabilityTaskCompare {
  workflow: IWorkflowTabModel | null
}

const ExplainabilityTaskCompare = (props: IExplainabilityTaskCompare) => {
  const { workflow } = props
  const { experimentId } = useParams()
  const { tabs } = useAppSelector((state: RootState) => state.workflowTabs)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if(workflow){
      const taskVariables = workflow.workflowTasks.explainabilityTask || null
      if(!taskVariables?.["2dpdp"].data){
    dispatch(
      fetchExplainabilityPlot({
        explanationType: "hyperparameterExplanation",
        explanationMethod: "2dpdp",
        model: "Ideko_model",
        feature1: taskVariables?.hyperparametersNames[0] || "feature1",
        feature2: taskVariables?.hyperparametersNames[1] || "feature2",
        modelId: 0,
      }),
    )
  }
    dispatch(
      fetchExplainabilityPlot({
        explanationType: "hyperparameterExplanation",
        explanationMethod: "pdp",
        model: "Ideko_model",
        feature1: taskVariables?.hyperparametersNames[0] || "feature1",
        feature2: taskVariables?.hyperparametersNames[1] || "feature2",
        modelId: 0,
      }),
    )
    dispatch(
      fetchExplainabilityPlot({
        explanationType: "hyperparameterExplanation",
        explanationMethod: "ale",
        model: "Ideko_model",
        feature1: taskVariables?.hyperparametersNames[0] || "feature1",
        feature2: taskVariables?.hyperparametersNames[1] || "feature2",
        modelId: 0,
      }),
    )
  }
  }, [])

  return (
    <>
      {console.log(tabs)}
      <Box sx={{ mb: "2rem" }}>
          <Box
            sx={{
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
              Model Training Task
            </Typography>
            <Typography variant="body1">Explainability</Typography>
          </Box>
            <Box
              sx={{
                px: 5,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 4,
                my: "3rem",
              }}
            >
              {/* <Box sx={{ display: "flex", gap: 4, flexFlow: "wrap" }}> */}
              <Grid container spacing={2}>
                <Grid container item xs={12} md={12} spacing={2}>
                  <Grid item xs={12} md={6}>
                    <LinePlot
                      key={`pdp-plot`}
                      plotModel={workflow?.workflowTasks.explainabilityTask?.pdp || null}
                      options={workflow?.workflowTasks.explainabilityTask?.hyperparametersNames || null}
                      fetchFunction={fetchExplainabilityPlot}
                      workflowId={0}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <LinePlot
                      key={`ale-plot`}
                      plotModel={workflow?.workflowTasks.explainabilityTask?.ale || null} 
                      options={workflow?.workflowTasks.explainabilityTask?.hyperparametersNames || null}
                      fetchFunction={fetchExplainabilityPlot}
                      workflowId={0}
                    />
                  </Grid>
                </Grid>
                <Grid item xs={12} md={6}>
                  <ContourPlot
                    key={`2dpdp-plot`}
                    plotModel={workflow?.workflowTasks.explainabilityTask?.["2dpdp"] || null}
                    options={workflow?.workflowTasks.explainabilityTask?.hyperparametersNames || null}
                    fetchFunction={fetchExplainabilityPlot}
                    workflowId={0}
                  />
                </Grid>
              </Grid>
            </Box>
      </Box>
    </>
  )
}
export default ExplainabilityTaskCompare
