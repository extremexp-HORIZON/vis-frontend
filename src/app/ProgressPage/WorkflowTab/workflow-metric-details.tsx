import { Box, Grid } from "@mui/material"
import MetricEvaluation from "./WorkflowMetricDetailsItems/metric-evaluation"
import MetricEvolution from "./WorkflowMetricDetailsItems/metric-evolution"
import RuntimeDecomposition from "./WorkflowMetricDetailsItems/runtime-decomposition";

interface Metric {
  name: string;
  value: number;
  avgDiff: number;
  avgValue: number;
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
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <MetricEvaluation availableMetrics={metrics} workflowId={workflowId} />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
            <RuntimeDecomposition availableMetrics={metrics} workflowId={workflowId} />
            <MetricEvolution/>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default WorkflowMetricDetails