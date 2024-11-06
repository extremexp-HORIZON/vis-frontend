import Grid from "@mui/material/Grid"
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
import Typography from "@mui/material/Typography"
import LinearProgress from "@mui/material/LinearProgress"
import { useEffect, useState } from "react"
import { setIntialization } from "../../store/slices/progressPageSlice"
import "../../index.css"

const ProgressPageLoading = () => {
  const { workflows, experiment } = useAppSelector(
    (state: RootState) => state.progressPage,
  )
  const dispatch = useAppDispatch()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!experiment.loading && experiment.data) {
      setProgress(50)
    }
    if (!workflows.loading && workflows.data.length > 0) {
      setProgress(100)
    }
  }, [workflows, experiment])

  useEffect(() => {
    if (
      !experiment.loading &&
      experiment.data &&
      workflows.data.length > 0 &&
      !workflows.loading
    ) {
      setTimeout(() => {
        dispatch(setIntialization(true))
      }, 600)
    }
  }, [experiment, workflows])

  return (
    <>
      <Grid
        id={"error-page"}
        sx={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Grid sx={{ display: "flex", rowGap: 2, flexDirection: "column" }}>
          <img src="/images/extremexp-logo.png" height={130} style={{ objectFit: "contain" }} />
          <Typography variant="h4">Initializing Progress Page</Typography>
          {!experiment.data && experiment.loading && (
            <Typography variant="h6">Fetching Experiment Data...</Typography>
          )}
          {workflows.data.length === 0 &&
            workflows.loading &&
            experiment.data && (
              <Typography variant="h6">Fetching Workflows...</Typography>
            )}
          {((workflows.error && !workflows.loading) ||
            (experiment.error && !workflows.loading)) && (
            <Typography variant="h6" color="error">
              {experiment.error || experiment.error}
            </Typography>
          )}
          {workflows.data.length > 0 &&
            !workflows.loading &&
            experiment.data &&
            !experiment.loading && <Typography variant="h6">Done!</Typography>}
          <LinearProgress
            variant="determinate"
            value={progress}
            color={
              workflows.data.length > 0 && !workflows.loading
                ? "success"
                : (workflows.error && !workflows.loading) ||
                    (experiment.error && !workflows.loading)
                  ? "error"
                  : "primary"
            }
          />
        </Grid>
      </Grid>
    </>
  )
}

export default ProgressPageLoading
