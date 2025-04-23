import type React from "react";
import { useState } from "react"
import type {
  GridFilterModel} from "@mui/x-data-grid";
import {
  DataGrid
} from "@mui/x-data-grid"
import { Box, Paper, styled } from "@mui/material"
import { useAppSelector } from "../../../../store/store"
import InfoMessage from "../../../../shared/components/InfoMessage"
import AssessmentIcon from "@mui/icons-material/Assessment"

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

  return (<>
   

    {Array.isArray(rows) && rows.length > 0&&Array.isArray(tab?.workflowTasks?.dataExploration?.controlPanel?.selectedColumns)&&  tab?.workflowTasks?.dataExploration?.controlPanel?.selectedColumns?.length>0  ? (
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
                  width: 155,
                  headerAlign: "center", // 👈 Center the header text
                  align: "center",  

                  
                  type:
                  typeof col === "string"
                    ? "string"
                    : (
                        col as {
                          type?: "string" | "number" | "date" | "boolean"
                        }
                      ).type || "string",
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
 ) : (
  <InfoMessage
  message="Please select columns to display."
  type="info"
  icon={<AssessmentIcon sx={{ fontSize: 40, color: "info.main" }} />}
  fullHeight
/>
  )}
  </>
  )
}

export default TableExpand
