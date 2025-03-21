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
            sx = {{
              position: "fixed",
              width: "16.6667%",
              height: "100%",
            }}
          >
            <LeftMenu />
          </Grid>
          <Grid
            item
            xs={10}
            sx={{
              flexDirection: "column",
              display: "flex",
              height:"100%",
              marginLeft: "16.6667%"
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                mt: 2,
                rowGap: 2,
                height:"98%",
                overflow: "hidden"
              }}
            >
              {children}
            </Box>
          </Grid>
        </Grid>
      )}  
    </>
  ) 
}

export default ProgressPage
