import Box from "@mui/material/Box"
import MetricsDistribution from "./metrics-distribution"
import TopWorkflowMetric from "./top-workflow-metric"
import { Grid, Typography } from "@mui/material"
import VariabilityPointCharts from "./variability-point-charts"
import VariabilityPointHeatmap from "./variability-point-heatmap"

const CompareCompleted = () => {
  return (
    <Box
      key="compare-completed"
      sx={{ display: "flex", flexDirection: "column", rowGap: 2 }}
    >
      <Box key="compare-completed-title">
        <Typography
          variant="body1"
          sx={{ fontWeight: 600, fontSize: "1.5rem" }}
        >
          Metrics Analysis
        </Typography>
      </Box>
      <Box
        key="compare-completed-items"
        sx={{ display: "flex", flexDirection: "column", rowGap: 2, mb: 1 }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <MetricsDistribution />
          </Grid>
          <Grid item xs={12} md={6}>
            <TopWorkflowMetric />
          </Grid>
          
        </Grid>
        <Box>
            <VariabilityPointCharts />
          </Box>
          <Box>
            <VariabilityPointHeatmap />
          </Box>
      </Box>
    </Box>
  )
}

export default CompareCompleted
