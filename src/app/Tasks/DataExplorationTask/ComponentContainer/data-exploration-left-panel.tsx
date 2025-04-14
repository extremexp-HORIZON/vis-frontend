import { useAppSelector } from "../../../../store/store"
import ChartButtonGroup from "../ChartControls/data-exploration-chart-button-group"
import Controlaki from "./data-exploration-columns-panel"
import FilterBuilder from "./data-exploration-filter-builder"

import BarChartControlPanel from "../ChartControls/data-exploration-bar-control"
import { Box, Typography } from "@mui/material"
import ViewColumnIcon from "@mui/icons-material/ViewColumn"
import { grey } from "@mui/material/colors"
import FilterAltIcon from "@mui/icons-material/FilterAlt"

const LeftPanel = () => {
  const { tab } = useAppSelector(state => state.workflowPage)
  const chartType =
    tab?.workflowTasks.dataExploration?.controlPanel.chartType || "line" // Default to line chart if no chart type is selected in data exploration

  const SectionHeader = ({
    icon,
    title,
  }: {
    icon: React.ReactNode
    title: string
  }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        borderBottom: `1px solid ${grey[400]}`,
      }}
    >
      {icon}
      <Typography
        variant="h6"
        sx={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          ml: 1,
          fontWeight: "bold",
        }}
        color="primary"
      >
        {title}
      </Typography>
    </Box>
  )

  return (
    <>
      <Box>
        <ChartButtonGroup />
      </Box>
      <Box sx={{ marginTop: 3 }} /> {/* Adjust spacing as needed */}
      <SectionHeader icon={<ViewColumnIcon />} title="Columns" />
      <Box sx={{ marginTop: 3 }} /> {/* Adjust spacing as needed */}
      <Controlaki />
      <Box sx={{ marginTop: 3 }} /> {/* Adjust spacing as needed */}
      <SectionHeader icon={<FilterAltIcon />} title="Filters" />
      <Box sx={{ marginTop: 3 }} />
      <FilterBuilder />

    </>
  )
}

export default LeftPanel
