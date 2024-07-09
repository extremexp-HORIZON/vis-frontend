import { useState } from "react"
import { VegaLite } from "react-vega"
import InfoIcon from "@mui/icons-material/Info"
import { VisualizationSpec } from "vega-embed"

import {
  Paper,
  Box,
  Typography,
  Button,
  ButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Tooltip,
  IconButton,
} from "@mui/material"
import grey from "@mui/material/colors/grey"

const MetricEvolution = () => {
  const [selectedMetrics, setSelectedMetrics] = useState(["Accuracy"])
  const [viewMode, setViewMode] = useState("overlay")
  const data = [
    { time: 1, Accuracy: 0.6, Precision: 0.42, Recall: 0.12 },
    { time: 2, Accuracy: 0.65, Precision: 0.45, Recall: 0.15 },
    { time: 3, Accuracy: 0.7, Precision: 0.5, Recall: 0.18 },
    { time: 4, Accuracy: 0.75, Precision: 0.55, Recall: 0.2 },
    { time: 5, Accuracy: 0.8, Precision: 0.6, Recall: 0.25 },
    { time: 6, Accuracy: 0.82, Precision: 0.65, Recall: 0.3 },
    { time: 7, Accuracy: 0.85, Precision: 0.7, Recall: 0.35 },
    { time: 8, Accuracy: 0.88, Precision: 0.75, Recall: 0.4 },
    { time: 9, Accuracy: 0.9, Precision: 0.8, Recall: 0.45 },
    { time: 10, Accuracy: 0.92, Precision: 0.82, Recall: 0.5 },
    { time: 11, Accuracy: 0.94, Precision: 0.85, Recall: 0.55 },
    { time: 12, Accuracy: 0.96, Precision: 0.88, Recall: 0.6 },
    { time: 13, Accuracy: 0.97, Precision: 0.9, Recall: 0.65 },
    { time: 14, Accuracy: 0.98, Precision: 0.92, Recall: 0.7 },
    { time: 15, Accuracy: 0.99, Precision: 0.95, Recall: 0.75 },
  ]

  const handleMetricChange = (event: any) => {
    setSelectedMetrics(event.target.value)
  }

  const handleViewModeChange = (mode: any) => {
    setViewMode(mode)
  }

  const metrics = ["Accuracy", "Precision", "Recall"]

  const plotWidth = 1500
  const plotHeight = 400

  const overlaySpec = {
    width: "container",
    height: plotHeight,
    data: { values: data },
    transform: [
      {
        fold: selectedMetrics,
        as: ["metric", "value"],
      },
    ],
    mark: "line",
    encoding: {
      x: { field: "time", type: "quantitative" },
      y: { field: "value", type: "quantitative" },
      color: { field: "metric", type: "nominal" },
    },
  } as VisualizationSpec

  const stackSpec = {
    width: "container",
    height: plotHeight,
    data: { values: data },
    transform: [
      {
        fold: selectedMetrics,
        as: ["metric", "value"],
      },
    ],
    facet: {
      column: { field: "metric", type: "nominal" },
    },
    spec: {
      mark: "line",
      encoding: {
        x: { field: "time", type: "quantitative" },
        y: { field: "value", type: "quantitative" },
      },
    },
    // config: {
    //   facet: { spacing: 10 },
    // },
  } as VisualizationSpec

  return (
    <Paper
      className="Category-Item"
      elevation={2}
      sx={{
        borderRadius: 4,
        width: "inherit",
        display: "flex",
        flexDirection: "column",
        rowGap: 0,
        minWidth: "300px",
        height: "100%",
      }}
    >
      <Box
        sx={{
          px: 1.5,
          py: 0.5,
          display: "flex",
          alignItems: "center",
          borderBottom: `1px solid ${grey[400]}`,
        }}
      >
        <Typography fontSize={"1rem"} fontWeight={600}>
          {"Metric Evolution Over Time"}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Tooltip title={"Description not available"}>
          <IconButton>
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 1.5,
          justifyContent: "space-between",
        }}
      >
        <Box sx={{display: "flex", alignItems: "center"}}>
        <Typography fontSize={"0.8rem"}>Metrics:</Typography>
        <FormControl sx={{ m: 1, minWidth: 120, maxHeight: 120 }} size="small">
          <Select
            labelId="metric-select-label"
            multiple
            value={selectedMetrics}
            onChange={handleMetricChange}
            renderValue={selected => (selected as string[]).join(", ")}
          >
            {metrics.map(metric => (
              <MenuItem key={metric} value={metric}>
                <Checkbox checked={selectedMetrics.indexOf(metric) > -1} />
                <ListItemText primary={metric} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        </Box>
        <ButtonGroup variant="contained">
          <Button
            onClick={() => handleViewModeChange("overlay")}
            color={viewMode === "overlay" ? "primary" : "inherit"}
          >
            Overlay
          </Button>
          <Button
            onClick={() => handleViewModeChange("stack")}
            color={viewMode === "stack" ? "primary" : "inherit"}
          >
            Stack
          </Button>
        </ButtonGroup>
      </Box>
      <Box sx={{ width: "99%", px: 1 }}>
        <VegaLite style={{width: "99%"}} actions={false} spec={viewMode === "overlay" ? overlaySpec : stackSpec} />
      </Box>
    </Paper>
  )
}

export default MetricEvolution
