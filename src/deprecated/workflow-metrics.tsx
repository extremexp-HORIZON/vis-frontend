// import Box from "@mui/material/Box"
// import Grid from "@mui/material/Grid"
// import Paper from "@mui/material/Paper"
// import Typography from "@mui/material/Typography"
// import green from "@mui/material/colors/green"
// import red from "@mui/material/colors/red"
// import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp"
// import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
// import WarningIcon from "@mui/icons-material/Warning"

// interface IWorkflowMetrics {
//   metrics: { [key: string]: number | string }[] | null
// }

// const WorkflowMetrics = (props: IWorkflowMetrics) => {
//   const { metrics } = props

//   return (
//     <>
//       <Box
//         className="Category-Item"
//         sx={{
//           borderRadius: 4,
//           display: "flex",
//           flexDirection: "column",
//           rowGap: 0,
//           minWidth: "300px",
//           overflow: "hidden",
//         }}
//       >
//         {/* <Box sx={{ px: 1.5, pt: 1.5, display: "flex", alignItems: "center", borderBottom: `1px solid ${grey[400]}` }}>
//           <Typography fontSize={"1rem"} fontWeight={600}>
//             {"Model Statistics"}
//           </Typography>
//           <Box sx={{ flex: 1 }} />
//           <Tooltip title={"Model Statistics"}>
//             <IconButton>
//               <InfoIcon />
//             </IconButton>
//           </Tooltip>
//         </Box> */}
//         <Grid sx={{ p: 2, justifyContent: "center" }} container spacing={3}>
//           {metrics ? (
//             metrics.map(metric => {
//               const value =
//                 typeof metric.value === "string"
//                   ? Number(parseFloat(metric.value).toFixed(3))
//                   : Number(metric.value.toFixed(3))
//               return (
//                 <Grid
//                   key={`statistics-${metric.name}`}
//                   xs={12}
//                   sm={12}
//                   md={6}
//                   lg={3}
//                   item
//                 >
//                   <Paper sx={{ p: 2 }}>
//                     <Box
//                       sx={{
//                         display: "flex",
//                         justifyContent: "center",
//                         alignItems: "centers",
//                         columnGap: 1,
//                       }}
//                     >
//                       <Typography fontWeight={600}>{metric.name}:</Typography>
//                       <Typography>
//                         {!isNaN(value) ? value : "N/A"}
//                         {metric.name === "runtime" && "s"}
//                       </Typography>
//                     </Box>
//                     {!isNaN(value) ? (
//                       <Box
//                         sx={{
//                           textAlign: "center",
//                           display: "flex",
//                           justifyContent: "center",
//                         }}
//                       >
//                         {(metric.avgDiff as number) > 0 ? (
//                           <ArrowDropUpIcon sx={{ color: green[400] }} />
//                         ) : (metric.avgDiff as number) === 0 ? null : (
//                           <ArrowDropDownIcon sx={{ color: red[400] }} />
//                         )}
//                         <Typography sx={{ mr: 0.5 }}>
//                           {parseInt(metric.avgDiff.toString())}%
//                         </Typography>
//                         <Typography>vs. experiment average</Typography>
//                       </Box>
//                     ) : (
//                       <Box
//                         sx={{
//                           textAlign: "center",
//                           display: "flex",
//                           justifyContent: "center",
//                         }}
//                       >
//                         <Typography sx={{ mr: 0.5 }}>0%</Typography>
//                         <Typography>vs. experiment average</Typography>
//                       </Box>
//                     )}
//                   </Paper>
//                 </Grid>
//               )
//             })
//           ) : (
//             <Box sx={{ display: "flex", columnGap: 1, alignItems: "center", py: 4 }}>
//               <WarningIcon
//                 sx={{ color: theme => theme.palette.customGrey.dark }}
//               />
//               <Typography
//                 sx={{ color: theme => theme.palette.customGrey.dark }}
//                 variant="h6"
//               >
//                 No metrics found
//               </Typography>
//             </Box>
//           )}
//         </Grid>
//       </Box>
//     </>
//   )
// }

// export default WorkflowMetrics

import { Box, Typography } from "@mui/material"
import WorkflowMetricsTable from "./Deprecated/workflow-metrics-table"
import WorkflowTrends from "./workflow-metrics-trend"
import type { RootState } from "../store/store";
import { useAppSelector } from "../store/store"
import { useSearchParams } from "react-router-dom"
import InfoMessage from "../shared/components/InfoMessage"
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded"


const WorkflowMetrics = () => {
  const { tab } = useAppSelector((state: RootState) => state.workflowPage)
  const [searchParams] = useSearchParams()
  const task = searchParams.get("task")

  const metrics = !task ? 
    tab?.workflowMetrics?.data 
    : tab?.workflowMetrics?.data?.filter(metric => metric.task === task)

  if (!metrics?.length ) {
    return (
      <InfoMessage 
        message="Not available metrics to display."
        type="info"
        icon={<ReportProblemRoundedIcon sx={{ fontSize: 40, color: "info.main" }} />}
        fullHeight
      />
    )
  }

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
      <Box
        key="task-metrics"
        sx={{
          display: "flex",
          flexDirection: "column",
          rowGap: 2,
          width: "100%",
        }}
      >
        <Box key="task-metrics-overview-title">
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Overview
          </Typography>
        </Box>
        <Box key="task-metrics-overview-items" sx={{ pb: 1 }}>
          <WorkflowMetricsTable />
        </Box>
      </Box>
      <Box
        key="task-metrics-trend"
        sx={{
          display: "flex",
          flexDirection: "column",
          rowGap: 2,
          width: "100%",
        }}
      >
        <Box key="task-metrics-trend-title">
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Metric Trend
          </Typography>
        </Box>
        <Box key="task-metrics-trend-items" sx={{ pb: 1 }}>
          <WorkflowTrends />
        </Box>
      </Box>
    </Box>
  )
}

export default WorkflowMetrics
