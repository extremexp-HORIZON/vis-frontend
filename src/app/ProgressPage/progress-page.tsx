import { Button, IconButton } from "@mui/material"
import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography"
import { Type } from "vega-lite/build/src/type"
import EditIcon from "@mui/icons-material/Edit"
import grey from "@mui/material/colors/grey"
import ParallelCoordinatePlot from "./parallel-coordinate-plot"
import { useState } from "react"
import WorkflowTab from "./WorkflowTab/workflow-tab"

const ProgressPage = () => {
  const [value, setValue] = useState(0)

  const handleChange = (newValue: number) => (event: React.SyntheticEvent) => {
    if (value === newValue) return
    setValue(newValue)
  }

  return (
    <>
      <Grid
        sx={{
          maxWidth: "100vw",
          minHeight: "100vh",
          flexDirection: "column",
          display: "flex",
          rowGap: 3,
        }}
      >
        <Box key={"progress-page-title"} sx={{ width: "max-content", px: 2 }}>
          <Box sx={{ display: "flex", borderBottom: `1px solid ${grey[500]}`, px: 2 }}>
            <IconButton>
              <EditIcon />
            </IconButton>
            <Typography fontSize={"2rem"} sx={{ fontWeight: 600 }}>
              {"Experiment1"}
            </Typography>
          </Box>
          <Box>
            <Typography fontSize={"1rem"}>
              {"Experiment Description"}
            </Typography>
          </Box>
        </Box>
        <Box key="progress-tabs">
          <Grid
            className="dashboard-title"
            item
            xs={12}
            sx={{
              px: 2,
              bgcolor: grey[300],
              display: "flex",
              height: "3.5rem",
              columnGap: 1,
              alignItems: "center",
            }}
          >
            <Button
              variant="text"
              sx={{
                borderRadius: 20,
                px: 2,
                py: 1,
                color: "black",
                bgcolor: value === 0 ? "white" : grey[300],
                border: value !== 0 ? `1px solid ${grey[400]}` : "none",
                // borderBottom: "none",
                fontSize: "0.8rem",
                textTransform: "none",
                ":hover": { bgcolor: value !== 0 ? grey[400] : "white" },
                boxShadow: "0 0 -25px 0 #001f3f",
              }}
              size="small"
              disableRipple
              onClick={handleChange(0)}
            >
              Experiment Overview
            </Button>
            <Button
              sx={{
                borderRadius: 20,
                px: 2,
                py: 1,
                color: "black",
                bgcolor: value === 1 ? "white" : grey[300],
                border: value !== 1 ? `1px solid ${grey[400]}` : "none",
                // borderBottom: "none",
                fontSize: "0.8rem",
                textTransform: "none",
                ":hover": { bgcolor: value !== 1 ? grey[400] : "white" },
              }}
              size="small"
              disableRipple
              onClick={handleChange(1)}
            >
              Workflow1
            </Button>
          </Grid>
        </Box>
        <Box sx={{px: 5, displau: "flex", flexDirection: "column", mt: 3}}>
        {value === 0 &&  <ParallelCoordinatePlot /> }
         {value === 1 && <WorkflowTab />}
        </Box>
      </Grid>
    </>
  )
}

export default ProgressPage
