import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import green from "@mui/material/colors/green"
import red from "@mui/material/colors/red"
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import { useEffect } from "react"

interface IWorkflowMetrics {
  metrics: { [key: string]: number | string }[] | null
  hasMetrics: boolean | undefined
  setHasMetrics: React.Dispatch<React.SetStateAction<boolean | undefined>>
}

const WorkflowMetrics = (props: IWorkflowMetrics) => {
  const { metrics, hasMetrics, setHasMetrics } = props
  
  useEffect(() => {
    const hasDisplayMetrics = metrics?.some(metric => {
      const value = typeof metric.value === 'string' ? Number(parseFloat(metric.value).toFixed(3)) : Number(metric.value.toFixed(3))
      return !isNaN(value)
    })  
    setHasMetrics(hasDisplayMetrics)
  }, [])

  return (
    <>
      <Box
        className="Category-Item"
        // elevation={2}
        sx={{
          borderRadius: 4,
          display: "flex",
          flexDirection: "column",
          rowGap: 0,
          minWidth: "300px",
          overflow: "hidden",
        }}
      >
        {/* <Box sx={{ px: 1.5, pt: 1.5, display: "flex", alignItems: "center", borderBottom: `1px solid ${grey[400]}` }}>
          <Typography fontSize={"1rem"} fontWeight={600}>
            {"Model Statistics"}
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Tooltip title={"Model Statistics"}>
            <IconButton>
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Box> */}
        <Grid sx={{ p: 2, justifyContent: "center" }} container spacing={3}>
          {metrics
            ? metrics.map(metric => {
                const value = typeof metric.value === 'string' ? Number(parseFloat(metric.value).toFixed(3)) : Number(metric.value.toFixed(3))
                if(!isNaN(value))
                  return (
                    <Grid
                      key={`statistics-${metric.name}`}
                      xs={12}
                      sm={12}
                      md={6}
                      lg={3}
                      item
                    >
                      <Paper sx={{ p: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "centers",
                            columnGap: 1,
                          }}
                        >
                          <Typography fontWeight={600}>{metric.name}:</Typography>
                          <Typography>
                          {value}
                          {metric.name === "runtime" && "s"}
                          </Typography>
                        </Box>
                         <Box
                          sx={{
                            textAlign: "center",
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          {metric.avgDiff as number > 0 ? (
                            <ArrowDropUpIcon sx={{ color: green[400] }} />
                          ) : (
                            <ArrowDropDownIcon sx={{ color: red[400] }} />
                          )}
                          <Typography sx={{ mr: 0.5 }}>
                            {parseInt(metric.avgDiff.toString())}%
                          </Typography>
                          <Typography>vs. experiment average</Typography>
                        </Box> 
                      </Paper>
                    </Grid>
                  )
              })
            : null}
            {!hasMetrics && (
              <Grid
                xs={12}
                sm={12}
                md={6}
                lg={3}
                item
              >
                <Typography>{"No Metrics Available"}</Typography>
              </Grid>
            )}
        </Grid>
      </Box>
    </>
  )
}

export default WorkflowMetrics
