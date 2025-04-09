import { useEffect, useState } from "react"
import type {
  SelectChangeEvent} from "@mui/material";
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Chip
} from "@mui/material"
import type {
  RootState} from "../../../../store/store";
import {
  useAppSelector,
} from "../../../../store/store"
import WorkflowCard from "../../../../shared/components/workflow-card"
import ChartParameters from "./chart-parameters"
import ResponsiveVegaLite from "../../../../shared/components/responsive-vegalite"

interface ChartData {
  x: number
  y: number
  id: string
  point: string
}

const VariabilityPointCharts = () => {
  const { workflows } = useAppSelector((state: RootState) => state.progressPage)

  // Extract unique metrics and variability points from workflows
  const metrics = workflows.data
    ? Array.from(
        new Set(
          workflows.data.flatMap(workflow =>
            workflow.metrics ? workflow.metrics.filter(
              m => m?.semantic_type && m.semantic_type.includes("ML"),
            ).flatMap(m => m.name) : [],
          ),
        ),
      )
    : []
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

  const processData = (selectedMetric: string, variabilityPoints: string[]) => {
    if (!workflows.data) return []

    return variabilityPoints.flatMap(point =>
      workflows.data
        .filter(
          workflow =>
            workflow.status === "completed" &&
            workflow.metrics &&
            workflow.tasks.find(task => task.id === "TrainModel")?.parameters,
        )
        .map(workflow => ({
          x: parseFloat(
            workflow.tasks.find(task => task.id === "TrainModel")?.parameters?.find(param => param.name === point)?.value || "0"
        ) || 0,        
          y: workflow.metrics?.find(m => m.name === selectedMetric)?.value ? parseFloat(workflow.metrics?.find(m => m.name === selectedMetric)?.value || "0") : 0,
          id: workflow.workflowId,
          point,
        })),
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
  const [selectedVariabilityPoints, setSelectedVariabilityPoints] = useState(
    variabilityPoints.slice(0, 1),
  )
  const [chartWidth, setChartWidth] = useState(250) // Default width

  const chartData = processData(selectedMetric, selectedVariabilityPoints)
  const yAxisDomain = getYAxisDomain(chartData)

  const handleMetricChange = (event: SelectChangeEvent<string>) => {
    setSelectedMetric(event.target.value)
  }

  const handleVariabilityPointChange = (event: SelectChangeEvent<string[]>) => {
    setSelectedVariabilityPoints(
      Array.isArray(event.target.value)
        ? event.target.value
        : [event.target.value],
    )
  }

  const ITEM_HEIGHT = 48
  const ITEM_PADDING_TOP = 8
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  }

  useEffect(() => {
    const handleResize = () => {
      const chartContainerWidth =
        (document.querySelector(".chart-container") as HTMLElement | null)
          ?.offsetWidth || 300
      if (chartContainerWidth) {
        setChartWidth(
          Math.max(
            300,
            chartContainerWidth / selectedVariabilityPoints.length - 20,
          ),
        ) // 20px for margin
      }
    }

    window.addEventListener("resize", handleResize)
    handleResize() // Initial call to set width

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [selectedVariabilityPoints.length])

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
            multiple
            size="small"
            value={selectedVariabilityPoints}
            onChange={handleVariabilityPointChange}
            renderValue={selected => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map(value => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
            MenuProps={MenuProps}
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
        {selectedVariabilityPoints.map(point => (
          <Box width="40%" key={point}>
            <ResponsiveVegaLite
              minWidth={100}
              spec={{
                mark: { type: "point", tooltip: true },
                encoding: {
                  x: { field: "x", type: "nominal", title: point },
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
                    { field: "x", type: "nominal", title: point },
                    { field: "y", type: "quantitative", title: selectedMetric },
                  ],
                },
                data: {
                  values: chartData.filter(data => data.point === point),
                },
              }}
              actions={false}
            />
          </Box>
        ))}
      </Box>
    </WorkflowCard>
  )
}

export default VariabilityPointCharts
