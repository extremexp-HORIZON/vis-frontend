import React, { useState } from "react"
import {
  DataGrid,
  GridToolbarColumnsButton,
  GridToolbarExport,
  GridFilterModel,
} from "@mui/x-data-grid"
import { Box, Paper, IconButton, Popper, Typography } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close" // Import close icon

import { mean, std, min, max } from "mathjs" // Use this library for numeric calculations
import { VisualColumn } from "../../../../shared/models/dataexploration.model"

interface DataTableProps {
  data: any
  columns: VisualColumn[]
  datetimeColumn: string
}

const TableExpand: React.FC<DataTableProps> = ({
  data,
  columns,
  datetimeColumn,
}) => {

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
    height: 800,
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

  const rows = data.map((row: any, index: number) => ({
    id: row[datetimeColumn] ?? index, // Use index as fallback if datetimeColumn is null or undefined
    ...row,
  }))

  const calculateStatistics = (field: string) => {
    const columnData = rows
      .map((row: any) => row[field])
      .filter((value: any) => value !== undefined)
    return {
      min: min(columnData) as number,
      max: max(columnData) as number,
      avg: mean(columnData) as number,
      std: Number(std(columnData)) as number,
    }
  }

  const handleCellClick = (
    params: any,
    event: React.MouseEvent<HTMLElement>,
  ) => {
    const columnField = params.field
    const columnDefinition = columns.find(col => col.name === columnField)
    const cellAnchor = event.currentTarget

    if (
      columnDefinition?.type === "DOUBLE" ||
      columnDefinition?.type === "FLOAT" ||
      columnDefinition?.type === "INTEGER"
    ) {
      setStatistics(calculateStatistics(columnField)) // Calculate statistics for numeric columns
      setColumnType(columnDefinition.type) // Store the column type
      setAnchorEl(cellAnchor)
    } else {
      setStatistics(null) // Clear statistics for non-numeric columns
      setColumnType(columnDefinition ? columnDefinition.type : "N/A")
      setAnchorEl(cellAnchor)
    }
  }

  // Function to close the popper
  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
        <Box sx={{ ...tableStyle, marginLeft: 2, marginRight: 2 }}>
          {/* Enable horizontal scrolling */}
          <DataGrid
            rows={rows}
            columns={columns.map((col: any) => ({
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
            }))}
            filterModel={filterModel}
            // onFilterModelChange={handleFilterChange} // Capture filter changes
            onCellClick={handleCellClick} // Handle cell click for statistics
            disableColumnMenu
            hideFooter
            disableColumnSelector
            slots={{
              toolbar: CustomToolbar,
            }}
          />
        </Box>
    </>
  )
}

export default TableExpand
