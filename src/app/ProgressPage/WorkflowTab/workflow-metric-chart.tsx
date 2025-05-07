import ResponsiveCardVegaLite from "../../../shared/components/responsive-card-vegalite"
import type { RootState} from "../../../store/store";
import { useAppSelector } from "../../../store/store"
import type { IMetric } from "../../../shared/models/experiment/metric.model"
import { Box, Divider, Typography, useMediaQuery, useTheme } from "@mui/material"
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import green from "@mui/material/colors/green"
import red from "@mui/material/colors/red"
import { useLocation } from "react-router-dom";
import { DetailsCard, DetailsCardItem } from "../../../shared/components/details-card";


interface GroupMetrics {
  value: number;
  id: string | null;
  metricName: string;
  step: number | undefined;
  timestamp: string;
  task: string | undefined;
}

interface MetricData {
  title?: string;
  value?: number;
  average?: number;
  min?: number;
  max?: number;
  avgDiff?: number;
  step?: number | null;
  timestamp?: number;
  task?: string;
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
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("xl"))
  
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
    <Box sx={{height: "99%"}}>
      <ResponsiveCardVegaLite
        spec={chartSpec}
        actions={false}
        title={metrics[0].task ? `${metrics[0].task}／${metrics[0].metricName}` : metrics[0].metricName}
        aspectRatio={isSmallScreen ? 4 : 2}
        maxHeight={500}
      />
    </Box>
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
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          rowGap: 1,
          height: "100%",
          overflow: "auto", //enables scrolling when table minHeight is applied in the overview page
        }}
      >
       <MetricLineChart metrics={metrics} /> 
      </Box>
    :
    <MetricCards />
  )
}


const WorkflowLink = ({ workflowId }: { workflowId: string }) => {
  const location = useLocation();
  return (
  <Typography
  variant="body2"
  color="primary"
  sx={{ cursor: "pointer", textDecoration: "underline" }}
  component="a"
  href={`${location.pathname}?workflowId=${workflowId}`}
  target="_blank"
  rel="noopener noreferrer"
  >
    {workflowId}
  </Typography>

  );
};

export const MetricCards = () => {
  const { tab } = useAppSelector(state => state.workflowPage);
  const { workflows } = useAppSelector((state: RootState) => state.progressPage);

  const metricData: MetricData = {
    title: tab?.dataTaskTable.selectedItem?.data?.name,
    value: tab?.dataTaskTable.selectedItem?.data?.value,
    average: tab?.dataTaskTable.selectedItem?.data?.avgValue,
    min: tab?.dataTaskTable.selectedItem?.data?.minValue,
    max: tab?.dataTaskTable.selectedItem?.data?.maxValue,
    avgDiff: tab?.dataTaskTable.selectedItem?.data?.avgDiff,
    step: tab?.dataTaskTable.selectedItem?.data?.step,
    timestamp: tab?.dataTaskTable.selectedItem?.data?.timestamp,
    task: tab?.dataTaskTable.selectedItem?.data?.task
  };

  const filteredWorkflows = workflows?.data?.flatMap(w =>
    w.metrics?.filter(metric => metric.name === metricData.title)
      .map(metric => ({ parent: w, value: metric.value })) ?? []
  );

  const minEntry = filteredWorkflows?.length ? filteredWorkflows.reduce((min, curr) =>
    curr.value < min.value ? curr : min
  ) : null;

  const maxEntry = filteredWorkflows?.length ? filteredWorkflows.reduce((max, curr) =>
    curr.value > max.value ? curr : max
  ) : null;

  const minWorkflow = minEntry?.parent;
  const maxWorkflow = maxEntry?.parent;

  const renderDiffIcon = () => {
    if (!metricData.avgDiff) return null;
    return metricData.avgDiff > 0 ? (
      <ArrowDropUpIcon sx={{ color: green[500], mb: 1 }} />
    ) : (
      <ArrowDropDownIcon sx={{ color: red[500], mb: 1 }} />
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "row", gap: 2, width: "100%" }}>
      <DetailsCard title="Metric Details">
        <DetailsCardItem label="Metric" value={metricData.title} />
        <DetailsCardItem label="Value" value={metricData.value?.toFixed(2)} />
        {metricData.task && <DetailsCardItem label="Logged in Task" value={metricData.task} />}
        <DetailsCardItem 
          label="Timestamp" 
          value={typeof metricData.timestamp === 'number' ? 
            new Date(metricData.timestamp).toLocaleString() : 
            undefined
          } 
        />
      </DetailsCard>

      <DetailsCard title="Comparison Across All Workflows">
        <Box>
          <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
            <Typography sx={{ mb: 1 }} variant="body1">
              Average: {metricData.average?.toFixed(2)} — Difference: {metricData.avgDiff ? metricData.avgDiff.toFixed(2) : 0}%
            </Typography>
            {renderDiffIcon()}
          </Box>
          <Divider />
        </Box>
        <DetailsCardItem 
          label="Minimum" 
          value={
            <>
              {metricData.min?.toFixed(2)}
              {metricData.value !== metricData.min && minWorkflow && (
                <> — View Workflow <WorkflowLink workflowId={minWorkflow.id} /></>
              )}
            </>
          } 
        />
        <DetailsCardItem 
          label="Maximum" 
          value={
            <>
              {metricData.max?.toFixed(2)}
              {metricData.value !== metricData.max && maxWorkflow && (
                <> — View Workflow <WorkflowLink workflowId={maxWorkflow.id} /></>
              )}
            </>
          } 
        />
      </DetailsCard>
    </Box>
  );
};
