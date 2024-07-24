export const viewChartSpec = {
  "width": "container",
  "height": 400,
  "autosize": { type: "fit", contains: "padding", resize: true },
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
};

export const compareChartSpec = {
  "width": "container",
  "height": 400,
  "autosize": { type: "fit", contains: "padding", resize: true },
  "data": { "name": "chartData" },
  "mark": "line",
  "transform": [
    {
      "window": [{ "op": "row_number", "as": "index" }],
      "groupby": ["series"]
    },
  ],
  "encoding": {
    "x": {
      "field": "index",
      "type": "nominal",
      "title": "Index"
    },
    "y": {
      "field": "value",
      "type": "quantitative"
    },
    "color": {
      "condition": {
        "test": {
          "or": [
            // {"param": "brushLines"},
            {"param": "highlight"}
          ]
        },
        "field": "series",
        "type": "nominal",
        "legend": null
      },
      // "field": "category",
      // "type": "nominal",
      // "scale": {
      //   "domain": ["no anomaly", "mechanical anomaly", "electrical anomaly"],
      //   "range": ["green", "#4C78A8", "orange"]
      // },
      // "legend": null,
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
  "selection": {
    "highlight": {
      "type": "point",
      "on": "click",
      "empty": "click",
      "fields": ["series"]
    },
    "brushLines": {
      "type": "interval",
      "encodings": ["y"],
      "on": "[mousedown, window:mouseup] > window:mousemove!",
      "translate": "[mousedown, window:mouseup] > window:mousemove!",
      "resolve": "union"
    }
  }
};

// Function to generate selectionChartSpec based on misclassified parameter
const getSelectionChartSpec = (misclassified: boolean) => {
  const colorEncoding = misclassified
    ? {
        "condition": {
          "test": "datum['misclassified'] === true",
          "value": "red"
        },
        "value": "grey"
      }
    : {
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
      };

  return {
    "width": "container",
    "height": 100,
    "layer": [
      // File bars
      {
        "data": { "name": "fileRegions" },
        "mark": "rect",
        "encoding": {
          "x": {
            "field": "start",
            "type": "temporal"
          },
          "x2": { "field": "end", "type": "temporal" },
          "stroke": { "value": "rgba(0, 0, 0, 0.2)" },
          "opacity": {
            "condition": { "test": "datum['selected'] === true", "value": 0.6 },
            "value": 0.2
          },
          "color": colorEncoding
        },
        "selection": {
          "headerCategory": {
            "type": "point",
            "fields": ["category"],
            "bind": "legend"
          },
          "zoomPan": {
            "type": "interval",
            "bind": "scales",
            "translate": "[mousedown[!event.shiftKey], window:mouseup] > window:mousemove!"
          },
          "brushRegions": {
            "type": "interval",
            "zoom": null,
            "on": "[mousedown[event.shiftKey], window:mouseup] > window:mousemove!",
            "translate": "[mousedown[event.shiftKey], window:mouseup] > window:mousemove!",
            "clear": [{ "type": "mouseup" }, { "signal": "zoomPan" }],
            "resolve": "union",
            "mark": {
              "fill": "blue",
              "fillOpacity": 0.1,
              "stroke": "grey",
              "strokeWidth": 1
            }
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
        "axis": {
          "grid": false
        }
      },
      "y": {
        "axis": {
          "grid": false
        }
      }
    }
  };
};



export const getVlSpec = (alignment: string, misclassified: boolean) => {
  return {
    "width": "container",  
    "vconcat": [alignment === 'view' ? viewChartSpec : compareChartSpec, getSelectionChartSpec(misclassified)],
    "resolve": {"scale": {"color": "independent"}},
  }
};
