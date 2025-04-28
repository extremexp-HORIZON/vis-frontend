import type React from "react";
import { useState, useRef } from "react"
import type {
  GridFilterModel} from "@mui/x-data-grid";
import {
  DataGrid
} from "@mui/x-data-grid"
import { 
  Box, 
  Paper, 
  styled,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Typography,
} from "@mui/material"
import { useAppSelector, useAppDispatch } from "../../../../store/store"
import InfoMessage from "../../../../shared/components/InfoMessage"
import AssessmentIcon from "@mui/icons-material/Assessment"
import TableRowsIcon from "@mui/icons-material/TableRows"
import FileDownloadIcon from "@mui/icons-material/FileDownload"
import ResponsiveCardHeader, { SectionHeader } from "../../../../shared/components/responsive-card-table"
import { setControls } from "../../../../store/slices/workflowPageSlice"
import { fetchDataExplorationData } from "../../../../shared/models/tasks/data-exploration-task.model"
import { defaultDataExplorationQuery } from "../../../../shared/models/dataexploration.model"
import ResponsiveCardTable from "../../../../shared/components/responsive-card-table";

const TableExpand: React.FC = () => {
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] })
  const tableRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();

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
    // Fix header to remain at top
    "& .MuiDataGrid-main": {
      // Critical for layout
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
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
      backgroundColor: '#ffffff',
    },
    "& .MuiTablePagination-root": {
      overflow: "visible",
    },
    // Add border radius to bottom corners
    '&.MuiDataGrid-root': {
      borderRadius: '0 0 12px 12px',
      border: 'none',
      height: '100%', // Ensure full height
    }
  }))

  // Column selection functionality
  const originalColumns = tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns || []
  const selectedColumns = tab?.workflowTasks.dataExploration?.controlPanel?.selectedColumns || []
  const selectedColumnNames = selectedColumns.map(col => col.name)

  const handleColumnToggle = (columnName: string) => () => {
    const newSelectedColumns = selectedColumns.some(col => col.name === columnName)
      ? selectedColumns.filter(col => col.name !== columnName)
      : [...selectedColumns, originalColumns.find(col => col.name === columnName)!]
    
    dispatch(setControls({ selectedColumns: newSelectedColumns }))
    
    if (newSelectedColumns.length) {
      handleFetchDataExploration(newSelectedColumns)
    }
  }

  const handleFetchDataExploration = (columns = selectedColumns) => {
    if (!columns?.length) return;
  
    dispatch(fetchDataExplorationData({
      query: {
        ...defaultDataExplorationQuery,
        datasetId: tab?.dataTaskTable.selectedItem?.data?.source || "",
        columns: columns.map(col => col.name),
        filters: tab?.workflowTasks.dataExploration?.controlPanel?.filters || [],
      },
      metadata: {
        workflowId: tab?.workflowId || "",
        queryCase: "chart",
      },
    }));
  }

  // Export data to CSV
  const handleExportCsv = () => {
    if (!rows || rows.length === 0) return;
    
    const headers = selectedColumns.map(col => col.name);
    const csvContent = [
      headers.join(','),
      ...rows.map((row: any) => 
        headers.map(header => {
          const value = row[header];
          // Handle values with commas by wrapping in quotes
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value !== undefined && value !== null ? value : '';
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `data-table-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Column selection panel component
  const ColumnSelectionPanel = () => (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        mb: 1.5,
        color: '#3566b5',
      }}>
        <TableRowsIcon fontSize="small" sx={{ mr: 1 }} />
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: '#1e3a5f',
          }}
        >
          Select columns to display
        </Typography>
      </Box>
      <Box sx={{ 
        maxHeight: 250,
        overflow: 'auto',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: '8px',
        bgcolor: 'rgba(248,249,250,0.6)',
      }}>
        <List dense disablePadding>
          {originalColumns.map((column) => (
            <ListItem 
              key={column.name} 
              disablePadding
              divider
              sx={{
                '&:last-child': {
                  borderBottom: 'none',
                }
              }}
            >
              <ListItemButton 
                onClick={handleColumnToggle(column.name)}
                sx={{
                  py: 0.5,
                  '&:hover': {
                    bgcolor: 'rgba(53, 102, 181, 0.04)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Checkbox
                    edge="start"
                    checked={selectedColumnNames.includes(column.name)}
                    tabIndex={-1}
                    disableRipple
                    size="small"
                    color="primary"
                  />
                </ListItemIcon>
                <ListItemText 
                  primary={column.name} 
                  primaryTypographyProps={{
                    variant: 'body2',
                    sx: { 
                      fontSize: '0.875rem',
                      fontWeight: selectedColumnNames.includes(column.name) ? 500 : 400,
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );

  const hasContent = Array.isArray(rows) && rows.length > 0 && 
                    Array.isArray(selectedColumns) && selectedColumns.length > 0;

  return (
    <Box sx={{ height: "99%" }}>
      <ResponsiveCardTable
        title="Data Table" 
        controlPanel={<ColumnSelectionPanel />}
        onDownload={handleExportCsv}
        showDownloadButton={hasContent}
        downloadLabel="Export as CSV"
        downloadSecondaryText="Download table data"
        additionalMenuItems={null}
        noPadding={true}
      >
        <Box sx={{ 
          height: "100%", 
          width: "100%",
          display: 'flex',
          flexDirection: 'column',
        }}>
          {hasContent ? (
            <Box 
              sx={{ 
                flexGrow: 1, 
                width: "100%",
                height: '100%', 
                overflow: 'hidden', // Important to contain the scrolling
                display: 'flex',
              }} 
              ref={tableRef}
            >
              <StyledDataGrid
                rows={rows || []}
                columns={selectedColumns.map(col => ({
                  field: typeof col === "string" ? col : col.name,
                  headerName: typeof col === "string" ? col : col.name,
                  width: 155,
                  headerAlign: "center",
                  align: "center",
                  type: typeof col === "string" ? "string" : col.type || "string",
                }))}
                filterModel={filterModel}
                disableColumnMenu
                disableColumnSelector
                pagination
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 25 },
                  },
                }}
                autoHeight={false}
                sx={{
                  width: '100%',
                  border: 'none',
                }}
              />
            </Box>
          ) : (
            <InfoMessage
              message="Please select columns to display."
              type="info"
              icon={<AssessmentIcon sx={{ fontSize: 40, color: "info.main" }} />}
              fullHeight
            />
          )}
        </Box>
      </ResponsiveCardTable>
    </Box>
  );
};

export default TableExpand;
