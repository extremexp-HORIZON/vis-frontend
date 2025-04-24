import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import type {
  RootState} from "../../../store/store";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../store/store"
import ContourPlot from "../../Tasks/SharedItems/Plots/contour-plot"
import LinePlot from "../../Tasks/SharedItems/Plots/line-plot";
import { useEffect, useState } from "react"
import Typography from "@mui/material/Typography"
import {
  explainabilityQueryDefault,
  fetchExplainabilityPlot,
} from "../../../shared/models/tasks/explainability.model"
import type { IRun } from "../../../shared/models/experiment/run.model";
import { initTab } from "../../../store/slices/workflowPageSlice";

const DummyExplains = () => {
  const { tab } = useAppSelector((state: RootState) => state.workflowPage)
  const { workflows } = useAppSelector((state: RootState) => state.progressPage)
  const [plotRequestMetadata, setPlotRequestMetadata] = useState<any>(null)
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(initTab({ tab: workflows.data[0].id, workflows }))
  }, [])

  useEffect(() => {
    if (tab) {
      const taskVariables = tab.workflowTasks.explainabilityTask || null
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
      console.log(query)

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
            explanation_type: "featureExplanation",
            explanation_method: "pdp",
            model : ["metadata/proxy_data_models/I2Cat_workflow12.pkl"],
            data : "metadata/datasets/phising.csv",
          train_index : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120],
            test_index : [],
            target_column : "label"
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
  }, [tab])

  return (
    <>
      <Box sx={{ mb: "2rem" }}>
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
                    tab?.workflowTasks.explainabilityTask?.pdp || null
                  }
                  options={
                    tab?.workflowTasks.explainabilityTask?.pdp.data
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
                    tab?.workflowTasks.explainabilityTask?.ale || null
                  }
                  options={
                    tab?.workflowTasks.explainabilityTask?.ale.data
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
                  tab?.workflowTasks.explainabilityTask?.["2dpdp"] || null
                }
                options={
                  tab?.workflowTasks.explainabilityTask?.["2dpdp"].data
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
export default DummyExplains
