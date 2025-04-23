import { Box, IconButton, Typography, CircularProgress } from "@mui/material"
import ProgressPageBar from "./progress-page-bar"
import PauseIcon from "@mui/icons-material/Pause"
import StopIcon from "@mui/icons-material/Stop"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import type { RootState} from "../../store/store";
import { useAppSelector, useAppDispatch } from "../../store/store"
import Rating from "@mui/material/Rating";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useEffect } from "react"
import { setProgressBarData } from "../../store/slices/progressPageSlice"
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import PauseCircleRoundedIcon from '@mui/icons-material/PauseCircleRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';

const ExperimentControls = () => {
  const [ searchParams ] = useSearchParams()
  const navigate = useNavigate()
  const workflowId = searchParams.get("workflowId")
  const { progressBar, workflows } = useAppSelector(
    (state: RootState) => state.progressPage
  )
  const { experimentId } = useParams()
  const dispatch = useAppDispatch()
  const workflow = workflows.data.find(workflow => workflow.id === workflowId)
  const workflowStatus = workflow?.status
  const completedTasks = workflow?.tasks?.filter(task => task.endTime).length
  const taskLength = workflow?.tasks?.length

  let workflowIcon;

  switch (workflowStatus) {
    case "COMPLETED":
      workflowIcon = <CheckCircleIcon fontSize="small" color="success" />;
      break;
    case "FAILED":
    case "KILLED":
      workflowIcon = <ErrorIcon fontSize="small" color="error" />;
      break;
    case "RUNNING":
      workflowIcon = <AutorenewRoundedIcon fontSize="small" color="primary" />;
      break;
    case "STOPPED":
      workflowIcon = <StopRoundedIcon fontSize="small" color="primary" />;
      break;
    case "PAUSED":
      workflowIcon = <PauseCircleRoundedIcon fontSize="small" color="primary" />;
      break;
    default:
      break;
  }
  

    useEffect(() => {
      if (workflows.data.length > 0) {
        const total = workflows.data.length
        const completed = workflows.data.filter(
          workflow => workflow.status === "COMPLETED",
        ).length
        const running =
          workflows.data.filter(
            workflow => workflow.status === "SCHEDULED",
          ).length +
          workflows.data.filter(workflow => workflow.status === "RUNNING")
            .length
        const failed = workflows.data.filter(
          workflow => workflow.status === "FAILED",
        ).length
        const progress = Math.round(((completed + failed) / total) * 100)
        dispatch(setProgressBarData({ total, completed, running, failed, progress }))
      }
    }, [workflows])

    return (
      <Box
        sx={{
          borderColor: theme => theme.palette.customGrey.main,
          borderBottomWidth: 2,
          borderBottomStyle: "solid",
          height: "64px", // Fixed height to match left menu header
          boxSizing: "border-box",
          padding: 1,
          display: "flex",
          alignItems: "center"
        }}
      >
        <Box
          key={"progress-page-experiment-controls"}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            width: "100%",
            height: "100%"
          }}
        >
          {!workflowId ? (
            <>
              <Box className={"progress-page-bar"} sx={{flex: 1}}>
                <ProgressPageBar />
              </Box>
              <Box className={"progress-page-actions"} >
                <IconButton onClick={() => console.log("Paused")} color="primary">
                  <PauseIcon fontSize="large" />
                </IconButton>
                <IconButton onClick={() => console.log("Stopped")} color="primary">
                  <StopIcon fontSize="large" />
                </IconButton>
              </Box>
            </>
          ) : (
            <>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 4 }}>
                <ArrowBackIcon
                  sx={{ fontSize: 24, cursor: "pointer", color: "grey" }}
                  onClick={() => navigate(`/${experimentId}/monitoring`)}
                />
                <Box sx={{display: "flex", flexDirection: "column"}}>
                  <Box sx={{display: "flex", flexDirection: "row", gap: 1}}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {`Workflow ${workflowId}`}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>-</Typography>
                    <Rating name="simple-uncontrolled" size="large" defaultValue={2} />
                  </Box>
                  <Box sx={{display: "flex", flexDirection: "row",alignItems: "center", gap: 1}}>
                    <Typography variant="body2">Status: {workflowStatus?.toLowerCase()}</Typography>
                    {workflowIcon}
                    {taskLength && <Typography variant="body2">Completed Tasks: {completedTasks}/{taskLength}</Typography>}
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", }}>
                <Box sx={{ position: "relative", display: "inline-flex" }}>
                  <CircularProgress
                    variant="determinate"
                    value={progressBar.progress}
                    size={50}
                    thickness={5}
                    sx={{ color: (theme) => theme.palette.primary.main }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      fontSize: "0.6rem",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    {`${Math.round(progressBar.progress)}%`}
                  </Box>
                </Box>
                <IconButton onClick={() => console.log("Paused")} color="primary">
                  <PauseIcon fontSize="large" />
                </IconButton>
                <IconButton onClick={() => console.log("Stopped")} color="primary">
                  <StopIcon fontSize="large" />
                </IconButton>
              </Box>
            </>
          )}
        </Box>
      </Box>
    )
}

export default ExperimentControls