import React, { useState } from "react";
import { VegaLite, VisualizationSpec } from "react-vega";
import { Paper, Box, Typography, Tooltip, IconButton, FormControl, Select, MenuItem } from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import workflows from "../../../../shared/data/workflows.json"; // Adjust the import based on your project structure
 
const getTopTenWorkflowsByMetric = (workflows: any[], metric: string) => {
  const completedWorkflows = workflows.filter(workflow => workflow.metrics && workflow.metrics[metric] !== undefined);
  completedWorkflows.sort((a, b) => b.metrics[metric] - a.metrics[metric]);
  const topTenWorkflows = completedWorkflows.slice(0, 10);
  const chartData = topTenWorkflows.map(workflow => ({
    workflowId: workflow.workflowId,
    metricValue: workflow.metrics[metric],
  }));
  return chartData;
};
 
const TopWorkflowMetric = () => {
  const [metric, setMetric] = useState("precision");
 
  const topTenWorkflows = getTopTenWorkflowsByMetric(workflows, metric);
 
  // const spec = {
  //   width: "container",
  //   height: 400,
  //   mark: "bar",
  //   encoding: {
  //     y: { // Switched to 'y' for workflow IDs
  //       field: "workflowId",
  //       type: "ordinal",
  //       title: "Workflow ID",
  //       sort: { field: "metricValue", order: "descending" } // Sorting so highest values appear on top
  //     },
  //     x: { // Switched to 'x' for metric values
  //       field: "metricValue",
  //       type: "quantitative",
  //       title: `Top 10 Workflows by ${metric}`
  //     },
  //     tooltip: [
  //       { field: "workflowId", type: "nominal", title: "Workflow ID" },
  //       { field: "metricValue", type: "quantitative", title: `${metric} Value` }
  //     ]
  //   },
  //   data: { values: topTenWorkflows },
  // };
  const spec = {
    width: "container",
    height: 400,
    mark: "bar",
    encoding: {
      x: { field: "workflowId", type: "ordinal", title: "Workflow ID" , sort: { field: "metricValue", order: "descending" } },
      y: { field: "metricValue", type: "quantitative", title: `Top 10 Workflows by ${metric}` },
      tooltip: [
        { field: "workflowId", type: "nominal", title: "Workflow ID" },
        { field: "metricValue", type: "quantitative", title: `${metric} Value` }
      ]
    },
    data: { values: topTenWorkflows },
  };
 
  const handleMetricChange = (e: any) => {
    setMetric(e.target.value);
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
          {"Top 10 Workflows By Metric"}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Tooltip title={"Description not available."}>
          <IconButton>
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", px: 1.5, py: 1 }}>
        <Typography fontSize={"0.8rem"}>Metric:</Typography>
        <FormControl
          sx={{ m: 1, minWidth: 120, maxHeight: 120 }}
          size="small"
        >
          <Select
            value={metric}
            onChange={handleMetricChange}
            sx={{ fontSize: "0.8rem" }}
          >
            <MenuItem value="accuracy">Accuracy</MenuItem>
            <MenuItem value="precision">Precision</MenuItem>
            <MenuItem value="recall">Recall</MenuItem>
            <MenuItem value="f1_score">F1 Score</MenuItem>
            {/* Add more options as needed */}
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ px: 1.5, py: 1, flex: 1, width: "99%" }}>
        <VegaLite actions={false} style={{width: "90%"}} spec={spec as VisualizationSpec} />
      </Box>
    </Paper>
  );
};
 
export default TopWorkflowMetric;