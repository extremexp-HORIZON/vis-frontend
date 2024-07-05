import { IconButton, Divider } from "@mui/material"
import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography"
import EditIcon from "@mui/icons-material/Edit"
import grey from "@mui/material/colors/grey"
import ParallelCoordinatePlot from "./parallel-coordinate-plot"
import { useState } from "react"
import WorkflowTab from "./WorkflowTab/workflow-tab"
import ProgressPageTabs from "./progress-page-tabs"
import WorkflowTable from "./WorkFlowTables/workflow-table"
import ScheduleTable from "./WorkFlowTables/schedule-table"
import { RootState, useAppSelector } from "../../store/store"

const ProgressPage = () => {
  const [value, setValue] = useState(0)
  const { tabs } = useAppSelector((state: RootState) => state.workflowTabs)
  const handleChange = (newValue: number) => (event: React.SyntheticEvent) => {
    if (value === newValue) return
    setValue(newValue)
  }

  return (
    <>
    {console.log(tabs)}
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
          <Box
            sx={{
              display: "flex",
              borderBottom: `1px solid ${grey[500]}`,
              px: 2,
            }}
          >
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
        <Box sx={{ px: 5, display: "flex", flexDirection: "column", mt: 3 }}>
          {value === 0 && (
            <>
              <ParallelCoordinatePlot />
              <WorkflowTable handleChange={handleChange} />
              {/* <Divider sx={{ margin: '20px' }} /> */}
              <ScheduleTable />
            </>
          )}
          {value === 1 && <WorkflowTab />}
        </Box>
      </Grid>
    </>
  )
}

export default ProgressPage
