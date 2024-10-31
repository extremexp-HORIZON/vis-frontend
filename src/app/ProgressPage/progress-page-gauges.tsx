import { useEffect } from "react"
import { Box, Typography, useTheme } from "@mui/material"
import {
  GaugeContainer,
  GaugeValueArc,
  GaugeReferenceArc,
} from "@mui/x-charts/Gauge"
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
import { setProgressGauges } from "../../store/slices/progressPageSlice"
import { IWorkflowResponse, MetricDetail } from "../../shared/models/workflow.model"

const MetricGauge = (props: {gaugeInfo: {name: string, type: string, value: number}}) => {
  const { gaugeInfo } = props
  const displayValue = gaugeInfo.value.toFixed(2)
  const maxValue = 0 // Set max to 5 for time values and 100 for percentages
  const val = gaugeInfo.value > 1 ? gaugeInfo.value : gaugeInfo.value * 100
  const theme = useTheme()
  return (
    <Box sx={{ display: "flex", flexDirection: "column", textAlign: "center" }}>
      <Typography variant="h6">Avg. {gaugeInfo.name} per Workflow</Typography>
      <GaugeContainer
        width={150}
        height={150}
        sx={{ alignSelf: "center" }}
        startAngle={-110}
        endAngle={110}
        value={val}
      >
        <GaugeReferenceArc min={0} max={maxValue} />
        <GaugeValueArc style={{ fill: theme.palette.primary.main }} />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="20"
          fill={theme.palette.text.primary}
          fontWeight={600}
        >
          {displayValue}
        </text>
      </GaugeContainer>
    </Box>
  )
}

const RuntimeDisplay = (props: {gaugeInfo: {name: string, type: string, value: number}}) => {
  const { gaugeInfo } = props
  const displayValue = gaugeInfo.value > 60 
    ? `${(gaugeInfo.value / 60).toFixed(2)}min` 
    : `${gaugeInfo.value.toFixed(2)}sec`;

  return (
    <Box
      sx={{
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography variant="h6">Avg. Runtime per Workflow</Typography>
      <Typography
        variant="h4"
        sx={{
          textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
          fontWeight: 600,
          height: "100px",
          // width: "100px",
          alignItems: "center",
          display: "flex",
          justifyContent: "center",
          flex: 1,
          color: theme => theme.palette.primary.main,
        }}
      >
        {displayValue}
      </Typography>
    </Box>
  )
}

const ProgressPageGauges = () => {
  const { workflows, progressGauges } = useAppSelector(
    (state: RootState) => state.progressPage,
  )
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (workflows.data.length > 0) {
      const completedWorkflows = workflows.data.filter(
        workflow => workflow.status === "completed",
      )

      const getCommonMetricsOfAllCompletedWorkflows = (completedWorkflows: IWorkflowResponse[]) => {
        // Array of arrays that each array contains all the metric names of a workflow
        const allMetrics = completedWorkflows.reduce((acc: any, workflow: IWorkflowResponse) => {
          const workflowMetrics = workflow.metrics.map((metric: any) => metric.name)
          return [...acc, workflowMetrics]
        }, [])
        // Get the common metrics of all workflows
        const commonMetrics = allMetrics.reduce((acc: any, metrics: string[]) => {
          return acc.filter((metric: string) => metrics.includes(metric))
        })
        return commonMetrics
      }

      const commonMetrics = getCommonMetricsOfAllCompletedWorkflows(completedWorkflows)

      const calculateCommonMetricsAverageValues = () => {
        const averageValues = commonMetrics.reduce((acc: any, metric: string) => {
          const metricValues = completedWorkflows.map((workflow: IWorkflowResponse) => (
          workflow.metrics.find((m: any) => m.name === metric)
          )) as MetricDetail[]
          const metricAverage = (metricValues.reduce((acc: number, metric: any) => (acc = acc + parseFloat(metric.value) ), 0) / metricValues.length)
          return [...acc, {name: metric, type: metricValues[0].type, value: metricAverage}] 
        }, [])
        return averageValues
      }


      dispatch(
        setProgressGauges(calculateCommonMetricsAverageValues()),
      )
    }
  }, [workflows])

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        columnGap: 5,
        flexWrap: "wrap",
      }}
    >
      {progressGauges.map((gaugeInfo: {name: string, type: string, value: number}) => (
        gaugeInfo.type === "time" ? 
        <RuntimeDisplay key={`${gaugeInfo.name}-gauge`} gaugeInfo={gaugeInfo} />
        : 
        <MetricGauge key={`${gaugeInfo.name}-gauge`} gaugeInfo={gaugeInfo} />
        ))}
    </Box>
  )
}

export default ProgressPageGauges
