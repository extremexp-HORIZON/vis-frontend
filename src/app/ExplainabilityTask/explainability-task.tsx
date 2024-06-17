import { useEffect, useState } from "react"
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
import { fetchInitialization } from "../../store/slices/explainabilitySlice"
import Grid from "@mui/material/Grid"
import grey from "@mui/material/colors/grey"
import DashboardTitle from "./explainability-header"
import CircularProgress from "@mui/material/CircularProgress"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import FeatureExplainability from "./FeatureExpl/feature-explainability"
import HyperparameterExplainability from "./HyperparamExpl/hyperparameter-explainability"
import DataExploration from "../DataExplorationTask/data-exploration"
import { defaultDataExplorationRequest } from "../../shared/models/dataexploration.model"

const ExplainabilityTask = () => {
  const { explInitialization, initLoading, tabs } = useAppSelector(
    state => state.explainability,
  )
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
              }
            ],
            limit: 10000
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
              }
            ]
        },
      }),
    )
  }, [])

  const [value, setValue] = useState(0)

  return (
    <>
      <Grid
        sx={{
          maxWidth: "100vw",
          minHeight: "100vh",
          flexDirection: "column",
          display: "flex",
          justifyContent: initLoading ? "center" : "start",
          textAlign: initLoading ? "center" : "start",
        }}
      >
        {initLoading && explInitialization === null ? (
          <Box sx={{ height: "100%", width: "100%" }}>
            <CircularProgress size={"10rem"} />
            <Typography fontSize={"1.5rem"} color={grey[500]}>
              Initializing page...
            </Typography>
          </Box>
        ) : (
          <>
            <DashboardTitle value={value} setValue={setValue} />
            {value === 0 && <HyperparameterExplainability />}
            {value === 1 && <FeatureExplainability variantId={71} />}
            {tabs.map((tab: any, index: number) => (
             value === index + 2 && <FeatureExplainability variantId={tab.id} />
            ))}
          </>
        )}
      </Grid>
    </>
  )
}

export default ExplainabilityTask
