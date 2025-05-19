import { useEffect, useState } from "react"
import type {
  SelectChangeEvent} from "@mui/material";
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem
} from "@mui/material"
import type {
  RootState} from "../../../store/store";
import {
  useAppSelector,
  useAppDispatch,
} from "../../../store/store"
import WorkflowCard from "../../../shared/components/workflow-card"
import ChartParameters from "./chart-parameters"
import ResponsiveVegaLite from "../../../shared/components/responsive-vegalite"

interface ChartData {
  x: number
  y: number
  id: string
  point: string
}

const VariabilityPointCharts = () => {
  const { workflows } = useAppSelector((state: RootState) => state.progressPage)
  const dispatch = useAppDispatch()

  // Extract unique metrics and variability points from workflows
  const metrics = workflows.data
    ? Array.from(
        new Set(
          workflows.data.flatMap(workflow =>
            workflow.metrics ? workflow.metrics.flatMap(m => m.name) : [],
          ),
        ),
      )
    : []

  const variabilityPoints = workflows.data
    ? Array.from(
        new Set(
          workflows.data.flatMap(workflow =>
              workflow.params?.map(param => param.name) || []
          ),
        ),
      )
    : []

  const processData = (selectedMetric: string, variabilityPoint: string) => {
    if (!workflows.data) return []

      return  workflows.data
        .filter(
          workflow =>
            workflow.status === "COMPLETED" &&
            workflow.metrics &&
            workflow.params?.find(param => param.name === variabilityPoint),
        )
        .map(workflow => ({
          x: parseFloat(workflow.params?.find(param => param.name === variabilityPoint)?.value || "0")|| 0,
          y: workflow.metrics?.find(m => m.name === selectedMetric)?.value  || 0,
          id: workflow.id,
          point: variabilityPoint,
        }),
    )
  }

  const getYAxisDomain = (data: ChartData[]) => {
    if (data.length === 0) return { min: 0, max: 1 }

    const values = data.map(d => d.y)
    const min = Math.min(...values)
    const max = Math.max(...values)
    return { min, max }
  }

  const [selectedMetric, setSelectedMetric] = useState(metrics[0] || "accuracy")
  const [selectedVariabilityPoint, setSelectedVariabilityPoint] = useState<string>(
    variabilityPoints[0],
  )

  const chartData = processData(selectedMetric, selectedVariabilityPoint)
  const yAxisDomain = getYAxisDomain(chartData)

  const handleMetricChange = (event: SelectChangeEvent<string>) => {
    setSelectedMetric(event.target.value)
  }

  const handleVariabilityPointChange = (event: SelectChangeEvent<string>) => {
    setSelectedVariabilityPoint(event.target.value)
  }

  useEffect(() => {
    const handleResize = () => {
      // if (chartContainerWidth) {
      //   setChartWidth(
      //     Math.max(
      //       300,
      //       chartContainerWidth / selectedVariabilityPoints.length - 20,
      //     ),
      //   ) // 20px for margin
      // }
    }

    window.addEventListener("resize", handleResize)
    handleResize() // Initial call to set width

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [selectedVariabilityPoint])

  return (
    <WorkflowCard
      title="Impact of Variability Points on Metrics (small multiples)"
      description="Description not available"
    >
      <ChartParameters>
        <Typography fontSize={"0.8rem"}>Variability Points</Typography>

        <FormControl sx={{ m: 1, minWidth: 120, maxHeight: 120 }} size="small">
          <Select
            labelId="variability-point-select-label"
            size="small"
            value={selectedVariabilityPoint}
            onChange={handleVariabilityPointChange}
            sx={{ fontSize: "0.8rem" }}
          >
            {variabilityPoints.map(point => (
              <MenuItem key={point} value={point}>
                {point}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography fontSize={"0.8rem"} sx={{ ml: 2 }}>
          Metric
        </Typography>
        <FormControl sx={{ m: 1, minWidth: 120, maxHeight: 120 }} size="small">
          <Select
            labelId="metric-select-label"
            size="small"
            value={selectedMetric}
            onChange={handleMetricChange}
            sx={{ fontSize: "0.8rem" }}
          >
            {metrics.map(metric => (
              <MenuItem key={metric} value={metric}>
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </ChartParameters>
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
          <Box width="40%" key={"variability-point-chart"}>
            <ResponsiveVegaLite
              minWidth={100}
              spec={{
                mark: { type: "point", tooltip: true },
                encoding: {
                  x: { field: "x", type: "nominal", title: selectedVariabilityPoint },
                  y: {
                    field: "y",
                    type: "quantitative",
                    title: selectedMetric,
                    scale: { domain: [yAxisDomain.min, yAxisDomain.max] },
                  },
                  color: {
                    field: "id",
                    type: "nominal",
                    legend: null,
                    scale: { scheme: "category10" },
                  },
                  tooltip: [
                    { field: "id", type: "nominal", title: "Workflow ID" },
                    { field: "x", type: "nominal", title: selectedVariabilityPoint },
                    { field: "y", type: "quantitative", title: selectedMetric },
                  ],
                },
                data: {
                  values: chartData.filter(data => data.point === selectedVariabilityPoint),
                },
              }}
              actions={false}
            />
          </Box>
      </Box>
    </WorkflowCard>
  )
}

export default VariabilityPointCharts
