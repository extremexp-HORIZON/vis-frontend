import { Paper, Typography, Divider, Box } from "@mui/material"
import { useAppSelector } from "../../../store/store"
import DataExplorationComponent from "../../Tasks/DataExplorationTask/ComponentContainer/DataExplorationComponent"
import { MetricBulletChart } from "./WorkflowMetricDetailsItems/metric-bullet-chart"

const SelectedItemViewer = () => {
  const { selectedItem, selectedTask } = useAppSelector(
    state =>
      state.workflowPage.tab?.dataTaskTable ?? {
        selectedItem: null,
        selectedTask: null,
        selectedDataset: null,
      },
  )
  const tab = useAppSelector(state => state.workflowPage.tab)
  console.log("tab",tab?.workflowConfiguration.params)

  if (selectedTask?.role === "TASK") {
    return (
      <Box sx={{height: "100%"}}>
        <Box sx={{ p: 3, overflow: "auto" }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Task Overview
        </Typography>
        <Divider sx={{ mb: 2 }} />

        </Box>
      </Box>
    )
  }

  if (selectedTask?.role === "DATA_ASSETS") {
    return (
      <Paper sx={{ p: 3, height: "100%", overflow: "auto" }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Data Overview
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Paper>
    )
  }

  if (selectedTask?.role === "Parameters") {
    return (
      <Paper sx={{ p: 3, height: "100%", overflow: "auto" }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Variability Overview
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Paper>
    )
  }

  if (selectedTask?.role === "Metrics") {
    return (
      <Paper sx={{ p: 3, height: "100%", overflow: "auto" }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Metrics Overview
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Paper>
    )
  }

  if (selectedItem?.type === "DATASET" ) {
    return (
      <Box sx={{ p:2, height: "96%", overflow: "auto" }}>
        {/* <Typography variant="h6" sx={{ mb: 1 }}>
          {selectedItem.type} Details
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <pre style={{ fontSize: 14 }}>
          {JSON.stringify(selectedItem.data, null, 2)}
        </pre> */}
        <DataExplorationComponent />
      </Box>
    )
  }
  if (selectedItem?.type === "param") {
    return (
      <Paper sx={{ p: 3, height: "100%", overflow: "auto" }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          {selectedItem.type} Details
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <pre style={{ fontSize: 14 }}>
          {JSON.stringify(selectedItem.data, null, 2)}
        </pre>
      </Paper>
    )
  }
  if (selectedItem?.type === "metric") {
    return (
      <Box sx={{height: "100%"}}>
        <Box sx={{ p: 3, overflow: "auto" }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          {selectedItem.data.name} Details
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <MetricBulletChart />
        </Box>
      </Box>
    )
  }

  return (
    <Box justifyContent={"center"} alignItems="center" display="flex" height="100%">
      <Typography variant="body1" color="text.secondary">
        No selection yet. Click a task or item to view its details.
      </Typography>
    </Box>
  )
}

export default SelectedItemViewer
