import Box from "@mui/material/Box"
import type { ReactNode } from "react";
import { useEffect, useRef } from "react"
import type { RootState} from "../../store/store";
import { useAppDispatch, useAppSelector } from "../../store/store"
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom"
import {
  fetchExperiment,
  fetchExperimentWorkflows,
  setMenuOptions,
} from "../../store/slices/progressPageSlice"
import ProgressPageLoading from "./progress-page-loading"
import LeftMenu from "./left-menu"
import ExperimentControls from "./experiment-controls"

interface ProgressPageProps {
  children?: ReactNode;
}


const ProgressPage = (props: ProgressPageProps) => {
  const { experiment, workflows, initialization, menuOptions } = useAppSelector(
    (state: RootState) => state.progressPage,
  )
  const { experimentId } = useParams()
  const [ searchParams ] = useSearchParams()
  const dispatch = useAppDispatch()
  const intervalId = useRef<NodeJS.Timeout | null>(null)
  const { children } = props
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const pathParts = location.pathname.split("/").filter(Boolean);

    if (pathParts.length === 1) {
      navigate(`/${experimentId}/monitoring`, {replace: true});
    }
    if(location.pathname.includes("workflow") && !searchParams.has("workflowId")) 
      navigate(`/${experimentId}/monitoring`, {replace: true});

    if(location.pathname.includes("workflow")) dispatch(setMenuOptions({...menuOptions, selected: "monitoring"}))
    else dispatch(setMenuOptions({...menuOptions, selected: pathParts[1]}))
  }, [location, history]);

  useEffect(() => {
    if (experimentId && experimentId !== experiment.data?.id) {
        dispatch(fetchExperiment(experimentId))
    }
  }, [])

  // TODO: Enable this for live data
  useEffect(() => {
    const fetchWorkflows = () => {
      if (!experiment.loading && experiment.data) {
          dispatch(fetchExperimentWorkflows(experimentId || ""))
      }
    }
    fetchWorkflows()
    // TODO: Remove this if statement when no longer needed
    // if (experimentId !== "ideko" && experimentId !== "I2Cat_phising") {
    // intervalId.current = setInterval(fetchWorkflows, 5000)
    // }

    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current)
      }
    }
  }, [experiment])

  // TODO: Enable this for live data
  useEffect(() => {
    if (workflows.data && workflows.data.length > 0) {
      workflows.data.every(workflow => workflow.status === "COMPLETED") &&
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
          sx={{
            height: "100vh", 
            width:"100vw",
            display: "flex",
          }}
        >
          {/* Left Menu - Full Height */}
          <Box
            sx={{
              width: !menuOptions.collapsed ? "calc(15% + 16px)" : "56px",
              height: "100%",
              transition: "width 0.3s ease",
              flexShrink: 0
            }}
          >
            <LeftMenu />
          </Box>
          
          {/* Right Content Area */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              width: !menuOptions.collapsed ? "calc(85% - 16px)" : "calc(100% - 56px)",
              transition: "width 0.3s ease",
            }}
          >
            {/* Experiment Controls */}
            <Box sx={{ width: "100%"}}>
              <ExperimentControls />
            </Box>
            
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                rowGap: 2,
                flexGrow: 1,
                overflow: "hidden", // Prevent overflow
                width: "100%",
                boxSizing: "border-box" 
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
