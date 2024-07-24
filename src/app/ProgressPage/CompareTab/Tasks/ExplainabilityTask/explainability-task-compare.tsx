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
  IExplainability,
} from "../../../../../shared/models/tasks/explainability.model"

interface IExplainabilityTaskCompare {
  taskVariables: IExplainability
}

const ExplainabilityTaskCompare = (props: IExplainabilityTaskCompare) => {
  const { taskVariables } = props
  const { tabs } = useAppSelector((state: RootState) => state.workflowTabs)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (
      // taskVariables &&
      !taskVariables["2dpdp"].data &&
      !taskVariables.ale.data &&
      !taskVariables.pdp.data
    ) {
      dispatch(
        fetchExplainabilityPlot({
          explanationType: "hyperparameterExplanation",
          explanationMethod: "2dpdp",
          model: "Ideko_model",
          feature1: taskVariables.hyperparametersNames[0] || "feature1",
          feature2: taskVariables.hyperparametersNames[1] || "feature2",
          modelId: 1,
        }),
      )
      dispatch(
        fetchExplainabilityPlot({
          explanationType: "hyperparameterExplanation",
          explanationMethod: "pdp",
          model: "Ideko_model",
          feature1: taskVariables.hyperparametersNames[0] || "feature1",
          feature2: taskVariables.hyperparametersNames[1] || "feature2",
          modelId: 1,
        }),
      )
      dispatch(
        fetchExplainabilityPlot({
          explanationType: "hyperparameterExplanation",
          explanationMethod: "ale",
          model: "Ideko_model",
          feature1: taskVariables.hyperparametersNames[0] || "feature1",
          feature2: taskVariables.hyperparametersNames[1] || "feature2",
          modelId: 1,
        }),
      )
    }
  }, [])

  return (
    <>
      {console.log(taskVariables)}
      <Box sx={{ mb: "2rem" }}>
        <Box sx={{ display: "flex", alignItems: "center", columnGap: 2 }}>
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
          {taskVariables["2dpdp"].loading ||
            taskVariables.ale.loading ||
            taskVariables.pdp.loading ? (
              <Box>
                <CircularProgress sx={{ size: "5rem" }} />
              </Box>
            ) : null}
        </Box>
        {taskVariables["2dpdp"].data &&
          taskVariables.ale.data &&
          taskVariables.pdp.data && (
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
                <Grid item xs={12} md={6}>
                  <ContourPlot
                    key={`2dpdp-plot`}
                    plotModel={taskVariables["2dpdp"].data}
                    options={taskVariables.hyperparametersNames}
                    fetchFunction={fetchExplainabilityPlot}
                  />
                </Grid>
                <Grid container item xs={12} md={6} spacing={2}>
                  <Grid item xs={12}>
                    <LinePlot
                      key={`pdp-plot`}
                      plotModel={taskVariables.pdp.data}
                      options={taskVariables.hyperparametersNames}
                      fetchFunction={fetchExplainabilityPlot}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <LinePlot
                      key={`ale-plot`}
                      plotModel={taskVariables.ale.data}
                      options={taskVariables.hyperparametersNames}
                      fetchFunction={fetchExplainabilityPlot}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          )}
      </Box>
    </>
  )
}
export default ExplainabilityTaskCompare
