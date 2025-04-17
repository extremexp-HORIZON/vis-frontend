import Box from "@mui/material/Box"
import { useEffect } from "react"
import { RootState, useAppDispatch, useAppSelector } from "../../../store/store"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import {  Paper } from "@mui/material"
import { fetchWorkflowMetrics, initTab, resetWorkflowTab } from "../../../store/slices/workflowPageSlice"

import StaticDirectedGraph from "./worfklow-flow-chart"
import WorkflowTreeView from "./workflow-tree-view"
import SelectedItemViewer from "./SelectedItemViewer"

const WorkflowTab = () => {
  const { tab, isTabInitialized } = useAppSelector((state: RootState) => state.workflowPage)
  const { workflows } = useAppSelector((state: RootState) => state.progressPage)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const workflowId = searchParams.get("workflowId")
  const dispatch = useAppDispatch()
  const { experimentId } = useParams()

  useEffect(() => {
    if (!workflows.data.find(workflow => workflow.id === workflowId))
      navigate(`/${experimentId}/monitoring`)
    else dispatch(initTab({ tab: workflowId, workflows }))
  }, [workflows])

  useEffect(() => {
    const metricNames = tab?.workflowMetrics.data?.map((m) => m.name)
    if (experimentId && workflowId && metricNames && isTabInitialized) {
      dispatch(fetchWorkflowMetrics({experimentId, workflowId, metricNames}))
    }
  },[isTabInitialized])
  

  useEffect(() => {
    return () => {
      dispatch(resetWorkflowTab());
    };
  }, []);
 
  return (
    <Box sx={{height: "100%", display: "flex", flexDirection: "column", gap: 1}}>
      {(tab?.workflowConfiguration?.tasks?.length ?? 0) > 0 &&
        <Box sx={{px: 2,mt:1}}>
          <StaticDirectedGraph
            workflowSvg={tab?.workflowSvg.data || null}
            params={tab?.workflowConfiguration.params}
            handleOpenTask={function (taskName: string): void {
              throw new Error("Function not implemented.")
            }}
          />
        </Box>
      }
      <Box sx={{px: 2, pb: 1, height: "100%", display: "flex", direction: "row", gap: 1, overflow: "hidden"}}>
        <Paper elevation={2} sx={{ width: "25%", height: "100%", overflow: "auto" }}>
          <WorkflowTreeView />
        </Paper>
        <Paper elevation={2} sx={{width: "75%", height: "100%", overflow: "auto"}}>
        <SelectedItemViewer />

        </Paper>
      </Box>
      </Box>
     
  )
}

export default WorkflowTab

