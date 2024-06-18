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
import ProgressPageTabs from "./progress-page-tabs"

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
          <ProgressPageTabs value={value} handleChange={handleChange} />
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
