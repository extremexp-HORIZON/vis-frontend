import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import { VegaLite, ViewListener } from "react-vega"
import { useEffect, useRef, useState } from "react"
import Typography from "@mui/material/Typography"
import FormControl from "@mui/material/FormControl"
import Select, { SelectChangeEvent } from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
import { setProgressParallel } from "../../store/slices/progressPageSlice"
import _ from "lodash"

const ParallelCoordinatePlot = () => {
  const { workflows, progressParallel } = useAppSelector(
    (state: RootState) => state.progressPage,
  )
  const parallelData = useRef<any[]>([])
  const foldArray = useRef<string[]>([])
  const tooltipArray = useRef<{ [key: string]: string }[]>([])
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (workflows.data.length > 0) {
      const uniqueParameters = new Set(
        workflows.data.reduce(
          (acc: any[], workflow) => [
            ...acc,
            ...Object.keys(
              workflow.variabilityPoints["Model Training"].Parameters,
            ),
          ],
          [],
        ),
      )
      foldArray.current = Array.from(uniqueParameters)
      const data = workflows.data
        .filter(workflow => workflow.workflowInfo.status === "completed")
        .map(workflow => ({
          ...Array.from(uniqueParameters).reduce((acc, variant) => {
            acc[variant] =
              (workflow.variabilityPoints["Model Training"].Parameters[
                variant
              ] !== "-"
                ? workflow.variabilityPoints["Model Training"].Parameters[
                    variant
                  ]
                : null) || ""
            return acc
          }, {}),
          ...workflow.metrics,
          workflowId: workflow.workflowId,
        }))
      parallelData.current = _.cloneDeep(data)
      const options = Object.keys(
        workflows.data.find(
          workflow => workflow.workflowInfo.status === "completed",
        )?.metrics || [],
      )
      tooltipArray.current = Object.keys(
        workflows.data.filter(
          workflow => workflow.workflowInfo.status === "completed",
        )[0].metrics,
      ).map(key => ({ field: key }))
      const selected = options[0]
      dispatch(
        setProgressParallel({
          data,
          options,
          selected,
        }),
      )
    }
  }, [workflows])

  const handleMetricSelection = (event: SelectChangeEvent) => {
    dispatch(setProgressParallel({ selected: event.target.value as string }))
  }

  const handleNewView = (view: any) => {
    view.addEventListener("click", (event: any, item: any) => {
      if (item && item.datum) {
        console.log(item.datum)
        console.log(view.data("mydata"))
      } else {
        console.log(null)
      }
    })
  }

  return (
    <>
      {progressParallel.data.length > 0 && (
        <Paper elevation={2}>
          <Box sx={{ display: "flex", alignItems: "center", px: 1.5 }}>
            <Typography fontSize={"0.8rem"}>Color by:</Typography>
            <FormControl
              sx={{ m: 1, minWidth: 120, maxHeight: 120 }}
              size="small"
            >
              <Select
                value={progressParallel.selected}
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
                {progressParallel.options.map(feature => (
                  <MenuItem key={`${feature}`} value={feature}>
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
                  name: "mydata",
                  values: parallelData.current,
                },
                transform: [
                  { window: [{ op: "count", as: "index" }] },
                  {
                    fold: foldArray.current,
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
                      "isNumber(datum.value) ? (datum.value - datum.min) / (datum.max - datum.min) : datum.value ",
                    as: "norm_val",
                  },
                  {
                    calculate:
                      "isNumber(datum.value) ? (datum.min + datum.max) / 2 : datum.value",
                    as: "mid",
                  },
                ],
                layer: [
                  {
                    mark: { type: "rule", color: "#ccc", strokeWidth: 2 },
                    encoding: {
                      detail: { field: "index" },
                      x: { field: "key" },
                    },
                  },
                  {
                    mark: {
                      type: "line",
                      point: true,
                    },
                    encoding: {
                      color: {
                        field: progressParallel.selected,
                        type: "quantitative",
                        scale: { scheme: "yellowgreenblue" },
                      },
                      tooltip: tooltipArray.current,
                      detail: { type: "nominal", field: "index" },
                      opacity: {
                        condition: {
                          param: "hover",
                          empty: false,
                          value: 1,
                        },
                        value: 1,
                      },
                      x: { type: "nominal", field: "key" },
                      y: {
                        type: "nominal",
                        field: "value",
                        axis: null,
                      },
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
                      y: { field: "value", type: "nominal" },
                    },
                    layer: [
                      {
                        mark: { type: "text", style: "label", size: 10 },
                        encoding: {
                          text: { field: "value", type: "nominal" },
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
      )}
    </>
  )
}

export default ParallelCoordinatePlot
