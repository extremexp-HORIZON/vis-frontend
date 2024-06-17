import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { VegaLite } from "react-vega";

const ParallelCoordinatePlot = () => {

  return (
    <>
    <Paper elevation={2}>
      <Box sx={{ width: "99%", px: 1 }}>
        <VegaLite
          actions={false}
          style={{ width: "90%" }}
          spec={{
            width: "container",
            height: 300,
            data: {
              values: [
                { learning_rate: 0.01, max_depth: 10, min_child_weight: 1, split_proportion: 0.1, accuracy: 0.65 },
                { learning_rate: 0.01, max_depth: 9, min_child_weight: 2, split_proportion: 0.2, accuracy: 0.66 },
                { learning_rate: 0.01, max_depth: 8, min_child_weight: 3, split_proportion: 0.3, accuracy: 0.67 },
                { learning_rate: 0.01, max_depth: 7, min_child_weight: 4, split_proportion: 0.4, accuracy: 0.68 },
                { learning_rate: 0.01, max_depth: 6, min_child_weight: 5, split_proportion: 0.5, accuracy: 0.69 },
                { learning_rate: 0.01, max_depth: 5, min_child_weight: 6, split_proportion: 0.6, accuracy: 0.70 },
                { learning_rate: 0.02, max_depth: 10, min_child_weight: 1, split_proportion: 0.1, accuracy: 0.65 },
                { learning_rate: 0.02, max_depth: 9, min_child_weight: 2, split_proportion: 0.2, accuracy: 0.66 },
                { learning_rate: 0.02, max_depth: 8, min_child_weight: 3, split_proportion: 0.3, accuracy: 0.67 },
                { learning_rate: 0.02, max_depth: 7, min_child_weight: 4, split_proportion: 0.4, accuracy: 0.68 },
                { learning_rate: 0.02, max_depth: 6, min_child_weight: 5, split_proportion: 0.5, accuracy: 0.69 },
                { learning_rate: 0.02, max_depth: 5, min_child_weight: 6, split_proportion: 0.6, accuracy: 0.70 }
              ]
            },
            transform: [
              { window: [{ op: "count", as: "index" }] },
              {
                fold: ["learning_rate", "max_depth", "min_child_weight", "split_proportion"]
              },
              {
                joinaggregate: [
                  { op: "min", field: "value", as: "min" },
                  { op: "max", field: "value", as: "max" }
                ],
                groupby: ["key"]
              },
              {
                calculate: "(datum.value - datum.min) / (datum.max - datum.min)",
                as: "norm_val"
              },
              {
                calculate: "(datum.min + datum.max) / 2",
                as: "mid"
              }
            ],
            layer: [
              {
                mark: { type: "rule", color: "#ccc", strokeWidth: 2 },
                encoding: {
                  detail: { aggregate: "count" },
                  x: { field: "key" }
                }
              },
              {
                mark: "line",
                encoding: {
                  color: { type: "quantitative", field: "accuracy", scale: { scheme: "redyellowgreen" } },
                  detail: { type: "nominal", field: "index" },
                  opacity: { value: 0.3 },
                  x: { type: "nominal", field: "key" },
                  y: { type: "quantitative", field: "norm_val", axis: null },
                  tooltip: [
                    {
                      type: "quantitative",
                      field: "learning_rate"
                    },
                    {
                      type: "quantitative",
                      field: "max_depth"
                    },
                    {
                      type: "quantitative",
                      field: "min_child_weight"
                    },
                    {
                      type: "quantitative",
                      field: "split_proportion"
                    }
                  ]
                }
              },
              {
                encoding: {
                  x: { type: "nominal", field: "key" },
                  y: { value: 0 }
                },
                layer: [
                  {
                    mark: { type: "text", style: "label" },
                    encoding: {
                      text: { aggregate: "max", field: "max" }
                    }
                  },
                  {
                    mark: {
                      type: "tick",
                      style: "tick",
                      size: 8,
                      color: "#ccc"
                    }
                  }
                ]
              },
              {
                encoding: {
                  x: { type: "nominal", field: "key" },
                  y: { value: 150 }
                },
                layer: [
                  {
                    mark: { type: "text", style: "label" },
                    encoding: {
                      text: { aggregate: "min", field: "mid" }
                    }
                  },
                  {
                    mark: {
                      type: "tick",
                      style: "tick",
                      size: 8,
                      color: "#ccc"
                    }
                  }
                ]
              },
              {
                encoding: {
                  x: { type: "nominal", field: "key" },
                  y: { value: 300 }
                },
                layer: [
                  {
                    mark: { type: "text", style: "label" },
                    encoding: {
                      text: { aggregate: "min", field: "min" }
                    }
                  },
                  {
                    mark: {
                      type: "tick",
                      style: "tick",
                      size: 8,
                      color: "#ccc"
                    }
                  }
                ]
              }
            ],
            config: {
              axisX: {
                domain: false,
                labelAngle: 0,
                tickColor: "black",
                title: null
              },
              view: { stroke: null },
              style: {
                label: { baseline: "middle", align: "right", dx: -5 },
                tick: { orient: "horizontal" }
              }
            }
          }}
        />
      </Box>
      </Paper>
    </>
  );
};

export default ParallelCoordinatePlot;
