import type {
  GridColumnNode,
  GridRowSelectionModel,
} from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import ToolbarWorkflow from './toolbar-workflow-table';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import LaunchIcon from '@mui/icons-material/Launch';
import { setSelectedTab, setWorkflowsTable, toggleWorkflowSelection, setHoveredWorkflow, setVisibleTable } from '../../../../store/slices/monitorPageSlice';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import type { RootState } from '../../../../store/store';
import { useEffect, useRef, useState } from 'react';
import { Badge,  IconButton, Popover, styled } from '@mui/material';
import FilterBar from '../../../../shared/components/filter-bar';
import ProgressBar from './prgress-bar';
import theme from '../../../../mui-theme';
import { debounce } from 'lodash';
import type { CustomGridColDef } from '../../../../shared/types/table-types';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import WorkflowRating from './workflow-rating';
import InfoMessage from '../../../../shared/components/InfoMessage';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { logger } from '../../../../shared/utils/logger';
import type { WorkflowTableRow } from '../../../../store/slices/monitorPageSlice';

export interface Data {
  [key: string]: string | number | boolean | null | undefined;
}

// WorkflowActions

const WorkflowActions = (props: {
  currentStatus: string
  workflowId: string,
  experimentId: string | undefined,
}) => {
  const { currentStatus, workflowId, experimentId } = props;

  return (
    <span onClick={event => event.stopPropagation()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Link
        to={`/${experimentId}/workflow?workflowId=${workflowId}`}
      >
        <IconButton>
          <Badge color="warning" badgeContent="" variant="dot" invisible={currentStatus !== 'PENDING_INPUT'}>
            <LaunchIcon
              style={{
                cursor: 'pointer',
                color: theme.palette.primary.main,
              }}
            />
          </Badge>
        </IconButton>
      </Link>
      {currentStatus !== 'COMPLETED' && currentStatus !== 'FAILED' && (
        <>
          <IconButton onClick={() => logger.log('Pause clicked')} >
            <PauseIcon
              style={{ cursor: 'pointer', color: theme.palette.primary.main }}
            />
          </IconButton>
          <IconButton onClick={() => logger.log('Stop clicked')}>
            <StopIcon
              style={{ cursor: 'pointer', color: theme.palette.primary.main }}
            />
          </IconButton>
        </>
      )}
    </span>
  );
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
  '& .datagrid-header-fixed': {
    // Action column
    position: 'sticky',
    right: 0,
    zIndex: 9999,
    backgroundColor: theme.palette.customGrey.main,
    borderLeft: '1px solid #ddd',
  },
  '& .MuiDataGrid-cell[data-field="action"]': {
    position: 'sticky',
    right: 0,
    backgroundColor: theme.palette.customGrey.light,
    zIndex: 9999,
    borderLeft: '1px solid #ddd',
  },
  // Add pagination styling
  '& .MuiDataGrid-footerContainer': {
    minHeight: '56px',
    borderTop: '1px solid rgba(224, 224, 224, 1)',
  },

  '& .MuiTablePagination-root': {
    overflow: 'visible',
  },
  '& .MuiDataGrid-columnHeader[data-field="__action_group__"]': {
    position: 'sticky',
    right: 0,
    zIndex: 1000,
    backgroundColor: theme.palette.customGrey.main,
    borderLeft: '1px solid #ddd',
    display: 'flex',
    justifyContent: 'center', // Center the header content
    alignItems: 'center', // Vertically center
  },
}));

const CustomNoRowsOverlay = () => {
  return (
    <InfoMessage
      message="No workflows available."
      type="info"
      icon={<ScheduleIcon sx={{ fontSize: 40, color: 'info.main' }} />}
      fullHeight
    />
  );
};

export default function WorkflowTable() {
  const { workflows } = useAppSelector(
    (state: RootState) => state.progressPage,
  );
  const { workflowsTable, selectedTab } = useAppSelector(
    (state: RootState) => state.monitorPage
  );
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const lastHoveredIdRef = useRef<string | null>(null);
  const { experimentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const dispatch = useAppDispatch();

  const handleSelectionChange = (newSelection: GridRowSelectionModel) => {
    newSelection.forEach(workflowId => {
      dispatch(toggleWorkflowSelection(workflowId));
    });
    dispatch(setWorkflowsTable({ selectedWorkflows: newSelection }));
  };

  const handleLaunchCompletedTab =
    () => (e: React.SyntheticEvent) => {
      dispatch(setSelectedTab(1));
      const searchParams = new URLSearchParams(location.search);

      searchParams.set('tab', '1');
      navigate({
        pathname: location.pathname,
        search: searchParams.toString(),
      }, { replace: true });
    };

  const filterClicked = (event: React.MouseEvent<HTMLElement>) => {
    setFilterOpen(!isFilterOpen);
    !isFilterOpen ? setAnchorEl(event.currentTarget) : setAnchorEl(null);
  };

  const handleFilterChange = (
    index: number,
    column: string,
    operator: string,
    value: string,
  ) => {
    const newFilters = [...workflowsTable.filters];

    newFilters[index] = { column, operator, value };
    dispatch(setWorkflowsTable({ filters: newFilters }));
  };

  const handleAddFilter = () => {
    const newFilters = [
      ...workflowsTable.filters,
      { column: '', operator: '', value: '' },
    ];

    dispatch(setWorkflowsTable({ filters: newFilters }));
  };

  const handleRemoveFilter = (index: number) => {
    const newFilters = workflowsTable.filters.filter(
      (_, i) => i !== index,
    );

    dispatch(setWorkflowsTable({ filters: newFilters }));
  };

  const debouncedDispatch = useRef(
    debounce((workflowId: string | null) => {
      dispatch(setHoveredWorkflow(workflowId));
    }, 20)
  ).current;

  const handleHover = (workflowId: string | null) => {
    if (workflowId !== lastHoveredIdRef.current) {
      lastHoveredIdRef.current = workflowId;
      debouncedDispatch(workflowId);
    }
  };

  const handleAggregation = (
    rows: WorkflowTableRow[],
    groupKeys: string[],
    metricKeys: string[]
  ): {
    aggregatedRows: WorkflowTableRow[],
    grouppedWorkflows: Record<string, string[]>
  } => {
    const grouped = new Map<string, WorkflowTableRow[]>();
    const grouppedWorkflows: Record<string, string[]> = {};

    rows.forEach(row => {
      const key = groupKeys.map(k => row[k]).join('|');

      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)?.push(row);
    });

    let idCounter = 0;
    const aggregatedRows: WorkflowTableRow[] = [];

    for (const [, group] of grouped.entries()) {
      const values = group[0];
      const workflowIds = group.map(row => row.workflowId);
      const groupId = (idCounter++).toString();
      const summary: WorkflowTableRow = {
        id: groupId,
        isGroupSummary: true,
        workflowId: group.length > 1 ? `${group.length} workflows` : `${group.length} workflow`,
      };

      grouppedWorkflows[groupId] = workflowIds;

      groupKeys.forEach(param => {
        summary[param] = values[param];
      });

      metricKeys.filter(metric => metric !== 'rating').forEach(metric => {
        const validValues = group.map(row => row[metric]).filter((v): v is number => typeof v === 'number');

        if (validValues.length > 0) {
          const avg = validValues.reduce((sum, val) => sum + val, 0) / validValues.length;

          summary[metric] = Number(avg.toFixed(3));
        } else {
          summary[metric] = 'n/a';
        }
      });
      aggregatedRows.push(summary);
    }

    return { aggregatedRows, grouppedWorkflows };
  };

  useEffect(() => {
    if(workflowsTable.initialized) {
      let counter = 0;

      for (let i = 0; i < workflowsTable.filters.length; i++) {
        if (workflowsTable.filters[i].value !== '') {
          counter++;
        }
      }

      let filteredRows = workflowsTable.rows;

      // Apply column filters
      filteredRows = filteredRows.filter(row => {
        return workflowsTable.filters.every(filter => {
          if (filter.value === '') return true;
          const cellValue = row[filter.column as keyof Data]
            ?.toString()
            .toLowerCase();
          const filterValue = filter.value.toLowerCase();

          if (!cellValue) return false;

          switch (filter.operator) {
            case 'contains':
              return cellValue.includes(filterValue);
            case '=':
              return !Number.isNaN(Number(cellValue)) ? Number(cellValue) === Number(filterValue) : cellValue === filterValue;
            case 'startsWith':
              return cellValue.startsWith(filterValue);
            case 'endsWith':
              return cellValue.endsWith(filterValue);
            case '>':
              return !Number.isNaN(Number(cellValue)) ? Number(cellValue) > Number(filterValue) : true;
            case '<':
              return !Number.isNaN(Number(cellValue)) ? Number(cellValue) < Number(filterValue) : true;
            case '>=':
              return !Number.isNaN(Number(cellValue)) ? Number(cellValue) >= Number(filterValue) : true;
            case '<=':
              return !Number.isNaN(Number(cellValue)) ? Number(cellValue) <= Number(filterValue) : true;
            default:
              return true;
          }
        });
      });

      dispatch(setWorkflowsTable({ filteredRows, filtersCounter: counter }));
    }
  }, [workflowsTable.filters, workflowsTable.rows, workflowsTable.rows]);

  useEffect(() => {
    if(workflowsTable.initialized) {
      if (workflowsTable.groupBy.length > 0 && workflowsTable.filteredRows.length > 0) {
        const { aggregatedRows, grouppedWorkflows } = handleAggregation(
          workflowsTable.filteredRows,
          workflowsTable.groupBy,
          workflowsTable.uniqueMetrics
        );

        const allowedFields = new Set([
          'workflowId',
          ...workflowsTable.groupBy,
          ...workflowsTable.uniqueMetrics,
        ]);

        const reducedColumns = workflowsTable.columns
          .filter(col => allowedFields.has(col.field))
          .map(col => {
            const isMetric = workflowsTable.uniqueMetrics.includes(col.field);
            const isGroupBy = workflowsTable.groupBy.includes(col.field);

            // Rename column header if it's a metric and aggregation is applied
            if (isMetric && !isGroupBy) {
              return {
                ...col,
                headerName: `AVG ${col.headerName || col.field}`,
              };
            }

            return col;
          });

        const newVisibleIds = new Set(aggregatedRows.map(r => r.id));
        const preservedSelections = workflowsTable.selectedWorkflows.filter(id => newVisibleIds.has(id));

        dispatch(setWorkflowsTable({
          visibleRows: aggregatedRows,
          aggregatedRows: aggregatedRows,
          visibleColumns: reducedColumns,
          selectedWorkflows: preservedSelections,
          grouppedWorkflows
        }));
      } else {
        dispatch(setWorkflowsTable({
          visibleRows: workflowsTable.filteredRows,
          aggregatedRows: [],
          visibleColumns: workflowsTable.columns,
        }));
      }
    }
  }, [workflowsTable.groupBy, workflowsTable.filteredRows, workflowsTable.uniqueMetrics]);

  useEffect(() => {
    if (workflows.data.length > 0) {
      // find unique parameters of each workflow -> model traning task
      const uniqueParameters = new Set(
        workflows.data.filter(workflow => workflow.status !== 'SCHEDULED')
          .reduce((acc: string[], workflow) => {
            const params = workflow.params;
            let paramNames: string[] = [];

            if (params) {
              paramNames = params.map(param => param.name);

              return [...acc, ...paramNames];
            } else {
              return [...acc];
            }
          }, []),
      );
      const uniqueMetrics = new Set(
        workflows.data.filter(workflow => workflow.status !== 'SCHEDULED')
          .reduce((acc: string[], workflow) => {
            const metrics = workflow.metrics;
            let metricNames: string[] = [];

            if(metrics) {
              metricNames = metrics.map(metric => metric.name).filter(name => name !== 'rating');;

              return [...acc, ...metricNames];
            } else {
              return [...acc];
            }
          }, [])
      );

      const uniqueTasks = Object.entries(workflows.data.filter(workflow => workflow.status !== 'SCHEDULED').flatMap(workflow => workflow.tasks || [])
        .reduce((acc: Record<string, Set<string>>, task) => {
          if (task && task.name) {
            if (!acc[task.name]) {
              acc[task.name] = new Set<string>();
            }
            if (task.variant) {
              acc[task.name].add(task.variant);
            }
          }

          return acc;
        }, {})).filter(([_, variants]) => variants.size > 1)
        .map(([name]) => name);

      // Create rows for the table based on the unique parameters we found
      const rows = workflows.data
        .filter(workflow => workflow.status !== 'SCHEDULED')
        .map(workflow => {
          const params = workflow.params;
          const metrics = workflow?.metrics;
          const tasks = workflow?.tasks;

          return {
            id: workflow.id,
            workflowId: workflow.id,
            ...Array.from(uniqueTasks).reduce((acc, variant) => {
              acc[variant] =
                tasks?.find(task => task.name === variant)?.variant || 'n/a';

              return acc;
            }, {} as Record<string, string>),
            ...Array.from(uniqueParameters).reduce((acc, variant) => {
              const rawValue = params?.find(param => param.name === variant)?.value;
              const parsedValue =
                rawValue != null && !isNaN(Number(rawValue)) && rawValue !== ''
                  ? Number(rawValue)
                  : rawValue ?? 'n/a';

              acc[variant] = parsedValue;

              return acc;
            }, {} as Record<string, string | number>),
            ...Array.from(uniqueMetrics).reduce((acc, variant) => {
              if (metrics && metrics.length > 0) {
                const matchingMetrics = metrics.filter(metric => metric.name === variant);

                // Pick the one with highest step or fallback to latest timestamp
                const latestMetric = matchingMetrics.reduce((latest, current) => {
                  if (current.step != null && latest.step != null) {
                    return current.step > latest.step ? current : latest;
                  } else {
                    return current.timestamp > latest.timestamp ? current : latest;
                  }
                }, matchingMetrics[0]);

                acc[variant] = latestMetric?.value != null ? latestMetric.value : 'n/a';
              } else {
                acc[variant] = 'n/a';
              }

              return acc;
            }, {} as Record<string, number | string>),
            rating: (() => {
              if (metrics && metrics.length > 0) {
                const ratingMetric = metrics.find(metric => metric.name === 'rating');

                return ratingMetric?.value ?? 0;
              }

              return 0;
            })(),
            status: workflow.status,
            action: '',
          };
        });

      // Check if there are no rows completed then set the table to scheduled
      if (rows.length === 0) {
        dispatch(setVisibleTable('scheduled'));

        return;
      }

      const columns: CustomGridColDef[] = Object.keys(rows[0])
        .filter(key => key !== 'id')
        .map(key => ({
          field: key,
          headerName: key === 'action' ? '' : key.replace('_', ' '),
          headerClassName:
            key === 'action' ? 'datagrid-header-fixed' : 'datagrid-header',
          minWidth: key === 'action' ? 120 : key === 'status' ? key.length * 10 + 40 : key.length * 10,
          flex: 1,
          align: 'center',
          headerAlign: 'center',
          sortable: key !== 'action',
          type: (rows.length > 0 && typeof (rows[0] as Record<string, string | number | boolean | undefined>)[key] === 'number') ? 'number' : 'string',
          ...(key === 'status' && {
            renderCell: params => (
              <ProgressBar
                workflowStatus={params.value}
                workflowId={params.row.workflowId}
              />
            ),
          }),
          ...(key === 'action' && {
            renderCell: params => {
              const currentStatus = params.row.status;

              return (
                <WorkflowActions
                  currentStatus={currentStatus}
                  workflowId={params.row.workflowId}
                  experimentId={experimentId}
                />
              );
            },
          }),
          ...(key === 'rating' && {
            renderCell: params => {
              const currentRating = params.row.rating;

              return (
                <WorkflowRating
                  currentRating={currentRating} experimentId={experimentId || ''} workflowId={params.row.id} />
              );
            },
          }),
        }));

      const visibilityModel = columns.reduce((acc, col) => {
        acc[col.field] = true;

        return acc;
      }, {} as Record<string, boolean>);

      dispatch(
        setWorkflowsTable({
          rows,
          filteredRows: rows,
          visibleRows: rows.slice(0, workflowsTable.rowsPerPage),
          columns: columns,
          visibleColumns: columns,
          columnsVisibilityModel: visibilityModel,
          uniqueMetrics: Array.from(uniqueMetrics),
          uniqueParameters: Array.from(uniqueParameters),
          uniqueTasks: Array.from(uniqueTasks),
          initialized: true
        }),
      );
    }
  }, [workflows.data]);

  const hasVisibleParameterColumns = workflowsTable.visibleColumns.some(
    (col) =>
      workflowsTable.uniqueParameters.includes(col.field) &&
    workflowsTable.columnsVisibilityModel[col.field] !== false
  );

  return (
    <Box sx={{ height: '100%' }}>
      <Paper elevation={2} sx={{ height: '100%', width: '100%', mb: 2 }}>
        <Box >
          <ToolbarWorkflow
            key="workflows-toolbar"
            actionButtonName="Compare selected workflows"
            tableName="Workflow Execution"
            numSelected={workflowsTable.selectedWorkflows.length}
            filterNumbers={workflowsTable.filtersCounter}
            filterClickedFunction={filterClicked}
            handleClickedFunction={handleLaunchCompletedTab}
            groupByOptions={Array.from(new Set([...workflowsTable.uniqueTasks, ...workflowsTable.uniqueParameters]))}
            showFilterButton={true}
          />
        </Box>
        <Popover
          id={'Filters'}
          open={isFilterOpen}
          anchorEl={anchorEl}
          onClose={() => setFilterOpen(false)}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              width: '550px',
              p: 2,
              borderRadius: 1,
              boxShadow: 3
            }
          }}
        >
          <FilterBar
            columns={workflowsTable.columns}
            filters={workflowsTable.filters}
            onFilterChange={handleFilterChange}
            onAddFilter={handleAddFilter}
            onRemoveFilter={handleRemoveFilter}
          />
        </Popover>

        <div style={{ height: 'calc(100% - 63px)', width: '100%' }}>
          <StyledDataGrid
            disableVirtualization
            density="compact"
            rows={workflowsTable.visibleRows}
            columns={workflowsTable.visibleColumns as CustomGridColDef[]}
            columnVisibilityModel={workflowsTable.columnsVisibilityModel}
            disableColumnFilter
            onColumnVisibilityModelChange={(model) =>
              dispatch(setWorkflowsTable({ columnsVisibilityModel: model }))
            }
            slots={{ noRowsOverlay: CustomNoRowsOverlay }}
            slotProps={
              {
                row: {
                  onMouseEnter: (event) => {
                    if(selectedTab === 1) {
                      const rowId = event.currentTarget.getAttribute('data-id');
                      const id = rowId ? workflowsTable.selectedWorkflows.includes(rowId) ? rowId : 'notSelected' : null;

                      handleHover(id);
                    }
                  },
                  onMouseLeave: () => {
                    if(selectedTab === 1)
                      handleHover(null);
                  }
                }
              }

            }
            checkboxSelection
            onRowSelectionModelChange={handleSelectionChange}
            rowSelectionModel={workflowsTable.selectedWorkflows}
            sx={{
              '& .MuiDataGrid-selectedRowCount': {
                visibility: 'hidden', // Remove the selection count text on the bottom because we implement it in the header
              },
              '& .theme-parameters-group': {
                textAlign: 'center',
                justifyContent: 'center',
                position: 'relative',
                display: 'grid',
                width: '100%',
                '&::after': {
                  content: '""',
                  display: 'block',
                  width: '100%',
                  height: '2px',
                  backgroundColor: theme.palette.primary.main,
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                },
              },
              '& .theme-parameters-group-2': {
                textAlign: 'center',
                justifyContent: 'center',
                position: 'relative',
                display: 'grid',
                width: '100%',
                '&::after': {
                  content: '""',
                  display: 'block',
                  width: '100%',
                  height: '2px',
                  backgroundColor: theme.palette.secondary.dark,
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                },
              }
            }}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 50 },
              },
            }}
            columnGroupingModel={[
              {
                groupId: 'Parameters',
                headerClassName: 'theme-parameters-group',
                children: workflowsTable.uniqueParameters.length > 0
                  ? (workflowsTable.uniqueParameters.map(
                    (param): GridColumnNode => ({
                      field: param,
                    }),
                  ) as GridColumnNode[])
                  : [],
              },
              {
                groupId: 'Metrics',
                headerClassName: 'theme-parameters-group-2',
                children: workflowsTable.uniqueMetrics.length > 0 ? (
                  workflowsTable.uniqueMetrics.map(
                    (metric): GridColumnNode => ({
                      field: metric,
                    }),
                  ) as GridColumnNode[]
                ) : []
              },
              {
                groupId: 'Task Variants',
                headerClassName: hasVisibleParameterColumns ? 'theme-parameters-group-2' : 'theme-parameters-group',
                children: workflowsTable.uniqueTasks.length > 0 ? (
                  workflowsTable.uniqueTasks.map(
                    (task): GridColumnNode => ({
                      field: task,
                    }),
                  ) as GridColumnNode[]
                ) : []
              },
              {
                groupId: 'Actions',
                headerClassName: 'datagrid-header-fixed',
                headerAlign: 'center',
                children: [
                  {
                    field: 'action',
                  } as GridColumnNode
                ]
              }
            ]}
          />
        </div>
      </Paper>
    </Box>
  );
}
