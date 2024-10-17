import Box from "@mui/material/Box"
import MetricsDistribution from "./metrics-distribution"
import TopWorkflowMetric from "./top-workflow-metric"
import { Grid, Typography } from "@mui/material"
import VariabilityPointCharts from "./variability-point-charts"
import VariabilityPointHeatmap from "./variability-point-heatmap"
import CompareCompletedSvg from "./compare-completed-svg"
import { useState } from "react"
import ExplainabilityTaskCompare from "../Tasks/ExplainabilityTask/explainability-task-compare"
import { RootState, useAppSelector } from "../../../../store/store"
import { explainabilityDefault } from "../../../../shared/models/tasks/explainability.model"

const CompareCompleted = () => {
  const { tabs } = useAppSelector((state: RootState) => state.workflowTabs)
  const [chosenTask, setChosenTask] = useState<string | null>(null)
  return (
    <>
      <Box
        key="compare-completed"
        sx={{ display: "flex", flexDirection: "column", rowGap: 2, mb: 3 }}
      >
        <Box key="compare-completed-svg">
          <CompareCompletedSvg
            setChosenTask={setChosenTask}
            chosenTask={chosenTask}
          />
        </Box>
        {!chosenTask ? (
          <>
            <Box
              key="compare-completed-metrics-analysis"
              sx={{ display: "flex", flexDirection: "column", rowGap: 2 }}
            >
              <Box key="compare-completed-metrics-analysis-title">
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 600, fontSize: "1.5rem" }}
                >
                  Metrics Analysis
                </Typography>
              </Box>
              <Box
                key="compare-completed--metrics-analysis-items"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  rowGap: 2,
                  mb: 1,
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <MetricsDistribution />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TopWorkflowMetric />
                  </Grid>
                </Grid>
              </Box>
            </Box>
            <Box
              key="compare-completed-variability-point-analysis"
              sx={{ display: "flex", flexDirection: "column", rowGap: 2 }}
            >
              <Box key="compare-completed-metrics-analysis-title">
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 600, fontSize: "1.5rem" }}
                >
                  Variability Point Analysis
                </Typography>
              </Box>
              <Box
                key="compare-completed-variability-point-analysis-items"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  rowGap: 2,
                  mb: 1,
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <VariabilityPointCharts />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <VariabilityPointHeatmap />
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </>
        ) : (
          <ExplainabilityTaskCompare
            workflow={
              tabs.find(tab => tab.workflowId === "compare-completed") ||
              null
            }
          />
        )}
      </Box>
    </>
  )
}

export default CompareCompleted
