import Box from "@mui/material/Box"
import WorkflowMetrics from "./workflow-metrics"
import ModelAnalysisTask from "../../Tasks/ModelAnalysisTask/model-analysis-task"
import WorkflowDetails from "./WorkflowDetails"
import WorkflowSvg from "./workflow-svg"
import { useState } from "react"
import Typography from "@mui/material/Typography"
import WorkflowPlaceholder from "./workflow-placeholder"
import DataExploration from "../../Tasks/DataExplorationTask/data-exploration"
import WorkflowConfiguration from "./workflow-configuration"
import TaskConfiguration from "./task-configuration"
import { RootState, useAppSelector } from "../../../store/store"

interface IWorkflowTab {
  workflowId: number
}

const WorkflowTab = (props: IWorkflowTab) => {
  const { workflowId } = props
  const { tabs } = useAppSelector((state: RootState) => state.workflowTabs)
  const [chosenTask, setChosenTask] = useState<string | null>(null)

  const taskProvider = (taskId: string | null) => {
    switch (taskId) {
      case "I2Cat_Dataset":
        return <DataExploration />
      case "Model_Training":
        return <ModelAnalysisTask variantId={71} />
      case null:
        return <WorkflowPlaceholder />
    }
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", rowGap: 2, mb: 1 }}>
      <Box key="workflow-svg">
        <WorkflowSvg setChosenTask={setChosenTask} chosenTask={chosenTask} />
      </Box>
      {/* <Box
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
      </Box> */}
      <Box
        key="task-configuration"
        sx={{ display: "flex", flexDirection: "column", rowGap: 2 }}
      >
        <Box key="task-configuration-title">
          <Typography
            variant="body1"
            sx={{ fontWeight: 600, fontSize: "1.5rem" }}
          >
            Task Configuration
          </Typography>
        </Box>
        <Box key="task-configuration-items">
          <TaskConfiguration  variants={tabs.find(tab => tab.workflowId === workflowId)?.workflowConfiguration.data || null}/>
        </Box>
      </Box>
      <Box
        key="metric-summary"
        sx={{ display: "flex", flexDirection: "column", rowGap: 2 }}
      >
        <Box key="metric-summary-title">
          <Typography
            variant="body1"
            sx={{ fontWeight: 600, fontSize: "1.5rem" }}
          >
            Metric Summary
          </Typography>
        </Box>
        <Box key="metric-summary-items">
          <WorkflowMetrics metrics={tabs.find(tab => tab.workflowId === workflowId)?.workflowMetrics.data || null} />
        </Box>
        <Box key="summary-items">
          <WorkflowDetails/>
        </Box>
      </Box>
      {chosenTask ? (
        <Box key="workflow-task">{taskProvider(chosenTask)}</Box>
      ) : (
        <Box key="metric-details"><WorkflowPlaceholder /></Box>
      )}
    </Box>
  )
}

export default WorkflowTab
