import { useEffect, useMemo, useState } from "react"
import Paper from "@mui/material/Paper"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TablePagination from "@mui/material/TablePagination"
import TableRow from "@mui/material/TableRow"
import workflows from "../../../shared/data/workflows.json"
import CheckIcon from "@mui/icons-material/Check"
import CloseIcon from "@mui/icons-material/Close"
import ProgressPercentage from "./progress-percentage"
import Box from "@mui/material/Box"
import Checkbox from "@mui/material/Checkbox"
import PauseIcon from "@mui/icons-material/Pause"
import StopIcon from "@mui/icons-material/Stop"
// import FilterListIcon from '@mui/icons-material/FilterList';
import LaunchIcon from "@mui/icons-material/Launch"
import EnhancedTableHead from "./enhanced-table-head"
import ToolbarWorkflow from "./toolbar-workflow-table"
import { Popover, useTheme } from "@mui/material"
import type { RootState } from "../../../store/store"
import { useAppDispatch, useAppSelector } from "../../../store/store"
import { addTab } from "../../../store/slices/workflowTabsSlice"
import FilterBar from "./filter-bar"
import { setProgressWokflowsTable } from "../../../store/slices/progressPageSlice"

const fractionStrToDecimal = (str: string): string => {
  const [numerator, denominator] = str.split("/").map(Number)
  if (isNaN(numerator) || isNaN(denominator) || denominator === 0) {
    return str
  }
  return (numerator / denominator).toString()
}
function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
}

export type Order = "asc" | "desc"

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]: number | string | boolean },
  b: { [key in Key]: number | string | boolean },
) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy)
}

function stableSort<T>(
  array: readonly T[],
  comparator: (a: T, b: T) => number,
) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number])
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0])
    if (order !== 0) {
      return order
    }
    return a[1] - b[1]
  })
  return stabilizedThis.map(el => el[0])
}

export interface Column {
  id: keyof Data
  label: string
  minWidth?: number
  align?: "right" | "left" | "center" | "inherit" | "justify" | undefined
  numeric?: boolean
  sortable?: boolean
  // format?: (value: number) => string;
}

const columns: Column[] = [
  {
    id: "workflowId",
    numeric: true,
    label: "Workflow ID",
    // align: 'center',
    minWidth: 50,
    sortable: true,
  },
  {
    id: "train_model",
    label: "Train Model",
    minWidth: 50,
    numeric: false,
    align: "center",
    sortable: true,
  },
  {
    id: "split_proportion",
    label: "split_proportion",
    minWidth: 50,
    numeric: true,
    align: "center",
    sortable: true,
  },
  {
    id: "max_depth",
    label: "max_depth",
    minWidth: 50,
    // align: 'right',
    numeric: true,
    align: "center",
    sortable: true,
    // format: (value: number) => value.toLocaleString('en-US'),
  },
  {
    id: "batch_size",
    label: "batch_size",
    minWidth: 50,
    // align: 'right',
    align: "center",
    numeric: true,
    sortable: true,
    // format: (value: number) => value.toLocaleString('en-US'),
  },
  {
    id: "status",
    label: "Status",
    minWidth: 50,
    // align: 'right',
    align: "center",
    sortable: true,
    numeric: false,
    // format: (value: number) => value.toFixed(2),
  },
  {
    id: "runtime",
    label: "runtime < 3s",
    minWidth: 80,
    // align: 'right',
    align: "center",
    numeric: false,
    sortable: true,

    // format: (value: number) => value.toFixed(2),
  },
  {
    id: "action",
    label: "Action",
    minWidth: 50,
    align: "center",
    sortable: false,
    // format: (value: number) => value.toFixed(2),
  },
]

export interface Data {
  id: number
  workflowId: number
  split_proportion: number
  train_model: string
  max_depth: number
  batch_size: number
  status: string
  runtime: boolean
  action: string
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
  action: string,
): Data {
  return {
    id,
    workflowId,
    split_proportion,
    train_model,
    max_depth,
    batch_size,
    status,
    runtime,
    action,
  }
}

let idCounter = 1

interface WorkFlowTableProps {
  handleChange: (
    newValue: number | string,
  ) => (event: React.SyntheticEvent) => void
}

export default function WorkflowTable(props: WorkFlowTableProps) {
  const theme = useTheme()
  const { handleChange } = props
  const dispatch = useAppDispatch()
  const { workflows, progressWokflowsTable } = useAppSelector(
    (state: RootState) => state.progressPage,
  )
  const { tabs } = useAppSelector((state: RootState) => state.workflowTabs)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [isFilterOpen, setFilterOpen] = useState(false)

  useEffect(() => {
    if (workflows.data.length > 0) {
      const rows = workflows.data.map(workflow =>
        createData(
          idCounter++,
          workflow.workflowId,
          workflow.variabilityPoints.n_estimators,
          workflow.variabilityPoints.scaler,
          workflow.variabilityPoints.max_depth,
          workflow.variabilityPoints.min_child_weight,
          workflow.workflowInfo.status === "running"
            ? workflow.workflowInfo.completedTasks ?? "running"
            : workflow.workflowInfo.status,
          workflow.constraints.runtimeLess1sec,
          "",
        ),
      )
      dispatch(setProgressWokflowsTable({ rows, filteredRows: rows }))
    }
  }, [workflows])

  const filterClicked = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterOpen(!isFilterOpen)
    !isFilterOpen ? setAnchorEl(event.currentTarget) : setAnchorEl(null)
  }

  const handleLaunchNewTab = (workflowId: any) => (e: React.SyntheticEvent) => {
    if (tabs.find(tab => tab.workflowId === workflowId)) return
    dispatch(addTab(workflowId))
    handleChange(workflowId)
  }

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Data,
  ) => {
    const isAsc =
      progressWokflowsTable.orderBy === property &&
      progressWokflowsTable.order === "asc"
    dispatch(
      setProgressWokflowsTable({
        order: isAsc ? "desc" : "asc",
        orderBy: property,
      }),
    )
  }

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = progressWokflowsTable.rows.map(n => n.id)
      dispatch(setProgressWokflowsTable({ selectedWorkflows: newSelected }))
      return
    }
    dispatch(setProgressWokflowsTable({ selectedWorkflows: [] }))
  }

  const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
    const selectedIndex = progressWokflowsTable.selectedWorkflows.indexOf(id)
    let newSelected: readonly number[] = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(
        progressWokflowsTable.selectedWorkflows,
        id,
      )
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(
        progressWokflowsTable.selectedWorkflows.slice(1),
      )
    } else if (
      selectedIndex ===
      progressWokflowsTable.selectedWorkflows.length - 1
    ) {
      newSelected = newSelected.concat(
        progressWokflowsTable.selectedWorkflows.slice(0, -1),
      )
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        progressWokflowsTable.selectedWorkflows.slice(0, selectedIndex),
        progressWokflowsTable.selectedWorkflows.slice(selectedIndex + 1),
      )
    }
    dispatch(setProgressWokflowsTable({ selectedWorkflows: newSelected }))
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    dispatch(setProgressWokflowsTable({ page: newPage }))
  }

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    dispatch(
      setProgressWokflowsTable({ rowsPerPage: +event.target.value, page: 0 }),
    )
  }

  const handleFilterChange = (
    index: number,
    column: string,
    operator: string,
    value: string,
  ) => {
    const newFilters = [...progressWokflowsTable.filters]
    newFilters[index] = { column, operator, value }
    dispatch(setProgressWokflowsTable({ filters: newFilters }))
  }

  const handleAddFilter = () => {
    const newFilters = [
      ...progressWokflowsTable.filters,
      { column: "", operator: "", value: "" },
    ]
    dispatch(setProgressWokflowsTable({ filters: newFilters }))
  }

  const handleRemoveFilter = (index: number) => {
    const newFilters = progressWokflowsTable.filters.filter(
      (_, i) => i !== index,
    )
    dispatch(setProgressWokflowsTable({ filters: newFilters }))
  }

  useEffect(() => {
    let counter = 0
    // if(progressWokflowsTable.filters.length > 0) {
    for (let i = 0; i < progressWokflowsTable.filters.length; i++) {
      if (progressWokflowsTable.filters[i].value !== "") {
        counter++
      }
    }
    dispatch(setProgressWokflowsTable({ filtersCounter: counter }))
    const filteredRows = progressWokflowsTable.rows.filter(row => {
      return progressWokflowsTable.filters.every(filter => {
        if (filter.value === "") return true
        const cellValue = row[filter.column as keyof Data]
          ?.toString()
          .toLowerCase()
        const filterValue = filter.value.toLowerCase()
        if (!cellValue) return false

        switch (filter.operator) {
          case "contains":
            return cellValue.includes(filterValue)
          case "equals":
            return cellValue === filterValue
          case "startsWith":
            return cellValue.startsWith(filterValue)
          case "endsWith":
            return cellValue.endsWith(filterValue)
          default:
            return true
        }
      })
    })
    dispatch(setProgressWokflowsTable({ filteredRows }))
    // }
  }, [progressWokflowsTable.filters])

  const isSelected = (id: number) =>
    progressWokflowsTable.selectedWorkflows.indexOf(id) !== -1

  // Avoid a layout jump when reaching the last page with empty rows.
  // const emptyRows =
  //   progressWokflowsTable.page > 0
  //     ? Math.max(
  //         0,
  //         (1 + progressWokflowsTable.page) * progressWokflowsTable.rowsPerPage -
  //           progressWokflowsTable.rows.length,
  //       )
  //     : 0

  useEffect(() => {
    const visibleRows = stableSort(
      progressWokflowsTable.filteredRows,
      getComparator(progressWokflowsTable.order, progressWokflowsTable.orderBy),
    ).slice(
      progressWokflowsTable.page * progressWokflowsTable.rowsPerPage,
      progressWokflowsTable.page * progressWokflowsTable.rowsPerPage +
        progressWokflowsTable.rowsPerPage,
    )
    dispatch(setProgressWokflowsTable({ visibleRows }))
  }, [
    progressWokflowsTable.order,
    progressWokflowsTable.orderBy,
    progressWokflowsTable.page,
    progressWokflowsTable.rowsPerPage,
    progressWokflowsTable.filteredRows,
  ])

  return (
      <Box>
        <Paper elevation={2}>
          <ToolbarWorkflow
            actionButtonName="Compare selected workflows"
            secondActionButtonName="Compare completed workflows"
            tableName="Workflow Execution"
            numSelected={progressWokflowsTable.selectedWorkflows.length}
            filterNumbers={progressWokflowsTable.filtersCounter}
            filterClickedFunction={filterClicked}
            handleClickedFunction={handleLaunchNewTab}
          />
          <Popover
            id={"Filters"}
            open={isFilterOpen}
            anchorEl={anchorEl}
            onClose={() => setFilterOpen(false)}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <Box sx={{ p: 2 }}>
              <FilterBar
                filters={progressWokflowsTable.filters}
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
                numSelected={progressWokflowsTable.selectedWorkflows.length}
                order={progressWokflowsTable.order}
                orderBy={progressWokflowsTable.orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={progressWokflowsTable.rows.length}
              />
              <TableBody>
                {progressWokflowsTable.visibleRows.map((row: any, index) => {
                  const isItemSelected = isSelected(row.id)
                  const labelId = `enhanced-table-checkbox-${index}`
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
                          onClick={event => handleClick(event, row.id)}
                          sx={{
                            cursor: "pointer",
                            color: theme => theme.palette.primary.main,
                          }}
                          checked={isItemSelected}
                          inputProps={{
                            "aria-labelledby": labelId,
                          }}
                        />
                      </TableCell>
                      {columns.map(column => {
                        let value: string
                        const currentStatus = row.status
                        switch (column.id) {
                          case "runtime":
                            value = String(row[column.id])
                            return (
                              <TableCell key={column.id} align={column.align}>
                                {value === "true" ? (
                                  <CheckIcon style={{ color: "green" }} />
                                ) : (
                                  <CloseIcon style={{ color: "red" }} />
                                )}
                              </TableCell>
                            )
                          case "status":
                            value = row[column.id]
                            return (
                              <TableCell
                                key={column.id}
                                align={column.align}
                                sx={{
                                  color: theme => theme.palette.customGrey.text,
                                }}
                              >
                                <ProgressPercentage
                                  progressNumber={fractionStrToDecimal(value)}
                                />
                              </TableCell>
                            )
                          case "action":
                            return (
                              <TableCell
                                key={column.id}
                                align={column.align}
                                sx={{
                                  color: theme => theme.palette.customGrey.text,
                                }}
                              >
                                <LaunchIcon
                                  onClick={
                                    currentStatus !== "completed"
                                      ? () => {}
                                      : handleLaunchNewTab(row.workflowId)
                                  } // TODO: Change to row.id or row.workflowId when tabs are fully implemented
                                  sx={{
                                    cursor:
                                      currentStatus !== "completed"
                                        ? "default"
                                        : "pointer",
                                  }}
                                  style={{
                                    color:
                                      currentStatus !== "completed"
                                        ? theme.palette.action.disabled
                                        : theme.palette.primary.main,
                                  }}
                                />
                                {currentStatus !== "completed" &&
                                  currentStatus !== "failed" && (
                                    <span>
                                      <PauseIcon
                                        sx={{ cursor: "pointer" }}
                                        onClick={() => console.log("clicked")}
                                        style={{
                                          color: theme.palette.primary.main,
                                        }}
                                      />

                                      <StopIcon
                                        sx={{ cursor: "pointer" }}
                                        onClick={() => console.log("clicked")}
                                        style={{
                                          color: theme.palette.primary.main,
                                        }}
                                      />
                                      {/* </Button> */}
                                    </span>
                                  )}
                              </TableCell>
                            )

                          default:
                            value = String(row[column.id])

                            return (
                              <TableCell
                                key={column.id}
                                align={column.align}
                                sx={{
                                  color: theme => theme.palette.customGrey.text,
                                }}
                              >
                                {value}
                              </TableCell>
                            )
                        }
                      })}
                    </TableRow>
                  )
                })}
                {/* {emptyRows > 0 && (
                  <TableRow
                    style={{
                      height: 53 * emptyRows,
                    }}
                  >
                    <TableCell colSpan={6} />
                  </TableRow>
                )} */}
              </TableBody>
            </Table>
          </TableContainer>
          {progressWokflowsTable.filteredRows.length > 5 && (
            <TablePagination
              rowsPerPageOptions={[10, 25, 100]}
              component="div"
              count={progressWokflowsTable.filteredRows.length}
              rowsPerPage={progressWokflowsTable.rowsPerPage}
              page={progressWokflowsTable.page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}
        </Paper>
      </Box>
  )
}
