


import React, { useState } from 'react';
import { Box, Typography, FormControl, Select, MenuItem, Grid, IconButton, Paper } from '@mui/material';
import { Vega } from 'react-vega';
import { VisualizationSpec } from 'vega-embed';
import CloseIcon from "@mui/icons-material/Close"


interface CorrelationChartProps {
  availableMetrics: string[];
}

const CorrelationChart: React.FC<CorrelationChartProps> = ({ availableMetrics }) => {
  const [xMetric, setXMetric] = useState('Precision');
  const [yMetric, setYMetric] = useState('Accuracy');

  const handleXAxisChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setXMetric(event.target.value as string);
  };

  const handleYAxisChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setYMetric(event.target.value as string);
  };

  const correlationPlotSpec = (xMetric: string, yMetric: string): VisualizationSpec => ({
    "$schema": "https://vega.github.io/schema/vega/v5.json",
    "description": "A correlation plot between selected metrics.",
    "width": 500,
    "height": 500,
    
    // "autosize": {"type": "none", "contains": "padding", "resize": true},

    // "padding": 40,
    "data": [
      {
        "name": "table",
        "values": [
          { "x": Math.random(), "y": Math.random(), "category": "Workflow 1" },
          { "x": Math.random(), "y": Math.random(), "category": "Workflow 1" },
          { "x": Math.random(), "y": Math.random(), "category": "Workflow 1" },
          { "x": Math.random(), "y": Math.random(), "category": "Workflow 1" },
          { "x": Math.random(), "y": Math.random(), "category": "Workflow 1" },
          { "x": Math.random(), "y": Math.random(), "category": "Experiment Average" },
          { "x": Math.random(), "y": Math.random(), "category": "Experiment Average" },
          { "x": Math.random(), "y": Math.random(), "category": "Experiment Average" },
          { "x": Math.random(), "y": Math.random(), "category": "Experiment Average" },
          { "x": Math.random(), "y": Math.random(), "category": "Experiment Average" }
        ]
      }
    ],
    "scales": [
      {
        "name": "x",
        "type": "linear",
        "range": "width",
        "zero": false,
        "domain": { "data": "table", "field": "x" }
      },
      {
        "name": "y",
        "type": "linear",
        "range": "height",
        "zero": false,
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
            "tooltip": { "signal": "{'x': datum.x, 'y': datum.y, 'category': datum.category}" }
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
  return (
    <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #ccc', m: 2 }}>
      <Box sx={{ bgcolor: '#f0f0f0', display: 'flex', alignItems: 'center', height: '3.5rem', px: 2 }}>
        <Typography variant="h6">Metrics Correlation</Typography>
        <Box sx={{ flex: 1 }} />
        <IconButton>
          <CloseIcon />
        </IconButton>
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
              {availableMetrics.map((metric) => (
                <MenuItem key={metric} value={metric}>
                  {metric}
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
              {availableMetrics.map((metric) => (
                <MenuItem key={metric} value={metric}>
                  {metric}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
      <Box sx={{ p: 2 }}>
        <Vega spec={correlationPlotSpec(xMetric, yMetric)} />
      </Box>
    </Paper>
  );
};

export default CorrelationChart;





    
