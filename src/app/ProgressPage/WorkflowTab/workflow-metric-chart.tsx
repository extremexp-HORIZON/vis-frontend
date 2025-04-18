import ResponsiveCardVegaLite from "../../../shared/components/responsive-card-vegalite"
import { RootState, useAppSelector } from "../../../store/store"
import { IMetric } from "../../../shared/models/experiment/metric.model"

interface GroupMetrics {
  value: number;
  id: string | null;
  metricName: string;
  step: number | undefined;
  timestamp: string;
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
        axis: { labels: false, title: null }, // Hide x-axis labels
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
    <MetricBulletChart />
  )
}