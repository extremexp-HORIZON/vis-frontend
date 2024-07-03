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
import LaunchIcon from '@mui/icons-material/Launch';
import { Close } from '@mui/icons-material';
import ToolBarWorkflow from './toolbar-workflow-table';


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

  const isStartRow = (id: number): string => {
    if (id === 1) {
      return "#e0e0e0";
    }
    return "black";
  }
  const isEndRow = (id: number): string => {
    if (id === rows.length) {
      return "#e0e0e0";
    }
    return "black";
  }
  function handleIndexChange(indexChange: number, id: number) {
    const rowIndex = rows.findIndex((row) => row.id === id);
    console.log(rowIndex, indexChange)
    const newIndex = rowIndex + indexChange;
    console.log(newIndex, 'newIndex')
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
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <ToolBarWorkflow actionButtonName='Cancel selected workflows' numSelected={selected.length} tableName={"Scheduled Workflows"} />
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow
                sx={{
                  "& th": {
                    backgroundColor: "#F2F2FA"
                  }
                }} >
                <TableCell align="right" colSpan={1} />
                <TableCell align="right" colSpan={1} />
                <TableCell style={{ borderBottom: "2px solid #bdbdbd" }} align="center" colSpan={2}>
                  Task Variant
                </TableCell>
                <TableCell style={{ borderBottom: "2px solid #bdbdbd" }} align="center" colSpan={2}>
                  Parameters
                </TableCell>
                <TableCell align="right" colSpan={1} />
                <TableCell align="left" colSpan={1}>

                </TableCell>
                <TableCell align="right" colSpan={1} />
              </TableRow >
              <TableRow
                sx={{
                  "& th": {
                    backgroundColor: "#F2F2FA"
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
                    style={{ top: 57, minWidth: headCell.minWidth }}
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

                        let currentScheduledPosition = row.id;

                        switch (column.id) {
                          case 'action':
                            currentScheduledPosition = row.id;

                            return (
                              <TableCell key={column.id} align={column.align}>
                                <span>
                                  <ArrowUp
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => handleIndexChange(-1, row.id)}
                                    style={{ color: isStartRow(currentScheduledPosition) }} />

                                  <ArrowDown
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => handleIndexChange(1, row.id)}
                                    style={{ color: isEndRow(currentScheduledPosition) }} />
                                </span>
                                <Close
                                  // onClick={handleCloseScheduled(row.id)} // TODO: Create function deleting the workflow (delete from scheduled? Or from whole database?)
                                  sx={{ cursor: 'pointer' }}
                                  style={{ color: 'black' }} />
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