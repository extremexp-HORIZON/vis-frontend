import React, {useEffect, useState} from "react";
import { VegaLite} from "react-vega";
import { Paper, Box, Typography, FormControl, Select, MenuItem, Chip, IconButton, Tooltip, SelectChangeEvent } from "@mui/material";
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
  id: string;
  point: string;
}

const processData = (workflows: Workflow[], selectedMetric: string, variabilityPoints: string[]) => {
  return variabilityPoints.flatMap(point =>
    workflows
      .filter(workflow => workflow.workflowInfo.status === "completed" && workflow.metrics)
      .map(workflow => ({
        x: workflow.variabilityPoints[point],
        y: workflow.metrics[selectedMetric],
        id: workflow.workflowId,
        point
      }))
  );
};

const getYAxisDomain = (data: ChartData[]) => {
  const values = data.map(d => d.y);
  const min = Math.min(...values);
  const max = Math.max(...values);
  return { min, max };
};

const VariabilityPointCharts = () => {
  const [selectedMetric, setSelectedMetric] = useState("accuracy");
  const [selectedVariabilityPoints, setSelectedVariabilityPoints] = useState(["learning_rate"]);
  const [chartWidth, setChartWidth] = useState(250); // Default width


  const chartData = processData(workflows as unknown as Workflow[], selectedMetric, selectedVariabilityPoints);
  const yAxisDomain = getYAxisDomain(chartData);

  const handleMetricChange = (event: SelectChangeEvent<string>) => {
    setSelectedMetric(event.target.value);
  };

  const handleVariabilityPointChange = (event: SelectChangeEvent<string[]>) => {
    setSelectedVariabilityPoints(Array.isArray(event.target.value) ? event.target.value : [event.target.value]);
  };

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };
  useEffect(() => {
    const handleResize = () => {
      const chartContainerWidth = (document.querySelector('.chart-container') as HTMLElement | null)?.offsetWidth || 300;
      if (chartContainerWidth) {
        setChartWidth(Math.max(300, chartContainerWidth / selectedVariabilityPoints.length - 20)); // 20px for margin
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call to set width

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [selectedVariabilityPoints.length]); // Depend on the numbe

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
          {"Impact of Variability Points on Metrics (small multiples)"}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Tooltip title={"Description not available."}>
          <IconButton>
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", px: 1.5, py: 1 }}>
        <Typography fontSize={"0.8rem"}>Variability Points</Typography>
        
        <FormControl sx={{ m: 1, minWidth: 120, maxHeight: 120 }} size="small">
          <Select
            labelId="variability-point-select-label"
            multiple
            size="small"
            value={selectedVariabilityPoints}
            onChange={handleVariabilityPointChange}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map(value => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
            MenuProps={MenuProps}
          >
            <MenuItem value="learning_rate">Learning Rate</MenuItem>
            <MenuItem value="max_depth">Max Depth</MenuItem>
            <MenuItem value="min_child_weight">Min Child Weight</MenuItem>
            <MenuItem value="n_estimators">N Estimators</MenuItem>
            <MenuItem value="scaler">Scaler</MenuItem>
          </Select>
        </FormControl>
        
        <Typography fontSize={"0.8rem"} sx={{ ml: 2 }}>Metric</Typography>
        <FormControl sx={{ m: 1, minWidth: 120, maxHeight: 120 }} size="small">
          <Select
            labelId="metric-select-label"
            size="small"
            value={selectedMetric}
            onChange={handleMetricChange}
          >
            <MenuItem value="accuracy">Accuracy</MenuItem>
            <MenuItem value="precision">Precision</MenuItem>
            <MenuItem value="recall">Recall</MenuItem>
            <MenuItem value="f1_score">F1 Score</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2, p: 2, className: 'chart-container', alignItems: "center", flex: 1 }}>
        {selectedVariabilityPoints.map(point => (
          <Box key={point} sx={{ width: `max-content`, minWidth: '300px' }}>
            <VegaLite actions={false} spec={{
              width: chartWidth,
              height: 300,
              mark: { type: "point", tooltip: true },
              encoding: {
                x: { field: "x", type: "nominal", title: point },
                y: { field: "y", type: "quantitative", title: selectedMetric, scale: { domain: [yAxisDomain.min, yAxisDomain.max] } },
                color: { field: "id", type: "nominal", legend: null, scale: { scheme: 'category10' } },
                tooltip: [
                  { field: "id", type: "nominal", title: "Workflow ID" },
                  { field: "x", type: "nominal", title: point },
                  { field: "y", type: "quantitative", title: selectedMetric }
                ]
              },
              data: { values: chartData.filter(data => data.point === point) }
            }} />
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default VariabilityPointCharts;
