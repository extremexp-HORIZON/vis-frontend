import { useEffect, useRef, useState } from "react"
import InstanceClassification from "../../Tasks/SharedItems/Plots/instance-classification"
import type { RootState } from "../../../store/store"
import { useAppDispatch, useAppSelector } from "../../../store/store"
import { getLabelTestInstances } from "../../../shared/models/tasks/model-analysis.model"
import CounterfactualsTable from "../../Tasks/SharedItems/Tables/counterfactuals-table"
import { useParams } from "react-router-dom"
import {
  ButtonGroup,
  Button,
  Tooltip,
  Box,
  styled,
  Checkbox,
  Typography,
  Stack,
} from "@mui/material"
import { setControls } from "../../../store/slices/workflowPageSlice"
import ScatterPlotIcon from "@mui/icons-material/ScatterPlot"
import TableChartIcon from "@mui/icons-material/TableChartSharp"
import { DataGrid } from "@mui/x-data-grid"
import InfoMessage from "../../../shared/components/InfoMessage"
import ResponsiveCardTable from "../../../shared/components/responsive-card-table"
import Loader from "../../../shared/components/loader"


const InstanceView = () => {
  const { tab, isTabInitialized } = useAppSelector(
    (state: RootState) => state.workflowPage,
  )
  const chartType = useAppSelector(
    (state: RootState) =>
      state.workflowPage.tab?.workflowTasks.dataExploration?.controlPanel
        .chartType,
  )
  const dispatch = useAppDispatch()
  const experimentId = useParams().experimentId
  const workflow = tab?.workflowTasks.modelAnalysis?.counterfactuals
  const tableRef = useRef<HTMLDivElement>(null)
  const hasContent = true
  const [showMisclassifiedOnly, setShowMisclassifiedOnly] = useState(false)

  const [point, setPoint] = useState<any | null>(null)
  const rows = tab?.workflowTasks.modelAnalysis?.modelInstances?.data ?? []
console.log(point)

  const columns = Object.keys(rows[0] || {}).map(key => ({
    field: key,
    headerName: key,
    flex: 1,
    minWidth: 150,
    maxWidth: 300,
    headerAlign: "center",
    align: "center",

    renderCell: (params: any) => {
      const value = params.value
      if (key === "predicted") {
        return (
          <span
            style={{
              color: value === "1" ? "green" : "red",
              fontWeight: "bold",
            }}
          >
            {value}
          </span>
        )
      }
      return typeof value === "number"
        ? value.toFixed(3)
        : (value?.toString?.() ?? "")
    },
  }))
  
  const handleExportCsv = () => {
    if (!rows || rows.length === 0) return

    const headers = selectedColumns.map(col => col.name)
    const csvContent = [
      headers.join(","),
      ...rows.map((row: any) =>
        headers
          .map(header => {
            const value = row[header]
            // Handle values with commas by wrapping in quotes
            return typeof value === "string" && value.includes(",")
              ? `"${value}"`
              : value !== undefined && value !== null
                ? value
                : ""
          })
          .join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `data-table-export-${new Date().toISOString().split("T")[0]}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
    "& .MuiDataGrid-scrollbarFiller": {
      backgroundColor: theme.palette.customGrey.main,
    },
    "& .MuiDataGrid-columnHeader": {
      backgroundColor: theme.palette.customGrey.main,
    },
    '& .MuiDataGrid-columnHeader[data-field="__check__"]': {
      backgroundColor: theme.palette.customGrey.main,
    },
    "& .MuiDataGrid-columnHeaderTitle": {
      whiteSpace: "nowrap",
      overflow: "visible",
    },
    // Fix header to remain at top
    "& .MuiDataGrid-main": {
      // Critical for layout
      display: "flex",
      flexDirection: "column",
      height: "100%",
    },
    "& .MuiDataGrid-columnHeaders": {
      position: "sticky",
      top: 0,
      zIndex: 2,
    },
    // Ensure the cell container scrolls properly
    "& .MuiDataGrid-virtualScroller": {
      flex: 1,
      overflow: "auto",
    },
    // Fix pagination to remain at bottom
    "& .MuiDataGrid-footerContainer": {
      minHeight: "56px",
      borderTop: "1px solid rgba(224, 224, 224, 1)",
      position: "sticky",
      bottom: 0,
      zIndex: 2,
      backgroundColor: "#ffffff",
    },
    "& .MuiTablePagination-root": {
      overflow: "visible",
    },
    // Add border radius to bottom corners
    "&.MuiDataGrid-root": {
      borderRadius: "0 0 12px 12px",
      border: "none",
      height: "100%", // Ensure full height
    },
    // Add styling for selected row
    "& .MuiDataGrid-row.Mui-selected": {
      backgroundColor: `${theme.palette.primary.light}40`,
      "&:hover": {
        backgroundColor: `${theme.palette.primary.light}60`,
      },
    },
  }))

  useEffect(() => {
    if (tab) {
      dispatch(
        getLabelTestInstances({
          experimentId: experimentId || "",
          runId: tab?.workflowId,
        }),
      )
    }
  }, [isTabInitialized])

  const visibleRows = showMisclassifiedOnly
    ? rows.filter((row: any) => row.actual !== row.predicted)
    : rows

  const rowHeight = 52 // Estimated row height
  const maxTableHeight = 500 // Set a max height to avoid it growing indefinitely
  const calculatedHeight = Math.min(
    visibleRows.length * rowHeight + 210,
    maxTableHeight,
  ) // Add space for headers and footer

  // Common chart height to use for both chart types
  const chartHeight = calculatedHeight

  return (
    <>
      <Box display="flex" justifyContent="space-between" marginBottom={2} alignItems="center">
        {/* Misclassified instances checkbox moved to the top left */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography fontSize={"0.8rem"}>Show Misclassified Instances:</Typography>
          <Checkbox
            checked={showMisclassifiedOnly}
            onChange={e => setShowMisclassifiedOnly(e.target.checked)}
            disabled={
              tab?.workflowTasks.modelAnalysis?.modelInstances?.loading ||
              !tab.workflowTasks.modelAnalysis?.modelInstances?.data
            }
          />
        </Stack>

        {/* Chart type controls remain on the right */}
        <ButtonGroup
          size="small"
          aria-label="Small button group"
          variant="outlined"
          sx={{
            marginLeft: 'auto',
            height: 30, // Adjust this value to your desired height
            '& .MuiButton-root': {
              minHeight: 30,
              padding: '2px 2px',
              marginTop: 0.5,
            },
          }}
        >  
          
          <Tooltip title="Table">
            <Button
              variant={chartType === "datatable" ? "contained" : "outlined"}
              onClick={() => dispatch(setControls({ chartType: "datatable" }))}
            >
              <TableChartIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Scatter">
            <Button
              variant={chartType === "scatter" ? "contained" : "outlined"}
              onClick={() => dispatch(setControls({ chartType: "scatter" }))}
            >
              <ScatterPlotIcon />
            </Button>
          </Tooltip>
        </ButtonGroup>
      </Box>

      {chartType === "scatter" ? (
        <Box sx={{ height: "60%", minHeight: 400 }}>
          <InstanceClassification
            plotData={tab?.workflowTasks.modelAnalysis?.modelInstances ?? null}
            point={point}
            setPoint={setPoint}
            showMisclassifiedOnly={showMisclassifiedOnly}
          />
        </Box>
      ) : (
        <Box sx={{ height: "60%", minHeight: 400 }}>
          <ResponsiveCardTable
            title="Instance Classification Table"
            onDownload={handleExportCsv}
            showDownloadButton={hasContent}
            downloadLabel="Export as CSV"
            downloadSecondaryText="Download table data"
            additionalMenuItems={null}
            noPadding={true}
            showControlsInHeader={true}
          >
            <Box
              sx={{
                height: "100%",
                width: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
               {tab?.workflowTasks.modelAnalysis?.modelInstances?.loading ? (
                 <Loader/>
                ) : hasContent ? (
                <Box
                  sx={{
                    flexGrow: 1,
                    width: "100%",
                    height: "100%",
                    overflow: "hidden", // Important to contain the scrolling
                    display: "flex",
                  }}
                  ref={tableRef}
                >
                  <StyledDataGrid
                    rows={(showMisclassifiedOnly
                      ? rows.filter((row: any) => row.actual !== row.predicted)
                      : rows
                    ).map((row: any, index: any) => ({ id: index, ...row }))}
                    columns={columns}
                    onRowClick={(params) => {
                      const { id, ...rowWithoutId } = params.row
                      setPoint(rowWithoutId)
                    }}
                    pagination
                    selectionModel={point ? [rows.indexOf(point)] : []}
                    rowSelectionModel={point ? [rows.indexOf(point)] : []}
                    checkboxSelection={false}
                    disableRowSelectionOnClick={false}
                    sx={{
                      width: "100%",
                      border: "none",
                      "& .MuiDataGrid-cell": {
                        whiteSpace: "normal", // Allow text to wrap
                        wordWrap: "break-word",
                      },
                      "& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell": {
                        // Add border to make cells more distinct
                        borderRight: "1px solid rgba(224, 224, 224, 0.4)",
                      },
                      // Make the grid look better when fewer columns
                      "& .MuiDataGrid-main": {
                        overflow: "hidden",
                      },
                      // Style for selected row
                      "& .MuiDataGrid-row.Mui-selected": {
                        backgroundColor: "rgba(25, 118, 210, 0.15)",
                        "&:hover": {
                          backgroundColor: "rgba(25, 118, 210, 0.25)",
                        },
                      },
                    }}
                  />
                </Box>
              ) : (
                <InfoMessage
                  message="Please select columns to display."
                  type="info"
                  fullHeight
                />
              )}
            </Box>
          </ResponsiveCardTable>
        </Box>
      )}
      {point && workflow ? (
        <Box sx={{ pt: 2, height: "30%", minHeight: 300 }}>
           <CounterfactualsTable
             key={`counterfactuals-table`}
             point={point}
             handleClose={() => {}}
             counterfactuals={workflow || null}
             onClose={() => setPoint(null)}
             experimentId={experimentId || "I2Cat_phising"}
             workflowId={tab?.workflowId || "1"}
           />
        </Box>
      ) : null}
    </>
  )
}

export default InstanceView;



