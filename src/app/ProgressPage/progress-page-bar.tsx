import Box from "@mui/material/Box"
import LinearProgress from "@mui/material/LinearProgress"
import Typography from "@mui/material/Typography"
import workflows from "../../shared/data/workflows.json"
import { useEffect, useState } from "react"
import grey from "@mui/material/colors/grey"
import theme from "../../mui-theme"

interface IexperimentStats {
  total: number
  completed: number
  running: number
  failed: number
  progress: number
}

const experimentStatsDefault = {
  total: 0,
  completed: 0,
  running: 0,
  failed: 0,
  progress: 0,
}

const ProgressPageBar = () => {
  const [experimentStats, setExperimentStats] = useState<IexperimentStats>(
    experimentStatsDefault,
  )

  useEffect(() => {
    if (workflows) {
      const total = workflows.length
      const completed = workflows.filter(
        workflow => workflow.workflowInfo.status === "completed",
      ).length
      const running =
        workflows.filter(
          workflow => workflow.workflowInfo.status === "scheduled",
        ).length +
        workflows.filter(workflow => workflow.workflowInfo.status === "running")
          .length
      const failed = workflows.filter(
        workflow => workflow.workflowInfo.status === "failed",
      ).length
      const progress = Math.round(((completed + failed) / total) * 100)
      setExperimentStats({ total, completed, running, failed, progress })
    }
  }, [workflows])

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ minWidth: 35 }}>
          <Typography
            fontSize={"1.4rem"}
            color="text.primary"
          >{`Progress: ${Math.round(experimentStats.progress)}%`}</Typography>
        </Box>
        <Box
          sx={{ minWidth: 35, display: "flex", columnGap: 1, flexWrap: "wrap" }}
        >
          <Typography
            variant="body1"
            color="text.primary"
          >{`Completed: ${experimentStats.completed}/${experimentStats.total}`}</Typography>
          <Typography
            variant="body1"
            color="text.primary"
          >{`Running: ${experimentStats.running}/${experimentStats.total}`}</Typography>
          <Typography
            variant="body1"
            color="text.primary"
          >{`Failed: ${experimentStats.failed}/${experimentStats.total}`}</Typography>
        </Box>
      </Box>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress
          variant="determinate"
          value={Math.round(experimentStats.progress)}
          sx={{
            height: "1rem",
            borderRadius: 4,
            backgroundColor: grey[300],
            "& .MuiLinearProgress-bar": {
              background:
                theme => theme.palette.customGradient.main,
            },
          }}
        />
      </Box>
    </Box>
  )
}

export default ProgressPageBar
