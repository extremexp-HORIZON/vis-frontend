import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import { VegaLite } from "react-vega"
import workflows from "../../shared/data/workflows.json"
import { useEffect, useState } from "react"
import Typography from "@mui/material/Typography"
import FormControl from "@mui/material/FormControl"
import Select, { SelectChangeEvent } from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import { set } from "lodash"

const ParallelCoordinatePlot = () => {
  const [completedWorkflows, setCompletedWorkflows] = useState<any>(null)
  const [options, setOptions] = useState<string[]>([])
  const [selectedMetric, setSelectedMetric] = useState("accuracy")

  useEffect(() => {
    if (workflows) {
      setCompletedWorkflows(
        workflows
          .filter(workflow => workflow.workflowInfo.status === "completed")
          .map(workflow => ({
            ...workflow.variabilityPoints,
            ...workflow.metrics,
            workflowId: workflow.workflowId,
          })),
      )
    }
    const metricOptions = Object.keys(workflows
      .find(workflow => workflow.workflowInfo.status === "completed")?.metrics || [])
    setSelectedMetric(metricOptions[0])
    setOptions(metricOptions)
  }, [])

  const handleMetricSelection = (event: SelectChangeEvent) => {
    setSelectedMetric(event.target.value as string)
  }

  const handleNewView = (view: any) => {
    view.addEventListener("click", (event: any, item: any) => {
      if (item && item.datum) {
        console.log(item.datum)
      } else {
        console.log(null)
      }
    })
  }

  return (
    <>
      {console.log("completed", completedWorkflows)}
      <Paper elevation={2}>
        <Box sx={{ display: "flex", alignItems: "center", px: 1.5 }}>
          <Typography fontSize={"0.8rem"}>
            Color by:
          </Typography>
          <FormControl
            sx={{ m: 1, minWidth: 120, maxHeight: 120 }}
            size="small"
          >
            <Select
              value={selectedMetric}
              sx={{ fontSize: "0.8rem" }}
              onChange={handleMetricSelection}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 250,
                    maxWidth: 300,
                  },
                },
              }}
            >
              {options.map(feature => (
                <MenuItem
                  key={`${feature}`}
                  value={feature}
                >
                  {feature}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ width: "99%", px: 1 }}>
          <VegaLite
            actions={false}
            onNewView={handleNewView}
            style={{ width: "100%" }}
            spec={{
              width: "container",
              height: 300,
              data: {
                values: completedWorkflows,
              },
              transform: [
                { window: [{ op: "count", as: "index" }] },
                {
                  fold: [
                    "learning_rate",
                    "max_depth",
                    "min_child_weight",
                    "n_estimators",
                  ],
                },
                {
                  joinaggregate: [
                    { op: "min", field: "value", as: "min" },
                    { op: "max", field: "value", as: "max" },
                  ],
                  groupby: ["key"],
                },
                {
                  calculate:
                    "(datum.value - datum.min) / (datum.max - datum.min)",
                  as: "norm_val",
                },
                {
                  calculate: "(datum.min + datum.max) / 2",
                  as: "mid",
                },
              ],
              layer: [
                {
                  mark: { type: "rule", color: "#ccc", strokeWidth: 2 },
                  encoding: {
                    detail: { aggregate: "count" },
                    x: { field: "key" },
                  },
                },
                {
                  mark: "line",
                  encoding: {
                    color: {
                      field: "accuracy",
                      type: "quantitative",
                      scale: {
                        range: [
                          "#F4FAD4",
                          "#D7F1AC",
                          "#A9E3AF",
                          "#82CDBB",
                          "#63C1BF",
                          "#1DA8C9",
                          "#2367AC",
                          "#2B2D84",
                        ],
                      },
                    },
                    detail: { type: "nominal", field: "index" },
                    opacity: {
                      condition: {
                        param: "hover",
                        empty: false,
                        value: 1,
                      },
                      value: 0.3,
                    },
                    x: { type: "nominal", field: "key" },
                    y: { type: "quantitative", field: "norm_val", axis: null },
                    tooltip: [
                      {
                        type: "quantitative",
                        field: "learning_rate",
                      },
                      {
                        type: "quantitative",
                        field: "max_depth",
                      },
                      {
                        type: "quantitative",
                        field: "min_child_weight",
                      },
                      {
                        type: "quantitative",
                        field: "n_estimators",
                      },
                    ],
                  },
                  params: [
                    {
                      name: "hover",
                      select: {
                        type: "point",
                        on: "pointerover",
                      },
                    },
                  ],
                },
                {
                  encoding: {
                    x: { type: "nominal", field: "key" },
                    y: { value: 0 },
                  },
                  layer: [
                    {
                      mark: { type: "text", style: "label" },
                      encoding: {
                        text: { aggregate: "max", field: "max" },
                      },
                    },
                    {
                      mark: {
                        type: "tick",
                        style: "tick",
                        size: 8,
                        color: "#ccc",
                      },
                    },
                  ],
                },
                {
                  encoding: {
                    x: { type: "nominal", field: "key" },
                    y: { value: 150 },
                  },
                  layer: [
                    {
                      mark: { type: "text", style: "label" },
                      encoding: {
                        text: { aggregate: "min", field: "mid" },
                      },
                    },
                    {
                      mark: {
                        type: "tick",
                        style: "tick",
                        size: 8,
                        color: "#ccc",
                      },
                    },
                  ],
                },
                {
                  encoding: {
                    x: { type: "nominal", field: "key" },
                    y: { value: 300 },
                  },
                  layer: [
                    {
                      mark: { type: "text", style: "label" },
                      encoding: {
                        text: { aggregate: "min", field: "min" },
                      },
                    },
                    {
                      mark: {
                        type: "tick",
                        style: "tick",
                        size: 8,
                        color: "#ccc",
                      },
                    },
                  ],
                },
              ],
              config: {
                axisX: {
                  domain: false,
                  labelAngle: 0,
                  tickColor: "black",
                  title: null,
                },
                view: { stroke: null },
                style: {
                  label: { baseline: "middle", align: "right", dx: -5 },
                  tick: { orient: "horizontal" },
                },
              },
            }}
          />
        </Box>
      </Paper>
    </>
  )
}

export default ParallelCoordinatePlot
