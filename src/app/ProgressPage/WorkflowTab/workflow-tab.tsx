import Box from "@mui/material/Box"
import WorkflowMetrics from "./workflow-metrics"
import ModelAnalysisTask from "../../Tasks/ModelAnalysisTask/model-analysis-task"
import WorkflowDetails from "./workflow-details"
import WorkflowSvg from "./workflow-svg"
import { useState } from "react"
import Typography from "@mui/material/Typography"

const WorkflowTab = () => {

  const [choosenTask, setChoosenTask] = useState(null)

  return (
    <Box sx={{ display: "flex", flexDirection: "column", rowGap: 2, mb: 1 }}>
      <Box
        key="workflow-details"
        sx={{ display: "flex", flexDirection: "column", rowGap: 2 }}
      >
        <Box key="workflow-details-title">
          <Typography
            variant="body1"
            sx={{ fontWeight: 600, fontSize: "1.5rem" }}
          >
            Workflow1 details
          </Typography>
        </Box>
        <Box key="workflow-details-items">
          <WorkflowDetails />
        </Box>
      </Box>
      <Box
        key="workflow-metrics"
        sx={{ display: "flex", flexDirection: "column", rowGap: 2 }}
      >
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
      <Box key="workflow-svg">
        <WorkflowSvg />
      </Box>
      <Box key="workflow-task">
        <ModelAnalysisTask variantId={71} />
      </Box>
    </Box>
  )
}

export default WorkflowTab
