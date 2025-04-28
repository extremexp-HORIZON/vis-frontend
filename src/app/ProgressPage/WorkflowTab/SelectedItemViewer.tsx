import { Paper, Typography, Divider, Box } from "@mui/material"
import { useAppSelector } from "../../../store/store"
import DataExplorationComponent from "../../Tasks/DataExplorationTask/ComponentContainer/DataExplorationComponent"
import { WorkflowMetricChart } from "./workflow-metric-chart"
import WorkflowTaskOverview from "./workflow-task-overview"
import InfoMessage from "../../../shared/components/InfoMessage"
import AssessmentIcon from "@mui/icons-material/Assessment"
import WorkflowParameter from "./workflow-parameter"
import DatasetIcon from "@mui/icons-material/Dataset"
import Grid3x3Icon from "@mui/icons-material/Grid3x3"
import BarChartIcon from "@mui/icons-material/BarChart"
import theme from "../../../mui-theme"
import ModelAnalysisTask from "../../Tasks/ModelAnalysisTask/model-analysis-task"

const SelectedItemViewer = () => {
  const { selectedItem, selectedTask } = useAppSelector(
    state =>
      state.workflowPage.tab?.dataTaskTable ?? {
        selectedItem: null,
        selectedTask: null,
        selectedDataset: null,
      },
  )

  // Enhanced header component for consistency
  const Header = ({ title, icon }: { title: string; icon: React.ReactNode }) => (
    <Box sx={{ 
      pt: 0, 
      px: 0, 
      borderBottom: `1px solid ${theme.palette.divider}`,
      bgcolor: 'background.paper',
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      p: 2,
    }}>
      {icon}
      <Typography variant="h6" sx={{ fontWeight: 500, color: theme.palette.text.primary }}>
        {title}
      </Typography>
    </Box>
  );

  if (selectedTask?.role === "TASK") {
    return (
      <Box sx={{height: "100%", display: "flex", flexDirection: "column"}}>
        <Header 
          title={`${selectedTask?.variant || selectedTask?.task} Overview`} 
          icon={<AssessmentIcon color="primary" />} 
        />
        <Box sx={{ px: 3, py: 2, flexGrow: 1, overflow: "auto" }}>
          <WorkflowTaskOverview />
        </Box>
      </Box>
    )
  }

  if (selectedItem?.type === "DATASET" ) {
    return (
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Header 
          title={`${selectedItem.data.name} Details`} 
          icon={<DatasetIcon color="primary" />} 
        />
        <Box sx={{ px: 3, py: 2, flexGrow: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
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
        <Header 
          title={`${selectedItem.data.name} Details`} 
          icon={<Grid3x3Icon color="primary" />} 
        />
        <Box sx={{ px: 3, py: 2, flexGrow: 1, overflow: "auto" }}>
          <WorkflowParameter />
        </Box>
      </Box>
    )
  }
  
  if (selectedItem?.type === "metric") {
    return (
      <Box sx={{height: "100%", display: "flex", flexDirection: "column"}}>
        <Header 
          title={`${selectedItem.data.name} Details`} 
          icon={<BarChartIcon color="primary" />} 
        />
        <Box sx={{ px: 3, py: 2, flexGrow: 1, overflow: "auto" }}>
          <WorkflowMetricChart />
        </Box>
      </Box>
    )
  }

  if (selectedItem?.type === "explains") {
    return (
      <Box sx={{height: "100%", display: "flex", flexDirection: "column"}}>
        <Header 
          title={`${selectedItem.data.task} Explanations`} 
          icon={<AssessmentIcon color="primary" />} 
        />
        <Box sx={{ px: 3, py: 2, flexGrow: 1,overflow: "auto" }}>
            <ModelAnalysisTask />
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