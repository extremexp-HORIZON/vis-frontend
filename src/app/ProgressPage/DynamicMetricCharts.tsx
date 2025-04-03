import React, { useState } from "react"
import { RootState, useAppSelector } from "../../store/store"
import {
  Grid,
  Container,
  FormControlLabel,
  Switch,
  ButtonGroup,
  Button,
  Typography,
  Box,
} from "@mui/material"
import { useLocation } from "react-router-dom"
import ResponsiveCardVegaLite from "../../shared/components/responsive-card-vegalite"
import { max } from "lodash"

interface IMetric {
  name: string
  value: number
  timestamp: number
  step: number
}

interface IWorkflow {
  id: string
  name: string
  experimentId: string
  status: string
  startTime: number
  endTime: number
  params: any[]
  metrics: IMetric[]
  dataAssets: any[]
  tasks: any[]
  tags: any
}

const WorkflowCharts: React.FC = () => {
  const { workflowsTable } = useAppSelector(
    (state: RootState) => state.monitorPage,
  )

  const { workflows } = useAppSelector((state: RootState) => state.progressPage)
  const [isMosaic, setIsMosaic] = useState(true)

  const filteredWorkflows = workflows.data.filter((workflow: IWorkflow) =>
    workflowsTable.selectedWorkflows.includes(workflow.id),
  )

  const groupedMetrics = filteredWorkflows.reduce(
    (acc: any, workflow: IWorkflow) => {
      workflow.metrics.forEach(metric => {
        if (!acc[metric.name]) {
          acc[metric.name] = []
        }
        acc[metric.name].push({
          value: metric.value,
          step: metric.step, // Use step or timestamp as x-axis
          id: workflow.id,
          metricName: metric.name,
        })
      })
      return acc
    },
    {},
  )
  // Render charts for each grouped metric name
  const renderCharts = Object.keys(groupedMetrics).map(metricName => {
    const metricSeries = groupedMetrics[metricName]
    const uniqueSteps = new Set(metricSeries.map(m => m.step))
    const workflowColorMap = workflowsTable.workflowColors;
    const workflowColorScale = filteredWorkflows.map(wf => ({
      id: wf.id,
      color: workflowColorMap[wf.id] || "#000000", // Default to black if not found
    }));

    const chartSpec = {
      mark: uniqueSteps.size === 1 ? "bar" : "line",
      encoding: {
        x: {
          field: uniqueSteps.size === 1 ? "id" : "step",
          type: "ordinal",
          axis: { labels: false }, // Hide x-axis labels
          scale: {
            padding: 0.05, // Adds 2% extra space to the right
          }
  
        },
        y: {
          field: "value",
          type: "quantitative",
          scale: {
            domain: [
              0, // Min value is 0 (or any other value you'd like)
              Math.max(...metricSeries.map((d: any) => d.value)) * 1.05, // Max value with 10% padding
            ],
          },
        },
        color: {
          field: "id",
          type: "nominal",
          scale: {
            domain: workflowColorScale.map(w => w.id), // Workflow IDs
            range: workflowColorScale.map(w => w.color), // Corresponding Colors
          },
          legend: null,
        },        tooltip: [
          { field: "id", type: "nominal" },
          // { field: "step", type: "quantitative" },
          { field: "value", type: "quantitative" },
        ],
      },
      data: { values: metricSeries },
    }

    return (
      <Grid
        item
        xs={isMosaic ? 6 : 12}
        key={metricName}
        sx={{ textAlign: "left", width: "100%" }} // Ensure full width
      >
        <ResponsiveCardVegaLite
          spec={chartSpec}
          actions={false}
          title={metricName}
          sx={{ width: "100%", maxWidth: "100%" }} // Ensure it expands properly
        />
      </Grid>
    )
  })

  if (workflowsTable.selectedWorkflows.length === 0) {
    return  <Box sx={{ display: "flex", height: "20rem", justifyContent: "center", alignItems: "center" }}>
    <Typography align="center" fontWeight="bold">Select Workflows to display metrics.</Typography>
    </Box> // Or you can return some placeholder text/UI
  }

  return (
    <Container sx={{ maxWidth: "100%" }}>
      <Grid
        container
        justifyContent="flex-end" // Align to the right
        alignItems="center"
        sx={{ marginBottom: 2 }}
      >
        <ButtonGroup
          variant="contained"
          aria-label="view mode"
          sx={{
            height: "25px", // Ensure consistent height for the button group
          }}
        >
          <Button onClick={() => setIsMosaic(true)} disabled={isMosaic}>
            Mosaic
          </Button>
          <Button onClick={() => setIsMosaic(false)} disabled={!isMosaic}>
            One Row
          </Button>
        </ButtonGroup>
      </Grid>
      <Grid container spacing={2} sx={{ width: "100%", margin: "0 auto" }}>
        {renderCharts}
      </Grid>
    </Container>
  )
}

export default WorkflowCharts
