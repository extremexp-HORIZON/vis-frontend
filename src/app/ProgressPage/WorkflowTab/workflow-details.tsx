import { Box, Typography } from "@mui/material"
import StaticDirectedGraph from "./worfklow-flow-chart"
import WorkflowTaskConfiguration from "./workflow-task-configuration"
import { useAppSelector, RootState } from "../../../store/store"
import { useLocation, useNavigate } from "react-router-dom"
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded"
import InfoMessage from "../../../shared/components/InfoMessage"

const WorkflowDetails = () => {
    const { tab } = useAppSelector((state: RootState) => state.workflowPage)
    const location = useLocation()
    const navigate = useNavigate()


    const handleOpenTask = (taskName: string) => {
      const currentParams = new URLSearchParams(location.search)
      currentParams.set('task', taskName)
      currentParams.delete('tab')
      navigate({
        pathname: location.pathname,
        search: `?${currentParams.toString()}`,
      })
    }

    if(!tab?.workflowConfiguration?.tasks?.length) return (
      <InfoMessage 
        message="This workflow has no task details."
        type="info"
        icon={<ReportProblemRoundedIcon sx={{ fontSize: 40, color: "info.main" }} />}
        fullHeight
      />
    )

    return (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2}}>
          <Box key="workflow-flow-chart" sx={{width: "100%" }}>
            <StaticDirectedGraph workflowSvg={tab?.workflowSvg.data || null} params={tab?.workflowConfiguration.params} handleOpenTask={handleOpenTask}/>
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
                handleOpenTask={handleOpenTask}
              />
            </Box>
          </Box>
        </Box>
        
    )
}

export default WorkflowDetails