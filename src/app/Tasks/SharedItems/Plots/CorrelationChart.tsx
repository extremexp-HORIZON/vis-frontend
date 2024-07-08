
  import React, { useState, useEffect } from 'react';
import { Box, Typography, FormControl, Select, MenuItem, IconButton, Paper, SelectChangeEvent } from '@mui/material';
import { Vega } from 'react-vega';
import CloseIcon from "@mui/icons-material/Close";

interface Metric {
  name: string;
  value: number;
  avgDiff: number;
}

interface CorrelationChartProps {
  metrics: Metric[];
  workflowId: string;
}

const CorrelationChart = ({ metrics, workflowId }: CorrelationChartProps) => {
  const [xMetric, setXMetric] = useState(metrics[0].name);
  const [yMetric, setYMetric] = useState(metrics[1]?.name || metrics[0].name);
  const [vegaSpec, setVegaSpec] = useState({}); // State to hold Vega spec

  const handleYAxisChange = (event: SelectChangeEvent<string>) => {
    setYMetric(event.target.value as string);
  };
  const handleXAxisChange = (event: SelectChangeEvent<string>) => {
    setXMetric(event.target.value as string);
  };
  // const handleXAxisChange = (event: React.ChangeEvent<{ value: unknown }>) => {
  //   setXMetric(event.target.value as string);
  // };

  // const handleYAxisChange = (event: React.ChangeEvent<{ value: unknown }>) => {
  //   setYMetric(event.target.value as string);
  // };

  // Function to build Vega spec based on current xMetric and yMetric
  const buildVegaSpec = () => ({
    "$schema": "https://vega.github.io/schema/vega/v5.json",
    "description": "A correlation plot between selected metrics.",
    "width": 800,
    "height": 765,
    "padding": 110,
    "autosize": {"type": "none", "contains": "padding", "resize": true},
    "data": [
      {
        "name": "table",
        "values": metrics.map(metric => ({
          x: metric.name === xMetric ? metric.value : metric.value * (1 + metric.avgDiff / 100),
          y: metric.name === yMetric ? metric.value : metric.value * (1 + metric.avgDiff / 100),
          category: metric.name === xMetric || metric.name === yMetric ? `Workflow ${workflowId}` : "Experiment Average"
        }))
      }
    ],
    "scales": [
      {
        "name": "x",
        "type": "linear",
        "range": "width",
        "zero": true,
        "domain": { "data": "table", "field": "x" }
      },
      {
        "name": "y",
        "type": "linear",
        "range": "height",
        "zero": true,
        "nice": true,
        "domain": { "data": "table", "field": "y" }
      },
      {
        "name": "color",
        "type": "ordinal",
        "domain": { "data": "table", "field": "category" },
        "range": { "scheme": "category10" }
      }
    ],
    "axes": [
      { "orient": "bottom", "scale": "x", "title": xMetric },
      { "orient": "left", "scale": "y", "title": yMetric }
    ],
    "marks": [
      {
        "type": "symbol",
        "from": { "data": "table" },
        "encode": {
          "enter": {
            "x": { "scale": "x", "field": "x" },
            "y": { "scale": "y", "field": "y" },
            "fill": { "scale": "color", "field": "category" },
            "size": { "value": 100 },
            "tooltip": {
              "signal": `{'${xMetric}': format(datum.x, '.2f'), '${yMetric}': format(datum.y, '.2f'), 'Category': datum.category}`
            }
          }
        }
      }
    ],
    "legends": [
      {
        "fill": "color",
        "orient": "right",
        "title": "Category",
        "encode": {
          "symbols": {
            "update": {
              "shape": { "value": "circle" },
              "stroke": { "value": "transparent" }
            }
          }
        }
      }
    ]
  });

  // Update Vega spec when xMetric or yMetric changes
  useEffect(() => {
    setVegaSpec(buildVegaSpec());
  }, [xMetric, yMetric]);

  return (
    <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #ccc', m: 2 }}>
      <Box sx={{ bgcolor: '#f0f0f0', display: 'flex', alignItems: 'center', height: '3.5rem', px: 2 }}>
        <Typography variant="h6">Metrics Correlation</Typography>
        <Box sx={{ flex: 1 }} />
        {/* <IconButton>
          <CloseIcon />
        </IconButton> */}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', px: 1.5 }}>
          <Typography fontSize={"0.8rem"}>x-axis:</Typography>
          <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
            <Select
              value={xMetric}
              onChange={handleXAxisChange}
              sx={{ fontSize: "0.8rem" }}
            >
              {metrics.map(metric => (
                <MenuItem key={metric.name} value={metric.name}>
                  {metric.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', px: 1.5 }}>
          <Typography fontSize={"0.8rem"}>y-axis:</Typography>
          <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
            <Select
              value={yMetric}
              onChange={handleYAxisChange}
              sx={{ fontSize: "0.8rem" }}
            >
              {metrics.map(metric => (
                <MenuItem key={metric.name} value={metric.name}>
                  {metric.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
      <Box sx={{ p: 2 }}>
        <Vega spec={vegaSpec} />
      </Box>
    </Paper>
  );
};

export default CorrelationChart;

