import { Box, Typography } from "@mui/material"
import StaticDirectedGraph from "./worfklow-flow-chart"
import WorkflowTaskConfiguration from "./workflow-task-configuration"
import { useState } from "react"
import { useAppSelector, RootState } from "../../../store/store"

const WorkflowDetails = () => {
    const [chosenTask, setChosenTask] = useState<string | null>(null)
    const { tab } = useAppSelector((state: RootState) => state.workflowPage)

    return (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2}}>
          <Box key="workflow-flow-chart" sx={{width: "100%" }}>
            <StaticDirectedGraph setChosenTask={setChosenTask} chosenTask={chosenTask} workflowSvg={tab?.workflowSvg.data || null} params={tab?.workflowConfiguration.params} />
          </Box>
          <Box
            key="task-configuration"
            sx={{ display: "flex", flexDirection: "column", rowGap: 2, width: "100%" }}
          >
            <Box key="task-configuration-title">
              <Typography
                variant="body1"
                sx={{ fontWeight: 600 }}
              >
                Workflow Configuration
              </Typography>
            </Box>
            <Box key="task-configuration-items" sx={{pb: 1}}>
              <WorkflowTaskConfiguration
                configuration={ tab?.workflowConfiguration.tasks || null }
                params={tab?.workflowConfiguration.params || null}
              />
            </Box>
          </Box>
        </Box>
        
    )
}

export default WorkflowDetails