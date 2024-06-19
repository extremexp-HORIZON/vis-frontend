import Typography from '@mui/material/Typography';
import React from 'react';
import { Vega, VegaLite } from 'react-vega';

const ScatterPlot = ({ data, selectedColumns }) => {
  // Check if there are at least two columns to plot
  if (selectedColumns.length < 2) {
    return (
    <Typography variant="h6" gutterBottom>
Please select at least two columns for Scatter View.        
</Typography>
    );
  }else if(selectedColumns.length == 2){
  const spec={
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "description": "Drag a rectangular brush to show (first 20) selected points in a table.",
    "data": { "values": data },
    "transform": [{
      "window": [{"op": "row_number", "as": "row_number"}]
    }],
    "hconcat": [
      {
      "width": 500,
      "height" :500, 
      "params": [{"name": "brush", "select": "interval"}],
      "mark": "point",
      "encoding": {
        "x": {"field": selectedColumns[0], "type": "quantitative"},
        "y": {"field": selectedColumns[1], "type": "quantitative"},
        
      }
    },

    ///This is the table section. 
     {
      "transform": [
        {"filter": {"param": "brush"}},
        {"window": [{"op": "rank", "as": "rank"}]},
        {"filter": {"field": "rank", "lt": 20}}
      ],
    
      "hconcat": [{
        "width": 120,
        "title": selectedColumns[0],
        "mark": "text",
        "encoding": {
          "text": {"field": selectedColumns[0], "type": "nominal"},
          "y": {"field": "row_number", "type": "ordinal", "axis": null}
        }
      }, {
        "width": 120,
        "title": selectedColumns[1],
        "mark": "text",
        "encoding": {
          "text": {"field": selectedColumns[1], "type": "nominal"},
          "y": {"field": "row_number", "type": "ordinal", "axis": null}
        }
      }]
    }],
    "resolve": {"legend": {"color": "independent"}}
  }
  
    
  return( 
    <>
        <Typography variant="h6" gutterBottom>
            Scatter   Viewer
        </Typography>
        <VegaLite spec={spec} />
    </>
);

    
  }else if(selectedColumns.length >2)
    {

  // Use selectedColumns to dynamically create row and column repeat directives
  const repeat = {
    row: selectedColumns,
    column: selectedColumns
  };

  const spec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "description": "Interactive scatter plots with brushing and zooming",
    "width": "container",
    "height": 500,
    "repeat": repeat,
    "spec": {
      "data": { "values": data },
      "mark": "point",
      "params": [
        {
          "name": "brush",
          "select": {
            "type": "interval",
            "resolve": "union",
            "on": "[pointerdown[event.shiftKey], window:pointerup] > window:pointermove!",
            "translate": "[pointerdown[event.shiftKey], window:pointerup] > window:pointermove!",
            "zoom": "wheel![event.shiftKey]"
          }
        },
        {
          "name": "grid",
          "select": {
            "type": "interval",
            "resolve": "global",
            "translate": "[pointerdown[!event.shiftKey], window:pointerup] > window:pointermove!",
            "zoom": "wheel![!event.shiftKey]"
          },
          "bind": "scales"
        }
      ],
      "encoding": {
        "x": {"field": {"repeat": "column"}, "type": "quantitative"},
        "y": {
          "field": {"repeat": "row"},
          "type": "quantitative",
          "axis": {"minExtent": 30}
        },
        
      }
    }
  };
  return( 
    <>
        <Typography variant="h6" gutterBottom>
            Scatter Viewer
        </Typography>
        <VegaLite spec={spec} />
    </>
);

}

};

export default ScatterPlot;