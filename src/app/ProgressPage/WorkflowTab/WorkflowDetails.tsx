// import { Box, Grid, Paper } from '@mui/material';
// import RadarChart from '../../Tasks/SharedItems/Plots/RadarChart';
// import CorrelationChart from '../../Tasks/SharedItems/Plots/CorrelationChart';
// import LineChart from '../../Tasks/SharedItems/Plots/LineChart';


// const WorkflowDetails: React.FC = () => {
//   const metrics = ['Accuracy', 'Precision', 'Recall', 'Runtime'];

//   return (
//     <Box sx={{ width: '100%', padding: 2 }}>
//     <Grid container spacing={3} justifyContent="center">
//       <Grid item xs={12} md={6}>
//         <RadarChart />
//       </Grid>
//       <Grid item xs={12} md={6}>
//         <CorrelationChart availableMetrics={metrics} />
//       </Grid>
//       <Grid item xs={12}>
//           <LineChart /> {/* Add the LineChart component */}
//         </Grid>
//     </Grid>

//   </Box>
  

//   );
// };

// export default WorkflowDetails;



import { Box, Grid, Paper } from '@mui/material';
import RadarChart from '../../Tasks/SharedItems/Plots/RadarChart';
import CorrelationChart from '../../Tasks/SharedItems/Plots/CorrelationChart';
import LineChart from '../../Tasks/SharedItems/Plots/LineChart';

interface Metric {
  name: string;
  value: number;
  avgDiff: number;
}
interface IWorkflowMetrics {
  metrics: Metric[] ;
  workflowId: string;
}
// Updated the component to accept a `metrics` prop
  const WorkflowDetails = ({ metrics, workflowId }: IWorkflowMetrics) => {

  // Extract the metric names to use in the charts
  const metricNames = metrics?.map(metric => metric.name);

  return (
    <Box sx={{ width: '100%', padding: 2 }}>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={6}>
          {/* Pass the metrics data to the RadarChart */}
          <RadarChart metrics={metrics} workflowId={workflowId} />
        </Grid>
        <Grid item xs={12} md={6}>
          {/* Pass the available metrics (names) to the CorrelationChart */}
          <CorrelationChart metrics={metrics} workflowId={workflowId} />
        </Grid>
        <Grid item xs={12}>
          {/* Optionally, you can pass metrics to the LineChart if needed */}
          <LineChart />
        </Grid>
      </Grid>
    </Box>
  );
};

export default WorkflowDetails;


