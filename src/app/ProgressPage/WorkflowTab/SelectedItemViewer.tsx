import { Paper, Typography, Divider, Box } from "@mui/material"
import { useAppSelector } from "../../../store/store"
import DataExplorationComponent from "../../Tasks/DataExplorationTask/ComponentContainer/DataExplorationComponent"
import { WorkflowMetricChart } from "./workflow-metric-chart"
import WorkflowTaskOverview from "./workflow-task-overview"
import InfoMessage from "../../../shared/components/InfoMessage"
import AssessmentIcon from "@mui/icons-material/Assessment"
import WorkflowParameter from "./workflow-parameter"


const SelectedItemViewer = () => {
  const { selectedItem, selectedTask } = useAppSelector(
    state =>
      state.workflowPage.tab?.dataTaskTable ?? {
        selectedItem: null,
        selectedTask: null,
        selectedDataset: null,
      },
  )

  if (selectedTask?.role === "TASK") {
    return (
      <Box sx={{height: "100%"}}>
        <Box sx={{ pt: 3, px: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {selectedTask?.variant || selectedTask?.task} Overview
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Box>
        <Box sx={{ px: 3, pb: 1, flexGrow: 1,overflow: "auto" }}>
          <Box>
            <WorkflowTaskOverview />
          </Box>
        </Box>
      </Box>
    )
  }

  // if (selectedTask?.role === "DATA_ASSETS") {
  //   return (
  //     <Paper sx={{ p: 3, height: "100%", overflow: "auto" }}>
  //       <Typography variant="h6" sx={{ mb: 1 }}>
  //         Data Overview
  //       </Typography>
  //       <Divider sx={{ mb: 2 }} />
  //     </Paper>
  //   )
  // }

  // if (selectedTask?.role === "Parameters") {
  //   return (
  //     <Paper sx={{ p: 3, height: "100%", overflow: "auto" }}>
  //       <Typography variant="h6" sx={{ mb: 1 }}>
  //         Variability Overview
  //       </Typography>
  //       <Divider sx={{ mb: 2 }} />
  //     </Paper>
  //   )
  // }

  // if (selectedTask?.role === "Metrics") {
  //   return (
  //     <Paper sx={{ p: 3, height: "100%", overflow: "auto" }}>
  //       <Typography variant="h6" sx={{ mb: 1 }}>
  //         Metrics Overview
  //       </Typography>
  //       <Divider sx={{ mb: 2 }} />
  //     </Paper>
  //   )
  // }

  if (selectedItem?.type === "DATASET" ) {
    return (
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Box sx={{ pt: 3, px: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {selectedItem.data.name} Details
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Box>
          
        <Box sx={{ px: 3, pb: 1, flexGrow: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <Box sx={{ overflow: "auto", height: "100%" }}>
            <DataExplorationComponent />
          </Box>
        </Box>
      </Box>
    )
  }
  if (selectedItem?.type === "param") {
    return (
      <Box sx={{height: "100%", display: "flex", flexDirection: "column"}}>
        <Box sx={{ pt: 3, px: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {selectedItem.data.name} Details
          </Typography>
        <Divider sx={{ mb: 2 }} />
        </Box>
        <Box sx={{ px: 3, pb: 1, flexGrow: 1,overflow: "auto" }}>
          <Box>
            <WorkflowParameter />
          </Box>
        </Box>
      </Box>
    )
  }
  if (selectedItem?.type === "metric") {
    return (
      <Box sx={{height: "100%", display: "flex", flexDirection: "column"}}>
        <Box sx={{ pt: 3, px: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {selectedItem.data.name} Details
          </Typography>
        <Divider sx={{ mb: 2 }} />
        </Box>
        <Box sx={{ px: 3, pb: 1, flexGrow: 1,overflow: "auto" }}>
          <Box>
            <WorkflowMetricChart />
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <InfoMessage 
      message="No selection yet. Click a task or item to view its details."
      type="info"
      icon={<AssessmentIcon sx={{ fontSize: 40, color: "info.main" }} />}
      fullHeight
    />
  )
}

export default SelectedItemViewer
