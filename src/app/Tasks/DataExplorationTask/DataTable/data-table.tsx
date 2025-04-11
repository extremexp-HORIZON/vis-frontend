import Paper from "@mui/material/Paper"
import Box from "@mui/material/Box"
import { Checkbox, styled } from "@mui/material"
import { RootState, useAppDispatch, useAppSelector } from "../../../../store/store"
import { useEffect, useState } from "react"
import type { GridColDef, GridRowSelectionModel } from "@mui/x-data-grid"
import { DataGrid } from "@mui/x-data-grid"
import theme from "../../../../mui-theme"
import InfoMessage from "../../../../shared/components/InfoMessage"
import ScheduleIcon from "@mui/icons-material/Schedule"
import { useSearchParams } from "react-router-dom"
import { setDataTable } from "../../../../store/slices/workflowPageSlice"

let idCounter = 1

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
  // Add pagination styling
  "& .MuiDataGrid-footerContainer": {
    minHeight: "56px",
    borderTop: "1px solid rgba(224, 224, 224, 1)",
  },
  "& .MuiTablePagination-root": {
    overflow: "visible",
  },
}))

// Create a custom NoRowsOverlay component using InfoMessage
const CustomNoRowsOverlay = () => {
  return (
    <InfoMessage 
      message="No data assets available."
      type="info"
      icon={<ScheduleIcon sx={{ fontSize: 40, color: "info.main" }} />}
      fullHeight
    />
  )
}

export default function DataTable() {
  const { tab } = useAppSelector((state: RootState) => state.workflowPage)
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()
  const task = searchParams.get("task")

  const handleSelect = (id: number) => {
    if (!tab?.dataAssetsTable) return;
    if(tab?.dataAssetsTable.selectedDataset === id) dispatch(setDataTable({selectedDataset: null }))
    else dispatch(setDataTable({ selectedDataset: id }))
  }  

  useEffect(() => {
    const dataAssets = !task ? (
        tab?.workflowConfiguration.dataAssets
      ) : (
        tab?.workflowConfiguration.dataAssets?.filter(asset => asset.task === task)
      )
    if (dataAssets && dataAssets?.length > 0) {
      const rows = dataAssets
        .map(asset => {
          return {
            id: idCounter++,
            dataset: asset.name,
            source: asset.source,
            task: asset.task,
            role: asset.role
          }
        })
        .sort((a, b) => a.id - b.id)
      dispatch(
        setDataTable({
          rows,
        }),
      )
    }
  }, [tab?.workflowConfiguration.dataAssets])

  const columns: GridColDef[] = [
    {
      field: "select",
      headerName: "",
      width: 50,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      align: "center",
      renderCell: (params: any) => (
        <Checkbox
          checked={tab?.dataAssetsTable.selectedDataset === params.row.id}
          onChange={() => handleSelect(params.row.id)}
        />
      ),
    },
    ...(tab?.dataAssetsTable.rows?.length
      ? Object.keys(tab.dataAssetsTable.rows[0])
          .filter(key => key !== "id" && key !== "source")
          .map(key => ({
            field: key,
            headerName: key.replace("_", " "),
            headerClassName: "datagrid-header",
            minWidth: key.length * 10,
            maxWidth: 500,
            flex: 1,
            align: "center",
            headerAlign: "center",
            sortable: false,
          } as GridColDef))
      : []),
  ];  

  return (
    <Box sx={{height: "100%" }} >
      <Paper sx={{ height: "100%", width: "100%"}} elevation={2}>
        <div style={{ height: '100%', width: "100%" }}>
          <StyledDataGrid
            disableVirtualization
            density="compact"
            rows={tab?.dataAssetsTable.rows}
            disableColumnFilter
            columns={columns}
            slots={{
              noRowsOverlay: CustomNoRowsOverlay
            }}
            sx={{
              "& .MuiDataGrid-selectedRowCount": {
                visibility: "hidden", // Remove the selection count text on the bottom because we implement it in the header
              },
            }}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 50 },
              },
            }}
          />
        </div>
      </Paper>
    </Box>
  )
}
