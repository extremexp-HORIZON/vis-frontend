import { useEffect, useRef, useState } from 'react';
import InstanceClassification from '../../Tasks/ModelAnalysisTask/plots/instance-classification';
import type { RootState } from '../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import CounterfactualsTable from '../../Tasks/ModelAnalysisTask/tables/counterfactuals-table';
import { useParams } from 'react-router-dom';
import {
  ButtonGroup,
  Button,
  Tooltip,
  Box,
  styled,
  Checkbox,
  Typography,
  Stack,
  IconButton,
} from '@mui/material';
import { setControls } from '../../../store/slices/workflowPageSlice';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import TableChartIcon from '@mui/icons-material/TableChartSharp';
import { DataGrid } from '@mui/x-data-grid';
import InfoMessage from '../../../shared/components/InfoMessage';
import ResponsiveCardTable from '../../../shared/components/responsive-card-table';
import Loader from '../../../shared/components/loader';
import PsychologyAltRoundedIcon from '@mui/icons-material/PsychologyAltRounded';
import { getLabelTestInstances } from '../../../store/slices/modelAnalysisSlice';
import type { GridColDef } from '@mui/x-data-grid';
import type { TestInstance } from '../../../shared/models/tasks/model-analysis.model';
import type { GridRenderCellParams } from '@mui/x-data-grid';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';

const CustomNoRowsOverlay = () => {
  return (
    <InfoMessage
      message="No Data Available."
      type="info"
      icon={<ReportProblemRoundedIcon sx={{ fontSize: 40, color: 'info.main' }} />}
      fullHeight
    />
  );
};

const InstanceView = () => {
  const { tab, isTabInitialized } = useAppSelector(
    (state: RootState) => state.workflowPage,
  );
  const chartType = useAppSelector(
    (state: RootState) =>
      state.workflowPage.tab?.workflowTasks.dataExploration?.controlPanel
        .chartType,
  );
  const dispatch = useAppDispatch();
  const experimentId = useParams().experimentId;
  const workflow = tab?.workflowTasks.modelAnalysis?.counterfactuals;
  const tableRef = useRef<HTMLDivElement>(null);
  const hasContent = true;
  const [showMisclassifiedOnly, setShowMisclassifiedOnly] = useState(false);

  const [point, setPoint] = useState<{ id: string; data: TestInstance } | null>(null);
  const rows: TestInstance[] = tab?.workflowTasks.modelAnalysis?.modelInstances?.data ?? [];

  useEffect(() => {
    if(chartType !== 'datatable' && chartType !== 'scatter')
      dispatch(setControls({ chartType: 'datatable' }));
  }, []);

  const baseColumns: GridColDef[] = Object.keys(rows[0] || {}).map(key => ({
    field: key,
    headerName: key,
    type: typeof rows[0]?.[key] === 'number' ? 'number' : 'string',
    flex: 1,
    minWidth: 150,
    maxWidth: 300,
    headerAlign: 'center',
    align: 'center',

    renderCell: (params: GridRenderCellParams) => {
      const value = params.value;

      if (key === 'predicted') {
        return (
          <span
            style={{
              color: value === '1' ? 'green' : 'red',
              fontWeight: 'bold',
            }}
          >
            {value}
          </span>
        );
      }

      return typeof value === 'number'
        ? value.toFixed(3)
        : (value?.toString?.() ?? '');
    },
  }));

  const actionColumn: GridColDef = {
    field: 'action',
    headerName: 'actions',
    headerAlign: 'center',
    align: 'center',
    sortable: false,
    filterable: false,
    headerClassName: 'datagrid-header-fixed',
    minWidth: 100,
    renderCell: (params: GridRenderCellParams) => (
      <Box
        onClick={(e) => e.stopPropagation()}
        display="flex"
        justifyContent="center"
        alignItems="center"
        width="100%"
        height="100%"
      >
        <Tooltip title="Explanations">
          <IconButton
            onClick={() => {
              const { id, ...data } = params.row;

              setPoint({ id, data });
            }}
          >
            <PsychologyAltRoundedIcon fontSize="small" color="primary" />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  };
  const columns: GridColDef[] = showMisclassifiedOnly ? [...baseColumns, actionColumn] : baseColumns;

  const handleExportCsv = () => {
    return;
  };

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
    // Add styling for selected row
    '& .MuiDataGrid-row.Mui-selected': {
      backgroundColor: `${theme.palette.primary.light}40`,
      '&:hover': {
        backgroundColor: `${theme.palette.primary.light}60`,
      },
    },
    '& .MuiDataGrid-columnHeader[data-field="action"]': {
      position: 'sticky',
      right: 0,
      zIndex: 999,
      backgroundColor: theme.palette.customGrey.main,
      borderLeft: '1px solid #ddd',
    },
    '& .MuiDataGrid-cell[data-field="action"]': {
      position: 'sticky',
      right: 0,
      zIndex: 999,
      backgroundColor: theme.palette.customGrey.light,
      borderLeft: '1px solid #ddd',
    },
  }));

  useEffect(() => {
    if (tab) {
      dispatch(
        getLabelTestInstances({
          experimentId: experimentId || '',
          runId: tab?.workflowId,
        }),
      );
    }
  }, [isTabInitialized]);

  const hashRow = (row: TestInstance): string => {
    const stringified = JSON.stringify(row, Object.keys(row).sort());
    let hash = 0;

    for (let i = 0; i < stringified.length; i++) {
      const char = stringified.charCodeAt(i);

      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }

    return `row-${Math.abs(hash)}`;
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between" marginBottom={2} alignItems="center">
        {/* Misclassified instances checkbox moved to the top left */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography fontSize={'0.8rem'}>Show Misclassified Instances:</Typography>
          <Checkbox
            checked={showMisclassifiedOnly}
            onChange={e => setShowMisclassifiedOnly(e.target.checked)}
            disabled={
              tab?.workflowTasks.modelAnalysis?.modelInstances?.loading ||
              !tab?.workflowTasks.modelAnalysis?.modelInstances?.data
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
              variant={chartType === 'datatable' ? 'contained' : 'outlined'}
              onClick={() => dispatch(setControls({ chartType: 'datatable' }))}
            >
              <TableChartIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Scatter">
            <Button
              variant={chartType === 'scatter' ? 'contained' : 'outlined'}
              onClick={() => dispatch(setControls({ chartType: 'scatter' }))}
            >
              <ScatterPlotIcon />
            </Button>
          </Tooltip>
        </ButtonGroup>
      </Box>

      {chartType === 'scatter' && (
        <Box sx={{ height: '60%', minHeight: 400 }}>
          <InstanceClassification
            plotData={tab?.workflowTasks.modelAnalysis?.modelInstances ?? null}
            point={point}
            setPoint={setPoint}
            showMisclassifiedOnly={showMisclassifiedOnly}
            hashRow={hashRow}
          />
        </Box>
      )}

      {chartType === 'datatable' && (
        <Box sx={{ height: '60%', minHeight: 400 }}>
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
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {tab?.workflowTasks.modelAnalysis?.modelInstances?.loading ? (
                <Loader/>
              ) : hasContent ? (
                <Box
                  sx={{
                    flexGrow: 1,
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden', // Important to contain the scrolling
                    display: 'flex',
                  }}
                  ref={tableRef}
                >
                  <StyledDataGrid
                    disableVirtualization={showMisclassifiedOnly}
                    rows={(showMisclassifiedOnly
                      ? rows.filter((row) => row.actual !== row.predicted)
                      : rows
                    ).map((row) => ({ id: hashRow(row), ...row }))}
                    columns={columns}
                    pagination
                    pageSizeOptions={[25, 50, 100]}
                    initialState={{
                      pagination: {
                        paginationModel: {
                          pageSize: showMisclassifiedOnly ? 25 : 100,
                          page: 0,
                        },
                      },
                    }}
                    slots={{ noRowsOverlay: CustomNoRowsOverlay }}
                    rowSelectionModel={point ? [point.id] : []}
                    checkboxSelection={false}
                    disableRowSelectionOnClick={false}
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
                      // Style for selected row
                      '& .MuiDataGrid-row.Mui-selected': {
                        backgroundColor: 'rgba(25, 118, 210, 0.15)',
                        '&:hover': {
                          backgroundColor: 'rgba(25, 118, 210, 0.25)',
                        },
                      },
                      '& .MuiDataGrid-selectedRowCount': {
                        visibility: 'hidden',
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
        <Box sx={{ pt: 2, height: '30%', minHeight: 300 }}>
          <CounterfactualsTable
            key={'counterfactuals-table'}
            point={point.data}
            counterfactuals={workflow || null}
            onClose={() => setPoint(null)}
            experimentId={experimentId || 'I2Cat_phising'}
            workflowId={tab?.workflowId || '1'}
          />
        </Box>
      ) : null}
    </>
  );
};

export default InstanceView;
