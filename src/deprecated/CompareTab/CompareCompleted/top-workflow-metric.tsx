import { useState, useMemo } from "react"
import type { VisualizationSpec } from "react-vega"
import type {
  SelectChangeEvent} from "@mui/material";
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem
} from "@mui/material"
import type { RootState } from "../../../store/store";
import { useAppSelector } from "../../../store/store"
import WorkflowCard from "../../../shared/components/workflow-card"
import ChartParameters from "./chart-parameters"
import ResponsiveVegaLite from "../../../shared/components/responsive-vegalite"
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import type { IMetric } from "../../../shared/models/experiment/metric.model"

const TopWorkflowMetric = () => {
  const { workflows } = useAppSelector((state: RootState) => state.progressPage)

  // Extract unique metrics from workflows
  const metrics = useMemo(() => {
    if (!workflows.data || workflows.data.length === 0) return []
    const allMetrics = workflows.data.flatMap(workflow =>
      workflow.metrics ? workflow.metrics.flatMap(metric => metric.name) : [],
    )
    return Array.from(new Set(allMetrics))
  }, [workflows.data])

  const [metric, setMetric] = useState(metrics[0] || "loss")

  const metricAvailability = (metrics: IMetric[], metricName: string) => {
    return metrics.some(metric => metric.name === metricName)
  }

  const getTopTenWorkflowsByMetric = (metric: string) => {
    if (!workflows.data) return []

    const completedWorkflows = workflows.data.filter(
      workflow =>
        workflow.metrics &&
        metricAvailability(workflow.metrics, metric) &&
        workflow.status === "COMPLETED",
    )

    completedWorkflows.sort(
      (a, b) =>
        (b.metrics?.find(m => m.name === metric)?.value ||0) 
        -
        (a.metrics?.find(m => m.name === metric)?.value || 0),
    )

    const topTenWorkflows = completedWorkflows.slice(0, 10)
    const chartData = topTenWorkflows.map(workflow => ({
      workflowId: workflow.id,
      metricValue: workflow.metrics?.find(m => m.name === metric)?.value || 0,
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
      { topTenWorkflows.some(workflow => workflow.metricValue) ? (
        <Box sx={{ textAlign: "center", m: 2 }}>
          <ResponsiveVegaLite
            minWidth={100}
            aspectRatio={2 / 1}
            actions={false}
            spec={spec as VisualizationSpec}
          />
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
  )
}

export default TopWorkflowMetric
