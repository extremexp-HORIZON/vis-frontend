import { Box, Grid, Paper } from '@mui/material';
import RadarChart from '../../Tasks/SharedItems/Plots/RadarChart';
import CorrelationChart from '../../Tasks/SharedItems/Plots/CorrelationChart';
import LineChart from '../../Tasks/SharedItems/Plots/LineChart';


const WorkflowDetails: React.FC = () => {
  const metrics = ['Accuracy', 'Precision', 'Recall', 'Runtime'];

  return (
    <Box sx={{ width: '100%', padding: 2 }}>
    <Grid container spacing={3} justifyContent="center">
      <Grid item xs={12} md={6}>
        <RadarChart />
      </Grid>
      <Grid item xs={12} md={6}>
        <CorrelationChart availableMetrics={metrics} />
      </Grid>
      <Grid item xs={12}>
          <LineChart /> {/* Add the LineChart component */}
        </Grid>
    </Grid>

  </Box>
  

  );
};

export default WorkflowDetails;



