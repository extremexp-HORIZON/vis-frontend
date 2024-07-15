import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import { useAppDispatch, useAppSelector } from "../../../../../store/store"
import ContourPlot from "../../../../Tasks/SharedItems/Plots/contour-plot"
import LinePlot from "../../../../Tasks/SharedItems/Plots/line-plot"
import { useEffect } from "react"
import { fetchInitialization } from "../../../../../store/slices/explainabilitySlice"
import Typography from "@mui/material/Typography"
import CircularProgress from "@mui/material/CircularProgress"
import grey from "@mui/material/colors/grey"

const ExplainabilityTaskCompare = () => {
  const { explInitialization, initLoading } = useAppSelector(
    state => state.explainability,
  )
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(
      fetchInitialization({
        modelName: "I2Cat_Phising_model",
        pipelineQuery: null,
        modelInstancesQuery: null,
        modelConfusionQuery: null,
      }),
    )
  }, [])

  return (
    <Box sx={{ mb: "2rem" }}>
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
          Model Training Task
        </Typography>
        <Typography variant="body1">Explainability</Typography>
      </Box>
      {explInitialization && !initLoading ? (
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
                plotModel={
                  explInitialization.hyperparameterExplanation.plots["2dpdp"] ||
                  null
                }
                options={
                  explInitialization.hyperparameterExplanation
                    .hyperparameterNames
                }
              />
            </Grid>
            <Grid container item xs={12} md={6} spacing={2}>
              <Grid item xs={12}>
                <LinePlot
                  key={`pdp-plot`}
                  plotModel={
                    explInitialization.hyperparameterExplanation.plots.pdp ||
                    null
                  }
                  options={
                    explInitialization.hyperparameterExplanation
                      .hyperparameterNames
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <LinePlot
                  key={`ale-plot`}
                  plotModel={
                    explInitialization.hyperparameterExplanation.plots.ale ||
                    null
                  }
                  options={
                    explInitialization.hyperparameterExplanation
                      .hyperparameterNames
                  }
                />
              </Grid>
            </Grid>
          </Grid>
        </Box>
      ) : (
        <Box sx={{ height: "100%", width: "100%", textAlign: "center" }}>
          <CircularProgress size={"10rem"} />
          <Typography fontSize={"1.5rem"} color={grey[500]}>
            Processing Data...
          </Typography>
        </Box>
      )}
    </Box>
  )
}
export default ExplainabilityTaskCompare
