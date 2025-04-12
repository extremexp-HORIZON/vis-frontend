import { useAppSelector } from "../../../../store/store"
import ChartButtonGroup from "../ChartControls/ChartButtonGroup"
import Controlaki from "./Controlaki"
import FilterBuilder from "./FilterBuilder"
import ScatterChartControlPanel from "../Charts/ScatterChartControlPanel"
import LineChartControlPanel from "../Charts/LineChartControlPanel"
import BarChartControlPanel from "../Charts/BarChartControlPanel"
import { Box, Typography } from "@mui/material"
import ViewColumnIcon from "@mui/icons-material/ViewColumn"
import { grey } from "@mui/material/colors"
import FilterAltIcon from "@mui/icons-material/FilterAlt"
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest"

const PlayPanel = () => {
  const { tab } = useAppSelector(state => state.workflowPage)
  const chartType =
    tab?.workflowTasks.dataExploration?.controlPanel.chartType || "line" // Default to line chart if no chart type is selected in data exploration
  return (
    <>
      <Box sx={{ mb: 2 }}>
        <ChartButtonGroup />
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          borderBottom: `1px solid ${grey[400]}`,
        }}
      >
        <ViewColumnIcon />
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
          Columns
        </Typography>
      </Box>
      <Box sx={{ marginTop: 3 }} /> {/* Adjust spacing as needed */}
      <Controlaki />
      <Box sx={{ marginTop: 3 }} /> {/* Adjust spacing as needed */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          borderBottom: `1px solid ${grey[400]}`,
        }}
      >
        <FilterAltIcon />
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
          Filters
        </Typography>
      </Box>
      <Box sx={{ marginTop: 3 }} />
      <FilterBuilder />
      <Box sx={{ marginTop: 3 }} />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          borderBottom: `1px solid ${grey[400]}`,
        }}
      >
        <SettingsSuggestIcon />
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
          Options
        </Typography>
      </Box>
      {chartType === "line" && <LineChartControlPanel />}
      {chartType === "scatter" && <ScatterChartControlPanel />}
      {chartType === "bar" && <BarChartControlPanel />}
      {/* {chartType === "map" && <MapControls/>} */}
    </>
  )
}

export default PlayPanel
