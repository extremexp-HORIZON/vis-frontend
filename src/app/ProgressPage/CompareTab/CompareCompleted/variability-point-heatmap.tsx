import React, { useState, useMemo } from "react"
import { VegaLite, VisualizationSpec } from "react-vega"
import {
  FormControl,
  Select,
  MenuItem,
  Typography,
  SelectChangeEvent,
  Box,
} from "@mui/material"
import {
  useAppSelector,
  useAppDispatch,
  RootState,
} from "../../../../store/store"
import WorkflowCard from "../../../../shared/components/workflow-card"
import ChartParameters from "./chart-parameters"
import ResponsiveVegaLite from "../../../../shared/components/responsive-vegalite"

interface ChartData {
  x: number
  y: number
  value: number
  id: string
}

const VariabilityPointHeatmap: React.FC = () => {
  const { workflows } = useAppSelector((state: RootState) => state.progressPage)
  const dispatch = useAppDispatch()

  // Derive available metrics and variability points from the workflows data
  const metrics = useMemo(() => {
    if (!workflows.data || workflows.data.length === 0) return []
    const allMetrics = workflows.data.flatMap(workflow =>
      workflow.metrics ? workflow.metrics.filter(
        m => m?.semantic_type && m.semantic_type.includes("ML"),
      ).flatMap(metric => metric.name) : [],
    )
    return Array.from(new Set(allMetrics))
  }, [workflows.data])

  const variabilityPoints = workflows.data
    ? Array.from(
        new Set(
          workflows.data.flatMap(workflow =>
            workflow.tasks.findIndex(task => task.id === "TrainModel") !== -1
              ? workflow.tasks.find(task => task.id === "TrainModel")?.parameters?.map(param => param.name) || []
              : [],
          ),
        ),
      )
    : []

  const processData = (
    selectedMetric: string,
    xVarPoint: string,
    yVarPoint: string,
  ): ChartData[] => {
    return workflows.data
      .filter(
        workflow =>
          workflow.status === "completed" && workflow.metrics,
      )
      .map(workflow => ({
        x: parseFloat(workflow.tasks.find(task => task.id === "TrainModel")?.parameters?.find(param => param.name === xVarPoint)?.value || "0")|| 0,
        y: parseFloat(workflow.metrics?.find(m => m.name === yVarPoint)?.value || "0") || 0,
        id: workflow.workflowId,
        value: parseFloat(workflow.metrics?.find(m => m.name === selectedMetric)?.value || "0") || 0,
      }))
  }

  const [selectedMetric, setSelectedMetric] = useState<string>(
    metrics[0] || "accuracy",
  )
  const [selectedXVarPoint, setSelectedXVarPoint] = useState<string>(
    variabilityPoints[0],
  )
  const [selectedYVarPoint, setSelectedYVarPoint] = useState<string>(
    variabilityPoints[1],
  )

  const chartData = processData(
    selectedMetric,
    selectedXVarPoint,
    selectedYVarPoint,
  )

  const handleMetricChange = (event: SelectChangeEvent<string>) => {
    setSelectedMetric(event.target.value as string)
  }

  const handleXVarPointChange = (event: SelectChangeEvent<string>) => {
    setSelectedXVarPoint(event.target.value as string)
  }

  const handleYVarPointChange = (event: SelectChangeEvent<string>) => {
    setSelectedYVarPoint(event.target.value as string)
  }

  const spec: VisualizationSpec = {
    mark: { type: "rect", tooltip: true },
    encoding: {
      x: { field: "x", type: "nominal", title: selectedXVarPoint },
      y: { field: "y", type: "nominal", title: selectedYVarPoint },
      color: { field: "value", type: "quantitative", title: selectedMetric },
      tooltip: [
        { field: "id", type: "nominal", title: "Workflow ID" },
        { field: "x", type: "nominal", title: selectedXVarPoint },
        { field: "y", type: "nominal", title: selectedYVarPoint },
        { field: "value", type: "quantitative", title: selectedMetric },
      ],
    },
    data: { values: chartData },
  }

  return (
    <WorkflowCard
      title="Impact of Variability Points on Metrics (Heatmap)"
      description="Description not available"
    >
      <ChartParameters>
        <Typography fontSize={"0.8rem"}>Metric</Typography>
        <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
          <Select
            labelId="metric-select-label"
            value={selectedMetric}
            onChange={handleMetricChange}
          >
            {metrics.map(metric => (
              <MenuItem key={metric} value={metric}>
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography fontSize={"0.8rem"} sx={{ ml: 2 }}>
          x-Axis
        </Typography>
        <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
          <Select
            labelId="x-var-point-select-label"
            value={selectedXVarPoint}
            onChange={handleXVarPointChange}
          >
            {variabilityPoints.map(point => (
              <MenuItem key={point} value={point}>
                {point.charAt(0).toUpperCase() + point.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography fontSize={"0.8rem"} sx={{ ml: 2 }}>
          y-Axis
        </Typography>
        <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
          <Select
            labelId="y-var-point-select-label"
            value={selectedYVarPoint}
            onChange={handleYVarPointChange}
          >
            {variabilityPoints.map(point => (
              <MenuItem key={point} value={point}>
                {point.charAt(0).toUpperCase() + point.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </ChartParameters>

      <Box
        sx={{
          textAlign: "center",
          m: 2,
        }}
      >
        <ResponsiveVegaLite
          minWidth={100}
          minHeight={100}
          aspectRatio={1 / 0.75}
          actions={false}
          spec={spec}
        />
      </Box>
    </WorkflowCard>
  )
}

export default VariabilityPointHeatmap
