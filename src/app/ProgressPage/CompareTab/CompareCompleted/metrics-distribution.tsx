import { useState } from "react"
import { Vega, VegaLite } from "react-vega"
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  IconButton,
  Paper,
  Tooltip,
} from "@mui/material"
import { grey } from "@mui/material/colors"
import InfoIcon from "@mui/icons-material/Info"

const MetricsDistribution = () => {
  const metrics = ["accuracy", "precision", "recall"]
  const [selectedMetrics, setSelectedMetrics] = useState(["accuracy"])

  const handleMetricChange = (event: any) => {
    const {
      target: { value },
    } = event
    setSelectedMetrics(typeof value === "string" ? value.split(",") : value)
  }

  // Dummy data
  const data = [
    { metricName: "accuracy", value: 0.7 },
    { metricName: "accuracy", value: 0.8 },
    { metricName: "accuracy", value: 0.65 },
    { metricName: "precision", value: 0.6 },
    { metricName: "precision", value: 0.7 },
    { metricName: "precision", value: 0.55 },
    { metricName: "recall", value: 0.5 },
    { metricName: "recall", value: 0.6 },
    { metricName: "recall", value: 0.45 },
    { metricName: "runtime", value: 1.2 },
    { metricName: "runtime", value: 1.5 },
    { metricName: "runtime", value: 1.1 },
  ]

  const getFilteredData = (metric: any) => {
    return  data.filter(d => d.metricName === metric)
  }

  return (
    <Paper
      className="Category-Item"
      elevation={2}
      sx={{
        borderRadius: 4,
        width: "inherit",
        display: "flex",
        flexDirection: "column",
        rowGap: 0,
        minWidth: "300px",
        height: "100%",
      }}
    >
      <Box
        sx={{
          px: 1.5,
          py: 0.5,
          display: "flex",
          alignItems: "center",
          borderBottom: `1px solid ${grey[400]}`,
        }}
      >
        <Typography fontSize={"1rem"} fontWeight={600}>
          {"Distribution of Metrics Across Workflows"}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Tooltip title={"Description not available"}>
          <IconButton>
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", px: 1.5 }}>
        <Typography fontSize={"0.8rem"}>Metrics:</Typography>
        <FormControl sx={{ m: 1, minWidth: 120, maxHeight: 120 }} size="small">
          <Select
            labelId="metric-select-label"
            multiple
            value={selectedMetrics}
            onChange={handleMetricChange}
            renderValue={selected => (selected as string[]).join(", ")}
          >
            {metrics.map(metric => (
              <MenuItem key={metric} value={metric}>
                <Checkbox checked={selectedMetrics.indexOf(metric) > -1} />
                <ListItemText primary={metric} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box
        sx={{
          width: "99%",
          px: 1,
          display: "flex",
          justifyContent: "center",
          height: "100%",
          flexWrap: "wrap",
        }}
      >
        {selectedMetrics.map(metric => (
          <VegaLite
            key={`metric-${metric}-distribution`}
            actions={false}
            style={{ width: "max-content" }}
            spec={{
              width: 300,
              height: 200,
              padding: 5,
              config: {
                axisBand: {
                  bandPosition: 1,
                  tickExtra: false,
                  tickOffset: 0,
                },
              },
              signals: [
                { name: "plotWidth", update: "(width - 50)/3" },
                { name: "height", update: "height" },
                { name: "trim", value: false }, // Default value set to false
                { name: "bandwidth", value: 0.1 }, // Default value set to 0
              ],
              data: [
                {
                  name: "dummyData",
                  values: getFilteredData(metric),
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
                      xc: { scale: "layout", field: "metricName", band: 0.5 },
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
                          width: { value: 5 },
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
                          height: { value: 20 },
                          width: { value: 20 },
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
        ))}
      </Box>
    </Paper>
  )
}

export default MetricsDistribution
