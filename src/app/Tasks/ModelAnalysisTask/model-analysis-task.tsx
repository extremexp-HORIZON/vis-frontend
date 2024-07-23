import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../../store/store"
import CounterfactualsTable from "../SharedItems/Tables/counterfactuals-table"
import LinePlot from "../SharedItems/Plots/line-plot"
import CloseIcon from "@mui/icons-material/Close"
import grey from "@mui/material/colors/grey"
import { fetchInitialization, fetchMultipleTimeseries, fetchMultipleTimeseriesMetadata } from "../../../store/slices/explainabilitySlice"
import { defaultDataExplorationRequest } from "../../../shared/models/dataexploration.model"
import Typography from "@mui/material/Typography"
import IconButton from "@mui/material/IconButton"
import CircularProgress from "@mui/material/CircularProgress"
import MultiTimeSeriesVisualizationWithCategories from "./multi-ts-visualization/MultiTimeSeriesVisualizationWithCategories"
import { useLocation, useParams } from "react-router-dom"
import InstanceClassification from "../SharedItems/Plots/instance-classification"
import ConfusionMatrix from "../SharedItems/Plots/confusion-matrix"

interface IFeatureExplainability {
  workflowId: number | string
}

const ModelAnalysisTask = (props: IFeatureExplainability) => {
  const { explInitialization, multipleTimeSeries, multipleTimeSeriesMetadata } = useAppSelector(state => state.explainability)
  const { experimentId } = useParams();
  const { workflowId } = props
  const [point, setPoint] = useState(null)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if(experimentId && experimentId.includes("ideko")){
      dispatch(fetchMultipleTimeseries({dataQuery: {
        datasetId: `folder://${experimentId}/datasets/LG600B6-100636-IDK`,
        columns: [],
        filters: [],   
      }}));
      dispatch(fetchMultipleTimeseriesMetadata({ dataQuery: {
        datasetId: `file://${experimentId}/metadata.csv`,
        columns: [],
        filters: [],
      }}));
    }
    dispatch(
      fetchInitialization({
        modelName: "I2Cat_Phising_model",
        pipelineQuery: {
          ...defaultDataExplorationRequest,
          datasetId: "file:///I2Cat_phising/metrics/Real_I2Cat_metrics.csv",
        },
        modelInstancesQuery: {
          ...defaultDataExplorationRequest,
          datasetId:
            "file:///I2Cat_phising/metrics/Real_I2Cat_instances.csv",
          filters: [
            {
              column: "id",
              type: "equals",
              value: workflowId,
            },
          ],
          limit: 10000,
        },
        modelConfusionQuery: {
          ...defaultDataExplorationRequest,
          datasetId:
            "file:///I2Cat_phising/metrics/I2Cat_phising_confusion_matrix.csv",
          filters: [
            {
              column: "id",
              type: "equals",
              value: workflowId,
            },
          ],
        },
      }),
    )
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
        {!explInitialization ? <Box sx={{ height: "100%", width: "100%" }}>
          <CircularProgress size={"5rem"} />
          <Typography fontSize={"1.5rem"} color={grey[500]}>
            Initializing page...
          </Typography>
        </Box> : 
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
              <Typography variant="body1">Test set classified instances and Confusion Matrix</Typography>
            </Box>
            { (multipleTimeSeries && multipleTimeSeriesMetadata) ?
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <MultiTimeSeriesVisualizationWithCategories 
                    data={structuredClone(multipleTimeSeries)} 
                    metadata={structuredClone(multipleTimeSeriesMetadata)}/>
                </Grid>
                <Grid item xs={12} md={4}>
                  <ConfusionMatrix
                    key={`confusion-matrix`}
                    metrics={
                      explInitialization.hyperparameterExplanation.pipelineMetrics
                    }
                    workflowId={workflowId}
                  />
                </Grid>
              </Grid> 
              :
              <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <InstanceClassification
                  key={`instance-classification`}
                  point={point}
                  setPoint={setPoint}
                  plotData={
                    explInitialization.featureExplanation.modelInstances
                  }
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <ConfusionMatrix
                  key={`confusion-matrix`}
                  metrics={
                    explInitialization.hyperparameterExplanation.pipelineMetrics
                  }
                  workflowId={workflowId}
                />
              </Grid>
            </Grid>
            }
            <Box>
              {point && (
                <CounterfactualsTable
                  key={`counterfactuals-table`}
                  point={point}
                  setPoint={setPoint}
                  plotModel={
                    explInitialization.featureExplanation.tables.counterfactuals
                  }
                />
              )}
            </Box>
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
              <Typography variant="body1">Feature based explanations for this variant</Typography>
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
            </Grid>
          </Box>}
        </Grid>
    </>
  )
}
export default ModelAnalysisTask
