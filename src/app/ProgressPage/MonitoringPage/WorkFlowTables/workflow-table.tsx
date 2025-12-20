import type {
  GridAlignment,
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { setSelectedTab, setWorkflowsTable, toggleWorkflowSelection, setHoveredWorkflow, setVisibleTable, setExpandedGroup } from '../../../../store/slices/monitorPageSlice';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import type { RootState } from '../../../../store/store';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Badge,  Button,  FormControl,  IconButton, InputLabel, MenuItem, Popover, Select, styled, TextField, Tooltip } from '@mui/material';
import FilterBar from '../../../../shared/components/filter-bar';
import ProgressBar from './prgress-bar';
import theme from '../../../../mui-theme';
import { debounce } from 'lodash';
import type { CustomGridColDef } from '../../../../shared/types/table-types';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import WorkflowRating from './workflow-rating';
import InfoMessage from '../../../../shared/components/InfoMessage';
import ScheduleIcon from '@mui/icons-material/Schedule';
import type { WorkflowTableRow } from '../../../../store/slices/monitorPageSlice';
import { setWorkflowsData, stateController } from '../../../../store/slices/progressPageSlice';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ControlPointDuplicateIcon from '@mui/icons-material/ControlPointDuplicate';
import type { IRun } from '../../../../shared/models/experiment/run.model';
import { SectionHeader } from '../../../../shared/components/responsive-card-table';
import SearchableSelect from '../../../../shared/components/searchable-select';

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
  const { workflows } = useAppSelector(
    (state: RootState) => state.progressPage,
  );
  const dispatch = useAppDispatch();
  const [anchorElCreateWorkflow, setAnchorElCreateWorkflow] = useState<null | HTMLElement>(null);

  const uniqueParameters = workflows.data.reduce(
    (acc: Record<string, Set<string>>, workflow) => {
      if (workflow.params) {
        workflow.params.forEach(param => {
          if (!acc[param.name]) {
            acc[param.name] = new Set();
          }
          acc[param.name].add(param.value);
        });
      }

      return acc;
    },
    {}
  );

  const [workflowName, setWorkflowName] = useState('');
  const [selectedParams, setSelectedParams] = useState<Record<string, string>>({});

  const currentWorkflow = workflows.data?.find(w => w.id === workflowId);

  useEffect(() => {
    if (anchorElCreateWorkflow && currentWorkflow) {
      const initialParams =
        (currentWorkflow.params ?? []).reduce((acc, p) => {
          acc[p.name] = String(p.value ?? '');

          return acc;
        }, {} as Record<string, string>);

      setSelectedParams(initialParams);

      const baseName = currentWorkflow.name?.trim() || currentWorkflow.id;

      setWorkflowName(baseName ? `${baseName} (copy)` : '');
    }
  }, [anchorElCreateWorkflow]);

  const handleCreateWorkflowOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElCreateWorkflow(event.currentTarget);
  };

  const handleCreateWokrkflowClose = () => setAnchorElCreateWorkflow(null);

  const handleParamChange = (paramName: string) => (value: string) => {
    setSelectedParams((prev) => ({ ...prev, [paramName]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = Object.entries(selectedParams)
      .filter(([, v]) => v !== '' && v !== undefined)
      .map(([name, value]) => ({ name, value }));

    // for now create a new dummy scheduled workflow
    const newRun: IRun = {
      id: workflowName.trim(),
      name: workflowName.trim(),
      experimentId: experimentId || '',
      status: 'SCHEDULED',
      startTime: undefined,
      endTime: undefined,
      params,
      metrics: [],
      dataAssets: [],
      tags: {},
    };
    const updatedWorkflows = workflows.data.concat(newRun);

    dispatch(setWorkflowsData(updatedWorkflows));

    handleCreateWokrkflowClose();
  };

  const handlePausePlay = () => {
    if(currentStatus === 'PAUSED') {
      const updatedWorkflows = workflows.data?.map(workflow =>
        workflow.id === workflowId
          ? { ...workflow, status: 'RUNNING' }
          : workflow
      );

      dispatch(setWorkflowsData(updatedWorkflows));
      dispatch(
        stateController({
          experimentId: null,
          runId: workflowId,
          action: 'resume',
        })
      );
    } else {
      const updatedWorkflows = workflows.data?.map(workflow =>
        workflow.id === workflowId
          ? { ...workflow, status: 'PAUSED' }
          : workflow
      );

      dispatch(setWorkflowsData(updatedWorkflows));
      dispatch(
        stateController({
          experimentId: null,
          runId: workflowId,
          action: 'pause',
        })
      );
    }
  };

  const handleStop = () => {
    const updatedWorkflows = workflows.data?.map(workflow =>
      workflow.id === workflowId
        ? { ...workflow, status: 'KILLED' }
        : workflow
    );

    dispatch(setWorkflowsData(updatedWorkflows));
    dispatch(
      stateController({
        experimentId: null,
        runId: workflowId,
        action: 'kill',
      })
    );
  };

  return (
    <span onClick={event => event.stopPropagation()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Link
        to={`/${experimentId}/workflow?workflowId=${workflowId}`}
      >
        <Tooltip title="Open">
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
        </Tooltip>
      </Link>
      {currentStatus !== 'COMPLETED' && currentStatus !== 'FAILED' && currentStatus !== 'KILLED' && (
        <>
          <IconButton onClick={handlePausePlay} >
            { currentStatus === 'PAUSED' ? (
              <PlayArrowIcon style={{ cursor: 'pointer', color: theme.palette.primary.main }} />
            ) : (
              <PauseIcon
                style={{ cursor: 'pointer', color: theme.palette.primary.main }}
              />
            )
            }
          </IconButton>
          <IconButton onClick={handleStop}>
            <StopIcon
              style={{ cursor: 'pointer', color: theme.palette.primary.main }}
            />
          </IconButton>
        </>
      )}
      { currentStatus === 'COMPLETED' &&
        <Tooltip title="Duplicate">
          <IconButton onClick={handleCreateWorkflowOpen}>
            <ControlPointDuplicateIcon
              style={{ cursor: 'pointer', color: theme.palette.primary.main }}
            />
          </IconButton>
        </Tooltip>
      }
      <Popover
        open={Boolean(anchorElCreateWorkflow)}
        anchorEl={anchorElCreateWorkflow}
        onClose={handleCreateWokrkflowClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{
          elevation: 3,
          sx: {
            width: 300,
            maxHeight: 300,
            overflow: 'hidden',
            padding: 0,
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.16)',
            border: '1px solid rgba(0,0,0,0.04)',
            mt: 1,
            '& .MuiList-root': {
              padding: 0,
            }
          },
        }}
      >
        <SectionHeader icon={<ControlPointDuplicateIcon fontSize="small" />} title="Create New Workflow" />

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            maxHeight: 200
          }}
        >
          <Box
            sx={{
              p: 2,
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >

            <TextField
              fullWidth
              size="small"
              label="workflow name"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
            />

            {Object.entries(uniqueParameters)
              .map(([paramName, valuesSet]) => {
                const values = Array.from(valuesSet).sort((a, b) => a.localeCompare(b));
                const selected = selectedParams[paramName] ?? '';

                return (
                  <FormControl key={paramName} size="small" fullWidth>
                    <SearchableSelect
                      labelId={`${paramName}-label`}
                      inputLabel={paramName}
                      label={paramName}
                      value={selected}
                      options={['None', ...values]}
                      onChange={(value) => handleParamChange(paramName)(value)}
                      menuMaxHeight={224}
                      menuWidth={250}
                    />
                  </FormControl>
                );
              })}
          </Box>
          <Box
            sx={{
              p: 1,
              borderTop: '1px solid rgba(0,0,0,0.08)',
              backgroundColor: 'background.paper',
              bottom: 0,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Button
              type="submit"
              variant="contained"
              disabled={!workflowName.trim()}
            >
                  Create
            </Button>
          </Box>
        </Box>
      </Popover>
    </span>
  );
};

const ACTION_COL_WIDTH = 120;
const STATUS_COL_WIDTH = 120;

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
  '& .datagrid-header-fixed-status': {
    position: 'sticky',
    right: ACTION_COL_WIDTH,
    zIndex: 9999,
    backgroundColor: theme.palette.customGrey.main,
    borderLeft: '1px solid #ddd',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  '&.status-sticky-mode .MuiDataGrid-columnHeader[data-field="status"]': {
    position: 'sticky',
    right: ACTION_COL_WIDTH,
    zIndex: 9998,
    backgroundColor: theme.palette.customGrey.main,
    borderLeft: '1px solid #ddd',
  },
  '&.status-sticky-mode .MuiDataGrid-cell[data-field="status"]': {
    position: 'sticky',
    right: ACTION_COL_WIDTH,
    zIndex: 9998,
    backgroundColor: theme.palette.customGrey.light,
    borderLeft: '1px solid #ddd',
  },

  // pagination
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
    justifyContent: 'center',
    alignItems: 'center',
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

const HIDDEN_INTERNAL_FIELDS = new Set(['space']);

// Download CSV helpers
const csvEscape = (value: unknown) => {
  if (value === null || value === undefined) return '';
  const s = String(value);
  const needsQuotes = /[",\n\r]/.test(s);
  const escaped = s.replace(/"/g, '""');

  return needsQuotes ? `"${escaped}"` : escaped;
};

const downloadTextFile = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const getCsvHeader = (c: { headerName?: string; field: string }) => {
  const headerName = (c.headerName ?? '').trim();

  if (!headerName && c.field === 'status') return 'status';

  return headerName || c.field;
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
  const prevGroupByRef = useRef<string[]>([]);

  const handleSelectionChange = (newSelection: GridRowSelectionModel) => {
    if (newSelection === workflowsTable.selectedWorkflows) return;
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

    const aggregatedRows: WorkflowTableRow[] = [];

    for (const [key, group] of grouped.entries()) {
      const groupId = `group-${key}`;
      const values = group[0];
      const workflowIds = group.map(row => row.workflowId);
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

  const getColumnsWithData = (rows: WorkflowTableRow[]): string[] => {
    if (!rows.length) return [];

    const columnsWithData = new Set<string>();

    Object.keys(rows[0]).forEach(column => {
      if (HIDDEN_INTERNAL_FIELDS.has(column) || column === 'id' || column === 'workflowId' || column === 'status' || column === 'action' || column === 'rating') {
        columnsWithData.add(column);

        return;
      }

      const hasData = rows.some(row => {
        const value = row[column];

        return value !== 'n/a' && value !== null && value !== undefined && value !== '';
      });

      if (hasData) {
        columnsWithData.add(column);
      }
    });

    return Array.from(columnsWithData);
  };

  const applyWorkflowFilters = (
    rows: WorkflowTableRow[],
    filters: typeof workflowsTable.filters,
    selectedSpaces: typeof workflowsTable.selectedSpaces,
  ): { filteredRows: WorkflowTableRow[]; filtersCounter: number } => {
    let counter = 0;

    for (let i = 0; i < filters.length; i++) {
      if (filters[i].value !== '') {
        counter++;
      }
    }

    let filteredRows = rows;

    // spaces filter
    if (Array.isArray(selectedSpaces) && selectedSpaces.length > 0) {
      const selSpaces = new Set(
        selectedSpaces
          .map(s => s?.trim().toLowerCase())
          .filter(Boolean) as string[]
      );

      filteredRows = filteredRows.filter(row => {
        const space = (row.space ?? '').toString().trim()
          .toLowerCase();

        return selSpaces.has(space);
      });
    }

    // column filters
    filteredRows = filteredRows.filter(row => {
      return filters.every(filter => {
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
            return !Number.isNaN(Number(cellValue))
              ? Number(cellValue) === Number(filterValue)
              : cellValue === filterValue;
          case 'startsWith':
            return cellValue.startsWith(filterValue);
          case 'endsWith':
            return cellValue.endsWith(filterValue);
          case '>':
            return !Number.isNaN(Number(cellValue))
              ? Number(cellValue) > Number(filterValue)
              : false;
          case '<':
            return !Number.isNaN(Number(cellValue))
              ? Number(cellValue) < Number(filterValue)
              : false;
          case '>=':
            return !Number.isNaN(Number(cellValue))
              ? Number(cellValue) >= Number(filterValue)
              : false;
          case '<=':
            return !Number.isNaN(Number(cellValue))
              ? Number(cellValue) <= Number(filterValue)
              : false;
          default:
            return true;
        }
      });
    });

    return { filteredRows, filtersCounter: counter };
  };

  useEffect(() => {
    if(workflowsTable.initialized) {
      const { filteredRows, filtersCounter } = applyWorkflowFilters(workflowsTable.rows, workflowsTable.filters, workflowsTable.selectedSpaces);

      dispatch(setWorkflowsTable({ filteredRows, filtersCounter: filtersCounter }));
    }
  }, [workflowsTable.filters, workflowsTable.rows, workflowsTable.selectedSpaces]);

  useEffect(() => {
    if(workflowsTable.initialized) {
      const groupByChanged =
        prevGroupByRef.current.join('|') !== workflowsTable.groupBy.join('|');

      if (groupByChanged) {
        dispatch(setWorkflowsTable({ expandedGroups: [] }));
      }

      prevGroupByRef.current = workflowsTable.groupBy;

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
          'action'
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
                headerName: col.headerName || col.field,
              };
            }

            return col;
          });

        const newVisibleIds = new Set(aggregatedRows.map(r => r.id));
        const preservedSelections = workflowsTable.selectedWorkflows.filter(id => newVisibleIds.has(id));

        const visibleRows: WorkflowTableRow[] = [];

        aggregatedRows.forEach((groupRow) => {
          visibleRows.push(groupRow);
          const groupId = groupRow.id;

          if (workflowsTable.expandedGroups.includes(groupId) &&
            Array.isArray(workflowsTable.grouppedWorkflows[groupId])
          ) {
            const children = workflowsTable.grouppedWorkflows[groupId];
            const childRows = workflowsTable.filteredRows.filter(row => children.includes(row.workflowId));

            visibleRows.push(...childRows);
          }
        });

        dispatch(setWorkflowsTable({
          visibleRows: visibleRows,
          aggregatedRows: aggregatedRows,
          visibleColumns: reducedColumns,
          selectedWorkflows: preservedSelections,
          grouppedWorkflows,
        }));
      } else {
        dispatch(setWorkflowsTable({
          visibleRows: workflowsTable.filteredRows,
          aggregatedRows: [],
          visibleColumns: workflowsTable.columns,
          grouppedWorkflows: {}
        }));
      }
    }
  }, [workflowsTable.groupBy, workflowsTable.filteredRows, workflowsTable.uniqueMetrics, workflowsTable.expandedGroups]);

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
              metricNames = metrics.map(metric => metric.name).filter(name => name !== 'rating');

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
            space: workflow.space,
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

      const isStatusSticky = selectedTab === 0;

      const columns: CustomGridColDef[] = Object.keys(rows[0])
        .filter(key => key !== 'id' && !HIDDEN_INTERNAL_FIELDS.has(key))
        .map(key => {
          const base: CustomGridColDef = {
            field: key,
            headerName: key === 'action' ? '' : key === 'status' && isStatusSticky ? '' : key.replace('_', ' '),
            headerClassName:
        key === 'action'
          ? 'datagrid-header-fixed'
          : 'datagrid-header',

            minWidth:
        key === 'action'
          ? ACTION_COL_WIDTH
          : key === 'status'
            ? STATUS_COL_WIDTH
            : key === 'rating'
              ? 120
              : key.length * 10,

            flex:
        key === 'action' || key === 'status'
          ? 0
          : 1,

            align: 'center',
            headerAlign: 'center',

            sortable: key !== 'action' && !workflowsTable.groupBy.length,

            type:
        typeof (rows[0] as Record<string, any>)[key] === 'number'
          ? 'number'
          : 'string',
          };

          if (key === 'status') {
            return {
              ...base,
              renderCell: params => (
                <ProgressBar
                  workflowStatus={params.value}
                  workflowId={params.row.workflowId}
                />
              ),
            };
          }
          if (key === 'action') {
            return {
              ...base,
              renderCell: params => {
                if (params.row.isGroupSummary) return null;

                const currentStatus = params.row.status;

                return (
                  <WorkflowActions
                    currentStatus={currentStatus}
                    workflowId={params.row.workflowId}
                    experimentId={experimentId}
                  />
                );
              },
            };
          }
          if (key === 'rating') {
            return {
              ...base,
              renderCell: params => (
                <WorkflowRating
                  currentRating={params.row.rating}
                  experimentId={experimentId || ''}
                  workflowId={params.row.id}
                />
              ),
            };
          }
          if (key === 'workflowId') {
            return {
              ...base,
              renderCell: (params) => {
                if (params.row.isGroupSummary) {
                  const groupId = params.row.id;
                  const isExpanded = workflowsTable.expandedGroups.includes(groupId);

                  return (
                    <Box
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(setExpandedGroup(groupId));
                      }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                        cursor: 'pointer',
                      }}
                    >
                      {isExpanded ? (
                        <ExpandMoreIcon fontSize="small" />
                      ) : (
                        <ChevronRightIcon fontSize="small" />
                      )}
                      <span>{params.value}</span>
                    </Box>
                  );
                }

                return <span>{params.value}</span>;
              },
            };
          }

          return base;
        });

      const { filteredRows, filtersCounter } = applyWorkflowFilters(
        rows,
        workflowsTable.filters,
        workflowsTable.selectedSpaces,
      );

      const showActionColumn = !workflowsTable.groupBy.length || workflowsTable.expandedGroups.length > 0;

      const visibilityModel = columns.reduce((acc, col) => {
        if (col.field === 'action') {
          acc[col.field] = showActionColumn;
        } else {
          acc[col.field] = true;
        }

        return acc;
      }, {} as Record<string, boolean>);

      dispatch(
        setWorkflowsTable({
          rows,
          filteredRows: filteredRows,
          visibleRows: filteredRows,
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
  }, [workflows.data, workflowsTable.expandedGroups]);

  useEffect(() => {
    if (workflowsTable.initialized && workflowsTable.visibleRows.length > 0) {
      const columnsWithData = getColumnsWithData(workflowsTable.visibleRows);

      const newVisibilityModel = { ...workflowsTable.columnsVisibilityModel };

      workflowsTable.columns.forEach(column => {
        const shouldBeVisible = columnsWithData.includes(column.field) ||
                               ['workflowId', 'status', 'action', 'rating'].includes(column.field);

        newVisibilityModel[column.field] = shouldBeVisible;
      });

      const hasChanged = workflowsTable.columns.some(column => {
        const currentVisibility = workflowsTable.columnsVisibilityModel[column.field] ?? true;
        const newVisibility = newVisibilityModel[column.field] ?? true;

        return currentVisibility !== newVisibility;
      });

      if (hasChanged) {
        dispatch(setWorkflowsTable({
          columnsVisibilityModel: newVisibilityModel
        }));
      }
    }
  }, [workflowsTable.visibleRows, workflowsTable.initialized]);

  const hasVisibleParameterColumns = workflowsTable.visibleColumns.some(
    (col) =>
      workflowsTable.uniqueParameters.includes(col.field) &&
    workflowsTable.columnsVisibilityModel[col.field] !== false
  );

  const isGroupedWorkflow = (id: string): boolean => {
    return Object.values(workflowsTable.grouppedWorkflows).some(workflowIds =>
      workflowIds.includes(id)
    );
  };

  const valueSuggestions = useMemo(() => {
    const valueSets: Record<string, Set<string>> = {};
    const valueCounts: Record<string, number> = {};

    workflowsTable.rows.forEach((row) => {
      Object.entries(row).forEach(([field, value]) => {
        if (
          HIDDEN_INTERNAL_FIELDS.has(field) ||
          field === 'id' ||
          field === 'workflowId' ||
          field === 'status' ||
          field === 'action' ||
          field === 'rating'
        ) {
          return;
        }

        if (value === null || value === undefined || value === 'n/a') return;

        const str = String(value).trim();

        if (!str) return;

        if (!valueSets[field]) {
          valueSets[field] = new Set<string>();
          valueCounts[field] = 0;
        }

        valueSets[field].add(str);
        valueCounts[field] += 1;
      });
    });

    const result: Record<string, string[]> = {};

    // how else to not show 'continous' numerical data??
    const MAX_DISTINCT_VALUES = 10;

    Object.entries(valueSets).forEach(([field, set]) => {
      const distinctCount = set.size;

      if (distinctCount > 0 && distinctCount <= MAX_DISTINCT_VALUES) {
        result[field] = Array.from(set).sort((a, b) => a.localeCompare(b));
      }
    });

    return result;
  }, [workflowsTable.rows]);

  const showActionColumn =
    workflowsTable.groupBy.length === 0 ||
    workflowsTable.expandedGroups.length > 0;

  const effectiveColumnVisibilityModel = {
    ...workflowsTable.columnsVisibilityModel,
    action: showActionColumn,
  };

  const handleDownloadCsv = () => {
    const rows = workflowsTable.visibleRows ?? [];

    const exportableCols = (workflowsTable.visibleColumns ?? [])
      .filter((c) => c.field !== 'action')
      .filter((c) => c.field !== 'id')
      .filter((c) => workflowsTable.columnsVisibilityModel?.[c.field] !== false);

    const headers = exportableCols.map((c) => csvEscape(getCsvHeader(c))).join(',');

    const dataLines = rows
      .filter((r) => !r.isGroupSummary)
      .map((r) =>
        exportableCols
          .map((c) => csvEscape((r as any)[c.field]))
          .join(',')
      );

    const csv = [headers, ...dataLines].join('\n');

    downloadTextFile(`${experimentId}_workflows.csv`, csv);
  };


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
            showSpaceButton={workflowsTable.rows.some(row => row.space && row.space.trim() !== '')}
            spaceOptions={Array.from(
              new Set(
                workflowsTable.rows
                  .map(row => row?.space?.trim())
                  .filter((space): space is string => Boolean(space && space !== ''))
              )
            )}
            onDownloadCsv={workflowsTable.groupBy.length === 0 ? handleDownloadCsv : undefined}
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
            valueSuggestions={valueSuggestions}
          />
        </Popover>

        <div style={{ height: 'calc(100% - 48px)', width: '100%' }}>
          <StyledDataGrid
            className={selectedTab === 0 ? 'status-sticky-mode' : undefined}
            disableVirtualization
            disableColumnMenu
            density="compact"
            rows={workflowsTable.visibleRows}
            sortModel={workflowsTable.sortModel}
            onSortModelChange={(newSortModel) => dispatch(setWorkflowsTable({ sortModel: newSortModel }))}
            disableColumnFilter
            columns={workflowsTable.visibleColumns as CustomGridColDef[]}
            columnVisibilityModel={effectiveColumnVisibilityModel}
            onColumnVisibilityModelChange={(model) => {
              const nextModel = {
                ...model,
                action: showActionColumn,
              };

              dispatch(setWorkflowsTable({ columnsVisibilityModel: nextModel }));
            }}
            isRowSelectable={(params) => {
              if (workflowsTable.groupBy.length === 0) return true;

              return !isGroupedWorkflow(params.row.id);
            }}
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
            getRowClassName={(params) =>
              selectedTab === 1 && workflowsTable.hoveredWorkflowId && params.id === workflowsTable.hoveredWorkflowId
                ? 'workflow-hovered-row'
                : ''
            }
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
              },
              '& .workflow-hovered-row': {
                outline: `2px solid ${theme.palette.primary.main}`,
                outlineOffset: -2,
              },
            }}
            pageSizeOptions={[10, 25, 50]}
            paginationModel={workflowsTable.paginationModel}
            onPaginationModelChange={(paginationModel) => dispatch(setWorkflowsTable({ paginationModel }))}
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
              ...(selectedTab === 0 ?
                [
                  {
                    groupId: 'Status',
                    headerClassName: 'datagrid-header-fixed-status',
                    headerAlign: 'center' as GridAlignment,
                    children: [
                      { field: 'status' } as GridColumnNode
                    ]
                  }
                ] : []),
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
