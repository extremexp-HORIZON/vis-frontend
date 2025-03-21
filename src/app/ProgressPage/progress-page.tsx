import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import { useEffect, useRef, ReactNode } from "react"
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom"
import {
  fetchExperiment,
  fetchExperimentTesting,
  fetchExperimentWorkflows,
  fetchExperimentWorkflowsTesting,
} from "../../store/slices/progressPageSlice"
import ProgressPageLoading from "./progress-page-loading"
import { updateTabs } from "../../store/slices/workflowTabsSlice"
import LeftMenu from "./left-menu"
import ExperimentControls from "./experiment-controls"
import { useState } from "react"

interface ProgressPageProps {
  children?: ReactNode;
}


const ProgressPage = (props: ProgressPageProps) => {
  const { experiment, workflows, initialization } = useAppSelector(
    (state: RootState) => state.progressPage,
  )
  const { tabs } = useAppSelector(
    (state: RootState) => state.workflowTabs,
  )
  const { experimentId } = useParams()
  const [ searchParams ] = useSearchParams()
  const dispatch = useAppDispatch()
  const intervalId = useRef<NodeJS.Timeout | null>(null)
  const { children } = props
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState<boolean>(false)

  useEffect(() => {
    const pathParts = location.pathname.split("/").filter(Boolean);

    if (pathParts.length === 1) {
      navigate(`/${experimentId}/monitoring`, {replace: true});
    }
    if(location.pathname.includes("workflow") && !searchParams.has("workflowId")) 
      navigate(`/${experimentId}/monitoring`, {replace: true});
  }, [location, history]);

  useEffect(() => {
    if (experimentId && experimentId !== experiment.data?.id) {
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

  return (
    <>
      {!initialization ? (
        <ProgressPageLoading />
      ) : (
        <Box
          sx={{height: "100vh", width:"100vw"}}
        >
        <Box sx={{ height: {xs:"15%", xl:"10%"}, width: "100vw"}}>
          <ExperimentControls />
        </Box>
        <Box
          sx={{
            height: {xs:"85%", xl:"90%"},
            width: "100vw",
          }}
        >
            <Box
              sx={{
                position: "fixed",
                left: 0,
                width: !collapsed ? "15%" : "8%",
                height: "100%",
                transition: "width 0.3s ease",
              }}
            >
              <LeftMenu collapsed={collapsed} setCollapsed={setCollapsed} />
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                rowGap: 2,
                height:"100%",
                overflow: "hidden",
                width:  !collapsed ? "75%%" : "92%",
                marginLeft: !collapsed ? "15%" : "8%",
                transition: "margin-left 0.3s ease, width 0.3s ease",  
              }}
            >
              {children}
            </Box>
        </Box>
        </Box>
      )}  
    </>
  ) 
}

export default ProgressPage
