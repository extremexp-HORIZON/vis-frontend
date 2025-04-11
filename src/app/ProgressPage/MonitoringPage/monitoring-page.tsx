import { Box, Tab, Tabs, Paper } from "@mui/material"
import { useNavigate, useParams } from "react-router-dom"
import ParallelCoordinatePlot from "./ParalleleCoodrinates/parallel-coordinate-plot"
import WorkflowTable from "./WorkFlowTables/workflow-table"
import ScheduleTable from "./WorkFlowTables/schedule-table"
import type { RootState} from "../../../store/store";
import { useAppSelector } from "../../../store/store"
import WorkflowCharts from "../DynamicMetricCharts"
import { Resizable } from "re-resizable"
import { setSelectedTab } from "../../../store/slices/monitorPageSlice"
import { useDispatch } from "react-redux"
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { useTheme } from '@mui/material/styles';

const MonitoringPage = () => {
  const { visibleTable, selectedTab } = useAppSelector(
    (state: RootState) => state.monitorPage,
  )
  const navigate = useNavigate()
  const { experimentId } = useParams()
  const dispatch = useDispatch()
  const theme = useTheme()

  const handleChange =
    (newValue: number | string | null) => (event: React.SyntheticEvent) => {
      const queryParams = new URLSearchParams()

      if (newValue !== null)
        queryParams.append("workflowId", newValue.toString())

      navigate(`/${experimentId}/workflow?${queryParams.toString()}`)
      window.scrollTo(0, 0)
    }

  return (
    <>
      {/* Sticky Header with Tabs */}
      <Box
        sx={{
          borderColor: theme => theme.palette.customGrey.main,
          borderBottomWidth: 2,
          borderBottomStyle: "solid",
          width: "100%",
          px: 2,
        }}
      >
        <Tabs
          value={selectedTab}
          onChange={(event, newValue) => dispatch(setSelectedTab(newValue))}
          // aria-label="tab menu"
        >
          <Tab label="OVERVIEW" />
          <Tab label="COMPARATIVE ANALYSIS" />
        </Tabs>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          rowGap: 1,
          height: "100%",
          overflow: "auto", //enables scrolling when table minHeight is applied in the overview page
          px: 2
        }}
      >
        {selectedTab === 0 && (
          <Box sx={{height: "98%"}}>
            <Box sx={{ height: "60%", minHeight: "350px", paddingBottom: 1 }}>
              {visibleTable === "workflows" ? (
                <WorkflowTable handleChange={handleChange} />
              ) : (
                <ScheduleTable />
              )}
            </Box>
            <Box sx={{ height: "40%" }}>
              <ParallelCoordinatePlot />
            </Box>
          </Box>
        )}
        {selectedTab === 1 && (
          <Box
            sx={{
              height: "99%",
              display: "flex",
              gap: 1,
            }}
          >
            <Resizable
              defaultSize={{
                width: "30%",
                height: "100%",
              }}
              minWidth="200px"
              enable={{
                top: false,
                right: true,
                bottom: false,
                left: false,
                topRight: false,
                bottomRight: false,
                bottomLeft: false,
                topLeft: false,
              }}
              maxWidth="80%"
              maxHeight="100%"
              style={{ height: "100%", position: "relative",  }}
              handleStyles={{
                right: {
                  cursor: "ew-resize",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "middle",
                },
              }}            
              handleComponent={{
                right: (
                <Box
                  sx={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "middle",
                    cursor: "ew-resize",
                  }}        
                >
                  <MoreVertRoundedIcon style={{ color: theme.palette.action.active }} />
                </Box>
                )
              }}
            >
              <WorkflowTable handleChange={handleChange} />
            </Resizable>
            <Paper elevation={2} sx={{ flex: 1, overflow: "auto", height: "100%", ml: 1 }}>
                <WorkflowCharts />
            </Paper>
          </Box>
        )}
      </Box>
    </>
  )
}

export default MonitoringPage
