import React, { useState } from "react"
import {
  DataGrid,
  GridFilterModel,
} from "@mui/x-data-grid"
import { Box, Paper, styled } from "@mui/material"

import { useAppSelector } from "../../../../store/store"

const TableExpand: React.FC = () => {
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] })

  const { tab } = useAppSelector(state => state.workflowPage)
  const dateTimeColumn =
    tab?.workflowTasks.dataExploration?.controlPanel?.selectedColumns?.find(
      col => col.type === "LOCAL_DATE_TIME",
    )?.name

  const rows = tab?.workflowTasks.dataExploration?.chart?.data?.data?.map(
    (row: any, index: number) => {
      if (dateTimeColumn !== undefined) {
        return {
          id: row[dateTimeColumn] ?? index,
          ...row,
        }
      } else {
        return {
          id: index,
          ...row,
        }
      }
    },
  )

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
    <Box sx={{ height: "100%" }}>
      <Paper sx={{ height: "100%", width: "100%" }} elevation={2}>
        <div style={{ height: "100%", width: "100%" }}>
          <StyledDataGrid
            rows={rows || []}
            columns={
              tab?.workflowTasks.dataExploration?.controlPanel?.selectedColumns?.map(
                (col: any) => ({
                  field:
                    typeof col === "string"
                      ? col
                      : (col as { name: string }).name,
                  headerName:
                    typeof col === "string"
                      ? col
                      : (col as { name: string }).name,
                  width: 200,

                  type:
                    typeof col === "string"
                      ? "string"
                      : (
                          col as {
                            type: "string" | "number" | "date" | "boolean"
                          }
                        ).type,
                }),
              ) || []
            }
            filterModel={filterModel}
            disableColumnMenu
            disableColumnSelector
          />
        </div>
      </Paper>
    </Box>
  )
}

export default TableExpand
