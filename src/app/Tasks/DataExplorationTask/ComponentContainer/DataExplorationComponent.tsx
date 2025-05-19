import { useEffect } from "react"
import {
  dataExplorationDefault,
} from "../../../../shared/models/tasks/data-exploration-task.model"
import { fetchMetaData } from "../../../../store/slices/dataExplorationSlice"
import { useAppDispatch, useAppSelector } from "../../../../store/store"
import { defaultDataExplorationQuery } from "../../../../shared/models/dataexploration.model"
import LeftPanel from "./data-exploration-left-panel"
import LineChart from "../Charts/data-exploration-line-chart"
import ScatterChart from "../Charts/data-exploration-scatter-chart"
import  BarChart from "../Charts/data-exploration-bar-chart"
import { Box, Paper, useMediaQuery } from "@mui/material"
import TableExpand from "../Charts/data-exploration-data-table"
import { setControls } from "../../../../store/slices/workflowPageSlice"
import InfoMessage from "../../../../shared/components/InfoMessage"
import AssessmentIcon from "@mui/icons-material/Assessment"
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded"
import theme from "../../../../mui-theme"
import HeatMap from "../Charts/data-exploration-heatmap"
import MapCardWrapper from "../Charts/map-wrap"

const DataExplorationComponent = () => {
  const dispatch = useAppDispatch()

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
      
        <Paper
          elevation={1}
          sx={{ flex: 1, overflow: "auto", height: "100%", width: "100%" }}
        >
          {chartType === "datatable" && <TableExpand />}
          {chartType === "line" && <LineChart />}
          {chartType === "scatter" && <ScatterChart />}
          {chartType === "bar" && <BarChart />}
          {chartType === "heatmap" && <HeatMap/>}
          {chartType === "map" && (<MapCardWrapper/>)}
        </Paper>
      
    </Box>
  )
}

export default DataExplorationComponent
