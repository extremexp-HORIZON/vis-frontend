import Box from "@mui/material/Box"
import { useEffect } from "react"
import Typography from "@mui/material/Typography"
import { RootState, useAppDispatch, useAppSelector } from "../../../store/store"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { Tabs, Tab, Paper } from "@mui/material"
import DataExplorationComponent from "../../Tasks/DataExplorationTask/ComponentContainer/DataExplorationComponent"
import { initTab } from "../../../store/slices/workflowPageSlice"
import WorkflowMetrics from "./workflow-metrics"
import WorkflowDetails from "./workflow-details"
import RuntimeDecomposition from "./WorkflowMetricDetailsItems/runtime-decomposition"
import DataTab from "../../Tasks/DataExplorationTask/ComponentContainer/data-exploration-data-tab"
import StaticDirectedGraph from "./worfklow-flow-chart"
import WorkflowTreeView from "./workflow-tree-view"

const WorkflowTab = () => {
  const { tab } = useAppSelector((state: RootState) => state.workflowPage)
  const { workflows } = useAppSelector((state: RootState) => state.progressPage)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const workflowId = searchParams.get("workflowId")
  const task = searchParams.get("task")
  const tabParam = searchParams.get("tab")
  const selectedTab = tabParam ?? (task ? "metrics" : "details")
  const dispatch = useAppDispatch()
  const { experimentId } = useParams()

  useEffect(() => {
    if (!workflows.data.find(workflow => workflow.id === workflowId))
      navigate(`/${experimentId}/monitoring`)
    else dispatch(initTab({ tab: workflowId, workflows }))
  }, [workflows])

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.set("tab", newValue)
    navigate({ search: `?${newParams.toString()}` }, { replace: true })
  }

  return (
    <Box sx={{height: "100%", display: "flex", flexDirection: "column"}}>
      <Box padding={1}>
        <StaticDirectedGraph
          workflowSvg={tab?.workflowSvg.data || null}
          params={tab?.workflowConfiguration.params}
          handleOpenTask={function (taskName: string): void {
            throw new Error("Function not implemented.")
          }}
        />
      </Box>
      <Box sx={{px: 2, pb: 1, flex: 1, height: "100%", display: "flex", direction: "row", gap: 1, overflow: "hidden"}}>
        <Paper sx={{ width: "25%", height: "100%", overflow: "auto" }}>
          <WorkflowTreeView />
        </Paper>
        <Paper sx={{width: "75%", height: "100%", overflow: "auto"}}>
          CONTENT
        </Paper>
      </Box>
    </Box>
  )
}

export default WorkflowTab

// <Box
// sx={{
//   borderColor: theme => theme.palette.customGrey.main,
//   borderBottomWidth: 2,
//   borderBottomStyle: "solid",
//   width: "100%",
//   px: 2,
// }}
// >
// <Tabs
//   value={selectedTab}
//   onChange={handleTabChange}
// >
//   {!task && <Tab label="DETAILS" value="details" />}
//   <Tab label="METRICS" value="metrics" />
//   { !task && <Tab label="SYSTEM" value ="system" /> }
//   <Tab label="DATA" value="data"/>
//   { task && <Tab label="FEEDBACK" value ="feedback"/> }
//   { task && <Tab label="EXPLAΝΑTIONS" value ="explanations"/> }
// </Tabs>
// </Box>

// {/* Tab Content */}
// <Box sx={{ overflow: "auto", px: 2, height: "100%" }}>
// {selectedTab === "details" && (
//   <WorkflowDetails />
// )}
// {selectedTab === "metrics" && tab?.workflowMetrics?.data && (
//   <WorkflowMetrics />
// )}
// {selectedTab === "system" && <RuntimeDecomposition/>}

// {selectedTab === "data" && (
//   <DataTab />
// )}

// {selectedTab === "feedback" && <Typography>Feedback Content</Typography>}

// {selectedTab === "explanations" && <Typography>Explanations Content</Typography>}
// </Box>
