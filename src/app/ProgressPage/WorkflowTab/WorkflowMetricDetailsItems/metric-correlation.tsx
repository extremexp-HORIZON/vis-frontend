import { useState } from "react"
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Paper,
  Tooltip,
} from "@mui/material"
import { VegaLite } from "react-vega"
import InfoIcon from "@mui/icons-material/Info"
import grey from "@mui/material/colors/grey"

interface Metric {
  name: string;
  value: number;
  avgDiff: number;
}

interface IMetricCorrelation {
  availableMetrics: Metric[] | null;
  workflowId: number;
}

const MetricCorrelation = (props: IMetricCorrelation) => {
  const { availableMetrics, workflowId } = props
  const [xMetric, setXMetric] = useState("Precision")
  const [yMetric, setYMetric] = useState("Accuracy")

  const handleAxisSelection =
    (axis: string) => (e: { target: { value: string } }) => {
      if (axis === "x") {
        setXMetric(e.target.value)
      } else {
        setYMetric(e.target.value)
      }
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
          {"Metric Correlation"}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Tooltip title={"Description not available."}>
          <IconButton>
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </Box>
      {availableMetrics ? <><Box sx={{ display: "flex", flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center", px: 1.5 }}>
          <Typography fontSize={"0.8rem"}>x-axis:</Typography>
          <FormControl
            sx={{ m: 1, minWidth: 120, maxHeight: 120 }}
            size="small"
          >
            <Select
              value={xMetric}
              onChange={handleAxisSelection("x")}
              sx={{ fontSize: "0.8rem" }}
            >
              {availableMetrics.map(metric => (
                <MenuItem key={metric.name} value={metric.name}>
                  {metric.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", px: 1.5 }}>
          <Typography fontSize={"0.8rem"}>y-axis:</Typography>
          <FormControl
            sx={{ m: 1, minWidth: 120, maxHeight: 120 }}
            size="small"
          >
            <Select
              value={yMetric}
              onChange={handleAxisSelection("y")}
              sx={{ fontSize: "0.8rem" }}
            >
              {availableMetrics.map(metric => (
                <MenuItem key={metric.name} value={metric.name}>
                  {metric.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
      <Box sx={{ width: "99%", px: 1 }}>
        <VegaLite
          actions={false}
          style={{ width: "90%" }}
          spec={{
            $schema: "https://vega.github.io/schema/vega/v5.json",
            description: "A correlation plot between selected metrics.",
            width: 800,
            height: 765,
            padding: 110,
            autosize: { type: "none", contains: "padding", resize: true },
            data: [
              {
                name: "table",
                values: availableMetrics.map(metric => ({
                  x:
                    metric.name === xMetric
                      ? metric.value
                      : metric.value * (1 + metric.avgDiff / 100),
                  y:
                    metric.name === yMetric
                      ? metric.value
                      : metric.value * (1 + metric.avgDiff / 100),
                  category:
                    metric.name === xMetric || metric.name === yMetric
                      ? `Workflow ${workflowId}`
                      : "Experiment Average",
                })),
              },
            ],
            scales: [
              {
                name: "x",
                type: "linear",
                range: "width",
                zero: true,
                domain: { data: "table", field: "x" },
              },
              {
                name: "y",
                type: "linear",
                range: "height",
                zero: true,
                nice: true,
                domain: { data: "table", field: "y" },
              },
              {
                name: "color",
                type: "ordinal",
                domain: { data: "table", field: "category" },
                range: { scheme: "category10" },
              },
            ],
            axes: [
              { orient: "bottom", scale: "x", title: xMetric },
              { orient: "left", scale: "y", title: yMetric },
            ],
            marks: [
              {
                type: "symbol",
                from: { data: "table" },
                encode: {
                  enter: {
                    x: { scale: "x", field: "x" },
                    y: { scale: "y", field: "y" },
                    fill: { scale: "color", field: "category" },
                    size: { value: 100 },
                    tooltip: {
                      signal: `{'${xMetric}': format(datum.x, '.2f'), '${yMetric}': format(datum.y, '.2f'), 'Category': datum.category}`,
                    },
                  },
                },
              },
            ],
            legends: [
              {
                fill: "color",
                orient: "right",
                title: "Category",
                encode: {
                  symbols: {
                    update: {
                      shape: { value: "circle" },
                      stroke: { value: "transparent" },
                    },
                  },
                },
              },
            ],
          }}
        />
      </Box>
      </> : <Typography>No metrics available</Typography>}
    </Paper>
  )
}

export default MetricCorrelation
