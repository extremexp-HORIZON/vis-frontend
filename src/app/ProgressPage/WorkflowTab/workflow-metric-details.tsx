import { Box, Grid } from "@mui/material"
import MetricEvaluation from "./WorkflowMetricDetailsItems/metric-evaluation"
import MetricCorrelation from "./WorkflowMetricDetailsItems/runtime-decomposition"
import MetricEvolution from "./WorkflowMetricDetailsItems/metric-evolution"
import RuntimeDecomposition from "./WorkflowMetricDetailsItems/runtime-decomposition";

interface Metric {
  name: string;
  value: number;
  avgDiff: number;
}
interface IWorkflowMetricDetails {
  metrics: Metric[] | null;
  workflowId: number | string;
}

const WorkflowMetricDetails = (props: IWorkflowMetricDetails) => {
  // const metrics = ["Accuracy", "Precision", "Recall", "Runtime"]
  const  { metrics, workflowId } = props

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={6}>
          <MetricEvaluation availableMetrics={metrics} workflowId={workflowId} />
        </Grid>
        <Grid item xs={12} md={6}>
          <RuntimeDecomposition availableMetrics={metrics} workflowId={workflowId} />
        </Grid>
        <Grid item xs={12} md={6}>
          <MetricEvolution />
        </Grid>
        <Grid item xs={12} md={6}/>
      </Grid>
    </Box>
  )
}

export default WorkflowMetricDetails
