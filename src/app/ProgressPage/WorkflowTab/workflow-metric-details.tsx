import { Box, Grid } from "@mui/material"
import MetricEvaluation from "./WorkflowMetricDetailsItems/metric-evaluation"
import MetricCorrelation from "./WorkflowMetricDetailsItems/metric-correlation"
import MetricEvolution from "./WorkflowMetricDetailsItems/metric-evolution"

interface Metric {
  name: string;
  value: number;
  avgDiff: number;
}
interface IWorkflowMetricDetails {
  metrics: Metric[] | null;
  workflowId: number;
}

const WorkflowMetricDetails = (props: IWorkflowMetricDetails) => {
  // const metrics = ["Accuracy", "Precision", "Recall", "Runtime"]
  const  { metrics, workflowId } = props

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={6}>
          {/* Pass the metrics data to the RadarChart */}
          <MetricEvaluation availableMetrics={metrics} workflowId={workflowId} />
        </Grid>
        <Grid item xs={12} md={6}>
          {/* Pass the available metrics (names) to the CorrelationChart */}
          <MetricCorrelation availableMetrics={metrics} workflowId={workflowId} />
        </Grid>
        <Grid item xs={12}>
          {/* Optionally, you can pass metrics to the LineChart if needed */}
          <MetricEvolution />
        </Grid>
      </Grid>
    </Box>
  )
}

export default WorkflowMetricDetails
