// import { useEffect } from "react"
// import { Box, Typography, useTheme } from "@mui/material"
// import {
//   GaugeContainer,
//   GaugeValueArc,
//   GaugeReferenceArc,
// } from "@mui/x-charts/Gauge"
// import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
// import { setProgressGauges } from "../../store/slices/progressPageSlice"

// const MetricGauge = ({ title, value, isTime = false }: any) => {
//   const displayValue = isTime
//     ? `${value.toFixed(3)} sec`
//     : `${value.toFixed(3)}`
//   const maxValue = isTime ? 5 : 100 // Set max to 5 for time values and 100 for percentages
//   const theme = useTheme()
//   return (
//     <Box sx={{ display: "flex", flexDirection: "column", textAlign: "center" }}>
//       <Typography variant="h6">Avg. {title} per Workflow</Typography>
//       <GaugeContainer
//         width={150}
//         height={150}
//         sx={{ alignSelf: "center" }}
//         startAngle={-110}
//         endAngle={110}
//         value={isTime ? value : value * 100}
//       >
//         <GaugeReferenceArc min={0} max={maxValue} />
//         <GaugeValueArc style={{ fill: theme.palette.primary.main }} />
//         <text
//           x="50%"
//           y="50%"
//           textAnchor="middle"
//           dominantBaseline="middle"
//           fontSize="20"
//           fill={theme.palette.text.primary}
//           fontWeight={600}
//         >
//           {displayValue}
//         </text>
//       </GaugeContainer>
//     </Box>
//   )
// }

// const RuntimeDisplay = (props: { value: number }) => {
//   const { value } = props
//   return (
//     <Box
//       sx={{
//         textAlign: "center",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//       }}
//     >
//       <Typography variant="h6">Avg. Runtime per Workflow</Typography>
//       <Typography
//         variant="h4"
//         sx={{
//           textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
//           fontWeight: 600,
//           height: "100px",
//           width: "100px",
//           alignItems: "center",
//           display: "flex",
//           justifyContent: "center",
//           flex: 1,
//           color: theme => theme.palette.primary.main,
//         }}
//       >
//         {value.toFixed(2)}s
//       </Typography>
//     </Box>
//   )
// }

// const ProgressPageGauges = () => {
//   const { workflows, progressGauges } = useAppSelector(
//     (state: RootState) => state.progressPage,
//   )
//   const dispatch = useAppDispatch()

//   useEffect(() => {
//     if (workflows.data.length > 0) {
//       const completedWorkflows = workflows.data.filter(
//         workflow => workflow.workflowInfo.status === "completed",
//       )

//       const calculateAverage = (metric: keyof typeof progressGauges) => {
//         const values = completedWorkflows.reduce((acc, workflow) => {
//           const metricValue = workflow.metrics?.[metric] ?? 0
//           return acc + metricValue
//         }, 0)
//         return values / completedWorkflows.length || 0
//       }

//       dispatch(
//         setProgressGauges({
//           accuracy: calculateAverage("accuracy"),
//           precision: calculateAverage("precision"),
//           recall: calculateAverage("recall"),
//           runtime: calculateAverage("runtime"),
//         }),
//       )
//     }
//   }, [workflows])

//   return (
//     <Box
//       sx={{
//         display: "flex",
//         justifyContent: "center",
//         columnGap: 5,
//         flexWrap: "wrap",
//       }}
//     >
//       <MetricGauge title="Accuracy" value={progressGauges.accuracy} />
//       <MetricGauge title="Precision" value={progressGauges.precision} />
//       <MetricGauge title="Recall" value={progressGauges.recall} />
//       <RuntimeDisplay value={progressGauges.runtime} />
//     </Box>
//   )
// }

// export default ProgressPageGauges





import { useEffect } from "react"
import { Box, Typography, useTheme } from "@mui/material"
import {
  GaugeContainer,
  GaugeValueArc,
  GaugeReferenceArc,
} from "@mui/x-charts/Gauge"
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
import { setProgressGauges } from "../../store/slices/progressPageSlice"

const MetricGauge = ({ title, value, isTime = false }: any) => {
  const displayValue = isTime
    ? `${value.toFixed(3)}s`
    : `${value.toFixed(3)}`
  const maxValue = isTime ? 5 : 100 // Set max to 5 for time values and 100 for percentages
  const theme = useTheme()
  return (
    <Box sx={{ display: "flex", flexDirection: "column", textAlign: "center" }}>
      <Typography variant="h6">Avg. {title} per Workflow</Typography>
      <GaugeContainer
        width={150}
        height={150}
        sx={{ alignSelf: "center" }}
        startAngle={-110}
        endAngle={110}
        value={isTime ? value : value * 100}
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

const RuntimeDisplay = (props: { value: number }) => {
  const { value } = props
  const displayValue = value > 60 
    ? `${(value / 60).toFixed(2)}min` 
    : `${value.toFixed(2)}sec`;

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
        workflow => workflow.workflowInfo.status === "completed",
      )

      const calculateAverage = (metric: keyof typeof progressGauges) => {
        const values = completedWorkflows.reduce((acc, workflow) => {
          const metricValue = workflow.metrics?.[metric] ?? 0
          return acc + metricValue
        }, 0)
        return values / completedWorkflows.length || 0
      }

      dispatch(
        setProgressGauges({
          accuracy: calculateAverage("accuracy"),
          precision: calculateAverage("precision"),
          recall: calculateAverage("recall"),
          runtime: calculateAverage("runtime"),
        }),
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
      <MetricGauge title="Accuracy" value={progressGauges.accuracy} />
      <MetricGauge title="Precision" value={progressGauges.precision} />
      <MetricGauge title="Recall" value={progressGauges.recall} />
      <RuntimeDisplay value={progressGauges.runtime} />
    </Box>
  )
}

export default ProgressPageGauges
