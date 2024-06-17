import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import green from "@mui/material/colors/green"
import red from "@mui/material/colors/red"
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const WorkflowMetrics = () => {
  const statistics = {
    row1: [
      { name: "Precision", value: 0.8, avgDiff: 0.2 },
      { name: "Runtime", value: 2.002, avgDiff: 10.2 },
    ],
    row2: [
      { name: "Recall", value: 2, avgDiff: 1.2 },
      { name: "Accuracy", value: 0.8, avgDiff: 0.3 },
    ],
  } as any

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
        <Grid sx={{ p: 2 }} container spacing={3}>
          {Object.keys(statistics).map((key: string, index: number) => (
            <Grid
              xs={12}
              md={12}
              lg={6}
              key={`statistics-row-${index}`}
              item
              container
              spacing={2}
            >
              {statistics[key].map((metric: any) => (
                <Grid key={`statistics-${metric.name}`} xs={12} md={6} item>
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
                        {parseFloat(metric.value).toFixed(3)}
                        {metric.name === "Runtime" && "s"}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        textAlign: "center",
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      {metric.avgDiff > 0 ? (
                        <ArrowDropUpIcon sx={{ color: green[400] }} />
                      ) : (
                        <ArrowDropDownIcon sx={{ color: red[400] }} />
                      )}
                      <Typography sx={{ mr: 0.5 }}>
                        {parseInt(metric.avgDiff)}%
                      </Typography>
                      <Typography>vs. experiment average</Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  )
}

export default WorkflowMetrics
