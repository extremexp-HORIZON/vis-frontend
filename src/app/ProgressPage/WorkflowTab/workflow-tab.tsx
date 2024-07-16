import Box from "@mui/material/Box"
import WorkflowMetrics from "./workflow-metrics"
import ModelAnalysisTask from "../../Tasks/ModelAnalysisTask/model-analysis-task"
import WorkflowSvg from "./workflow-svg"
import { useState } from "react"
import Typography from "@mui/material/Typography"
import DataExploration from "../../Tasks/DataExplorationTask/data-exploration"
import { RootState, useAppSelector } from "../../../store/store"
import WorkflowMetricDetails from "./workflow-metric-details"
import WorkflowTaskConfiguration from "./workflow-task-configuration"
import { IWorkflowTabModel } from "../../../shared/models/workflow.tab.model"
import { ICompareCompletedTab } from "../../../shared/models/compare.completed.tab.model"

interface IWorkflowTab {
  workflowId: number | string
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
        return null
    }
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", rowGap: 2, mb: 3 }}>
      <Box key="workflow-svg">
        <WorkflowSvg setChosenTask={setChosenTask} chosenTask={chosenTask} />
      </Box>
      <Box
        key="task-configuration"
        sx={{ display: "flex", flexDirection: "column", rowGap: 2 }}
      >
        <Box key="task-configuration-title">
          <Typography
            variant="body1"
            sx={{ fontWeight: 600, fontSize: "1.5rem" }}
          >
            Workflow Configuration
          </Typography>
        </Box>
        <Box key="task-configuration-items">
          <WorkflowTaskConfiguration
            variants={
              (
                tabs.find(
                  tab => tab.workflowId === workflowId,
                ) as IWorkflowTabModel
              )?.workflowConfiguration.data || null
            }
          />
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
          <WorkflowMetrics
            metrics={
              (
                tabs.find(
                  tab => tab.workflowId === workflowId,
                ) as IWorkflowTabModel
              )?.workflowMetrics.data || null
            }
          />
        </Box>
      </Box>
      {chosenTask ? (
        <Box key="workflow-task">{taskProvider(chosenTask)}</Box>
      ) : (
        <Box
          key="workflow-metric-details"
          sx={{ display: "flex", flexDirection: "column", rowGap: 2 }}
        >
          <Box key="workflow-metric-details-title">
            <Typography
              variant="body1"
              sx={{ fontWeight: 600, fontSize: "1.5rem" }}
            >
              Metric Details
            </Typography>
          </Box>
          <Box key="workflow-metric-details-items">
            <WorkflowMetricDetails
              metrics={
                (
                  tabs.find(
                    tab => tab.workflowId === workflowId,
                  ) as IWorkflowTabModel
                )?.workflowMetrics.data || null
              }
              workflowId={workflowId}
            />
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default WorkflowTab
