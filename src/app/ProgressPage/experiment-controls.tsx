import { Box, IconButton, Typography, CircularProgress, Tooltip } from "@mui/material"
import ProgressPageBar from "./progress-page-bar"
import PauseIcon from "@mui/icons-material/Pause"
import StopIcon from "@mui/icons-material/Stop"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useAppSelector, RootState, useAppDispatch } from "../../store/store"
import Rating from "@mui/material/Rating";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useEffect } from "react"
import { setProgressBarData } from "../../store/slices/progressPageSlice"
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'

const ExperimentControls = () => {
  const { experimentId } = useParams()
  const [ searchParams ] = useSearchParams()
  const navigate = useNavigate()
  const workflowId = searchParams.get("workflowId")
  const task = searchParams.get("task")
  const { progressBar, workflows } = useAppSelector(
    (state: RootState) => state.progressPage
  )
  const dispatch = useAppDispatch()
  const currentTask = workflows.data.find(workflow => workflow.id === workflowId)?.
    tasks?.find(t => t.name === task)
  const params = workflows.data.find(workflow => workflow.id === workflowId)?.params.filter(param => param.task === task)
  const paramsString = params?.map(param => `${param.name}: ${param.value}`).join(', ')

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
        }}
      >
        <Box
          key={"progress-page-experiment-controls"}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: {md: "15%"},
              height: "100%", // Make the box take full height
              borderColor: theme => theme.palette.customGrey.main,
              borderRightWidth: 2,
              borderRightStyle: "solid",
              padding: 1, 
            }}
          >
            <Box
              component="img"
              src="/images\extremexp-logo-removebg-preview.png"
              alt="ExtremeXP logo"
              sx={{
                width: "50px",
                borderRadius: "8px",
                objectFit: "cover",
                userSelect: "none",
              }}
            />
            <Box
              sx={{
                whiteSpace: 'nowrap',
                overflow: "hidden"
              }}
            >
              <Tooltip title={experimentId} arrow>
                <Typography variant="h6" sx={{ fontWeight: "bold" }} noWrap>
                  {experimentId}
                </Typography>
              </Tooltip>
            </Box>
          </Box>
          {!workflowId ? (
            <>
              <Box className={"progress-page-bar"} sx={{flex: 4}}>
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
                  onClick={() => navigate(-1)}
                />
                {
                  task ? (
                    <Box sx={{display: "flex", flexDirection: "column"}}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {`${workflowId} / ${currentTask?.variant ? currentTask?.variant : currentTask?.name}`}
                      </Typography>
                      {
                        currentTask?.endTime && currentTask?.startTime ? (
                        <Box sx={{display: "flex", flexDirection: "row", gap: 1}}>
                          <Typography variant="body2">Status: completed</Typography>
                          <CheckCircleIcon fontSize="small" color="success" />
                          <Typography variant="body2">Duration: {(currentTask?.endTime - currentTask?.startTime)/1000}sec</Typography>
                          {paramsString && <Typography variant="body2">Parameters:</Typography>}
                          {paramsString && <Typography variant="body2">{paramsString}</Typography>}
                        </Box>
                        ) : (
                          <Box sx={{display: "flex", flexDirection: "row", gap: 0.5}}>
                            <Typography variant="body2">status: waiting feedback</Typography>
                            <ErrorIcon fontSize="small" color="error" />
                            {paramsString && <Typography variant="body2">Parameters:</Typography>}
                            {paramsString && <Typography variant="body2">{paramsString}</Typography>}
                          </Box>
                        )
                      }
                    </Box>
                  ) : (
                    <>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {`Workflow ${workflowId}`}
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>-</Typography>
                      <Rating name="simple-uncontrolled" size="large" defaultValue={2} />
                    </>
                  )
                }
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