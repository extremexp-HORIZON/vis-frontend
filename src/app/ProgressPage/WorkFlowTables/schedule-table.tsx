import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import workflows from '../../../shared/data/workflows.json';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import ArrowUp from '@mui/icons-material/KeyboardArrowUp';
import ArrowDown from '@mui/icons-material/KeyboardArrowDown';
// import QueryStatsIcon from '@mui/icons-material/QueryStats';
import { Close } from '@mui/icons-material';
import ToolBarWorkflow from './toolbar-workflow-table';
import FilterBar from './filter-bar';
import { Popover } from '@mui/material';
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
    numeric: true,
    align: 'center',
    sortable: true,
    // format: (value: number) => value.toLocaleString('en-US'),
  },
  {
    id: 'batch_size',
    label: 'batch_size',
    minWidth: 50,
    align: 'center',
    numeric: true,
    sortable: true,
    // format: (value: number) => value.toLocaleString('en-US'),
  },
  {
    id: 'status',
    label: '',
    minWidth: 50,
    align: 'center',
    sortable: true,
    numeric: false,
    // format: (value: number) => value.toFixed(2),
  },
  {
    id: 'runtime',
    label: '',
    minWidth: 80,
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
  runtime: string;
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
  runtime: string,
  action: string
): Data {
  return { id, workflowId, split_proportion, train_model, max_depth, batch_size, status, runtime, action };
}

let idCounter = 1;

const firstRows = workflows.filter((element) => element.workflowInfo.status === "scheduled").map((workflow) =>
  createData(workflow.workflowInfo.scheduledPosition ? workflow.workflowInfo.scheduledPosition + 1 : idCounter++,
    workflow.workflowId,
    workflow.variabilityPoints.n_estimators,
    workflow.variabilityPoints.scaler,
    workflow.variabilityPoints.max_depth,
    workflow.variabilityPoints.min_child_weight, '', '', ''))
  .sort((a, b) => a.id - b.id);

// interface ScheduleTableProps {
//   handleChange: (newValue: number) => (event: React.SyntheticEvent) => void;
// }


export default function ScheduleTable() {
  // const { handleChange } = props;
  const [selected, setSelected] = React.useState<readonly number[]>([]);
  const [page, setPage] = React.useState(0);
  const [rows, setRows] = React.useState<Data[]>(firstRows);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [filters, setFilters] = React.useState([{ column: '', operator: '', value: '' }])
  const [isFilterOpen, setFilterOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [filterCounter, setFilterCounter] = React.useState(0);

  const filterClicked = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterOpen(!isFilterOpen);
    !isFilterOpen ? setAnchorEl(event.currentTarget) : setAnchorEl(null);
  }

  const removeSelected = (list: Number[]) => {
    // Removed scheduled selected values

  }

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
    setRows(firstRows.filter((row) => {
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

  const isStartRow = (id: number): boolean => {
    if (id === 1) {
      return true;
    }
    return false;
  }
  const isEndRow = (id: number): boolean => {
    if (id === rows.length) {
      return true;
    }
    return false;
  }
  function handleIndexChange(indexChange: number, id: number) {
    const rowIndex = rows.findIndex((row) => row.id === id);
    const newIndex = rowIndex + indexChange;
    if (newIndex < 0 || newIndex >= rows.length) {
      return null;
    } else {
      const updatedRows = [...rows];
      const [movedRow] = updatedRows.splice(rowIndex, 1);
      updatedRows.splice(newIndex, 0, movedRow);

      const newRows = updatedRows.map((row, index) => ({
        ...row,
        id: index + 1,
      }));

      setRows(newRows);
    }
  }

  const isSelected = (id: number) => selected.indexOf(id) !== -1;
  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  return (
    <Box>
      <Paper sx={{ width: '100%', mb: 2 }} elevation={2}>
        <ToolBarWorkflow filterNumbers={filterCounter} filterClickedFunction={filterClicked} actionButtonName='Cancel selected workflows' numSelected={selected.length} tableName={"Scheduled Workflows"} handleClickedFunction={removeSelected} />
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
            <TableHead>
              <TableRow
                sx={{
                  "& th": {
                    backgroundColor: theme => theme.palette.customGrey.main
                  }
                }} >
                <TableCell align="right" colSpan={1} />
                <TableCell align="right" colSpan={1} />
                <TableCell sx={{ borderBottom: theme => `2px solid ${theme.palette.primary.light}` }} align="center" colSpan={1}>
                  Task Variant
                </TableCell>
                <TableCell sx={{ borderBottom: theme => `2px solid ${theme.palette.primary.dark}` }} align="center" colSpan={3}>
                  Parameters
                </TableCell>
                <TableCell align="right" colSpan={1} />
                <TableCell align="left" colSpan={1} />

                <TableCell align="right" colSpan={1} />
              </TableRow >
              <TableRow
                sx={{
                  "& th": {
                    backgroundColor: theme => theme.palette.customGrey.main
                  }
                }}
              >
                <TableCell
                  padding='checkbox'
                  key={"checkbox-cell"}
                  // align={"center"}
                  style={{ top: 57, minWidth: "50" }}
                >
                </TableCell>
                {columns.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    align={headCell.align}
                    sx={{ top: 57, minWidth: headCell.minWidth }}
                  >
                    {headCell.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
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
                          sx={{ cursor: 'pointer', color: theme => theme.palette.primary.main }}
                          checked={isItemSelected}
                          inputProps={{
                            'aria-labelledby': labelId,
                          }}
                        />
                      </TableCell>
                      {columns.map((column) => {
                        let value: string;

                        let currentScheduledPosition = row.id;

                        switch (column.id) {
                          case 'action':
                            currentScheduledPosition = row.id;

                            return (
                              <TableCell key={column.id} align={column.align}>
                                <span>
                                  <ArrowUp
                                    onClick={() => handleIndexChange(-1, row.id)}
                                    sx={{ cursor: 'pointer', color: theme => isStartRow(currentScheduledPosition) ? theme.palette.text.disabled : theme.palette.primary.main }} />

                                  <ArrowDown
                                    onClick={() => handleIndexChange(1, row.id)}
                                    sx={{ cursor: 'pointer', color: theme => isEndRow(currentScheduledPosition) ? theme.palette.text.disabled : theme.palette.primary.main }} />
                                </span>
                                <Close
                                  // onClick={handleCloseScheduled(row.id)} // TODO: Create function deleting the workflow (delete from scheduled? Or from whole database?)
                                  sx={{ cursor: 'pointer', color: theme => theme.palette.primary.main }} />
                              </TableCell>
                            );

                          default:
                            value = String(row[column.id]);

                            return (
                              <TableCell key={column.id} align={column.align} sx={{color: theme => theme.palette.customGrey.text}}>
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
        {rows.length > 5 && <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />}
      </Paper>
    </Box>
  );
}
