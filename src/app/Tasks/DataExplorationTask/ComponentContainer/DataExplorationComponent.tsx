import { useEffect } from "react"
import {
  fetchDataExplorationData,
  fetchMetaData,
} from "../../../../shared/models/tasks/data-exploration-task.model"
import { useAppDispatch, useAppSelector } from "../../../../store/store"
import { defaultDataExplorationQuery } from "../../../../shared/models/dataexploration.model"
import PlayPanel from "./PlayPanel"
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded"
import LineChart from "../Charts/LineChart"
import ScatterChart from "../Charts/ScatterChart"
import { BarChart } from "@mui/icons-material"
import { Box, Paper, Typography } from "@mui/material"
import { Resizable } from "re-resizable"
import theme from "../../../../mui-theme"
import TableExpand from "../DataTable/TableExpand"
import { setControls } from "../../../../store/slices/workflowPageSlice"
import InfoMessage from "../../../../shared/components/InfoMessage"
import AssessmentIcon from "@mui/icons-material/Assessment"

const DataExplorationComponent = () => {
  const { tab } = useAppSelector(state => state.workflowPage)
  const dataExploration = tab?.workflowTasks.dataExploration
  const dispatch = useAppDispatch()
  const selectedDataset = tab?.dataAssetsTable.selectedDataset?.source

  useEffect(() => {
    if (!tab?.workflowId) return // Ensure workflowId exists before dispatch

    dispatch(
      fetchMetaData({
        query: {
          ...defaultDataExplorationQuery,
          datasetId: tab?.dataAssetsTable.selectedDataset?.source || "",
        },
        metadata: {
          workflowId: tab.workflowId,
          queryCase: "metaData",
        },
      }),
    )
    dispatch(
      fetchDataExplorationData({
        query: {
          ...defaultDataExplorationQuery,
          datasetId: tab?.dataAssetsTable.selectedDataset?.source || "",
          limit: 100,
        },
        metadata: {
          workflowId: tab.workflowId,
          queryCase: "chart",
        },
      }),
    )
  }, [tab?.workflowId, selectedDataset])
  useEffect(() => {
    console.log("mpainw")
    dispatch(
      setControls({
        selectedColumns: dataExploration?.metaData.data?.originalColumns,
      }),
    )
  }, [tab?.workflowId, dataExploration?.metaData.data?.originalColumns,selectedDataset])

  return (
    <>
      {selectedDataset ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            rowGap: 1,
            height: "100%",
            overflow: "auto", //enables scrolling when table minHeight is applied in the overview page
            px: 2,
          }}
        >
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
              style={{ height: "100%", position: "relative" }}
              handleStyles={{
                right: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "16px", // Fixed width for handle area
                  right: "-16px", // Position handle to overlap both components
                  zIndex: 10,
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
                      justifyContent: "center",
                      cursor: "ew-resize",
                    }}
                  >
                    <MoreVertRoundedIcon
                      style={{ color: theme.palette.action.active }}
                    />
                  </Box>
                ),
              }}
            >
              <PlayPanel />
            </Resizable>
            <Paper
              elevation={2}
              sx={{ flex: 1, overflow: "auto", height: "100%", ml: "8px" }}
            >
              {dataExploration?.controlPanel.chartType === "datatable" && (
                <TableExpand />
              )}
              {dataExploration?.controlPanel.chartType === "line" && (
                <LineChart />
              )}
              {dataExploration?.controlPanel.chartType === "scatter" && (
                <ScatterChart />
              )}
              {dataExploration?.controlPanel.chartType === "bar" && (
                <BarChart />
              )}
            </Paper>
          </Box>
        </Box>
      ) : (
        <InfoMessage
          message="Select a dataset to begin exploring your data."
          type="info"
          icon={<AssessmentIcon sx={{ fontSize: 40, color: "info.main" }} />}
          fullHeight
        />
      )}
    </>
  )
}

export default DataExplorationComponent
