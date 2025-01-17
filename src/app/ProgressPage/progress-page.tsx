import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography"
import EditIcon from "@mui/icons-material/Edit"
import grey from "@mui/material/colors/grey"
import ParallelCoordinatePlot from "./parallel-coordinate-plot"
import { useEffect, useState } from "react"
import WorkflowTab from "./WorkflowTab/workflow-tab"
import ProgressPageTabs from "./progress-page-tabs"
import WorkflowTable from "./WorkFlowTables/workflow-table"
import ScheduleTable from "./WorkFlowTables/schedule-table"
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
import CompareCompleted from "./CompareTab/CompareCompleted/compare-completed"
import ProgressPageBar from "./progress-page-bar"
import ProgressPageGauges from "./progress-page-gauges"
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import { useParams } from "react-router-dom"
import { fetchExperimentWorkflows } from "../../store/slices/progressPageSlice"

const ProgressPage = () => {
  const [value, setValue] = useState<number | string>("progress")
  const { experimentId } = useParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if(experimentId){
      dispatch(fetchExperimentWorkflows(experimentId));
    }
  }, [])

  const handleChange =
    (newValue: number | string) => (event: React.SyntheticEvent) => {
      if (value === newValue) return
      setValue(newValue)
      window.scrollTo(0, 0)
    }

  return (
    <>
      <Grid
        sx={{
          maxWidth: "100vw",
          minHeight: "100vh",
          flexDirection: "column",
          display: "flex",
          rowGap: 3,
        }}
      >
        <Box key={"progress-page-title"} sx={{ width: "inherit", px: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box className={"progress-page-description"}>
            <Box
              sx={{
                display: "flex",
                borderBottom: `1px solid ${grey[500]}`,
              }}
            >
              <Typography fontSize={"2rem"} sx={{ fontWeight: 600 }}>
                {experimentId && experimentId.charAt(0).toUpperCase() + experimentId.slice(1)}
              </Typography>
            </Box>
            <Box>
              <Typography fontSize={"1rem"}>
                {"Description: Improve accuracy in the anomaly prediction classification"}
              </Typography>
            </Box>
          </Box>
          <Box className={"progress-page-actions"}>
            <PauseIcon
              onClick={() => console.log("clicked")}
              sx={{ cursor: "pointer", color: theme => theme.palette.primary.main }}
              fontSize="large"
            />

            <StopIcon
              onClick={() => console.log("clicked")}
              sx={{ cursor: "pointer", color: theme => theme.palette.primary.main }}
              fontSize="large"
            />
          </Box>
        </Box>
        <Box key="progress-tabs">
          <ProgressPageTabs value={value} handleChange={handleChange} />
        </Box>
        <Box
          sx={{
            px: 5,
            display: "flex",
            flexDirection: "column",
            mt: 2,
            rowGap: 6,
          }}
        >
          {value === "progress" && (
            <>
              <ProgressPageBar />
              <ProgressPageGauges />
              <ParallelCoordinatePlot />
              <WorkflowTable handleChange={handleChange} />
              {/* <Divider sx={{ margin: '20px' }} /> */}
              <ScheduleTable />
            </>
          )}
          {value !== "progress" && value !== "compare-completed" && (
            <WorkflowTab workflowId={value} />
          )}
          {value === "compare-completed" && <CompareCompleted />}
        </Box>
      </Grid>
    </>
  )
}

export default ProgressPage
