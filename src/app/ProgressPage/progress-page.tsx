import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography"
import grey from "@mui/material/colors/grey"
import ParallelCoordinatePlot from "./parallel-coordinate-plot"
import { useEffect, useState, useRef } from "react"
import WorkflowTab from "./WorkflowTab/workflow-tab"
import ProgressPageTabs from "./progress-page-tabs"
import WorkflowTable from "./WorkFlowTables/workflow-table"
import ScheduleTable from "./WorkFlowTables/schedule-table"
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
import CompareCompleted from "./CompareTab/CompareCompleted/compare-completed"
import ProgressPageBar from "./progress-page-bar"
import ProgressPageGauges from "./progress-page-gauges"
import PauseIcon from "@mui/icons-material/Pause"
import StopIcon from "@mui/icons-material/Stop"
import { useParams } from "react-router-dom"
import {
  fetchExperiment,
  fetchExperimentTesting,
  fetchExperimentWorkflows,
  fetchExperimentWorkflowsTesting,
} from "../../store/slices/progressPageSlice"
import ProgressPageLoading from "./progress-page-loading"
import ProgressPageTab from "./progressPageTabs/progress-page-tab"
import { updateTabs } from "../../store/slices/workflowTabsSlice"

const ProgressPage = () => {
  const [value, setValue] = useState<number | string>("progress")
  const { experiment, workflows, initialization } = useAppSelector(
    (state: RootState) => state.progressPage,
  )
  const { tabs } = useAppSelector(
    (state: RootState) => state.workflowTabs,
  )
  const { experimentId } = useParams()
  const dispatch = useAppDispatch()
  const intervalId = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (experimentId) {
      // TODO: Remove this if statement when no longer needed
      if (experimentId === "ideko" || experimentId === "I2Cat_phising") {
        dispatch(fetchExperimentTesting(experimentId))
      } else {
        dispatch(fetchExperiment(experimentId))
      }
    }
  }, [])

  // useEffect(() => {
  //   if (!experiment.loading && experiment.data) {
  //     // TODO: Remove this if statement when no longer needed
  //     if (experimentId === "ideko" || experimentId === "I2Cat_phising") {
  //       dispatch(
  //         fetchExperimentWorkflowsTesting({
  //           experimentId: experimentId || "",
  //           workflowIds: experiment.data.workflow_ids,
  //         }),
  //       )
  //     } else {
  //       dispatch(fetchExperimentWorkflows(experimentId || ""))
  //     }
  //   }
  // }, [experiment])

  // TODO: Enable this for live data
  useEffect(() => {
    const fetchWorkflows = () => {
      if (!experiment.loading && experiment.data) {
        // TODO: Remove this if statement when no longer needed
        if (experimentId === "ideko" || experimentId === "I2Cat_phising") {
          dispatch(
            fetchExperimentWorkflowsTesting({
              experimentId: experimentId || "",
              workflowIds: experiment.data.workflow_ids,
            }),
          )
        } else {
          dispatch(fetchExperimentWorkflows(experimentId || ""))
        }
      }
    }
    fetchWorkflows()
    // TODO: Remove this if statement when no longer needed
    if (experimentId !== "ideko" && experimentId !== "I2Cat_phising") {
    intervalId.current = setInterval(fetchWorkflows, 5000)
    }

    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current)
      }
    }
  }, [experiment])

  // TODO: Enable this for live data
  useEffect(() => {
    if (workflows.data && workflows.data.length > 0) {
      dispatch(updateTabs({workflows, tabs}))
      workflows.data.every(workflow => workflow.status === "completed") &&
        intervalId.current &&
        clearInterval(intervalId.current)
    }
  }, [workflows])

  const handleChange =
    (newValue: number | string) => (event: React.SyntheticEvent) => {
      if (value === newValue) return
      setValue(newValue)
      window.scrollTo(0, 0)
    }

  return (
    <>
      {!initialization ? (
        <ProgressPageLoading />
      ) : (
        <Grid
          sx={{
            maxWidth: "100vw",
            minHeight: "100vh",
            flexDirection: "column",
            display: "flex",
            rowGap: 3,
          }}
        >
          <Box
            key={"progress-page-title"}
            sx={{
              width: "inherit",
              px: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box className={"progress-page-description"}>
              <Box
                sx={{
                  display: "flex",
                  borderBottom: `1px solid ${grey[500]}`,
                }}
              >
                <Typography fontSize={"2rem"} sx={{ fontWeight: 600 }}>
                  {experiment.data?.name || "Experiment Name"}
                </Typography>
              </Box>
              <Box>
                <Typography fontSize={"1rem"}>
                  {
                    "Description: Improve accuracy in the anomaly prediction classification"
                  }
                </Typography>
              </Box>
            </Box>
            <Box className={"progress-page-actions"}>
              <PauseIcon
                onClick={() => console.log("clicked")}
                sx={{
                  cursor: "pointer",
                  color: theme => theme.palette.primary.main,
                }}
                fontSize="large"
              />
              <StopIcon
                onClick={() => console.log("clicked")}
                sx={{
                  cursor: "pointer",
                  color: theme => theme.palette.primary.main,
                }}
                fontSize="large"
              />
            </Box>
          </Box>
          <Box key="progress-tabs">
            {/* <ProgressPageTabs value={value} handleChange={handleChange} /> */}
            <ProgressPageTab value={value} handleChange={handleChange} />
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
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    rowGap: 6,
                    px: [0, 3, 8, 15],
                  }}
                >
                  <ParallelCoordinatePlot />
                  <WorkflowTable handleChange={handleChange} />
                  <ScheduleTable />
                </Box>
              </>
            )}
            {value !== "progress" && value !== "compare-completed" && (
              <WorkflowTab workflowId={value} />
            )}
            {value === "compare-completed" && <CompareCompleted />}
          </Box>
        </Grid>
      )}
    </>
  )
}

export default ProgressPage
