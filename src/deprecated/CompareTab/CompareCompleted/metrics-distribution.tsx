import { useMemo, useState } from "react"
import {
  Typography,
  FormControl,
  Select,
  MenuItem,
  ListItemText,
  Box,
} from "@mui/material"
import type { RootState} from "../../../store/store";
import { useAppSelector } from "../../../store/store"
import WorkflowCard from "../../../shared/components/workflow-card"
import ChartParameters from "./chart-parameters"
import ResponsiveVegaLite from "../../../shared/components/responsive-vegalite"
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import type { IMetric } from "../../../shared/models/experiment/metric.model"

const MetricsDistribution = () => {
  const { workflows } = useAppSelector((state: RootState) => state.progressPage)

  const availableMetrics = useMemo(() => {
    if (!workflows.data || workflows.data.length === 0) return []
    const metricsSet = new Set<string>()

    workflows.data
      .filter(workflow => workflow.status === "COMPLETED")
      .forEach(workflow => {
        workflow.metrics.forEach((item: any) => {
          metricsSet.add(item.name)
        })
      })
    return Array.from(metricsSet)
  }, [workflows.data])

  const metricAvailability = (metrics: IMetric[], metricName: string) => {
    return metrics.some(metric => metric.name === metricName)
  }

  const getData = (metric: string) => {
    const completedWorkflows = workflows.data.filter(
      workflow =>
        workflow.metrics &&
        metricAvailability(workflow.metrics, metric) &&
        workflow.status === "COMPLETED",
    )

    completedWorkflows.sort(
      (a, b) =>
        (
          b.metrics?.find(m => m.name === metric)?.value
        || 0) -
        (
          a.metrics?.find(m => m.name === metric)?.value
        || 0),
    )

    return completedWorkflows.map(workflow => ({
      metricName: metric,
      value: workflow.metrics?.find(m => m.name === metric)
        ?.value,
    }))
  }

  const [selectedMetrics, setSelectedMetrics] = useState<string>(
    availableMetrics[0],
  )

  const data = getData(selectedMetrics)
  
  const handleMetricChange = (event: any) => {
    const {
      target: { value },
    } = event
    setSelectedMetrics(value)
  }
  return (
    <>
      <WorkflowCard
        title="Distribution of Metrics Across Workflows"
        description="Description not available"
      >
        <ChartParameters>
          <Typography fontSize={"0.8rem"}>Metrics:</Typography>
          <FormControl
            sx={{ m: 1, minWidth: 120, maxHeight: 120 }}
            size="small"
          >
            <Select
              value={selectedMetrics}
              onChange={handleMetricChange}
              sx={{ fontSize: "0.8rem" }}
            >
              {availableMetrics.map(metric => (
                <MenuItem key={metric} value={metric}>
                  <ListItemText
                    primary={metric.charAt(0).toUpperCase() + metric.slice(1)}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </ChartParameters>
        {data.some(d => d.value) ? (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-evenly",
              p: 1,
              className: "chart-container",
              alignItems: "center",
            }}
          >
            <Box width="40%" key={`metric-${selectedMetrics}-distribution`}>
              <ResponsiveVegaLite
                minHeight={100}
                actions={false}
                spec={{
                  config: {
                    axisBand: {
                      bandPosition: 1,
                      tickExtra: false,
                      tickOffset: 0,
                    },
                  },
                  signals: [
                    { name: "plotWidth", update: "(width - 50)/3" },
                    { name: "trim", value: false }, // Default value set to false
                    { name: "bandwidth", value: 0.1 }, // Default value set to 0
                  ],
                  data: [
                    {
                      name: "dummyData",
                      values: data,
                    },
                    {
                      name: "density",
                      source: "dummyData",
                      transform: [
                        {
                          type: "kde",
                          field: "value",
                          groupby: ["metricName"],
                          bandwidth: { signal: "bandwidth" },
                          extent: { signal: "trim ? null : [0, 2]" },
                        },
                      ],
                    },
                    {
                      name: "stats",
                      source: "dummyData",
                      transform: [
                        {
                          type: "aggregate",
                          groupby: ["metricName"],
                          fields: ["value", "value", "value"],
                          ops: ["q1", "median", "q3"],
                          as: ["q1", "median", "q3"],
                        },
                      ],
                    },
                  ],
                  scales: [
                    {
                      name: "layout",
                      type: "band",
                      range: "width",
                      domain: { data: "dummyData", field: "metricName" },
                    },
                    {
                      name: "yscale",
                      type: "linear",
                      range: "height",
                      round: true,
                      domain: { data: "dummyData", field: "value" },
                      domainMin: 0,
                      domainMax: 1.5,
  
                      zero: false,
                      nice: true,
                      reverse: false,
                    },
                    {
                      name: "hscale",
                      type: "linear",
                      range: [0, { signal: "plotWidth" }],
                      domain: { data: "density", field: "density" },
                    },
                    {
                      name: "color",
                      type: "ordinal",
                      domain: { data: "dummyData", field: "metricName" },
                      range: "category",
                    },
                  ],
                  axes: [
                    { orient: "bottom", scale: "layout", zindex: 1 },
                    { orient: "left", scale: "yscale", zindex: 1 },
                  ],
                  marks: [
                    {
                      type: "group",
                      from: {
                        facet: {
                          data: "density",
                          name: "violin",
                          groupby: "metricName",
                        },
                      },
                      encode: {
                        enter: {
                          xc: {
                            scale: "layout",
                            field: "metricName",
                            band: 0.5,
                          },
                          width: { signal: "plotWidth" },
                          height: { signal: "height" },
                        },
                      },
                      data: [
                        {
                          name: "summary",
                          source: "stats",
                          transform: [
                            {
                              type: "filter",
                              expr: "datum.metricName === parent.metricName",
                            },
                          ],
                        },
                      ],
                      marks: [
                        {
                          type: "area",
                          from: { data: "violin" },
                          encode: {
                            enter: {
                              fill: {
                                scale: "color",
                                field: { parent: "metricName" },
                              },
                              orient: { value: "horizontal" },
                              tooltip: {
                                signal:
                                  "{'Metric': parent.metricName, 'WorkflowId': parent.workflowId,'Value': datum.value, 'Density': datum.density}",
                              },
                            },
                            update: {
                              y: { scale: "yscale", field: "value" },
                              xc: { signal: "plotWidth / 2" },
                              width: { scale: "hscale", field: "density" },
                            },
                          },
                        },
                        {
                          type: "rect",
                          from: { data: "summary" },
                          encode: {
                            enter: {
                              fill: { value: "black" },
                              width: { value: 2 },
                              tooltip: {
                                signal:
                                  "{'Metric': parent.metricName,'WorkflowId': parent.workflowId, 'Q1': datum.q1, 'Q3': datum.q3}",
                              },
                            },
                            update: {
                              y: { scale: "yscale", field: "q1" },
                              y2: { scale: "yscale", field: "q3" },
                              xc: { signal: "plotWidth / 2" },
                            },
                          },
                        },
                        {
                          type: "rect",
                          from: { data: "summary" },
                          encode: {
                            enter: {
                              fill: { value: "black" },
                              height: { value: 10 },
                              width: { value: 10 },
                              tooltip: {
                                signal:
                                  "{'Metric': parent.metricName,'WorkflowId': parent.workflowId, 'Median': datum.median}",
                              },
                            },
                            update: {
                              y: { scale: "yscale", field: "median" },
                              xc: { signal: "plotWidth / 2" },
                            },
                          },
                        },
                      ],
                    },
                  ],
                }}
              />
            </Box>
          </Box>        
        ) : (
          <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column"
          }}
          >
            <ReportProblemRoundedIcon fontSize="large" />
            <Typography>{"No Metric Data"}</Typography>
          </Box>
        )}
      </WorkflowCard>
    </>
  )
}

export default MetricsDistribution
