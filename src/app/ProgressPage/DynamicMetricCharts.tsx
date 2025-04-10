import React, { useState } from "react"
import { RootState, useAppSelector } from "../../store/store"
import {
  Grid,
  Container,
  ButtonGroup,
  Button,
} from "@mui/material"
import ResponsiveCardVegaLite from "../../shared/components/responsive-card-vegalite"
import InfoMessage from "../../shared/components/InfoMessage"
import AssessmentIcon from "@mui/icons-material/Assessment"

interface IMetric {
  name: string
  value: number
  timestamp: number
  step: number
}

const WorkflowCharts: React.FC = () => {
  const { workflowsTable } = useAppSelector(
    (state: RootState) => state.monitorPage,
  )
  const [isMosaic, setIsMosaic] = useState(true)

  const filteredWorkflows = (
    workflowsTable.groupBy.length > 0
      ? workflowsTable.aggregatedRows
      : workflowsTable.filteredRows
  ).filter(row => workflowsTable.selectedWorkflows.includes(row.id))

  

  const groupedMetrics: Record<string, IMetric[]> = workflowsTable.uniqueMetrics.reduce(
    (acc: any, metricName: string) => {
      acc[metricName] = []

      filteredWorkflows.forEach(workflow => {
        if (workflow.hasOwnProperty(metricName)) {
          acc[metricName].push({
            value: workflow[metricName],
            id: workflow.id,
            metricName,
            step: workflow.step ?? 0, // Fallback to 0 if step is missing
          })
        }
      })

      return acc
    },
    {} as Record<string, IMetric[]>
  )
  // Render charts for each grouped metric name
  const renderCharts = Object.keys(groupedMetrics).map(metricName => {
    const metricSeries = groupedMetrics[metricName]
    const uniqueSteps = new Set(metricSeries.map(m => m.step))
    const workflowColorMap = workflowsTable.workflowColors
    const workflowColorScale = filteredWorkflows.map(wf => ({
      id: wf.id,
      color: workflowColorMap[wf.id] || "#000000", // Default to black if not found
    }))

    const chartSpec = {
      mark: uniqueSteps.size === 1 ? "bar" : "line",
      encoding: {
        x: {
          field: uniqueSteps.size === 1 ? "id" : "step",
          type: "ordinal",
          axis: { labels: false,title:null }, // Hide x-axis labels
          scale: {
            paddingInner: 0.2,
            paddingOuter: 1,
          },
        },
        y: {
          field: "value",
          type: "quantitative",
          axis:{title:null},
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
        },
        tooltip: [
          { field: "id", type: "nominal" },
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
    return (
      <InfoMessage 
        message="Select Workflows to display metrics."
        type="info"
        icon={<AssessmentIcon sx={{ fontSize: 40, color: "info.main" }} />}
        fullHeight
      />
    )
  }

  return (
    <Container maxWidth={false} >
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
          <Button
            variant={isMosaic ? "contained" : "outlined"}
            color="primary"
            onClick={() => setIsMosaic(true)}
          >
            Mosaic
          </Button>
          <Button
            variant={!isMosaic ? "contained" : "outlined"}
            color="primary"
            onClick={() => setIsMosaic(false)}
          >
            One Row
          </Button>
        </ButtonGroup>
      </Grid>
      <Grid
        container
        spacing={2}
        sx={{ width: "100%", margin: "0 auto", flexWrap: "wrap" }}
      >
        {renderCharts}
      </Grid>
    </Container>
  )
}

export default WorkflowCharts
