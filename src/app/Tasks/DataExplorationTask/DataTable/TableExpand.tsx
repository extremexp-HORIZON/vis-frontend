import React, { useState } from "react"
import {
  DataGrid,
  GridToolbarColumnsButton,
  GridToolbarExport,
  GridFilterModel,
} from "@mui/x-data-grid"
import { Box, Paper, IconButton, Popper, Typography, styled } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close" // Import close icon

import { mean, std, min, max } from "mathjs" // Use this library for numeric calculations
import { VisualColumn } from "../../../../shared/models/dataexploration.model"
import { useAppSelector } from "../../../../store/store"



const TableExpand: React.FC = () => {

  const [showAllColumns, setShowAllColumns] = useState(true)
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] })

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [statistics, setStatistics] = useState<{
    min: number
    max: number
    avg: number
    std: number
  } | null>(null)
  const [columnType, setColumnType] = useState<string | null>(null)

  const tableStyle = {
    height: 700,
    width: "98%",
  }


  const CustomToolbar = () => {
    const toggleColumns = () => {
      setShowAllColumns(!showAllColumns)
    }

    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center  ",
          padding: 1,
        }}
      >
        <GridToolbarColumnsButton />
        <GridToolbarExport />
      </Box>
    )
  }


    const { tab } = useAppSelector(state => state.workflowPage)
    const dateTimeColumn = tab?.workflowTasks.dataExploration?.controlPanel?.selectedColumns?.find(col => col.type === "LOCAL_DATE_TIME")?.name

  


    const rows = tab?.workflowTasks.dataExploration?.chart?.data?.data?.map((row: any, index: number) => {
      if (dateTimeColumn !== undefined) {
        return {
          id: row[dateTimeColumn] ?? index,
          ...row,
        };
      } else {
        return {
          id: index,
          ...row,
        };
      }
    });

  // const calculateStatistics = (field: string) => {
  //   const columnData = rows
  //     .map((row: any) => row[field])
  //     .filter((value: any) => value !== undefined)
  //   return {
  //     min: min(columnData) as number,
  //     max: max(columnData) as number,
  //     avg: mean(columnData) as number,
  //     std: Number(std(columnData)) as number,
  //   }
  // }

  // const handleCellClick = (
  //   params: any,
  //   event: React.MouseEvent<HTMLElement>,
  // ) => {
  //   const columnField = params.field
  //   const columnDefinition = columns.find(col => col.name === columnField)
  //   const cellAnchor = event.currentTarget

  //   if (
  //     columnDefinition?.type === "DOUBLE" ||
  //     columnDefinition?.type === "FLOAT" ||
  //     columnDefinition?.type === "INTEGER"
  //   ) {
  //     setStatistics(calculateStatistics(columnField)) // Calculate statistics for numeric columns
  //     setColumnType(columnDefinition.type) // Store the column type
  //     setAnchorEl(cellAnchor)
  //   } else {
  //     setStatistics(null) // Clear statistics for non-numeric columns
  //     setColumnType(columnDefinition ? columnDefinition.type : "N/A")
  //     setAnchorEl(cellAnchor)
  //   }
  // }

  // // Function to close the popper
  // const handleClose = () => {
  //   setAnchorEl(null)
  // }

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

  return (
    <Box sx={{height: "100%" }} >
    <Paper sx={{ height: "100%", width: "100%"}} elevation={2}>
      <div style={{ height: '100%', width: "100%" }}>

          <StyledDataGrid
            rows={rows||[]}
            columns={tab?.workflowTasks.dataExploration?.controlPanel?.selectedColumns?.map((col: any) => ({
              field:
                typeof col === "string" ? col : (col as { name: string }).name,
              headerName:
                typeof col === "string" ? col : (col as { name: string }).name,
              width: 200,

              type:
                typeof col === "string"
                  ? "string"
                  : (col as { type: "string" | "number" | "date" | "boolean" })
                      .type,
            })) || []}
            filterModel={filterModel}
            // onFilterModelChange={handleFilterChange} // Capture filter changes
            // onCellClick={handleCellClick} // Handle cell click for statistics
            disableColumnMenu
            // hideFooter
            disableColumnSelector
            slots={{
              toolbar: CustomToolbar,
            }}
          />
      </div>
    </Paper>
    </Box>
    
  )
}

export default TableExpand
