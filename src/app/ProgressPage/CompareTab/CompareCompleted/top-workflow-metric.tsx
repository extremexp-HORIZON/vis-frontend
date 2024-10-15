import { useState, useMemo } from "react"
import { VisualizationSpec } from "react-vega"
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material"
import { useAppSelector, RootState } from "../../../../store/store"
import WorkflowCard from "../../../../shared/components/workflow-card"
import ChartParameters from "./chart-parameters"
import ResponsiveVegaLite from "../../../../shared/components/responsive-vegalite"

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
    <WorkflowCard
      title="Top 10 Workflows By Metric"
      description="Description not available"
    >
      <ChartParameters>
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
      </ChartParameters>
      <Box sx={{ textAlign: "center", m: 2 }}>
        <ResponsiveVegaLite
          minWidth={100}
          aspectRatio={2 / 1}
          actions={false}
          spec={spec as VisualizationSpec}
        />
      </Box>
    </WorkflowCard>
  )
}

export default TopWorkflowMetric
