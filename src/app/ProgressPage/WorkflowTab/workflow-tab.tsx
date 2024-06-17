import { Typography } from "@mui/material"
import Box from "@mui/material/Box"
import WorkflowMetrics from "./workflow-metrics"

const WorkflowTab = () => {
  return (
    <Box>
      <Box key="workflow-details">
        <Box>
          <Typography
            variant="body1"
            sx={{ fontWeight: 600, fontSize: "1.5rem" }}
          >
            Workflow1 details
          </Typography>
        </Box>
        <Box></Box>
      </Box>
      <Box key="workflow-metrics">
        <Box key="workflow-metrics-title">
          <Typography
            variant="body1"
            sx={{ fontWeight: 600, fontSize: "1.5rem" }}
          >
            Workflow1 metrics
          </Typography>
        </Box>
        <Box key="workflow-metrics-items">
          <WorkflowMetrics />
        </Box>
      </Box>
      <Box key="workflow-svg"></Box>
      <Box key="workflow-task"></Box>
    </Box>
  )
}

export default WorkflowTab
