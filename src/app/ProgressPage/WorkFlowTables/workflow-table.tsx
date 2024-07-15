import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import workflows from '../../../shared/data/workflows.json';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ProgressPercentage from './progress-percentage';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
// import FilterListIcon from '@mui/icons-material/FilterList';
import LaunchIcon from '@mui/icons-material/Launch';
import EnhancedTableHead from './enhanced-table-head';
import ToolbarWorkflow from './toolbar-workflow-table';
import { Popover, useTheme } from '@mui/material';
import type { RootState } from '../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { addTab } from '../../../store/slices/workflowTabsSlice';
import FilterBar from './filter-bar';


const fractionStrToDecimal = (str: string): string => {
  const [numerator, denominator] = str.split('/').map(Number);
  if (isNaN(numerator) || isNaN(denominator) || denominator === 0) {
    return str;
  }
  return (numerator / denominator).toString();
};
function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

export type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]: number | string | boolean },
  b: { [key in Key]: number | string | boolean },
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

export interface Column {
  id: keyof Data;
  label: string;
  minWidth?: number;
  align?: "right" | "left" | "center" | "inherit" | "justify" | undefined;
  numeric?: boolean;
  sortable?: boolean;
  // format?: (value: number) => string;
}

const columns: Column[] = [
  {
    id: 'workflowId',
    numeric: true,
    label: 'Workflow ID',
    // align: 'center',
    minWidth: 50,
    sortable: true,
  },
  {
    id: 'train_model',
    label: 'Train Model',
    minWidth: 50,
    numeric: false,
    align: 'center',
    sortable: true,
  },
  {
    id: 'split_proportion',
    label: 'split_proportion',
    minWidth: 50,
    numeric: true,
    align: 'center',
    sortable: true,

  },
  {
    id: 'max_depth',
    label: 'max_depth',
    minWidth: 50,
    // align: 'right',
    numeric: true,
    align: 'center',
    sortable: true,
    // format: (value: number) => value.toLocaleString('en-US'),
  },
  {
    id: 'batch_size',
    label: 'batch_size',
    minWidth: 50,
    // align: 'right',
    align: 'center',
    numeric: true,
    sortable: true,
    // format: (value: number) => value.toLocaleString('en-US'),
  },
  {
    id: 'status',
    label: 'Status',
    minWidth: 50,
    // align: 'right',
    align: 'center',
    sortable: true,
    numeric: false,
    // format: (value: number) => value.toFixed(2),
  },
  {
    id: 'runtime',
    label: 'runtime < 3s',
    minWidth: 80,
    // align: 'right',
    align: 'center',
    numeric: false,
    sortable: true,

    // format: (value: number) => value.toFixed(2),
  },
  {
    id: 'action',
    label: 'Action',
    minWidth: 50,
    align: 'center',
    sortable: false,
    // format: (value: number) => value.toFixed(2),
  },
];

export interface Data {
  id: number;
  workflowId: number;
  split_proportion: number;
  train_model: string;
  max_depth: number;
  batch_size: number;
  status: string;
  runtime: boolean;
  action: string;
}

function createData(
  id: number,
  workflowId: number,
  split_proportion: number,
  train_model: string,
  max_depth: number,
  batch_size: number,
  status: string,
  runtime: boolean,
  action: string
): Data {
  return { id, workflowId, split_proportion, train_model, max_depth, batch_size, status, runtime, action };
}

let idCounter = 1;

const rows = workflows.map((workflow) =>
  createData(idCounter++, workflow.workflowId,
    workflow.variabilityPoints.n_estimators,
    workflow.variabilityPoints.scaler,
    workflow.variabilityPoints.max_depth,
    workflow.variabilityPoints.min_child_weight,
    workflow.workflowInfo.status === "running" ? workflow.workflowInfo.completedTasks ?? 'running' : workflow.workflowInfo.status,
    workflow.constraints.runtimeLess1sec, ''));


interface WorkFlowTableProps {
  handleChange: (newValue: number | string) => (event: React.SyntheticEvent) => void;
}


export default function WorkflowTable(props: WorkFlowTableProps) {
  const theme = useTheme();
  const { handleChange } = props;
  const dispatch = useAppDispatch();
  const { tabs } = useAppSelector((state: RootState) => state.workflowTabs);
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof Data>('id');
  const [selected, setSelected] = React.useState<readonly number[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [filters, setFilters] = React.useState([{ column: '', operator: '', value: '' }])
  const [isFilterOpen, setFilterOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [filterCounter, setFilterCounter] = React.useState(0);
  const [filteredRows, setFilteredRows] = React.useState(rows);

  const filterClicked = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterOpen(!isFilterOpen);
    !isFilterOpen ? setAnchorEl(event.currentTarget) : setAnchorEl(null);
  }

  const handleLaunchNewTab = (workflowId: number | string) => (e: React.SyntheticEvent) => {
    if (tabs.find(tab => tab.workflowId === workflowId)) return
    dispatch(addTab(workflowId))
    handleChange(workflowId)
  }

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Data,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleFilterChange = (index: number, column: string, operator: string, value: string) => {
    const newFilters = [...filters];
    newFilters[index] = { column, operator, value };
    setFilters(newFilters);
  };

  const handleAddFilter = () => {
    setFilters([...filters, { column: '', operator: '', value: '' }]);
  };

  const handleRemoveFilter = (index: number) => {
    const newFilters = filters.filter((_, i) => i !== index);
    setFilters(newFilters);
  };

  React.useMemo(() => {
    let counter = 0;
    for (let i = 0; i < filters.length; i++) {
      if (filters[i].value !== '') {
        counter++;
        setFilterCounter(counter);
      }
    }
    setFilteredRows(rows.filter((row) => {
      return filters.every((filter) => {
        if (filter.value === '') return true;
        const cellValue = row[filter.column as keyof Data]?.toString().toLowerCase();
        const filterValue = filter.value.toLowerCase();
        if (!cellValue) return false;

        switch (filter.operator) {
          case 'contains':
            return cellValue.includes(filterValue);
          case 'equals':
            return cellValue === filterValue;
          case 'startsWith':
            return cellValue.startsWith(filterValue);
          case 'endsWith':
            return cellValue.endsWith(filterValue);
          default:
            return true;
        }
      });
    }));
  }, [filters]);

  const isSelected = (id: number) => selected.indexOf(id) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const visibleRows = React.useMemo(
    () =>
      stableSort(filteredRows, getComparator(order, orderBy)).slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
      ),
    [order, orderBy, page, rowsPerPage, filteredRows],
  );

  return (
    <Box>
      <Paper elevation={2}>
        <ToolbarWorkflow actionButtonName='Compare selected workflows' secondActionButtonName='Compare completed workflows' tableName="Workflow Execution"
          numSelected={selected.length}
          filterNumbers={filterCounter} filterClickedFunction={filterClicked}
          handleClickedFunction={handleLaunchNewTab} />
        <Popover
          id={"Filters"}
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
              filters={filters}
              onFilterChange={handleFilterChange}
              onAddFilter={handleAddFilter}
              onRemoveFilter={handleRemoveFilter}
            />
          </Box>
        </Popover>

        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <EnhancedTableHead
              columns={columns}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {visibleRows
                .map((row, index) => {
                  const isItemSelected = isSelected(row.id);
                  const labelId = `enhanced-table-checkbox-${index}`;
                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          onClick={(event) => handleClick(event, row.id)}
                          color="primary"
                          sx={{ cursor: 'pointer' }}
                          checked={isItemSelected}
                          inputProps={{
                            'aria-labelledby': labelId,
                          }}
                        />
                      </TableCell>
                      {columns.map((column) => {
                        let value: string;
                        const currentStatus = row.status;
                        switch (column.id) {
                          case 'runtime':
                            value = String(row[column.id]);
                            return (
                              <TableCell key={column.id} align={column.align}>
                                {value === 'true' ? <CheckIcon style={{ color: 'green' }} />
                                  : <CloseIcon style={{ color: 'red' }} />}
                              </TableCell>
                            );
                          case 'status':
                            value = row[column.id];
                            return (
                              <TableCell key={column.id} align={column.align}>
                                <ProgressPercentage progressNumber={fractionStrToDecimal(value)} />
                              </TableCell>
                            );
                          case 'action':
                            return (
                              <TableCell key={column.id} align={column.align}>
                                <LaunchIcon
                                  onClick={currentStatus !== "completed" ? () => {} : handleLaunchNewTab(row.workflowId)} // TODO: Change to row.id or row.workflowId when tabs are fully implemented
                                  sx={{ cursor: currentStatus !== "completed" ? "default" : 'pointer' }}
                                  style={{ color: currentStatus !== "completed" ? theme.palette.action.disabled : 'black' }} />
                                {(currentStatus !== 'completed' && currentStatus !== 'failed') &&
                                  <span>
                                    <PauseIcon
                                      sx={{ cursor: 'pointer' }}
                                      onClick={() => console.log("clicked")}
                                      style={{ color: 'black' }} />

                                    <StopIcon
                                      sx={{ cursor: 'pointer' }}
                                      onClick={() => console.log("clicked")}
                                      style={{ color: 'black' }} />
                                    {/* </Button> */}
                                  </span>}
                              </TableCell>
                            );

                          default:
                            value = String(row[column.id]);

                            return (
                              <TableCell key={column.id} align={column.align}>
                                {value}
                              </TableCell>
                            );
                        }

                      })}
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 53 * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {filteredRows.length > 5 && <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />}
      </Paper>
    </Box>
  );
}