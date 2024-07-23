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
    { time: 1, Accuracy: 0.55, Precision: 0.35, Recall: 0.20, Loss: 0.70 },
    { time: 2, Accuracy: 0.57, Precision: 0.37, Recall: 0.22, Loss: 0.68 },
    { time: 3, Accuracy: 0.58, Precision: 0.39, Recall: 0.23, Loss: 0.66 },
    { time: 4, Accuracy: 0.60, Precision: 0.40, Recall: 0.25, Loss: 0.64 },
    { time: 5, Accuracy: 0.62, Precision: 0.42, Recall: 0.27, Loss: 0.62 },
    { time: 6, Accuracy: 0.63, Precision: 0.44, Recall: 0.29, Loss: 0.61 },
    { time: 7, Accuracy: 0.65, Precision: 0.46, Recall: 0.31, Loss: 0.59 },
    { time: 8, Accuracy: 0.66, Precision: 0.47, Recall: 0.32, Loss: 0.57 },
    { time: 9, Accuracy: 0.67, Precision: 0.48, Recall: 0.33, Loss: 0.55 },
    { time: 10, Accuracy: 0.68, Precision: 0.50, Recall: 0.34, Loss: 0.54 },
    { time: 11, Accuracy: 0.69, Precision: 0.51, Recall: 0.35, Loss: 0.52 },
    { time: 12, Accuracy: 0.70, Precision: 0.52, Recall: 0.36, Loss: 0.50 },
    { time: 13, Accuracy: 0.71, Precision: 0.53, Recall: 0.37, Loss: 0.48 },
    { time: 14, Accuracy: 0.72, Precision: 0.54, Recall: 0.38, Loss: 0.47 },
    { time: 15, Accuracy: 0.73, Precision: 0.55, Recall: 0.39, Loss: 0.45 },
    { time: 16, Accuracy: 0.74, Precision: 0.56, Recall: 0.40, Loss: 0.44 },
    { time: 17, Accuracy: 0.75, Precision: 0.57, Recall: 0.41, Loss: 0.42 },
    { time: 18, Accuracy: 0.76, Precision: 0.58, Recall: 0.42, Loss: 0.40 },
    { time: 19, Accuracy: 0.77, Precision: 0.59, Recall: 0.43, Loss: 0.39 },
    { time: 20, Accuracy: 0.78, Precision: 0.60, Recall: 0.44, Loss: 0.37 },
    { time: 21, Accuracy: 0.79, Precision: 0.61, Recall: 0.45, Loss: 0.36 },
    { time: 22, Accuracy: 0.80, Precision: 0.62, Recall: 0.46, Loss: 0.35 },
    { time: 23, Accuracy: 0.81, Precision: 0.63, Recall: 0.47, Loss: 0.34 },
    { time: 24, Accuracy: 0.82, Precision: 0.64, Recall: 0.48, Loss: 0.33 },
    { time: 25, Accuracy: 0.83, Precision: 0.65, Recall: 0.49, Loss: 0.32 },
    { time: 26, Accuracy: 0.84, Precision: 0.66, Recall: 0.50, Loss: 0.31 },
    { time: 27, Accuracy: 0.85, Precision: 0.67, Recall: 0.51, Loss: 0.30 },
    { time: 28, Accuracy: 0.86, Precision: 0.68, Recall: 0.52, Loss: 0.29 },
    { time: 29, Accuracy: 0.87, Precision: 0.69, Recall: 0.53, Loss: 0.28 },
    { time: 30, Accuracy: 0.88, Precision: 0.70, Recall: 0.54, Loss: 0.27 },
    { time: 31, Accuracy: 0.89, Precision: 0.71, Recall: 0.55, Loss: 0.26 },
    { time: 32, Accuracy: 0.90, Precision: 0.72, Recall: 0.56, Loss: 0.25 },
    { time: 33, Accuracy: 0.91, Precision: 0.73, Recall: 0.57, Loss: 0.24 },
    { time: 34, Accuracy: 0.92, Precision: 0.74, Recall: 0.58, Loss: 0.23 },
    { time: 35, Accuracy: 0.93, Precision: 0.75, Recall: 0.59, Loss: 0.22 },
    { time: 36, Accuracy: 0.94, Precision: 0.76, Recall: 0.60, Loss: 0.21 },
    { time: 37, Accuracy: 0.94, Precision: 0.77, Recall: 0.61, Loss: 0.20 },
    { time: 38, Accuracy: 0.95, Precision: 0.78, Recall: 0.62, Loss: 0.19 },
    { time: 39, Accuracy: 0.96, Precision: 0.79, Recall: 0.63, Loss: 0.18 },
    { time: 40, Accuracy: 0.97, Precision: 0.80, Recall: 0.64, Loss: 0.17 },
    { time: 41, Accuracy: 0.97, Precision: 0.81, Recall: 0.65, Loss: 0.16 },
    { time: 42, Accuracy: 0.98, Precision: 0.82, Recall: 0.66, Loss: 0.15 },
    { time: 43, Accuracy: 0.98, Precision: 0.83, Recall: 0.67, Loss: 0.14 },
    { time: 44, Accuracy: 0.99, Precision: 0.84, Recall: 0.68, Loss: 0.13 },
    { time: 45, Accuracy: 0.99, Precision: 0.85, Recall: 0.69, Loss: 0.12 },
    { time: 46, Accuracy: 0.99, Precision: 0.86, Recall: 0.70, Loss: 0.11 },
    { time: 47, Accuracy: 0.99, Precision: 0.87, Recall: 0.71, Loss: 0.10 },
    { time: 48, Accuracy: 1.00, Precision: 0.88, Recall: 0.72, Loss: 0.09 },
    { time: 49, Accuracy: 1.00, Precision: 0.89, Recall: 0.73, Loss: 0.08 },
    { time: 50, Accuracy: 1.00, Precision: 0.90, Recall: 0.74, Loss: 0.07 },
    { time: 51, Accuracy: 1.00, Precision: 0.90, Recall: 0.75, Loss: 0.06 },
    { time: 52, Accuracy: 1.00, Precision: 0.91, Recall: 0.76, Loss: 0.05 },
    { time: 53, Accuracy: 1.00, Precision: 0.92, Recall: 0.77, Loss: 0.04 },
    { time: 54, Accuracy: 1.00, Precision: 0.92, Recall: 0.78, Loss: 0.03 },
    { time: 55, Accuracy: 1.00, Precision: 0.93, Recall: 0.79, Loss: 0.02 },
    { time: 56, Accuracy: 1.00, Precision: 0.94, Recall: 0.80, Loss: 0.01 },
    { time: 57, Accuracy: 1.00, Precision: 0.94, Recall: 0.81, Loss: 0.01 },
    { time: 58, Accuracy: 1.00, Precision: 0.95, Recall: 0.82, Loss: 0.01 },
    { time: 59, Accuracy: 1.00, Precision: 0.95, Recall: 0.83, Loss: 0.01 },
    { time: 60, Accuracy: 1.00, Precision: 0.96, Recall: 0.84, Loss: 0.01 },
  ];
  
  

  const handleMetricChange = (event: any) => {
    setSelectedMetrics(event.target.value)
  }

  const handleViewModeChange = (mode: any) => {
    setViewMode(mode)
  }

  const metrics = ["Accuracy", "Precision", "Recall","Loss"]

  const plotHeight = 200

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
            size="small"
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
            size="small"
          >
            Overlay
          </Button>
          <Button
            onClick={() => handleViewModeChange("stack")}
            color={viewMode === "stack" ? "primary" : "inherit"}
            size="small"
            disabled
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
