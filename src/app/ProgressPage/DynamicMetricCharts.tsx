import type React from "react";
import { useState } from "react"
import type { RootState} from "../../store/store";
import { useAppSelector } from "../../store/store"
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
  const { workflows } = useAppSelector(
    (state: RootState) => state.progressPage,
  )
  const [isMosaic, setIsMosaic] = useState(true)
  const { hoveredWorkflowId } = workflowsTable;
  
  const filteredWorkflows = (
    workflowsTable.groupBy.length > 0
      ? workflowsTable.aggregatedRows
      : workflowsTable.filteredRows
  ).filter(row => workflowsTable.selectedWorkflows.includes(row.id))

  const groupByTooltipFields = workflowsTable.groupBy.map(col => ({
    field: col,
    type: "nominal",
    title: col
  }))

  const tooltipFields = [
    ...(workflowsTable.groupBy.length === 0 ? [{ field: "id", type: "nominal" }] : []),
    ...groupByTooltipFields,
    { field: "value", type: "quantitative", title: workflowsTable.groupBy.length > 0 ? "average value" : "value" },
  ]
  
  const groupedMetrics: Record<string, IMetric[]> = workflowsTable.uniqueMetrics.filter(metric => metric !== "rating")
  .reduce(
    (acc: any, metricName: string) => {
      acc[metricName] = []

      filteredWorkflows.forEach(workflow => {
        if (Object.prototype.hasOwnProperty.call(workflow, metricName)) {
          const value = workflow[metricName]
  
          // Skip non-numeric or NaN values
          if (typeof value === "number" && !isNaN(value)) {
            const metricPoint: any = {
              value,
              id: workflow.id,
              metricName,
              step: workflow.step ?? 0
            }
            
            workflowsTable.groupBy.forEach(groupKey => {
              metricPoint[groupKey] = workflow[groupKey];
            })
            
            acc[metricName].push(metricPoint)
          }
        }
      })
  
      return acc
    },
    {} as Record<string, IMetric[]>
  )
  // Render charts for each grouped metric name
  const renderCharts = Object.keys(groupedMetrics).map(metricName => {
    // task name is the same across workflows
    const metricTaskId = workflows.data.find(w => w.metrics.some(m => m.name === metricName))?.metrics?.find(m => m.name === metricName)?.task
    const metricTask = workflows.data?.find(w => w.tasks?.some(task => task.id === metricTaskId))?.tasks?.find(task => task.name === metricTaskId)?.name
    const metricSeries = groupedMetrics[metricName]
    const uniqueSteps = new Set(metricSeries.map(m => m.step))
    const workflowColorMap = workflowsTable.workflowColors
    const workflowColorScale = filteredWorkflows.map(wf => ({
      id: wf.id,
      color: workflowColorMap[wf.id] || "#000000", // Default to black if not found
    }))

    const isGrouped = workflowsTable.groupBy.length > 0;
    const hasMultipleSteps = uniqueSteps.size > 1;
    
    const xAxisTitle = isGrouped
      ? (hasMultipleSteps ? "Group Step" : "Workflow Group")
      : (hasMultipleSteps ? "Step" : "Workflow");
  
    const chartSpec = {
      mark: uniqueSteps.size <= 1 ? "bar" : "line",
      encoding: {
        x: {
          field: uniqueSteps.size <= 1 ? "id" : "step",
          type: "ordinal",
          axis: { labels: false, title: xAxisTitle },
          scale: {
            paddingInner: 0.2,
            paddingOuter: 1,
          },
        },
        y: {
          field: "value",
          type: "quantitative",
          axis: { title: metricName },
          scale: {
            domain: [
              0,
              Math.max(...metricSeries.map((d: any) => d.value)) * 1.05,
            ],
          },
        },
        color: {
          field: "id",
          type: "nominal",
          scale: {
            domain: workflowColorScale.map(w => w.id),
            range: workflowColorScale.map(w => w.color),
          },
          legend: null,
        },
        // Simplify the conditional encoding to maintain responsiveness
        opacity: hoveredWorkflowId ? {
          condition: { test: `datum.id === '${hoveredWorkflowId}'`, value: 1 },
          value: 0.5
        } : undefined,
        // Only add these properties when needed
        ...(hoveredWorkflowId ? {
          strokeWidth: { value: 1 },
          stroke: { 
            condition: { test: `datum.id === '${hoveredWorkflowId}'`, value: "#868686" },
            value: null 
          }
        } : {}),
        tooltip: tooltipFields,
      },
      data: { values: metricSeries },
    }

    return (
      <Grid
        item
        xs={isMosaic ? 6 : 12}
        key={metricName}
        sx={{ textAlign: "left", width: "100%"}} // Ensure full width
      >
        <ResponsiveCardVegaLite
          spec={chartSpec}
          actions={false}
          isStatic={false}
          title={metricTask ? `${metricTask}／${metricName}` : metricName}
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
    <Container maxWidth={false} sx={{padding: 2}} >
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
           Stacked
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
