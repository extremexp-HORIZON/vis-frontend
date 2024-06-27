import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../../store/store"
import ModelStatistics from "../SharedItems/Tables/model-statistics"
import InstanceClassification from "../SharedItems/Plots/instance-classification"
import ConfusionMatrix from "../SharedItems/Plots/confusion-matrix"
import CounterfactualsTable from "../SharedItems/Tables/counterfactuals-table"
import LinePlot from "../SharedItems/Plots/line-plot"
import CloseIcon from "@mui/icons-material/Close"
import grey from "@mui/material/colors/grey"
import { fetchInitialization } from "../../../store/slices/explainabilitySlice"
import { defaultDataExplorationRequest } from "../../../shared/models/dataexploration.model"
import Typography from "@mui/material/Typography"
import IconButton from "@mui/material/IconButton"
import CircularProgress from "@mui/material/CircularProgress"

interface IFeatureExplainability {
  variantId: number
}

const ModelAnalysisTask = (props: IFeatureExplainability) => {
  const { explInitialization } = useAppSelector(state => state.explainability)
  const { variantId } = props
  const [point, setPoint] = useState(null)
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(
      fetchInitialization({
        modelName: "I2Cat_Phising_model",
        pipelineQuery: {
          ...defaultDataExplorationRequest,
          datasetId: "file:///I2Cat_phising/metrics/I2Cat_phising_metrics.csv",
        },
        modelInstancesQuery: {
          ...defaultDataExplorationRequest,
          datasetId:
            "file:///I2Cat_phising/metrics/I2Cat_phising_instances.csv",
          filters: [
            {
              column: "id",
              type: "equals",
              value: 71,
            },
          ],
          limit: 1000,
        },
        modelConfusionQuery: {
          ...defaultDataExplorationRequest,
          datasetId:
            "file:///I2Cat_phising/metrics/I2Cat_phising_confusion_matrix.csv",
          filters: [
            {
              column: "id",
              type: "equals",
              value: 71,
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
          <CircularProgress size={"10rem"} />
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
                alignItems: "center",
                columnGap: 1,
              }}
            >
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, fontSize: "1.5rem" }}
              >
                Experiment Variant {variantId}:
              </Typography>
              <Typography variant="body1">Classification Report</Typography>
            </Box>
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
                  variantId={variantId}
                />
              </Grid>
            </Grid>
            <Box>
              {point && (
                <CounterfactualsTable
                  key={`counterfactuals-table`}
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
                alignItems: "center",
                columnGap: 1,
              }}
            >
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, fontSize: "1.5rem" }}
              >
                Experiment Variant {variantId}:
              </Typography>
              <Typography variant="body1">Features Explainability</Typography>
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
