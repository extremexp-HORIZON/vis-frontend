import Box from "@mui/material/Box"
import { useEffect, useState } from "react"
import Typography from "@mui/material/Typography"
import { RootState, useAppDispatch, useAppSelector } from "../../../store/store"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { Tabs, Tab, Card } from "@mui/material"
import DataExplorationComponent from "../../Tasks/DataExplorationTask/ComponentContainer/DataExplorationComponent"
import { initTab } from "../../../store/slices/workflowPageSlice"
import WorkflowMetrics from "./workflow-metrics"
import WorkflowDetails from "./workflow-details"

const WorkflowTab = () => {
  const { tab } = useAppSelector((state: RootState) => state.workflowPage)
  const { workflows } = useAppSelector((state: RootState) => state.progressPage)
  const navigate = useNavigate()
  const [selectedTabs, setSelectedTabs] = useState(0)
  const [searchParams] = useSearchParams()
  const workflowId = searchParams.get("workflowId")
  const dispatch = useAppDispatch()
  const { experimentId } = useParams()
  const [chosenTask, setChosenTask] = useState<string | null>(null)

  useEffect(() => {
    if (!workflows.data.find(workflow => workflow.id === workflowId))
      navigate(`/${experimentId}/monitoring`)
    else dispatch(initTab({ tab: workflowId, workflows }))
  }, [searchParams, workflows])

  return (
    <>
      {/* Sticky Header with Tabs */}
      <Box
        sx={{
          borderColor: theme => theme.palette.customGrey.main,
          borderBottomWidth: 2,
          borderBottomStyle: "solid",
          width: "100%",
          px: 2,
        }}
      >
        <Tabs
          value={selectedTabs}
          onChange={(event, newValue) => setSelectedTabs(newValue)}
          // aria-label="tab menu"
        >
          <Tab label="DETAILS" />
          <Tab label="METRICS" />
          <Tab label="SYSTEM" />
          <Tab label="DATA" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ overflow: "auto", px: 2 }}>
        {selectedTabs === 0 && (
          <WorkflowDetails />
        )}
        {selectedTabs === 1 && tab?.workflowMetrics?.data && (
          <WorkflowMetrics />
        )}
        {selectedTabs === 2 && <Typography>System Content</Typography>}

        {selectedTabs === 3 && (
          <DataExplorationComponent workflow={tab} task={null} />
        )}
      </Box>
    </>
  )
}

export default WorkflowTab
