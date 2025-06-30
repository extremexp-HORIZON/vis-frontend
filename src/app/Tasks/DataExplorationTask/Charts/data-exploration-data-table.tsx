import type React from 'react';
import { useRef, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, styled } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import ResponsiveCardTable from '../../../../shared/components/responsive-card-table';
import ColumnSelectionPanel from '../ChartControls/data-exploration-table-control';
import { fetchDataExplorationData } from '../../../../store/slices/dataExplorationSlice';
import PaginationComponent from '../ChartControls/data-exploration-pagination-control';
import { setCurrentPage } from '../../../../store/slices/workflowPageSlice';
import Loader from '../../../../shared/components/loader';
import InfoMessage from '../../../../shared/components/InfoMessage';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { logger } from '../../../../shared/utils/logger';
import type { VisualColumn } from '../../../../shared/models/dataexploration.model';
import type { GridColDef, GridValidRowModel } from '@mui/x-data-grid';

const TableExpand: React.FC = () => {
  const tableRef = useRef<HTMLDivElement>(null);

  const { tab } = useAppSelector(state => state.workflowPage);
  const dateTimeColumn =
    tab?.workflowTasks.dataExploration?.controlPanel?.selectedColumns?.find(
      col => col.type === 'LOCAL_DATE_TIME',
    )?.name;
  const columns =
    tab?.workflowTasks.dataExploration?.controlPanel?.selectedColumns || [];
  const rows = Array.isArray(tab?.workflowTasks.dataExploration?.dataTable?.data?.data) ?
    tab?.workflowTasks.dataExploration?.dataTable?.data?.data
      ?.filter((row): row is Record<string, unknown> => typeof row === 'object' && row !== null)
      .map(
        (row, index) => {
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
        },
      ) : [];

  const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
    '& .MuiDataGrid-scrollbarFiller': {
      backgroundColor: theme.palette.customGrey.main,
    },
    '& .MuiDataGrid-columnHeader': {
      backgroundColor: theme.palette.customGrey.main,
    },
    '& .MuiDataGrid-columnHeader[data-field="__check__"]': {
      backgroundColor: theme.palette.customGrey.main,
    },
    '& .MuiDataGrid-columnHeaderTitle': {
      whiteSpace: 'nowrap',
      overflow: 'visible',
    },
    // Fix header to remain at top
    '& .MuiDataGrid-main': {
      // Critical for layout
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    },
    '& .MuiDataGrid-columnHeaders': {
      position: 'sticky',
      top: 0,
      zIndex: 2,
    },
    // Ensure the cell container scrolls properly
    '& .MuiDataGrid-virtualScroller': {
      flex: 1,
      overflow: 'auto',
    },
    // Fix pagination to remain at bottom
    '& .MuiDataGrid-footerContainer': {
      minHeight: '56px',
      borderTop: '1px solid rgba(224, 224, 224, 1)',
      position: 'sticky',
      bottom: 0,
      zIndex: 2,
      backgroundColor: '#ffffff',
    },
    '& .MuiTablePagination-root': {
      overflow: 'visible',
    },
    // Add border radius to bottom corners
    '&.MuiDataGrid-root': {
      borderRadius: '0 0 12px 12px',
      border: 'none',
      height: '100%', // Ensure full height
    },
  }));

  useEffect(() => {
    dispatch(setCurrentPage(1));
  }, [tab?.workflowTasks.dataExploration?.controlPanel.filters]);
  // Get column information from the state
  const selectedColumns =
    tab?.workflowTasks.dataExploration?.controlPanel?.selectedColumns || [];
  const dispatch = useAppDispatch();
  const dataset = tab?.dataTaskTable.selectedItem?.data?.dataset;

  useEffect(() => {
    const fetchData = async () => {
      if (
        !tab?.dataTaskTable.selectedItem?.data?.dataset?.source ||
        columns.length === 0
      ) {
        return;
      }

      try {
        const currentPage =
          tab?.workflowTasks.dataExploration?.controlPanel?.currentPage || 1;
        const pageSize =
          tab?.workflowTasks.dataExploration?.controlPanel?.pageSize || 25;
        const offset = (currentPage - 1) * pageSize;

        await dispatch(
          fetchDataExplorationData({
            query: {
              dataSource: {
                source: dataset?.source || '',
                format: dataset?.format || '',
                sourceType: dataset?.sourceType || '',
                fileName: dataset?.name || ''
              },
              columns: columns.map((col: VisualColumn) => col.name),
              filters:
                tab?.workflowTasks.dataExploration?.controlPanel?.filters || [],
              limit: pageSize,
              offset,
            },
            metadata: {
              workflowId: tab?.workflowId || '',
              queryCase: 'dataTable',
            },
          }),
        ).unwrap();
      } catch (error) {
        logger.log('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, [
    dispatch,
    tab?.workflowTasks.dataExploration?.controlPanel?.currentPage,
    tab?.workflowTasks.dataExploration?.controlPanel?.pageSize,
    tab?.workflowTasks.dataExploration?.controlPanel?.filters,
    columns,
    tab?.dataTaskTable.selectedItem?.data?.dataset?.source,
    tab?.workflowId,
  ]);

  // Export data to CSV
  const handleExportCsv = () => {
    if (!rows || rows.length === 0) return;

    const headers = selectedColumns.map(col => col.name);
    const csvContent = [
      headers.join(','),
      ...rows.map((row: Record<string, unknown>) =>
        headers
          .map(header => {
            const value = row[header];

            // Handle values with commas by wrapping in quotes
            return typeof value === 'string' && value.includes(',')
              ? `"${value}"`
              : value !== undefined && value !== null
                ? value
                : '';
          })
          .join(','),
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `data-table-export-${new Date().toISOString()
        .split('T')[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasContent =
    Array.isArray(rows) &&
    rows.length > 0 &&
    Array.isArray(selectedColumns) &&
    selectedColumns.length > 0;

  const gridColumns: GridColDef<GridValidRowModel>[] = selectedColumns.map((col) => ({
    field: col.name,
    headerName: col.name,
    width: 155,
    headerAlign: 'center',
    align: 'center',
    type: col.type as GridColDef['type'],
    flex: 1,
    minWidth: 120,
  }));

  return (
    <Box sx={{ height: '99%' }}>
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
        <Box
          sx={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {hasContent ? (
            <Box
              sx={{
                flexGrow: 1,
                width: '100%',
                height: '100%',
                overflow: 'hidden', // Important to contain the scrolling
                display: 'flex',
                flexDirection: 'column',
              }}
              ref={tableRef}
            >
              { !tab?.workflowTasks.dataExploration?.dataTable.loading
              && !tab?.workflowTasks.dataExploration?.metaData?.loading
                ? (
                  <StyledDataGrid
                    rows={rows || []}
                    columns={gridColumns}
                    disableColumnMenu
                    hideFooter
                    disableColumnSelector
                    pagination
                    pageSizeOptions={[10, 25, 50, 100]}
                    initialState={{
                      pagination: {
                        paginationModel: { pageSize: 100 },
                      },
                    }}
                    autoHeight={false}
                    sx={{
                      width: '100%',
                      border: 'none',
                      '& .MuiDataGrid-cell': {
                        whiteSpace: 'normal', // Allow text to wrap
                        wordWrap: 'break-word',
                      },
                      '& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell': {
                        // Add border to make cells more distinct
                        borderRight: '1px solid rgba(224, 224, 224, 0.4)',
                      },
                      // Make the grid look better when fewer columns
                      '& .MuiDataGrid-main': {
                        overflow: 'hidden',
                      },
                    }}
                  />
                ) : (
                  <Loader/>
                )
              }
              <Box
                mt={5}
                mb={2}
                sx={{ display: 'flex', justifyContent: 'right' }}
              >
                <PaginationComponent />
              </Box>
            </Box>
          ) : (
            !tab?.workflowTasks.dataExploration?.dataTable.loading &&
            !tab?.workflowTasks.dataExploration?.metaData?.loading
              ? (
                <InfoMessage
                  message="No data available for the selected configuration."
                  type="info"
                  icon={<AssessmentIcon sx={{ fontSize: 40, color: 'info.main' }} />}
                  fullHeight
                />
              ) : (
                <Loader />
              )
          )}
        </Box>
      </ResponsiveCardTable>
    </Box>
  );
};

export default TableExpand;
