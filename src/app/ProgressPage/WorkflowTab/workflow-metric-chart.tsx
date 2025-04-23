import ResponsiveCardVegaLite from "../../../shared/components/responsive-card-vegalite"
import type { RootState} from "../../../store/store";
import { useAppSelector } from "../../../store/store"
import type { IMetric } from "../../../shared/models/experiment/metric.model"
import { Box, Card, CardContent, CardHeader, Divider, Typography } from "@mui/material"
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import green from "@mui/material/colors/green"
import red from "@mui/material/colors/red"
import { Link, useLocation } from "react-router-dom";


interface GroupMetrics {
  value: number;
  id: string | null;
  metricName: string;
  step: number | undefined;
  timestamp: string;
  task: string | undefined;
}

export const MetricBulletChart = () => {
    const { tab } = useAppSelector(state => state.workflowPage)
    const { workflows } = useAppSelector((state: RootState) => state.progressPage)
    const {workflowsTable} = useAppSelector((state: RootState) => state.monitorPage)
  
    const metricData = {
        title: tab?.dataTaskTable.selectedItem?.data?.name,
        value: tab?.dataTaskTable.selectedItem?.data?.value,
        average: tab?.dataTaskTable.selectedItem?.data?.avgValue,
        min: tab?.dataTaskTable.selectedItem?.data?.minValue,
        max: tab?.dataTaskTable.selectedItem?.data?.maxValue,
    }

    const queryParams = new URLSearchParams(location.search)
    const workflowId = queryParams.get("workflowId") // Get the workflowId from the query
    const filteredWorkflows = workflows.data.filter(workflow => workflow.id === workflowId)
  
    const workflowColorMap = workflowsTable.workflowColors
    const workflowColorScale = filteredWorkflows.map(wf => ({
      id: wf.id,
      color: workflowColorMap[wf.id] || "#000000", // Default to black if not found
    }))  

    const bulletChartSpec = {
        data: { values: metricData },
        encoding: {
          y: {
            field: "title",
            type: "ordinal",
            axis: {
              title: null,
              labelFontWeight: "bold",
              labelFontSize: 12,
              labelAngle: -90,
            },
          },
        },
        layer: [
          // Background range (min to max)
          {
            mark: "bar",
            encoding: {
              x: { field: "min", type: "quantitative" },
              x2: { field: "max" },
              color: { value: "#eeeeee" },
            },
          },
          // Average range
          {
            mark: "bar",
            encoding: {
              x: { field: "average", type: "quantitative" },
              x2: { field: "max" },
              color: { value: "#cccccc" },
            },
          },
          // Actual value
          {
            mark: {
              type: "bar",
              color: workflowColorScale.map(w => w.color),
              size: 20,
            },
            encoding: {
              x: { field: "value", type: "quantitative" },
              tooltip: [
                { field: "title", type: "ordinal" },
                { field: "value", type: "quantitative" },
                { field: "average", type: "quantitative" },
                { field: "min", type: "quantitative" },
                { field: "max", type: "quantitative" },
              ],
            },
          },
          // Marker for average
          {
            mark: {
              type: "tick",
              color: "black",
              size: 15,
              thickness: 2,
            },
            encoding: {
              x: { field: "average", type: "quantitative" },
            },
          },
        ],
        config: {
          axis: {
            grid: false,
          },
        },
      }
    
      return (
        <ResponsiveCardVegaLite
          title="Performance Overview"
          spec={bulletChartSpec}
          aspectRatio={2}
          maxHeight={400}
          actions={false}
        />
      )
}

export const MetricLineChart = ({metrics}: {metrics: GroupMetrics[]}) => {
  const { workflows } = useAppSelector((state: RootState) => state.progressPage)
  const {workflowsTable} = useAppSelector((state: RootState) => state.monitorPage)
  
  const queryParams = new URLSearchParams(location.search)
  const workflowId = queryParams.get("workflowId") // Get the workflowId from the query
  const filteredWorkflows = workflows.data.filter(workflow => workflow.id === workflowId)

  const workflowColorMap = workflowsTable.workflowColors
  const workflowColorScale = filteredWorkflows.map(wf => ({
    id: wf.id,
    color: workflowColorMap[wf.id] || "#000000", // Default to black if not found
  }))
  const isSingleStep = new Set(metrics.map(d => d.step ?? d.timestamp)).size === 1

  const chartSpec = {
    mark: isSingleStep ? "point" : "line", // Always use a line chart
    encoding: {
      x: {
        field: metrics[0].step=== null?"timestamp":"step", // Use the 'step' field for the x-axis (time or step sequence)
        type: "ordinal",
        axis: { labels: false, title: metrics[0].step=== null?"Timestamp":"Step" }, // Hide x-axis labels
      },
      y: {
        field: "value", // Use the 'value' field for the y-axis (metric values like CPU Load)
        type: "quantitative",
        axis: { title: metrics[0].metricName }, // Title the y-axis based on the metric name
        scale: {
          domain: [
            0, // Min value is 0 (or any other value you'd like)
            metrics.reduce(
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
        { field: metrics[0].step=== null?"timestamp":"step", type: "nominal" },
        { field: "value", type: "quantitative" },
      ],
    },
    data: { values: metrics },
  }

  return (
    <ResponsiveCardVegaLite
      spec={chartSpec}
      actions={false}
      title={metrics[0].metricName}
      aspectRatio={2}
      maxHeight={400}
    />
    
  )
}

export const WorkflowMetricChart = () => {
    const { tab } = useAppSelector(state => state.workflowPage)
    const queryParams = new URLSearchParams(location.search)
    const workflowId = queryParams.get("workflowId") // Get the workflowId from the query

    const groupedMetrics: Record<string, GroupMetrics[]> | undefined = tab?.workflowSeriesMetrics.data.reduce(
        (acc: Record<string, GroupMetrics[]>, entry) => {
            entry.seriesMetric.forEach((m: IMetric) => {
              if (!acc[m.name]) acc[m.name] = [];
              acc[m.name].push({
                value: m.value,
                id: workflowId,
                metricName: m.name,
                step: m.step,
                timestamp: new Date(m.timestamp).toLocaleString(),
                task: m.task
              });
            });
          return acc;
        },
        {}
      );

      const metrics = groupedMetrics?.[tab?.dataTaskTable.selectedItem?.data?.name] || []
  return (
    (metrics?.length ?? 0) > 1 ?
    <MetricLineChart metrics={metrics} /> :
    <MetricCards metrics={metrics} />
  )
}

export const MetricCards = ({metrics}: {metrics: GroupMetrics[]}) => {
  const { tab } = useAppSelector(state => state.workflowPage)
  const { workflows } = useAppSelector((state: RootState) => state.progressPage)
  const location = useLocation()

  const metricData = {
      title: tab?.dataTaskTable.selectedItem?.data?.name,
      value: tab?.dataTaskTable.selectedItem?.data?.value,
      average: tab?.dataTaskTable.selectedItem?.data?.avgValue,
      min: tab?.dataTaskTable.selectedItem?.data?.minValue,
      max: tab?.dataTaskTable.selectedItem?.data?.maxValue,
      avgDiff: tab?.dataTaskTable.selectedItem?.data?.avgDiff,
  }

  const filteredWorkflows = workflows?.data?.flatMap(w =>
    w.metrics.filter(metric => metric.name === metrics[0]?.metricName).map(metric => ({ parent: w, value: metric.value }))
   )
  
   const minEntry = filteredWorkflows.reduce((min, curr) =>
    curr.value < min.value ? curr : min
  );
  
  const maxEntry = filteredWorkflows.reduce((max, curr) =>
    curr.value > max.value ? curr : max
  );
  
  const minWorkflow = minEntry.parent;
  const maxWorkflow = maxEntry.parent;

  if (!metrics || metrics.length === 0) return null;

  return (
    <Box sx={{display: "flex", flexDirection: "row", gap: 2, width: "100%"}}>
    <Card sx={{
      minWidth: "20%",
      boxShadow: '0 4px 20px rgba(0,0,0,0.09)', 
      height: "100%", 
      borderRadius: '12px',
      border: '1px solid rgba(0, 0, 0, 0.06)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      '&:hover': {
        boxShadow: '0 6px 25px rgba(0,0,0,0.12)',
        transform: 'translateY(-2px)'
      }     
    }}>
      <CardHeader
        title={
          <Typography
            variant="overline"
            sx={{
              padding: "4px 8px",
              textTransform: "uppercase", // Optional: Makes the text uppercase (can be removed)
            }}
          >
            Metric Details
          </Typography>
        }
        sx={{
          background: 'linear-gradient(to right, #f8f9fa, #edf2f7)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          padding: "4px 16px",
          height: "40px",
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
        }}
      
      />
      <CardContent 
        sx={{
          backgroundColor: "#ffffff", 
          py: 2,
          px: 3,
          '&:last-child': { 
            paddingBottom: 3 
          },
          borderRadius: '0 0 12px 12px'              
        }}
      >
        <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", gap: 1 }} >
          <Box>
            <Typography sx={{mb: 1}} variant="body1">
              Metric: {metrics[0].metricName}
            </Typography>
            <Divider />
          </Box>
          <Box>
            <Typography sx={{mb: 1}} variant="body1">
              Value: {metrics[0].value.toFixed(2)}
            </Typography>
            <Divider />
          </Box>
          { metrics[0].task && 
            <Box>
              <Typography sx={{mb: 1}} variant="body1">
                Logged in Task: {metrics[0].task}
              </Typography>
              <Divider />
            </Box>
          }
          { metrics[0].step && 
            <Box>
              <Typography sx={{mb: 1}} variant="body1">
                Step: {metrics[0].step}
              </Typography>
              <Divider />
            </Box>
          }
          <Box>
            <Typography sx={{mb: 1}} variant="body1">
              Timestamp: {new Date(metrics[0].timestamp).toLocaleString()}
            </Typography>
            <Divider />
          </Box>
        </Box>
      </CardContent>
    </Card>
    <Card sx={{
      minWidth: "20%",
      boxShadow: '0 4px 20px rgba(0,0,0,0.09)', 
      height: "100%", 
      borderRadius: '12px',
      border: '1px solid rgba(0, 0, 0, 0.06)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      '&:hover': {
        boxShadow: '0 6px 25px rgba(0,0,0,0.12)',
        transform: 'translateY(-2px)'
      }     
    }}>
      <CardHeader
        title={
          <Typography
            variant="overline"
            sx={{
              padding: "4px 8px",
              textTransform: "uppercase", // Optional: Makes the text uppercase (can be removed)
            }}
          >
            Comparison Across All Workflows
          </Typography>
        }
        sx={{
          background: 'linear-gradient(to right, #f8f9fa, #edf2f7)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          padding: "4px 16px",
          height: "40px",
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
        }}
      
      />
      <CardContent 
        sx={{
          backgroundColor: "#ffffff", 
          py: 2,
          px: 3,
          '&:last-child': { 
            paddingBottom: 3 
          },
          borderRadius: '0 0 12px 12px'              
        }}
      >
        <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", gap: 1 }} >
          <Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                // gap: 1,
                alignItems: "center",
              }}
            >
              <Typography sx={{mb: 1}} variant="body1">
                Average: {metricData.average.toFixed(2)} — Difference: {metricData.avgDiff.toFixed(2)}%
              </Typography>
              {metricData.avgDiff > 0 ? (
                <ArrowDropUpIcon sx={{ color: green[500],mb: 1 }} />
              ) : metricData.avgDiff < 0 ? (
                <ArrowDropDownIcon sx={{ color: red[500], mb: 1 }} />
              ) : null}
            </Box>
            <Divider />
          </Box>
        </Box>
        <Box>
          <Typography sx={{mb: 1}} variant="body1">
            Minimum: {metricData.min.toFixed(2)}
            {metrics[0].value !== metricData.min && (
            <>
              {' — View Workflow '}
              <a
                href={`${location.pathname}?workflowId=${minWorkflow.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {minWorkflow.id}
              </a>
            </>
            )}
          </Typography>
          <Divider />
        </Box>
        <Box>
          <Typography sx={{mb: 1}} variant="body1">
            Maximum: {metricData.max.toFixed(2)}   
            {metrics[0].value !== metricData.max && (
            <>
              {' — View Workflow '}
              <a
                href={`${location.pathname}?workflowId=${maxWorkflow.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {maxWorkflow.id}
              </a>
            </>
            )}
          </Typography>
          <Divider />
        </Box>
      </CardContent>
    </Card>
  </Box>
  )
}