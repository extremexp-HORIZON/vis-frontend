import Box from "@mui/material/Box"
import { useEffect, useRef, ReactNode } from "react"
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
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
          sx={{height: "100vh", width:"100vw"}}
        >
        <Box sx={{ width: "100vw"}}>
          <ExperimentControls />
        </Box>
        <Box
          sx={{
            height: "calc(100% - 75px)",
            width: "100vw",
          }}
        >
            <Box
              sx={{
                position: "fixed",
                left: 0,
                width: !menuOptions.collapsed ? "calc(15% + 16px)" : "56px",
                height: "100%",
                transition: "width 0.3s ease",
              }}
            >
              <LeftMenu />
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                rowGap: 2,
                height:"100%",
                overflow: "hidden",
                width:  !menuOptions.collapsed ? "calc(85% - 16px)" : "calc(100% - 56px)",
                marginLeft: !menuOptions.collapsed ? "calc(15% + 16px)" : "56px",
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
