import { Box, Tab, Tabs, Paper } from "@mui/material"
import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useRef } from "react"
import ParallelCoordinatePlot from "./ParalleleCoodrinates/parallel-coordinate-plot"
import WorkflowTable from "./WorkFlowTables/workflow-table"
import ScheduleTable from "./WorkFlowTables/schedule-table"
import type { RootState} from "../../../store/store";
import { useAppSelector } from "../../../store/store"
import WorkflowCharts from "../DynamicMetricCharts"
import { Resizable } from "re-resizable"
import { bulkToggleWorkflowSelection, setSelectedTab, setVisibleTable, toggleWorkflowSelection } from "../../../store/slices/monitorPageSlice"
import { useDispatch } from "react-redux"
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { useTheme } from '@mui/material/styles';
import { getCache } from "../../../shared/utils/localStorageCache"

const MonitoringPage = () => {
  const { visibleTable, selectedTab, workflowsTable } = useAppSelector(
    (state: RootState) => state.monitorPage,
  )
  const navigate = useNavigate()
  const { experimentId } = useParams()
  const dispatch = useDispatch()
  const theme = useTheme()
  const queryParams = new URLSearchParams(location.search);
  const compare = queryParams.get("compare");
  const tabParam = queryParams.get("tab");
  const compareWorkflowsRef = useRef<string[] | null>(null)

  useEffect(() => {
    if (compare) {
      const parsed = getCache<{ workflowIds: string[] }>(compare);
      if (parsed?.workflowIds) {
        compareWorkflowsRef.current = parsed.workflowIds
      }
    }

    if (tabParam) {
      dispatch(setSelectedTab(Number(tabParam)))
    }
  }, [compare, tabParam])

  // Apply toggleWorkflowSelection only after workflowsTable is loaded
  useEffect(() => {
    if (
      workflowsTable.initialized &&
      compareWorkflowsRef.current &&
      compareWorkflowsRef.current.length > 0
    ) {
      dispatch(bulkToggleWorkflowSelection(compareWorkflowsRef.current));
      compareWorkflowsRef.current = null // avoid rerunning
    }
  }, [workflowsTable.initialized])


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
          onChange={(event, newValue) => {
            const searchParams = new URLSearchParams(location.search);
            searchParams.delete('compare');
            searchParams.set('tab', newValue)
            navigate({
              pathname: location.pathname,
              search: searchParams.toString(),
            }, { replace: true });
          
            if (newValue === 1) {
              dispatch(setVisibleTable("workflows"));
            }
          }}
          
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
            <Box sx={{ height: "40%", minHeight: "250px" }}>
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
              style={{ height: "100%", position: "relative"}}          
              handleStyles={{
                right: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "16px",  // Fixed width for handle area
                  right: "-16px",  // Position handle to overlap both components
                  zIndex: 10,
                }
              }}
              handleComponent={{
                right: (
                <Box
                  sx={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center", 
                    cursor: "ew-resize",
                  }}        
                >
                  <MoreVertRoundedIcon style={{ color: theme.palette.action.active }} />
                </Box>
                )
              }}
            >
              <WorkflowTable 
                handleChange={handleChange}
              />
            </Resizable>
            <Paper elevation={2} sx={{ flex: 1, overflow: "auto", height: "100%", ml: "8px"}}>
                <WorkflowCharts />
            </Paper>
          </Box>
        )}
      </Box>
    </>
  )
}

export default MonitoringPage
