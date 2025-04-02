import { Box, Tab, Tabs } from "@mui/material"
import { useNavigate, useParams } from "react-router-dom"
import ParallelCoordinatePlot from "./ParalleleCoodrinates/parallel-coordinate-plot"
import WorkflowTable from "./WorkFlowTables/workflow-table"
import ScheduleTable from "./WorkFlowTables/schedule-table"
import { RootState, useAppSelector } from "../../../store/store"
import WorkflowCharts from "../DynamicMetricCharts"
import { Resizable } from "re-resizable"
import { setSelectedTab } from "../../../store/slices/monitorPageSlice"
import { useDispatch } from "react-redux"

const MonitoringPage = () => {
  const { visibleTable, selectedTab } = useAppSelector(
    (state: RootState) => state.monitorPage,
  )
  const navigate = useNavigate()
  const { experimentId } = useParams()
  const dispatch = useDispatch()

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
          <Tab label="WORKFLOWS" />
          <Tab label="COMPARATIVE ANALYSIS" />
        </Tabs>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          rowGap: 1,
          height: "100%",
          overflow: "auto",
        }}
      >
        {selectedTab === 0 && (
          <Box>
            <Box sx={{ height: "60%", minHeight: "350px", px: 2 }}>
              {visibleTable === "workflows" ? (
                <WorkflowTable handleChange={handleChange} />
              ) : (
                <ScheduleTable />
              )}
            </Box>
            <Box sx={{ height: "40%", px: 2 }}>
              <ParallelCoordinatePlot />
            </Box>
          </Box>
        )}
        {selectedTab === 1 && (
          <Box
            sx={{
              height: "100%",
              widht: "100%",
              display: "flex",
              px: 2,
            }}
          >
            <Resizable
              defaultSize={{
                width: "30%",
                height: "100%",
              }}
              minWidth="400px"
              enable={{
                top: false,
                right: true,
                bottom: false,
                left: false,
                topRight: false,
                bottomRight: true,
                bottomLeft: false,
                topLeft: false,
              }}
              maxWidth="80%"
              maxHeight="100%"
              style={{ height: "100%", overflow: "hidden" }}
            >
              <WorkflowTable handleChange={handleChange} />
            </Resizable>
            <Box sx={{ flex: 1, overflow: "auto", height: "100%" }}>
              <WorkflowCharts />
            </Box>
          </Box>
        )}
      </Box>
    </>
  )
}

export default MonitoringPage
