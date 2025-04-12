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
import { Box, Paper } from "@mui/material"
import { Resizable } from "re-resizable"
import theme from "../../../../mui-theme"
import TableExpand from "../DataTable/TableExpand"
import { setControls } from "../../../../store/slices/workflowPageSlice"

const DataExplorationComponent = () => {
  const { tab } = useAppSelector(state => state.workflowPage)
  const dataExploration = tab?.workflowTasks.dataExploration
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!tab?.workflowId) return // Ensure workflowId exists before dispatch

    dispatch(
      fetchMetaData({
        query: {
          ...defaultDataExplorationQuery,
          datasetId: "I2Cat_phising/dataset/I2Cat_phising_dataset.csv",
        },
        metadata: {
          workflowId: tab.workflowId,
          queryCase: "metaData",
        },
      }),
    )
    if (tab.workflowTasks.dataExploration?.controlPanel?.selectedColumns?.length===0){ 
      console.log("mpainw")
      dispatch(setControls({ selectedColumns: dataExploration?.metaData.data?.originalColumns }))
    
  }

    dispatch(
      fetchDataExplorationData({
        query: {
          ...defaultDataExplorationQuery,
          datasetId: "I2Cat_phising/dataset/I2Cat_phising_dataset.csv",
          limit: 100,
        },
        metadata: {
          workflowId: tab.workflowId,
          queryCase: "chart",
        },
      }),
    )
  }, [tab?.workflowId])

  useEffect(() => {
    const originalColumns = dataExploration?.metaData.data?.originalColumns
    if (originalColumns && originalColumns.length > 0) {
      // dispatch(setControls({ originalColumns:originalColumns,uniqueValues:dataExploration?.metaData.data?.uniqueColumnValues }))
    }
  }, [dataExploration?.metaData.data, dispatch])

  console.log("tab", tab?.workflowTasks.dataExploration)
  return (
    <>
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
              <TableExpand
                data={tab?.workflowTasks.dataExploration?.chart.data?.data ?? []}
                columns={
                  tab?.workflowTasks.dataExploration?.controlPanel.selectedColumns
                   ?? []
                }
                datetimeColumn={""}
              />
            )}
            {dataExploration?.controlPanel.chartType === "line" && (
              <LineChart />
            )}
            {dataExploration?.controlPanel.chartType === "scatter" && (
              <ScatterChart />
            )}
            {dataExploration?.controlPanel.chartType === "bar" && <BarChart />}
          </Paper>
        </Box>
      </Box>
    </>
  )
}

export default DataExplorationComponent
