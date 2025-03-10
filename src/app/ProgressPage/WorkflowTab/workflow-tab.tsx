import Box from "@mui/material/Box"
import WorkflowMetrics from "./workflow-metrics"
import ModelAnalysisTask from "../../Tasks/ModelAnalysisTask/model-analysis-task"
import WorkflowSvg from "./workflow-svg"
import { useState } from "react"
import Typography from "@mui/material/Typography"
import DataExplorationComponent from "../../Tasks/DataExplorationTask/ComponentContainer/DataExplorationComponent"
import { RootState, useAppSelector } from "../../../store/store"
import WorkflowMetricDetails from "./workflow-metric-details"
import WorkflowTaskConfiguration from "./workflow-task-configuration"
import { IWorkflowTabModel } from "../../../shared/models/workflow.tab.model"
import Rating from "@mui/material/Rating"
import UserInteractiveTask from "../../Tasks/UserInteractiveTask/user-interactive-task"
import StaticDirectedGraph from "./worfklow-flow-chart"

interface IWorkflowTab {
  workflowId: number | string
}

const WorkflowTab = (props: IWorkflowTab) => {
  const { workflowId } = props
  const { tabs } = useAppSelector((state: RootState) => state.workflowTabs)
  const [chosenTask, setChosenTask] = useState<string | null>(null)
  const { workflows } = useAppSelector((state: RootState) => state.progressPage)
  const selectedTab = tabs.find(tab => tab.workflowId === workflowId)

  const taskProvider = (taskType: string | null) => {
    switch (taskType) {
      case "read_data":
        return (
          <DataExplorationComponent
            workflow={tabs.find(tab => tab.workflowId === workflowId) || null}
          />
        )
      case "evaluation":
        return (
          <ModelAnalysisTask
            workflow={
              tabs.find(
                tab => tab.workflowId === workflowId,
              ) as IWorkflowTabModel
            }
          />
        )
      case "interactive":
        return (
          <UserInteractiveTask
            url={"http://163.172.30.91:5000"}
          />
        )
      case null:
        return null
    }
  }
  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "column", rowGap: 2, mb: 3 }}>
        <Box key="workflow-title" sx={{ display: "flex", flexDirection: "row", columnGap: 2, justifyContent: "left", alignItems: "center" }}>
          <Typography
            variant="body1"
            sx={{ fontWeight: 600, fontSize: "2rem" }}
          >
           {`Workflow ${workflowId}`}
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontWeight: 600, fontSize: "2rem" }}
          >
            -
          </Typography>
          <Rating
            name="simple-uncontrolled"
            size="large"
            onChange={(event, newValue) => {
              console.log(newValue)
            }}
            defaultValue={2}
          />
        </Box>
        <Box key="workflow-flow-chart">
          <StaticDirectedGraph setChosenTask={setChosenTask} chosenTask={chosenTask} workflowSvg={tabs.find(tab => tab.workflowId === workflowId)?.workflowSvg.data || null} />
        </Box>
        {chosenTask ? (
          <Box key="workflow-task">{taskProvider(chosenTask)}</Box>
        ) : (
          <>
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
                  configuration={
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
                { selectedTab && 
                (<WorkflowMetricDetails
                  key={workflowId}
                  metrics={
                    (
                      tabs.find(
                        tab => tab.workflowId === workflowId,
                      ) as IWorkflowTabModel
                    )?.workflowMetrics.data || null
                  }
                  workflowId={workflowId}
                  info={
                    (
                      workflows.data.find(
                        workflow => workflow.workflowId === workflowId,
                      ) as any
                    )?.tasks || null
                  }
                />)
                }
              </Box>
            </Box>
          </>
        )}
      </Box>
    </>
  )
}

export default WorkflowTab
