import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import type {
  RootState} from "../../../../store/store";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../../store/store"
import ContourPlot from "../../../../app/Tasks/SharedItems/Plots/contour-plot"
import LinePlot from "../../../../app/Tasks/SharedItems/Plots/line-plot"
import { useEffect, useState } from "react"
import Typography from "@mui/material/Typography"
import {
  explainabilityQueryDefault,
  fetchExplainabilityPlot,
} from "../../../../shared/models/tasks/explainability.model"
import type { IWorkflowPageModel } from "../../../../shared/models/workflow.tab.model"
import type { IRun } from "../../../../shared/models/experiment/run.model"

interface IExplainabilityTaskCompare {
  workflow: IWorkflowPageModel | null
}

const ExplainabilityTaskCompare = (props: IExplainabilityTaskCompare) => {
  const { workflow } = props
  const { workflows } = useAppSelector((state: RootState) => state.progressPage)
  const [plotRequestMetadata, setPlotRequestMetadata] = useState<any>(null)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (workflow) {
      const taskVariables = workflow.workflowTasks.explainabilityTask || null
      console.log("here")

      // Create nessesary queries for the explainability plots
      const query = {hyper_configs: workflows.data.reduce((acc: {}, workflow: IRun) => {
        const savedModelDataset = workflow.tasks?.flatMap(task => [
          ...(workflow.dataAssets?.filter(asset => 
            asset.task === task.name
          ) || []),
        ]).find(dataset => dataset.name === "saved_model");
        
        const workflowSavedModelParameters = workflow.params?.reduce((ac, param) => ({
          ...ac,
          [param.name]: {
        values: param.value,
        // type: param.type === "integer" ? "numeric" : "categorical",
          },
        }), {})
        //TODO: This should be an option for the user
        const workflowSelectedMetric = workflow.metrics[0].value

        console.log(savedModelDataset?.source, workflowSavedModelParameters)
        return {
          ...acc,
          [savedModelDataset?.source || ""]: {hyperparameter: workflowSavedModelParameters, metric_value: workflowSelectedMetric},
        }
      }, {})}

      setPlotRequestMetadata(query)

      if (!taskVariables?.["2dpdp"].data) {
        dispatch(
          fetchExplainabilityPlot({
            query: {
              ...explainabilityQueryDefault,
              explanation_type: "hyperparameterExplanation",
              explanation_method: "2dpdp",
              ...query,
            },
            metadata: {
              workflowId: "",
              queryCase: "2dpdp",
            },
          }),
        )
      }
      dispatch(
        fetchExplainabilityPlot({
          query: {
            ...explainabilityQueryDefault,
            explanation_type: "hyperparameterExplanation",
            explanation_method: "pdp",
            ...query,
          },
          metadata: {
            workflowId: "",
            queryCase: "pdp",
          },
        }),
      )
      dispatch(
        fetchExplainabilityPlot({
          query: {
            ...explainabilityQueryDefault,
            explanation_type: "hyperparameterExplanation",
            explanation_method: "ale",
            ...query,
          },
          metadata: {
            workflowId: "",
            queryCase: "ale",
          },
        }),
      )
    }
  }, [])

  return (
    <>
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
                  plotModel={
                    workflow?.workflowTasks.explainabilityTask?.pdp || null
                  }
                  options={
                    workflow?.workflowTasks.explainabilityTask?.pdp.data
                      ?.hyperparameterList || null
                  }
                  fetchFunction={fetchExplainabilityPlot}
                  workflowId={0}
                  plotRequestMetadata={plotRequestMetadata}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <LinePlot
                  key={`ale-plot`}
                  plotModel={
                    workflow?.workflowTasks.explainabilityTask?.ale || null
                  }
                  options={
                    workflow?.workflowTasks.explainabilityTask?.ale.data
                      ?.hyperparameterList || null
                  }
                  fetchFunction={fetchExplainabilityPlot}
                  workflowId={0}
                  plotRequestMetadata={plotRequestMetadata}
                />
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              <ContourPlot
                key={`2dpdp-plot`}
                plotModel={
                  workflow?.workflowTasks.explainabilityTask?.["2dpdp"] || null
                }
                options={
                  workflow?.workflowTasks.explainabilityTask?.["2dpdp"].data
                    ?.hyperparameterList || null
                }
                fetchFunction={fetchExplainabilityPlot}
                plotRequestMetadata={plotRequestMetadata}
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
