import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import green from "@mui/material/colors/green"
import red from "@mui/material/colors/red"
import { RootState, useAppSelector } from "../../../../store/store"
import { useSearchParams } from "react-router-dom"

import theme from "../../../../mui-theme"

const WorkflowMetricsTable = () => {
  const { tab } = useAppSelector((state: RootState) => state.workflowPage)
  const [searchParams] = useSearchParams()
  const task = searchParams.get("task")
  
  const metrics = !task ? 
    tab?.workflowMetrics?.data 
    : tab?.workflowMetrics?.data?.filter(metric => metric.task === task)


  return (
    <>
      <Box>
        <TableContainer component={Paper}>
          <Table aria-label="task configuration table" >
            <TableHead sx={{background: theme.palette.customGrey.main}}>
              <TableRow>
                <TableCell>Metric</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Performance vs. Avg</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {metrics?.map(metric => {
                const value =
                  typeof metric.value === "string"
                    ? Number(parseFloat(metric.value).toFixed(3))
                    : Number(metric.value.toFixed(3))

                const avgDiff = Number(metric.avgDiff?.toFixed(2)) || 0

                return (
                  <TableRow key={`metric-${metric.name}`}>
                    <TableCell>{metric.name}</TableCell>
                    <TableCell>
                      {!isNaN(value)
                        ? `${value}${metric.name === "runtime" ? "s" : ""}`
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        {avgDiff > 0 ? (
                          <ArrowDropUpIcon sx={{ color: green[500] }} />
                        ) : avgDiff < 0 ? (
                          <ArrowDropDownIcon sx={{ color: red[500] }} />
                        ) : null}
                        <Typography variant="body2">
                          {avgDiff > 0
                            ? `+${avgDiff.toFixed(1)}%`
                            : `${avgDiff.toFixed(1)}%`}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  )
}

export default WorkflowMetricsTable
