import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import ParallelCoordinatePlot from "./parallel-coordinate-plot"
import { useEffect, useState, useRef } from "react"
import WorkflowTab from "./WorkflowTab/workflow-tab"
import WorkflowTable from "./WorkFlowTables/workflow-table"
import ScheduleTable from "./WorkFlowTables/schedule-table"
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
import CompareCompleted from "./CompareTab/CompareCompleted/compare-completed"
import ProgressPageBar from "./progress-page-bar"
import PauseIcon from "@mui/icons-material/Pause"
import StopIcon from "@mui/icons-material/Stop"
import { useParams, useLocation, useSearchParams, useNavigate } from "react-router-dom"
import {
  fetchExperiment,
  fetchExperimentTesting,
  fetchExperimentWorkflows,
  fetchExperimentWorkflowsTesting,
} from "../../store/slices/progressPageSlice"
import ProgressPageLoading from "./progress-page-loading"
import { updateTabs, initTabs } from "../../store/slices/workflowTabsSlice"
import LeftMenu from "./left-menu"

const ProgressPage = () => {
  const { experiment, workflows, initialization } = useAppSelector(
    (state: RootState) => state.progressPage,
  )
  const { tabs } = useAppSelector(
    (state: RootState) => state.workflowTabs,
  )
  const { experimentId } = useParams()
  const [ searchParams ] = useSearchParams()
  const workflowId = searchParams.get("workflowId")
  const tabsQuery = searchParams.get("tabs")
  const dispatch = useAppDispatch()
  const intervalId = useRef<NodeJS.Timeout | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const [visibleTable, setVisibleTable] = useState<string>("workflows")

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

  useEffect (() => {
    const tabsArray = tabsQuery?.split(',')
    if (workflowId && !tabsArray?.find(tabId => tabId === workflowId)) {
      const queryParams = new URLSearchParams()
      queryParams.append("workflowId", workflowId.toString())
      queryParams.append("tabs", workflowId.toString())
      navigate(`${location.pathname}?${queryParams.toString()}`, {replace: true})
    }

    if (workflows.data && workflows.data.length > 0 ) dispatch(initTabs({tabs: tabsQuery, workflows}))
  },[searchParams,workflows])  

  const handleChange =
  (newValue: number | string | null) => (event: React.SyntheticEvent) => {
    if (workflowId === newValue) return
    const queryParams = new URLSearchParams()

    if (newValue !== null) queryParams.append("workflowId", newValue.toString())

    navigate(`${location.pathname}?${queryParams.toString()}`)
    window.scrollTo(0, 0)
  }

  const handleTableChange = (newTable: string) => (event: React.SyntheticEvent) => {
    setVisibleTable(newTable)
  }

  return (
    <>
      {!initialization ? (
        <ProgressPageLoading />
      ) : (
        <Grid
          container
          spacing={0.5}
          sx={{
            height: "100vh",
          }}
        >
          <Grid
            item
            xs={2}
          >
            <LeftMenu workflowId={workflowId} />
          </Grid>
          <Grid
            item
            xs={10}
            sx={{
              flexDirection: "column",
              display: "flex",
              p: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                mt: 2,
                rowGap: 2,
              }}
            >
              {!workflowId && (
                <>
                  <Box
                    key={"progress-page-experiment-controls"}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 3
                    }}
                  >
                    <Box className={"progress-page-bar"} sx={{flex: 4}}>
                      <ProgressPageBar />
                    </Box>

                    <Box className={"progress-page-actions"} >
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
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      rowGap: 1,
                    }}
                  >
                    <ParallelCoordinatePlot />
                    {visibleTable === "workflows" ? 
                      <WorkflowTable visibleTable={visibleTable} handleChange={handleChange} handleTableChange={handleTableChange} /> :  
                      <ScheduleTable visibleTable={visibleTable} handleTableChange={handleTableChange}/>
                    }
                  </Box>
                </>
              )}
              {workflowId && workflowId !== "compare-completed" && (
                <WorkflowTab workflowId={workflowId} />
              )}
              {workflowId === "compare-completed" && <CompareCompleted />}
            </Box>
          </Grid>
        </Grid>
      )}  
    </>
  ) 
}

export default ProgressPage
