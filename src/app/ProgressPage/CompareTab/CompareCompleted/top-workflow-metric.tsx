import { useState, useMemo } from "react"
import { VegaLite, VisualizationSpec } from "react-vega"
import {
  Paper,
  Box,
  Typography,
  Tooltip,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material"
import InfoIcon from "@mui/icons-material/Info"
import { useAppSelector, RootState } from "../../../../store/store"

const TopWorkflowMetric = () => {
  const { workflows } = useAppSelector((state: RootState) => state.progressPage)

  // Extract unique metrics from workflows
  const metrics = useMemo(() => {
    if (!workflows.data || workflows.data.length === 0) return []
    const allMetrics = workflows.data.flatMap(workflow =>
      workflow.metrics ? Object.keys(workflow.metrics) : [],
    )
    return Array.from(new Set(allMetrics))
  }, [workflows.data])

  const [metric, setMetric] = useState(metrics[0] || "loss")

  const getTopTenWorkflowsByMetric = (metric: string) => {
    if (!workflows.data) return []

    const completedWorkflows = workflows.data.filter(
      workflow => workflow.metrics && workflow.metrics[metric] !== undefined,
    )
    completedWorkflows.sort(
      (a, b) => (b.metrics[metric] || 0) - (a.metrics[metric] || 0),
    )
    const topTenWorkflows = completedWorkflows.slice(0, 10)
    const chartData = topTenWorkflows.map(workflow => ({
      workflowId: workflow.workflowId,
      metricValue: workflow.metrics[metric],
    }))
    return chartData
  }

  const topTenWorkflows = getTopTenWorkflowsByMetric(metric)

  const spec = {
    width: "container",
    height: 400,
    mark: "bar",
    encoding: {
      x: {
        field: "workflowId",
        type: "ordinal",
        title: "Workflow ID",
        sort: { field: "metricValue", order: "descending" },
      },
      y: {
        field: "metricValue",
        type: "quantitative",
        title: `Top 10 Workflows by ${metric}`,
      },
      tooltip: [
        { field: "workflowId", type: "nominal", title: "Workflow ID" },
        {
          field: "metricValue",
          type: "quantitative",
          title: `${metric} Value`,
        },
      ],
    },
    data: { values: topTenWorkflows },
  }

  const handleMetricChange = (e: SelectChangeEvent<string>) => {
    setMetric(e.target.value)
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
          borderBottom: `1px solid grey`,
        }}
      >
        <Typography fontSize={"1rem"} fontWeight={600}>
          {"Top 10 Workflows By Metric"}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Tooltip title={"Description not available."}>
          <IconButton>
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", px: 1.5, py: 1 }}>
        <Typography fontSize={"0.8rem"}>Metric:</Typography>
        <FormControl sx={{ m: 1, minWidth: 120, maxHeight: 120 }} size="small">
          <Select
            value={metric}
            onChange={handleMetricChange}
            sx={{ fontSize: "0.8rem" }}
          >
            {metrics.map(metricOption => (
              <MenuItem key={metricOption} value={metricOption}>
                {metricOption.charAt(0).toUpperCase() + metricOption.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ px: 1.5, py: 1, flex: 1, width: "99%" }}>
        <VegaLite
          actions={false}
          style={{ width: "90%" }}
          spec={spec as VisualizationSpec}
        />
      </Box>
    </Paper>
  )
}

export default TopWorkflowMetric
