import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import ArrowUp from '@mui/icons-material/KeyboardArrowUp';
import ArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { Close } from '@mui/icons-material';
import ToolBarWorkflow from './toolbar-workflow-table';
import FilterBar from '../../../../shared/components/filter-bar';
import { Popover, styled } from '@mui/material';
import type { RootState } from '../../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import { useEffect, useRef, useState } from 'react';
import { setScheduledTable } from '../../../../store/slices/monitorPageSlice';
import type { GridColumnNode } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import theme from '../../../../mui-theme';
import InfoMessage from '../../../../shared/components/InfoMessage';
import ScheduleIcon from '@mui/icons-material/Schedule';
import type { CustomGridColDef } from '../../../../shared/types/table-types';
export interface Data {
  [key: string]: string | number | boolean
}

let idCounter = 1;

const WorkflowActions = (props: {
  id: number,
}) => {
  const { id } = props;
  const dispatch = useAppDispatch();
  const { scheduledTable } = useAppSelector(
    (state: RootState) => state.monitorPage,
  );

  const handleIndexChange = (indexChange: number, id: number) => {
    const rowIndex = scheduledTable.rows.findIndex(row => row.id === id);
    const newIndex = rowIndex + indexChange;

    if (newIndex < 0 || newIndex >= scheduledTable.rows.length) {
      return;
    } else {
      const updatedRows = [...scheduledTable.rows];
      const [movedRow] = updatedRows.splice(rowIndex, 1);

      updatedRows.splice(newIndex, 0, movedRow);

      const newRows = updatedRows.map((row, index) => ({
        ...row,
        id: index + 1,
      }));

      dispatch(
        setScheduledTable({ rows: newRows, visibleRows: newRows }),
      );
    }
  };

  const removeRow =
  (list: Number) => {
    let filteredWorkflows = scheduledTable.rows.filter(
      row => !(row.id === id),
    );

    dispatch(
      setScheduledTable({
        rows: filteredWorkflows,
        visibleRows: filteredWorkflows,
        selectedWorkflows: [],
      }),
    );
  };

  const isStartRow = (id: number): boolean => {
    if (id === 1) {
      return true;
    }

    return false;
  };
  const isEndRow = (id: number): boolean => {
    if (id === scheduledTable.rows.length) {
      return true;
    }

    return false;
  };

  return (
    <span onClick={event => event.stopPropagation()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <ArrowUp
        onClick={() => handleIndexChange(-1, id)}
        sx={{
          cursor: 'pointer',
          color: theme =>
            isStartRow(id)
              ? theme.palette.text.disabled
              : theme.palette.primary.main,
        }}
      />
      <ArrowDown
        onClick={() => handleIndexChange(1, id)}
        sx={{
          cursor: 'pointer',
          color: theme =>
            isEndRow(id)
              ? theme.palette.text.disabled
              : theme.palette.primary.main,
        }}
      />
      <Close
        onClick={() => removeRow(id)} // TODO: Create function deleting the workflow (delete from scheduled? Or from whole database?)
        sx={{
          cursor: 'pointer',
          color: theme => theme.palette.primary.main,
        }}
      />
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
    zIndex: 100,
    backgroundColor: theme.palette.customGrey.main,
    borderLeft: '1px solid #ddd',
  },
  '& .MuiDataGrid-cell[data-field="action"]': {
    position: 'sticky',
    right: 0,
    backgroundColor: theme.palette.customGrey.light,
    zIndex: 90,
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

// Create a custom NoRowsOverlay component using InfoMessage
const CustomNoRowsOverlay = () => {
  return (
    <InfoMessage
      message="No scheduled workflows available."
      type="info"
      icon={<ScheduleIcon sx={{ fontSize: 40, color: 'info.main' }} />}
      fullHeight
    />
  );
};

export default function ScheduleTable() {
  const { workflows } = useAppSelector(
    (state: RootState) => state.progressPage,
  );
  const { scheduledTable } = useAppSelector(
    (state: RootState) => state.monitorPage
  );
  const dispatch = useAppDispatch();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [isFilterOpen, setFilterOpen] = useState(false);
  const paramLength = useRef(0);

  useEffect(() => {
    if (workflows.data.length > 0) {
      const uniqueParameters = new Set(
        workflows.data.filter(workflow => workflow.status === 'SCHEDULED')
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

      const uniqueTasks = Object.entries(workflows.data.filter(workflow => workflow.status === 'SCHEDULED').flatMap(workflow => workflow.tasks || [])
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

      const rows = workflows.data
        .filter(workflow => workflow.status === 'SCHEDULED')
        .map(workflow => {
          const params = workflow.params;
          const tasks = workflow?.tasks;

          return {
            id: idCounter++,
            workflowId: workflow.name,
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
            status: workflow.status.toLowerCase(),
            action: '',
          };
        })
        .sort((a, b) => a.id - b.id);
      const workflow = workflows.data[0];
      const params = workflow.params;
      const tasks = workflow?.tasks;
      const infoRow = {
        id: idCounter++,
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
        status: workflow.status,
        action: '',
      };
      const columns: CustomGridColDef[] =
        infoRow
          ? Object.keys(infoRow)
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
              sortable: false,
              type: (rows.length > 0 && typeof (rows[0] as Record<string, string | number | boolean | undefined>)[key] === 'number') ? 'number' : 'string',
              ...(key === 'action' && {
                renderCell: (params) => {
                  return (
                    <WorkflowActions
                      id={params.row.id}
                    />
                  );
                }
              })
            }))
          : [];

      paramLength.current = uniqueParameters.size;
      const visibilityModel = columns.reduce((acc, col) => {
        acc[col.field] = true;

        return acc;
      }, {} as Record<string, boolean>);

      dispatch(
        setScheduledTable({
          rows,
          filteredRows: rows,
          visibleRows: rows.slice(0, scheduledTable.rowsPerPage),
          columns: columns,
          columnsVisibilityModel: visibilityModel,
          uniqueParameters: Array.from(uniqueParameters),
          uniqueTasks: Array.from(uniqueTasks)
        }),
      );
    }
  }, [workflows.data]);

  const filterClicked = (event: React.MouseEvent<HTMLElement>) => {
    setFilterOpen(!isFilterOpen);
    !isFilterOpen ? setAnchorEl(event.currentTarget as HTMLButtonElement) : setAnchorEl(null);
  };

  const removeSelected =
    (list: Number[] | string) => (e: React.SyntheticEvent) => {
      let filteredWorkflows;

      if (typeof list !== 'string') {
        filteredWorkflows = scheduledTable.rows.filter(
          row => !list.includes(row.id),
        );
      } else {
        filteredWorkflows = scheduledTable.rows.filter(
          row => !scheduledTable.selectedWorkflows.includes(row.id),
        );
      }
      dispatch(
        setScheduledTable({
          rows: filteredWorkflows,
          visibleRows: filteredWorkflows,
          selectedWorkflows: [],
        }),
      );
    };

  const handleFilterChange = (
    index: number,
    column: string,
    operator: string,
    value: string,
  ) => {
    const newFilters = [...scheduledTable.filters];

    newFilters[index] = { column, operator, value };
    dispatch(setScheduledTable({ filters: newFilters }));
  };

  const handleAddFilter = () => {
    dispatch(
      setScheduledTable({
        filters: [
          ...scheduledTable.filters,
          { column: '', operator: '', value: '' },
        ],
      }),
    );
  };

  const handleRemoveFilter = (index: number) => {
    const newFilters = scheduledTable.filters.filter(
      (_, i) => i !== index,
    );

    dispatch(setScheduledTable({ filters: newFilters }));
  };

  useEffect(() => {
    let counter = 0;
    let newRows = scheduledTable.rows;

    if(scheduledTable.filters.length > 0) {
      for (let i = 0; i < scheduledTable.filters.length; i++) {
        if (scheduledTable.filters[i].value !== '') {
          counter++;
        }
      }
      // dispatch(setScheduledTable({ filtersCounter: counter }))
      newRows = scheduledTable.rows.filter(row => {
        return scheduledTable.filters.every(filter => {
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
    }
    dispatch(
      setScheduledTable({
        filtersCounter: counter,
        filteredRows: newRows,
      }),
    );
  }, [scheduledTable.filters]);

  return (
    <Box sx={{ height: '100%' }} >
      <Paper sx={{ height: '100%', width: '100%', mb: 2 }} elevation={2}>
        <Box >
          <ToolBarWorkflow
            key="scheduled-toolbar"
            filterNumbers={scheduledTable.filtersCounter}
            filterClickedFunction={filterClicked}
            actionButtonName="Cancel selected workflows"
            numSelected={scheduledTable.selectedWorkflows.length}
            tableName={'Scheduled Workflows'}
            handleClickedFunction={removeSelected}
            showFilterButton={true}
          />
        </Box>
        <Popover
          id={'Filters'}
          open={isFilterOpen}
          anchorEl={anchorEl}
          onClose={() => setFilterOpen(false)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <Box sx={{ p: 2 }}>
            <FilterBar
              columns={scheduledTable.columns}
              filters={scheduledTable.filters}
              onFilterChange={handleFilterChange}
              onAddFilter={handleAddFilter}
              onRemoveFilter={handleRemoveFilter}
            />
          </Box>
        </Popover>

        <div style={{ height: 'calc(100% - 64px)', width: '100%' }}>
          <StyledDataGrid
            disableVirtualization
            density="compact"
            rows={scheduledTable.visibleRows}
            disableColumnFilter
            columns={scheduledTable.columns as CustomGridColDef[]}
            columnVisibilityModel={scheduledTable.columnsVisibilityModel}
            onColumnVisibilityModelChange={(model) =>
              dispatch(setScheduledTable({ columnsVisibilityModel: model }))
            }
            slots={{
              noRowsOverlay: CustomNoRowsOverlay
            }}
            checkboxSelection
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
                children: scheduledTable.uniqueParameters.length > 0
                  ? (scheduledTable.uniqueParameters.map(
                    (param): GridColumnNode => ({
                      field: param,
                    }),
                  ) as GridColumnNode[])
                  : [],
              },
              {
                groupId: 'Task Variants',
                headerClassName: 'theme-parameters-group-2',
                children: scheduledTable.uniqueTasks.length > 0 ? (
                  scheduledTable.uniqueTasks.map(
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
