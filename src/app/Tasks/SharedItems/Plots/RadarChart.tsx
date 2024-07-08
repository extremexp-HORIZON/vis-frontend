

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Vega } from 'react-vega';
import { VisualizationSpec } from 'vega-embed';

type Metric = {
  name: string;
  value: number;
  avgDiff: number;
};

const RadarChart = ({ metrics, workflowId }: { metrics: Metric[]; workflowId: string }) => {  
  // Convert incoming metrics data to the format expected by Vega
  const radarData = metrics.map(metric => ({
    key: metric.name,
    value: metric.value.toFixed(3),
    category: `Workflow ${workflowId}`
  }));
  

  // Example additional category, adjust as necessary
  const experimentAverage = metrics.map(metric => ({
    key: metric.name,
    // Calculate the average value as an adjusted percentage of the original value
    value: (metric.value * (1 + (metric.avgDiff / 100))).toFixed(3),
    category: "Experiments Average"
  }));

  const radarChartSpec: VisualizationSpec = {
    "$schema": "https://vega.github.io/schema/vega/v5.json",
    "description": "A radar chart example, showing multiple dimensions in a radial layout.",
    "width": 850,
    "height": 850,
    "padding": 0,
    "autosize": {"type": "none", "contains": "padding", "resize": true},

    "signals": [
      {"name": "radius", "update": "width / 2"}
    ],

    "data": [
      {
        "name": "table",
        "values": [...radarData, ...experimentAverage]
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
      "range": {"signal": "[0, radius-5]"},
      "zero": true,
      "nice": true,
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
"orient": "top",
      "title": "",
      "encode": {
        "legend": {"update": {"x": {"value":300}, "y": {"value": -300}}}
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
              "strokeWidth": {"value": 5},
              "fill": {"scale": "color", "field": "category"},
              "fillOpacity": {"value": 0.3},
            //   "tooltip": {
            //   "signal": "{'Metric': datum.key, 'Value': datum.datum.value, 'Category': datum.datum.category}"
            // }
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
              "fill": {"value": "black"},
              "fillOpacity": {"value": 1.0},
                "strokeWidth": {"value": 1},
                "tooltip": {
              "signal": "{'Metric': datum.datum.key, 'Value': datum.datum.value, 'Category': datum.datum.category}"
            }


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
          "strokeWidth": {"value": 1},
          // "tooltip": {
          //   "signal": "{'Key': datum.key}"
          // }
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
          "fontWeight": {"value": "bold"},
          "fillOpacity": {"value": 1.0},
                "strokeWidth": {"value": 10},
        },
       
      },
      
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
          "strokeWidth": {"value": 1},
          
          
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
    </Box>
    <Box sx={{ p: 2 }}>
      <Vega spec={radarChartSpec} />
     </Box>
   </Paper>
);
};

export default RadarChart;