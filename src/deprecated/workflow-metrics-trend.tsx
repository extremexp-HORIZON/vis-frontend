import { useLocation, useParams } from "react-router-dom"
import type { RootState} from "../store/store";
import { useAppDispatch, useAppSelector } from "../store/store"
import { Container, Grid, ButtonGroup, Button } from "@mui/material"
import { useEffect, useState } from "react"
import ResponsiveCardVegaLite from "../shared/components/responsive-card-vegalite"
import type { IMetric } from "../shared/models/experiment/metric.model"
import { useSearchParams } from "react-router-dom"
import { fetchWorkflowMetrics } from "../store/slices/workflowPageSlice"
import InfoMessage from "../shared/components/InfoMessage"
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded"

interface GroupMetrics {
  value: number;
  id: string | null;
  metricName: string;
  step: number | undefined;
  timestamp: string;
}

const WorkflowTrends = () => {
  const { workflows } = useAppSelector((state: RootState) => state.progressPage)
  const {workflowsTable} = useAppSelector((state: RootState) => state.monitorPage)
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const { experimentId } = useParams()
  const workflowId = queryParams.get("workflowId") // Get the workflowId from the query
  const [isMosaic, setIsMosaic] = useState(true)
  const [searchParams] = useSearchParams()
  const task = searchParams.get("task")
  const { tab } = useAppSelector((state: RootState) => state.workflowPage)
  const dispatch = useAppDispatch()


  useEffect(() => {
    const metricNames = tab?.workflowMetrics.data?.map((m) => m.name)
    if (experimentId && workflowId && metricNames) {
      dispatch(fetchWorkflowMetrics({experimentId, workflowId, metricNames}))
    }
    
  },[])
  
  
  const filteredWorkflows = workflows.data.filter(workflow => workflow.id === workflowId)

  const groupedMetrics: Record<string, GroupMetrics[]> | undefined = tab?.workflowSeriesMetrics.data.reduce(
    (acc: Record<string, GroupMetrics[]>, entry) => {
      if (!task) {
        entry.seriesMetric.forEach((m: IMetric) => {
          if (!acc[m.name]) acc[m.name] = [];
          acc[m.name].push({
            value: m.value,
            id: workflowId,
            metricName: m.name,
            step: m.step,
            timestamp: new Date(m.timestamp).toLocaleString(),
          });
        });
      } else {
        entry.seriesMetric
          .filter((m: IMetric) => m.task === task)
          .forEach((m: IMetric) => {
            if (!acc[m.name]) acc[m.name] = [];
            acc[m.name].push({
              value: m.value,
              id: workflowId,
              metricName: m.name,
              step: m.step,
              timestamp: new Date(m.timestamp).toLocaleString(),
            });
          });
      }
      return acc;
    },
    {}
  );
  
  if (!groupedMetrics) return //TODO: add spinner or something if fetches failed
  // Render charts for each grouped metric name
  const renderCharts = Object.keys(groupedMetrics).map(metricName => {
    const metricSeries = groupedMetrics[metricName]
    
    if(metricSeries.length <= 1) return null

    const workflowColorMap = workflowsTable.workflowColors
    const workflowColorScale = filteredWorkflows.map(wf => ({
      id: wf.id,
      color: workflowColorMap[wf.id] || "#000000", // Default to black if not found
    }))

    const chartSpec = {
      mark: metricSeries[0].step=== null ? "point" : "line", // Always use a line chart
      encoding: {
        x: {
          field: metricSeries[0].step=== null?"timestamp":"step", // Use the 'step' field for the x-axis (time or step sequence)
          type: "ordinal",
          axis: { labels: false, title: null }, // Hide x-axis labels
        },
        y: {
          field: "value", // Use the 'value' field for the y-axis (metric values like CPU Load)
          type: "quantitative",
          axis: { title: metricName }, // Title the y-axis based on the metric name
          scale: {
            domain: [
              0, // Min value is 0 (or any other value you'd like)
              metricSeries.reduce(
                (max, d) => Math.max(max, d.value),
                -Infinity
              ) * 1.05, // Max value with 5% padding
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
          legend:null,
        },
        tooltip: [
          { field: metricSeries[0].step=== null?"timestamp":"step", type: "nominal" },
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
  
  if (renderCharts.every(chart => chart === null)) return (
    <InfoMessage 
      message="No metric trend available."
      type="info"
      icon={<ReportProblemRoundedIcon sx={{ fontSize: 40, color: "info.main" }} />}
      fullHeight
    />
  )

  return (
    <Container maxWidth={false}>
      <Grid
        container
        justifyContent="flex-end" // Align to the right
        alignItems="center"
        sx={{ marginBottom: 2, }}
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
export default WorkflowTrends
