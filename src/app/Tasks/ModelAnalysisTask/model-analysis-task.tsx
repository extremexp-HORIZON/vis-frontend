import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../../store/store"
import CounterfactualsTable from "../SharedItems/Tables/counterfactuals-table"
import LinePlot from "../SharedItems/Plots/line-plot"
import CloseIcon from "@mui/icons-material/Close"
import grey from "@mui/material/colors/grey"
import { defaultDataExplorationQuery } from "../../../shared/models/dataexploration.model"
import Typography from "@mui/material/Typography"
import IconButton from "@mui/material/IconButton"
import MultiTimeSeriesVisualizationWithCategories from "./multi-ts-visualization/MultiTimeSeriesVisualizationWithCategories"
import { useParams } from "react-router-dom"
import InstanceClassification from "../SharedItems/Plots/instance-classification"
import ConfusionMatrix from "../SharedItems/Plots/confusion-matrix"
import _ from "lodash"
import {
  fetchModelAnalysisData,
  fetchModelAnalysisExplainabilityPlot,
} from "../../../shared/models/tasks/model-analysis.model"
import { IWorkflowTabModel } from "../../../shared/models/workflow.tab.model"
import { updateChartData, updateColumns, updateFilters } from "../../../store/slices/workflowTabsSlice"

interface IFeatureExplainability {
  workflow: IWorkflowTabModel | null
}

const ModelAnalysisTask = (props: IFeatureExplainability) => {
  const { tabs } = useAppSelector(state => state.workflowTabs)
  const { experimentId } = useParams()
  const { workflow } = props
  const [point, setPoint] = useState(null)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (experimentId === "ideko") {
      dispatch(
        fetchModelAnalysisData({
          query: {
            datasetId: `folder://${experimentId}/datasets/LG600B6-100636-IDK`,
            columns: [],
            filters: [],
            limit: -1,
          },
          metadata: {
            workflowId: workflow.workflowId,
            queryCase: "multipleTimeSeries",
          },
        }),
      )
      dispatch(
        fetchModelAnalysisData({
          query: {
            datasetId: `file://${experimentId}/metadata.csv`,
            columns: [],
            filters: [],
            limit: -1
          },
          metadata: {
            workflowId: workflow.workflowId,
            queryCase: "multipleTimeSeriesMetadata",
          },
        }),
      )
    } else if (experimentId !== "ideko") {
      dispatch(
        fetchModelAnalysisData({
          query: {
            ...defaultDataExplorationQuery,
            datasetId: `file://${experimentId}/metrics/${experimentId}_confusion_matrix.csv`,
            filters: [
              { column: "id", type: "equals", value: workflow.workflowId },
            ],
          },
          metadata: {
            workflowId: workflow.workflowId,
            queryCase: "modelConfusionMatrix",
          },
        }),
      )
      dispatch(
        fetchModelAnalysisData({
          query: {
            ...defaultDataExplorationQuery,
            datasetId: `file://${experimentId}/metrics/${experimentId}_instances.csv`,
            filters: [
              { column: "id", type: "equals", value: workflow.workflowId },
            ],
          },
          metadata: {
            workflowId: workflow.workflowId,
            queryCase: "modelInstances",
          },
        }),
      )
      dispatch(
        fetchModelAnalysisExplainabilityPlot({
          explanationType: "featureExplanation",
          explanationMethod: "pdp",
          model: "I2Cat_Phising_model",
          feature1:
            workflow.workflowTasks.modelAnalysis?.featureNames[0] || "feature1",
          feature2: "",
          modelId: workflow.workflowId,
        }),
      )
      dispatch(
        fetchModelAnalysisExplainabilityPlot({
          explanationType: "featureExplanation",
          explanationMethod: "ale",
          model: "I2Cat_Phising_model",
          feature1:
            workflow.workflowTasks.modelAnalysis?.featureNames[0] || "feature1",
          feature2: "",
          modelId: workflow.workflowId,
        }),
      )
    }
    dispatch(
      fetchModelAnalysisData({
        query: {
          ...defaultDataExplorationQuery,
          datasetId: `file://${experimentId}/metrics/${experimentId}_confusion_matrix.csv`,
          filters: [
            {
              column: "id",
              type: "equals",
              value: workflow.workflowId,
            },
          ],
        },
        metadata: {
          workflowId: workflow.workflowId,
          queryCase: "modelConfusionMatrix",
        },
      }),
    )
    dispatch(updateFilters({ filter: { column: "id", type: "equals", value: 3 }, workflowId: workflow.workflowId }))
    dispatch(updateColumns({ columns: [{name: "dskj", type: "integer"}], workflowId: workflow.workflowId }))
    dispatch(updateChartData({ chartType: "lineChart", data: {xAxis: "ok", yAxis: ["tapame"]}, workflowId: workflow.workflowId }))
  }, [])

  return (
    <>
    {console.log(tabs)}
      <Grid
        sx={{
          flexDirection: "column",
          display: "flex",
          justifyContent: "center",
          textAlign: "center",
          border: `1px solid ${grey[400]}`,
          borderRadius: 3,
          overflow: "hidden",
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
          <IconButton>
            <CloseIcon />
          </IconButton>
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
              Classification Report
            </Typography>
            <Typography variant="body1">
              Test set classified instances and Confusion Matrix
            </Typography>
          </Box>
          {experimentId === "ideko" ? (
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <MultiTimeSeriesVisualizationWithCategories
                  setPoint={setPoint}
                  multipleTimeSeries={
                    workflow?.workflowTasks.modelAnalysis?.multipleTimeSeries ||
                    null
                  }
                  multipleTimeSeriesMetadata={
                    workflow?.workflowTasks.modelAnalysis
                      ?.multipleTimeSeriesMetadata || null
                  }
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <ConfusionMatrix
                  key={`confusion-matrix`}
                  confusionMatrix={
                    workflow.workflowTasks.modelAnalysis
                      ?.modelConfusionMatrix || null
                  }
                />
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <InstanceClassification
                  key={`instance-classification`}
                  point={point}
                  setPoint={setPoint}
                  plotData={
                    workflow.workflowTasks.modelAnalysis?.modelInstances || null
                  }
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <ConfusionMatrix
                  key={`confusion-matrix`}
                  confusionMatrix={
                    workflow.workflowTasks.modelAnalysis
                      ?.modelConfusionMatrix || null
                  }
                />
              </Grid>
            </Grid>
          )}
          <Box>
            {point && (
              <CounterfactualsTable
                key={`counterfactuals-table`}
                point={point}
                handleClose={() => setPoint(null)}
                counterfactuals={
                  workflow.workflowTasks.modelAnalysis?.counterfactuals || null
                }
              />
            )}
          </Box>
          {experimentId !== "ideko" && (
            <>
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
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <LinePlot
                    key={`pdp-plot`}
                    plotModel={
                      workflow.workflowTasks.modelAnalysis?.pdp || null
                    }
                    options={
                      workflow.workflowTasks.modelAnalysis?.featureNames || null
                    }
                    fetchFunction={fetchModelAnalysisExplainabilityPlot}
                    workflowId={workflow.workflowId}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <LinePlot
                    key={`ale-plot`}
                    plotModel={
                      workflow.workflowTasks.modelAnalysis?.ale || null
                    }
                    options={
                      workflow.workflowTasks.modelAnalysis?.featureNames || null
                    }
                    fetchFunction={fetchModelAnalysisExplainabilityPlot}
                    workflowId={workflow.workflowId}
                  />
                </Grid>
              </Grid>
            </>
          )}
        </Box>
      </Grid>
    </>
  )
}
export default ModelAnalysisTask
