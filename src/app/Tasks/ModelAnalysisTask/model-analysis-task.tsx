import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../../store/store"
import CounterfactualsTable from "../SharedItems/Tables/counterfactuals-table"
import LinePlot from "../SharedItems/Plots/line-plot"
import CloseIcon from "@mui/icons-material/Close"
import grey from "@mui/material/colors/grey"
import {
  fetchConfusionMatrix,
  fetchInitialization,
  fetchMultipleTimeseries,
  fetchMultipleTimeseriesMetadata,
} from "../../../store/slices/explainabilitySlice"
import { defaultDataExplorationRequest } from "../../../shared/models/dataexploration.model"
import Typography from "@mui/material/Typography"
import IconButton from "@mui/material/IconButton"
import CircularProgress from "@mui/material/CircularProgress"
import MultiTimeSeriesVisualizationWithCategories from "./multi-ts-visualization/MultiTimeSeriesVisualizationWithCategories"
import { useLocation, useParams } from "react-router-dom"
import InstanceClassification from "../SharedItems/Plots/instance-classification"
import ConfusionMatrix from "../SharedItems/Plots/confusion-matrix"
import _ from "lodash"

interface IFeatureExplainability {
  workflowId: number | string
}

const ModelAnalysisTask = (props: IFeatureExplainability) => {
  const {
    explInitialization,
    multipleTimeSeries,
    multipleTimeSeriesMetadata,
    confusionMatrix,
    initLoading,
    loading,
  } = useAppSelector(state => state.explainability)
  const { experimentId } = useParams()
  const { workflowId } = props
  const [point, setPoint] = useState(null)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (experimentId === "ideko" && multipleTimeSeries.length === 0 && _.isEmpty(multipleTimeSeriesMetadata)) {
        dispatch(
          fetchMultipleTimeseries({
            dataQuery: {
              datasetId: `folder://${experimentId}/datasets/LG600B6-100636-IDK`,
              columns: [],
              filters: [],
            },
          }),
        )
        dispatch(
          fetchMultipleTimeseriesMetadata({
            dataQuery: {
              datasetId: `file://${experimentId}/metadata.csv`,
              columns: [],
              filters: [],
            },
          }),
        )
      }
    if (confusionMatrix.length === 0) {
      dispatch(fetchConfusionMatrix(workflowId))
    }
  }, [])

  return (
    <>
      <Grid
        sx={{
          flexDirection: "column",
          display: "flex",
          justifyContent: !explInitialization ? "center" : "start",
          textAlign: !explInitialization ? "center" : "start",
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
        {initLoading || loading || confusionMatrix.length === 0 || multipleTimeSeries.length === 0 ? (
          <Box sx={{ height: "100%", width: "100%" }}>
            <CircularProgress size={"5rem"} />
            <Typography fontSize={"1.5rem"} color={grey[500]}>
              Initializing page...
            </Typography>
          </Box>
        ) : (
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
            {
              multipleTimeSeries &&
              multipleTimeSeriesMetadata &&
              confusionMatrix.length > 0 ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <MultiTimeSeriesVisualizationWithCategories
                      data={structuredClone(multipleTimeSeries)}
                      metadata={structuredClone(multipleTimeSeriesMetadata)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <ConfusionMatrix
                      key={`confusion-matrix`}
                      metrics={confusionMatrix}
                      workflowId={workflowId}
                    />
                  </Grid>
                </Grid>
              ) : null
              // (
              //   <Grid container spacing={2}>
              //     <Grid item xs={12} md={6}>
              //       <InstanceClassification
              //         key={`instance-classification`}
              //         point={point}
              //         setPoint={setPoint}
              //         plotData={
              //           explInitialization.featureExplanation.modelInstances
              //         }
              //       />
              //     </Grid>
              //     <Grid item md={6} xs={12}>
              //       <ConfusionMatrix
              //         key={`confusion-matrix`}
              //         metrics={
              //           explInitialization.hyperparameterExplanation
              //             .pipelineMetrics
              //         }
              //         workflowId={workflowId}
              //       />
              //     </Grid>
              //   </Grid>
              // )
            }
            {/* <Box>
              {point && (
                <CounterfactualsTable
                  key={`counterfactuals-table`}
                  point={point}
                  handleClose={() => setPoint(null)}
                  plotModel={
                    explInitialization.featureExplanation.tables.counterfactuals
                  }
                />
              )}
            </Box> */}
            {/* <Box
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
                    explInitialization.featureExplanation.plots.pdp || null
                  }
                  options={explInitialization.featureExplanation.featureNames}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <LinePlot
                  key={`ale-plot`}
                  plotModel={
                    explInitialization.featureExplanation.plots.ale || null
                  }
                  options={explInitialization.featureExplanation.featureNames}
                />
              </Grid>
            </Grid> */}
          </Box>
        )}
      </Grid>
    </>
  )
}
export default ModelAnalysisTask
