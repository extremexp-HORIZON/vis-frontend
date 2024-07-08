

import React from 'react';
import { Box, Typography, FormControl, Select, MenuItem, Grid, IconButton, Paper } from '@mui/material';
import { Vega } from 'react-vega';
import { VisualizationSpec } from 'vega-embed';
import CloseIcon from "@mui/icons-material/Close"
const RadarChart: React.FC = () => { 
const radarChartSpec: VisualizationSpec = {
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "description": "A radar chart example, showing multiple dimensions in a radial layout.",
  "width": 620,
  "height": 620,
  "padding":50,
  "autosize": {"type": "none", "contains": "padding", "resize": true},

  "signals": [
    {"name": "radius", "update": "width / 2"}
  ],

  "data": [
    {
      "name": "table",
      "values": [
        {"key": "Accuracy", "value": 0.6, "category": "Workflow 1"},
        {"key": "Precision", "value": 0.42, "category": "Workflow 1"},
        {"key": "Recall", "value": 0.12, "category": "Workflow 1"},
        {"key": "Runtime", "value": 2.12, "category": "Workflow 1"},
        {"key": "Accuracy", "value": 0.8, "category": "Experiment Average"},
        {"key": "Precision", "value": 0.7, "category": "Experiment Average"},
        {"key": "Recall", "value": 0.5, "category": "Experiment Average"},
        {"key": "Runtime", "value": 1.5, "category": "Experiment Average"}
      ]
    },
    {
      "name": "keys",
      "source": "table",
      "transform": [
        {
          "type": "aggregate",
          "groupby": ["key"]
        }
      ]
    }
  ],

  "scales": [
    {
      "name": "angular",
      "type": "point",
      "range": {"signal": "[-PI, PI]"},
      "padding": 0.5,
      "domain": {"data": "table", "field": "key"}
    },
    {
      "name": "radial",
      "type": "linear",
      "range": {"signal": "[0, radius]"},
      "zero": true,
      "nice": false,
      "domain": {"data": "table", "field": "value"},
      "domainMin": 0
    },
    {
      "name": "color",
      "type": "ordinal",
      "domain": {"data": "table", "field": "category"},
      "range": {"scheme": "category10"}
    }
  ],

  "legends": [
    {
      "fill": "color",
      "orient": "none",
      "title": "Category",
      "encode": {
        "legend": {"update": {"x": {"value":120}, "y": {"value": -250}}}
      }
    }
  ],

  "encode": {
    "enter": {
      "x": {"signal": "radius"},
      "y": {"signal": "radius"}
    }
  },

  "marks": [
    {
      "type": "group",
      "name": "categories",
      "zindex": 1,
      "from": {
        "facet": {"data": "table", "name": "facet", "groupby": ["category"]}
      },
      "marks": [
        {
          "type": "line",
          "name": "category-line",
          "from": {"data": "facet"},
          "encode": {
            "enter": {
              "interpolate": {"value": "linear-closed"},
              "x": {"signal": "scale('radial', datum.value) * cos(scale('angular', datum.key))"},
              "y": {"signal": "scale('radial', datum.value) * sin(scale('angular', datum.key))"},
              "stroke": {"scale": "color", "field": "category"},
              "strokeWidth": {"value": 1},
              "fill": {"scale": "color", "field": "category"},
              "fillOpacity": {"value": 0.1}
            }
          }
        },
        {
          "type": "text",
          "name": "value-text",
          "from": {"data": "category-line"},
          "encode": {
            "enter": {
              "x": {"signal": "datum.x"},
              "y": {"signal": "datum.y"},
              "text": {"signal": "datum.datum.value"},
              "align": {"value": "center"},
              "baseline": {"value": "middle"},
              "fill": {"value": "black"}
            }
          }
        }
      ]
    },
    {
      "type": "rule",
      "name": "radial-grid",
      "from": {"data": "keys"},
      "zindex": 0,
      "encode": {
        "enter": {
          "x": {"value": 0},
          "y": {"value": 0},
          "x2": {"signal": "radius * cos(scale('angular', datum.key))"},
          "y2": {"signal": "radius * sin(scale('angular', datum.key))"},
          "stroke": {"value": "lightgray"},
          "strokeWidth": {"value": 1}
        }
      }
    },
    {
      "type": "text",
      "name": "key-label",
      "from": {"data": "keys"},
      "zindex": 1,
      "encode": {
        "enter": {
          "x": {"signal": "(radius + 5) * cos(scale('angular', datum.key))"},
          "y": {"signal": "(radius + 5) * sin(scale('angular', datum.key))"},
          "text": {"field": "key"},
          "align": [
            {
              "test": "abs(scale('angular', datum.key)) > PI / 2",
              "value": "right"
            },
            {
              "value": "left"
            }
          ],
          "baseline": [
            {
              "test": "scale('angular', datum.key) > 0", "value": "top"
            },
            {
              "test": "scale('angular', datum.key) == 0", "value": "middle"
            },
            {
              "value": "bottom"
            }
          ],
          "fill": {"value": "black"},
          "fontWeight": {"value": "bold"}
        }
      }
    },
    {
      "type": "line",
      "name": "outer-line",
      "from": {"data": "radial-grid"},
      "encode": {
        "enter": {
          "interpolate": {"value": "linear-closed"},
          "x": {"field": "x2"},
          "y": {"field": "y2"},
          "stroke": {"value": "lightgray"},
          "strokeWidth": {"value": 1}
        }
      }
    }
  ]

};

return (
    <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #ccc', m: 2 }}>
      <Box sx={{ bgcolor: '#f0f0f0', display: 'flex', alignItems: 'center', height: '3.5rem', px: 2 }}>
        <Typography variant="h6">Metrics Evaluation</Typography>
        <Box sx={{ flex: 1 }} />
        <IconButton>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box sx={{ p: 2 }}>
        <Vega spec={radarChartSpec} />
      </Box>
    </Paper>
  );
  // return (
  //   <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #ccc' }}>
  //     <Box sx={{ bgcolor: '#f0f0f0', display: 'flex', alignItems: 'center', height: '3.5rem', px: 2 }}>
  //       <Typography variant="h6">Metrics Evaluation </Typography>
  //       <Box sx={{ flex: 1 }} />
  //       <IconButton>
  //         <CloseIcon />
  //       </IconButton>
  //     </Box>
       
       
  //       <Grid item xs={12}>
  //         <Vega spec={radarChartSpec} />
  //       </Grid>
  //   </Paper>
  // );
};

export default RadarChart;