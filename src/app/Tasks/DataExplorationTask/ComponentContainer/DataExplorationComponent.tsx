import { useEffect } from "react"
import {
  dataExplorationDefault,
  fetchDataExplorationData,
  fetchMetaData,
} from "../../../../shared/models/tasks/data-exploration-task.model"
import { useAppDispatch, useAppSelector } from "../../../../store/store"
import { defaultDataExplorationQuery } from "../../../../shared/models/dataexploration.model"
import LeftPanel from "./data-exploration-left-panel"
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded"
import LineChart from "../Charts/data-exploration-line-chart"
import ScatterChart from "../Charts/data-exploration-scatter-chart"
import BarChart from "../Charts/data-exploration-bar-chart"
import {
  Box,
  CircularProgress,
  Paper,
  Typography,
  useMediaQuery,
} from "@mui/material"
import { Resizable } from "re-resizable"
import theme from "../../../../mui-theme"
import TableExpand from "../Charts/data-exploration-data-table"
import { setControls } from "../../../../store/slices/workflowPageSlice"
import InfoMessage from "../../../../shared/components/InfoMessage"
import AssessmentIcon from "@mui/icons-material/Assessment"
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded"
import MapControls from "../ChartControls/data-exploration-map-control"
import ResponsiveCardVegaLite from "../../../../shared/components/responsive-card-vegalite"
import MapCard from "../../../../shared/components/map-card"

const DataExplorationComponent = () => {
  const dispatch = useAppDispatch()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("xl"))

  const { tab } = useAppSelector(state => state.workflowPage)
  const selectedDataset = useAppSelector(
    state =>
      state.workflowPage?.tab?.dataTaskTable?.selectedItem?.data?.source || "",
  )
  const workflowId = useAppSelector(
    state => state.workflowPage?.tab?.workflowId || "",
  )
  const chartType = useAppSelector(
    state =>
      state.workflowPage?.tab?.workflowTasks?.dataExploration?.controlPanel
        ?.chartType || "",
  )

  useEffect(() => {
    if (selectedDataset && workflowId) {
      dispatch(setControls({ ...dataExplorationDefault.controlPanel }))
      dispatch(
        fetchMetaData({
          query: {
            ...defaultDataExplorationQuery,
            datasetId: selectedDataset,
          },
          metadata: {
            workflowId: workflowId,
            queryCase: "metaData",
          },
        }),
      )
    }
  }, [selectedDataset, workflowId, dispatch])

  if (!selectedDataset)
    return (
      <InfoMessage
        message="Select a dataset to begin exploring your data."
        type="info"
        icon={<AssessmentIcon sx={{ fontSize: 40, color: "info.main" }} />}
        fullHeight
      />
    )

  if (tab?.workflowTasks.dataExploration?.metaData.loading)
    return (
      <Box
        sx={{
          height: "100%",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    )

  if (tab?.workflowTasks.dataExploration?.metaData.error)
    return (
      <InfoMessage
        message="Failed to fetch dataset metadata."
        type="info"
        icon={
          <ReportProblemRoundedIcon sx={{ fontSize: 40, color: "info.main" }} />
        }
        fullHeight
      />
    )

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        rowGap: 1,
        height: "100%",
        overflow: "auto", //enables scrolling when table minHeight is applied in the overview page
      }}
    >
      <LeftPanel />
      {tab?.workflowTasks.dataExploration?.chart.loading ? (
        <Box
          sx={{
            height: "100%",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : tab?.workflowTasks.dataExploration?.chart.error ? (
        <InfoMessage
          message="Failed to fetch dataset."
          type="info"
          icon={
            <ReportProblemRoundedIcon
              sx={{ fontSize: 40, color: "info.main" }}
            />
          }
          fullHeight
        />
      ) : (
        <Paper
          elevation={1}
          sx={{ flex: 1, overflow: "auto", height: "100%", width: "100%" }}
        >
          {chartType === "datatable" && <TableExpand />}
          {chartType === "line" && <LineChart />}
          {chartType === "scatter" && <ScatterChart />}
          {chartType === "bar" && <BarChart />}
          {chartType === "map" && (
            <>
            <Typography> soon....</Typography>
              {/* <MapCard
                controlPanel={<MapControls />}
                maxHeight={500}
                aspectRatio={isSmallScreen ? 2.8 : 1.8}
              /> */}
            </>
          )}
        </Paper>
      )}
    </Box>
  )
}

export default DataExplorationComponent
