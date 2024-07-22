const viewVlSpec = {
  // "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "vconcat": [
    // Main Chart
    {
      "width": 1200,
      "height": 400,
      "data": { "name": "chartData" },
      "mark": "line",
      "encoding": {
        "x": { 
          "field": "timestamp", 
          "type": "temporal",
        },
        "y": { 
          "field": "value", 
          "type": "quantitative",
        },
        "color": { "value": "steelblue" }  // Use a single color for all series
      },
    },
    {
      "width": 1200,
      "height": 100,
      "layer": [
        // File bars
        {
          "data": { "name": "fileRegions" },
          "mark": "rect",
          "encoding": {
            "x": { 
              "field": "start",
              "type": "temporal",
            },
            "x2": { "field": "end", "type": "temporal" },
            "stroke": { "value": "rgba(0, 0, 0, 0.2)" },
            "opacity": {
              "condition": { "test": "datum['selected'] === true", "value": 0.6 },
              "value": 0.2,
            },
            "color": {
              "field": "category",
              "type": "nominal",
              "scale": {
                "domain": ["no anomaly", "mechanical anomaly", "electrical anomaly"],
                "range": ["green", "#4C78A8", "orange"]
              },
              "legend": {
                "title": "Anomaly Type",
                "orient": "top"
              }
            }
          },
          "selection": {
            "category": {
              "type": "point", 
              "fields": ["category"],
              "bind": "legend",
            },
            "zoomPan": {
              "type": "interval",
              "bind": "scales",
              "translate": "[mousedown[!event.shiftKey], window:mouseup] > window:mousemove!",
            },
            "brush": {
              "type": "interval",
              "on": "[mousedown[event.shiftKey], window:mouseup] > window:mousemove!",
              "translate": "[mousedown[event.shiftKey], window:mouseup] > window:mousemove!",
              "zoom": null,
              "clear": [{"type": "mouseup"}, {"signal": "zoomPan"}], // remove brush on mouseup or zoom
            },
          },

        },
        // Layer of smaller time series view
        {
          "mark": "line",
          "data": { "name": "condensedChartData" },
          "encoding": {
            "x": {
              "field": "timestamp",
              "type": "temporal",
              "axis": { "grid": false },    
            },
            "y": { 
              "field": "value", 
              "type": "quantitative",
              "axis": { "grid": false } ,
            },
          },
        }
      ],
      "encoding": {
        "x": {
          "axis": {
            "grid": false, // Disable grid for the secondary chart
          }
        },
        "y": {
          "axis": {
            "grid": false // Disable grid for the secondary chart
          }
        }
      },
    },
  ],
  "resolve": {"scale": {"color": "independent"}},
};

const compareVlSpec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "vconcat": [
    // Main Chart
    {
      "width": 1200,
      "height": 400,
      "data": { "name": "chartData" },
      "mark": "line",
      "transform": [
        {
          "window": [{ "op": "row_number", "as": "index" }],
          "groupby": ["series"]
        }
      ],
      "encoding": {
        "x": {
          "field": "index",
          "type": "quantitative",
          "title": "Index"
        },
        "y": {
          "field": "value",
          "type": "quantitative"
        },
        "color": {
          "condition": {
            "param": "highlight",
            "field": "series",
            "type": "nominal",
            "legend": null
          },
          "value": "grey"
        },
        "opacity": {
          "condition": {
            "param": "highlight",
            "value": 1
          },
          "value": 0.2
        },
        "tooltip": [
          { "field": "series", 
            "type": "nominal", 
            "title": "File Name" 
          }
        ]
      },
      "layer": [
        {
          "description": "transparent layer to make it easier to trigger selection",
          "params": [
            {
              "name": "highlight",
              "value": [],
              "select": {
                "type": "point",
                "fields": ["series", "category"],
                "on": "click",
                // "toggle": "event.shiftKey",
                "clear": "click[event.ctrlKey]"
              }
            }
          ],
          "mark": { "type": "line", "strokeWidth": 8, "stroke": "transparent" }
        },
        {
          "mark": "line"
        },
      ]
    },
    // File Regions and Condensed Chart
    {
      "width": 1200,
      "height": 100,
      "layer": [
        // File Regions Bars
        {
          "data": { "name": "fileRegions" },
          "mark": "rect",
          "encoding": {
            "x": { "field": "start", "type": "temporal" },
            "x2": { "field": "end", "type": "temporal" },
            "stroke": { "value": "rgba(0, 0, 0, 0.2)" },
            "opacity": {
              "condition": { "test": "datum['selected'] === true", "value": 0.6 },
              "value": 0.2
            },
            "color": {
              "name": "nav_color",
              "field": "category",
              "type": "nominal",
              "scale": {
                "domain": ["no anomaly", "mechanical anomaly", "electrical anomaly"],
                "range": ["green", "#4C78A8", "orange"]
              },
              "legend": {
                "title": "Anomaly Type",
                "orient": "top"
              }
            }
          },
          "selection": {
            "category": {
              "type": "point",
              "fields": ["category"],
              "bind": "legend"
            },
            "zoomPan": {
              "type": "interval",
              "bind": "scales",
              "translate": "[mousedown[!event.shiftKey], window:mouseup] > window:mousemove!"
            },
            "brush": {
              "type": "interval",
              "on": "[mousedown[event.shiftKey], window:mouseup] > window:mousemove!",
              "translate": "[mousedown[event.shiftKey], window:mouseup] > window:mousemove!",
              "zoom": null,
              "clear": [{ "type": "mouseup" }, { "signal": "zoomPan" }]
            }
          }
        },
        // Layer of smaller time series view
        {
          "mark": "line",
          "data": { "name": "condensedChartData" },
          "encoding": {
            "x": {
              "field": "timestamp",
              "type": "temporal",
              "axis": { "grid": false }
            },
            "y": {
              "field": "value",
              "type": "quantitative",
              "axis": { "grid": false }
            }
          }
        }
      ],
      "encoding": {
        "x": {
          "axis": { "grid": false }
        },
        "y": {
          "axis": { "grid": false }
        }
      }
    }
  ],
  "resolve": { "scale": { "color": "independent" } }
};



export const getVegaLiteSpec = (type: string) => {
    switch (type){
        case "view":
            return viewVlSpec;
        case "compare":
           return compareVlSpec;
        default:
            return null; 
    }
}