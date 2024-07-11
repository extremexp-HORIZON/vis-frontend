import React, { ChangeEvent, ReactNode, useState } from "react";
import { VegaLite } from "react-vega";
import { Paper, Box, FormControl, Select, MenuItem, IconButton, Tooltip, Typography, SelectChangeEvent } from "@mui/material";
import workflows from "../../../../shared/data/workflows.json"; // Adjust the import based on your project structure
import InfoIcon from '@mui/icons-material/Info';

interface Workflow {
  workflowId: string;
  workflowInfo: {
    status: string;
  };
  metrics: {
    [key: string]: number;
  };
  variabilityPoints: {
    [key: string]: number;
  };
}

interface ChartData {
  x: number;
  y: number;
  value: number;
  id: string;
}

const processData = (workflows: Workflow[], selectedMetric: string, xVarPoint: string, yVarPoint: string): ChartData[] => {
  return workflows
    .filter(workflow => workflow.workflowInfo.status === "completed" && workflow.metrics)
    .map(workflow => ({
      x: workflow.variabilityPoints[xVarPoint],
      y: workflow.variabilityPoints[yVarPoint],
      value: workflow.metrics[selectedMetric],
      id: workflow.workflowId
    }));
};

const VariabilityPointHeatmap: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState<string>("accuracy");
  const [selectedXVarPoint, setSelectedXVarPoint] = useState<string>("learning_rate");
  const [selectedYVarPoint, setSelectedYVarPoint] = useState<string>("max_depth");

  const chartData = processData(workflows as unknown as Workflow[], selectedMetric, selectedXVarPoint, selectedYVarPoint);

  const handleMetricChange = (event: SelectChangeEvent<string>) => {
    setSelectedMetric(event.target.value);
  };

  const handleXVarPointChange = (event: SelectChangeEvent<string>, child: ReactNode) => {
    setSelectedXVarPoint(event.target.value as string);
  };

  const handleYVarPointChange = (event: SelectChangeEvent<string>, child: ReactNode) => {
    setSelectedYVarPoint(event.target.value);
  };

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
          borderBottom: `1px solid grey`,
        }}
      >
        <Typography fontSize={"1rem"} fontWeight={600}>
          {"Impact of Variability Points on Metrics (Heatmap)"}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Tooltip title={"Description not available."}>
          <IconButton>
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", px: 1.5, py: 1 }}>
        <Typography fontSize={"0.8rem"}>Metric</Typography>
        <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
          <Select
            labelId="metric-select-label"
            value={selectedMetric}
            onChange={handleMetricChange}
          >
            <MenuItem value="accuracy">Accuracy</MenuItem>
            <MenuItem value="precision">Precision</MenuItem>
            <MenuItem value="recall">Recall</MenuItem>
            <MenuItem value="f1_score">F1 Score</MenuItem>
          </Select>
        </FormControl>

        <Typography fontSize={"0.8rem"} sx={{ ml: 2 }}>x-Axis</Typography>
        <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
          <Select
            labelId="x-var-point-select-label"
            value={selectedXVarPoint}
            onChange={handleXVarPointChange}
          >
            <MenuItem value="learning_rate">Learning Rate</MenuItem>
            <MenuItem value="max_depth">Max Depth</MenuItem>
            <MenuItem value="min_child_weight">Min Child Weight</MenuItem>
            <MenuItem value="n_estimators">N Estimators</MenuItem>
            <MenuItem value="scaler">Scaler</MenuItem>
          </Select>
        </FormControl>

        <Typography fontSize={"0.8rem"} sx={{ ml: 2 }}>y-Axis</Typography>
        <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
          <Select
            labelId="y-var-point-select-label"
            value={selectedYVarPoint}
            onChange={handleYVarPointChange}
          >
            <MenuItem value="learning_rate">Learning Rate</MenuItem>
            <MenuItem value="max_depth">Max Depth</MenuItem>
            <MenuItem value="min_child_weight">Min Child Weight</MenuItem>
            <MenuItem value="n_estimators">N Estimators</MenuItem>
            <MenuItem value="scaler">Scaler</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ mt: 2 }}>
        <VegaLite spec={{
          width: 500,
          height: 500,
          mark: { type: "rect", tooltip: true },
          encoding: {
            x: { field: "x", type: "nominal", title: selectedXVarPoint },
            y: { field: "y", type: "nominal", title: selectedYVarPoint },
            color: { field: "value", type: "quantitative", title: selectedMetric },
            tooltip: [
              { field: "id", type: "nominal", title: "Workflow ID" },
              { field: "x", type: "nominal", title: selectedXVarPoint },
              { field: "y", type: "nominal", title: selectedYVarPoint },
              { field: "value", type: "quantitative", title: selectedMetric }
            ]
          },
          data: { values: chartData }
        }} />
      </Box>
    </Paper>
  );
};

export default VariabilityPointHeatmap;
