import Box from "@mui/material/Box"
import WorkflowMetrics from "./workflow-metrics"
import ModelAnalysisTask from "../../Tasks/ModelAnalysisTask/model-analysis-task"
import WorkflowDetails from "./workflow-configuration"
import WorkflowSvg from "./workflow-svg"
import { useState } from "react"
import Typography from "@mui/material/Typography"
import WorkflowPlaceholder from "./workflow-placeholder"
import DataExploration from "../../Tasks/DataExplorationTask/data-exploration"
import WorkflowConfiguration from "./workflow-configuration"

const WorkflowTab = () => {

  const [chosenTask, setChosenTask] = useState<string | null>(null)

  const taskProvider = (taskId: string | null) => {
    switch (taskId) {
      case "I2Cat_Dataset": return <DataExploration />
      case "Model_Training": return <ModelAnalysisTask variantId={71} />
      case null: return <WorkflowPlaceholder />
    }
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", rowGap: 2, mb: 1 }}>
      <Box key="workflow-svg">
        <WorkflowSvg setChosenTask={setChosenTask} chosenTask={chosenTask}/>
      </Box>
      <Box
        key="workflow-configuration"
        sx={{ display: "flex", flexDirection: "column", rowGap: 2 }}
      >
        <Box key="workflow-configuration-title">
          <Typography
            variant="body1"
            sx={{ fontWeight: 600, fontSize: "1.5rem" }}
          >
            Workflow1 Configuration
          </Typography>
        </Box>
        <Box key="workflow-configuration-items">
          <WorkflowConfiguration />
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
      <Box key="workflow-task">
        {taskProvider(chosenTask)}
      </Box>
    </Box>
  )
}

export default WorkflowTab;
