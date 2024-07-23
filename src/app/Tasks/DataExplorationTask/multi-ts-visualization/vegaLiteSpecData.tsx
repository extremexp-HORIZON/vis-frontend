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
    {
      "filter": {
        "or": [
          { "param": "brushLines" },
          { "not": { "param": "brushLines" } }
        ]
      }
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
        "param": "brushLines",
        "field": "series",
        "type": "nominal",
        "legend": null
      },
      "value": "grey"
    },
    "opacity": {
      "condition": {
        "param": "brushLines",
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
    "brushLines": {
      "type": "interval",
      "encodings": ["y"],
      "on": "[mousedown, window:mouseup] > window:mousemove!",
      "translate": "[mousedown, window:mouseup] > window:mousemove!",
      "resolve": "union"
    }
  }
};

export const selectionChartSpec = {
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
          "type": "temporal",
        },
        "x2": { "field": "end", "type": "temporal" },
        "stroke": { "value": "rgba(0, 0, 0, 0.1)" },
        "color": {
          "condition": {
            "test": "datum['selected'] === true",
            "value": "lightgray"
          },
          "value": "white" 
        }
      },
      "selection": {
        "zoomPan": {
          "type": "interval",
          "bind": "scales",
          "translate": "[mousedown[!event.shiftKey], window:mouseup] > window:mousemove!",
        },
        "brushRegions": {
          "type": "interval",
          "zoom": null,
          "on": "[mousedown[event.shiftKey], window:mouseup] > window:mousemove!",
          "translate": "[mousedown[event.shiftKey], window:mouseup] > window:mousemove!",
          "clear": [{"type": "mouseup"}, {"signal": "zoomPan"}], // remove brush on mouseup or zoom
          "resolve": "union",
          "mark": {
            "fill": "blue",
            "fillOpacity": 0.3,
            "stroke": "grey",
            "strokeWidth": 1
          }
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
};


export const getSpecConcat = (alignment: string) => {
  if(alignment === 'view'){
    return [viewChartSpec, selectionChartSpec];
  }
  else return [compareChartSpec, selectionChartSpec];
}
