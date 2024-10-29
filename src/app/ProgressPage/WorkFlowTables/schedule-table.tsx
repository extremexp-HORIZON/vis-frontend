import Paper from "@mui/material/Paper"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TablePagination from "@mui/material/TablePagination"
import TableRow from "@mui/material/TableRow"
import Box from "@mui/material/Box"
import Checkbox from "@mui/material/Checkbox"
import ArrowUp from "@mui/icons-material/KeyboardArrowUp"
import ArrowDown from "@mui/icons-material/KeyboardArrowDown"
// import QueryStatsIcon from '@mui/icons-material/QueryStats';
import { Close } from "@mui/icons-material"
import ToolBarWorkflow from "./toolbar-workflow-table"
import FilterBar from "./filter-bar"
import { Popover } from "@mui/material"
import { RootState, useAppDispatch, useAppSelector } from "../../../store/store"
import { useEffect, useMemo, useRef, useState } from "react"
import { setProgressScheduledTable } from "../../../store/slices/progressPageSlice"

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

let columns: Column[] = []

export interface Data {
  [key: string]: string | number | boolean
}

let idCounter = 1

// interface ScheduleTableProps {
//   handleChange: (newValue: number) => (event: React.SyntheticEvent) => void;
// }

export default function ScheduleTable() {
  // const { handleChange } = props;
  const { workflows, progressScheduledTable } = useAppSelector(
    (state: RootState) => state.progressPage,
  )
  const dispatch = useAppDispatch()
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [isFilterOpen, setFilterOpen] = useState(false)
  const paramLength = useRef(0)

  useEffect(() => {
    if (workflows.data.length > 0) {
      //find unique parameters of each workflow -> model traning task
      // const uniqueParameters = new Set(workflows.data.reduce((acc: any[], workflow) => ([...acc, ...Object.keys(workflow.variabilityPoints["Model Training"].Parameters)]), []))
      const uniqueParameters = new Set(
        workflows.data.reduce(
          (acc: any[], workflow) => {
            const params = workflow.tasks.find(task => task.id === "TrainModel")?.parameters
            let paramNames = []
            if (params) {
              paramNames = params.map(param => param.name)
              return [
                ...acc,
                ...paramNames,
              ]
            }else{
              return [
                ...acc
              ]
            }
            },
          [],
        ),
      )
      // const rows = workflows.data
      // .filter(element => element.workflowInfo.status === "scheduled")
      // .map(workflow => ({
      //   id: idCounter++,
      //   workflowId: workflow.workflowId,
      //   "Train Model": workflow.variabilityPoints["Model Training"].Variant,
      //   ...Array.from(uniqueParameters).reduce((acc, variant) => {
      //     acc[variant] = workflow.variabilityPoints["Model Training"].Parameters[variant] || ""
      //     return acc
      //   }, {}),
      //   // status: workflow.workflowInfo.status === "running" ? workflow.workflowInfo.completedTasks ?? "running" : workflow.workflowInfo.status,
      //   // constrains: Object.values(workflow.constraints).every((value: any) => value === true),
      //   action: ""
      // })).sort((a, b) => a.id - b.id)
      const rows = workflows.data
        .filter(workflow => workflow.status === "scheduled")
        .map(workflow => {
          const params = workflow.tasks.find(task => task.id === "TrainModel")?.parameters
          return{
          id: idCounter++,
          workflowId: workflow.name,
          // "Train Model": workflow.variabilityPoints["Model Training"].Variant,
          ...Array.from(uniqueParameters).reduce((acc, variant) => {
            acc[variant] = params?.find(param => param.name === variant)?.value || ""
            return acc
          }, {}),
          status: workflow.status,
          // ...Object.keys(workflow.constraints)
          //   .map(key => ({ [key]: workflow.constraints[key] }))
          //   .reduce((acc, constraint) => ({ ...acc, ...constraint }), {}),
          action: "",
        }}).sort((a, b) => a.id - b.id)
      const infoRow = workflows.data
      .map(workflow => {
        const params = workflow.tasks.find(task => task.id === "TrainModel")?.parameters
        return{
        id: idCounter++,
        workflowId: workflow.name,
        // "Train Model": workflow.variabilityPoints["Model Training"].Variant,
        ...Array.from(uniqueParameters).reduce((acc, variant) => {
          acc[variant] = params?.find(param => param.name === variant)?.value || ""
          return acc
        }, {}),
        status: workflow.status,
        // ...Object.keys(workflow.constraints)
        //   .map(key => ({ [key]: workflow.constraints[key] }))
        //   .reduce((acc, constraint) => ({ ...acc, ...constraint }), {}),
        action: "",
      }})
      columns = infoRow.length > 0 ? Object.keys(infoRow[0]).filter(key => key !== "id").map(key => ({
        id: key,
        label: key,
        minWidth: key === "action" ? 100 : 50,
        numeric: typeof infoRow[0][key] === "number" ? true : false,
        align: "center",
        sortable: key !== "action" ? true : false,
      })) : []
      paramLength.current = uniqueParameters.size
      dispatch(setProgressScheduledTable({ rows, visibleRows: rows }))
    }
  }, [workflows])

  const filterClicked = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterOpen(!isFilterOpen)
    !isFilterOpen ? setAnchorEl(event.currentTarget) : setAnchorEl(null)
  }

  const removeSelected = (list: Number[] | string) => (e: React.SyntheticEvent) => {
    let filteredWorkflows;
    if(typeof list !== "string"){
      filteredWorkflows = progressScheduledTable.rows.filter(
        row => !list.includes(row.id))
    }else{
   filteredWorkflows = progressScheduledTable.rows.filter(
      row => !progressScheduledTable.selectedWorkflows.includes(row.id),
    )
  }
    dispatch(setProgressScheduledTable({ rows: filteredWorkflows, visibleRows: filteredWorkflows, selectedWorkflows: [] }))
  }

  const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
    const selectedIndex = progressScheduledTable.selectedWorkflows.indexOf(id)
    let newSelected: readonly number[] = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(
        progressScheduledTable.selectedWorkflows,
        id,
      )
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(
        progressScheduledTable.selectedWorkflows.slice(1),
      )
    } else if (
      selectedIndex ===
      progressScheduledTable.selectedWorkflows.length - 1
    ) {
      newSelected = newSelected.concat(
        progressScheduledTable.selectedWorkflows.slice(0, -1),
      )
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        progressScheduledTable.selectedWorkflows.slice(0, selectedIndex),
        progressScheduledTable.selectedWorkflows.slice(selectedIndex + 1),
      )
    }
    dispatch(setProgressScheduledTable({ selectedWorkflows: newSelected }))
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    dispatch(setProgressScheduledTable({ page: newPage }))
  }

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    dispatch(
      setProgressScheduledTable({ rowsPerPage: +event.target.value, page: 0 }),
    )
  }

  const handleFilterChange = (
    index: number,
    column: string,
    operator: string,
    value: string,
  ) => {
    const newFilters = [...progressScheduledTable.filters]
    newFilters[index] = { column, operator, value }
    dispatch(setProgressScheduledTable({ filters: newFilters }))
  }

  const handleAddFilter = () => {
    dispatch(setProgressScheduledTable({ filters: [...progressScheduledTable.filters, { column: "", operator: "", value: "" }] }))
  }

  const handleRemoveFilter = (index: number) => {
    const newFilters = progressScheduledTable.filters.filter((_, i) => i !== index)
    dispatch(setProgressScheduledTable({ filters: newFilters }))
  }

  useEffect(() => {
    let counter = 0
    for (let i = 0; i < progressScheduledTable.filters.length; i++) {
      if (progressScheduledTable.filters[i].value !== "") {
        counter++
      }
    }
    // dispatch(setProgressScheduledTable({ filtersCounter: counter }))
    const newRows = progressScheduledTable.rows.filter(row => {
      return progressScheduledTable.filters.every(filter => {
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
    dispatch(
      setProgressScheduledTable({ filtersCounter: counter, filteredRows: newRows }),
    )
  }, [progressScheduledTable.filters])

  const isStartRow = (id: number): boolean => {
    if (id === 1) {
      return true
    }
    return false
  }
  const isEndRow = (id: number): boolean => {
    if (id === progressScheduledTable.rows.length) {
      return true
    }
    return false
  }
  function handleIndexChange(indexChange: number, id: number) {
    const rowIndex = progressScheduledTable.rows.findIndex(row => row.id === id)
    const newIndex = rowIndex + indexChange
    if (newIndex < 0 || newIndex >= progressScheduledTable.rows.length) {
      return null
    } else {
      const updatedRows = [...progressScheduledTable.rows]
      const [movedRow] = updatedRows.splice(rowIndex, 1)
      updatedRows.splice(newIndex, 0, movedRow)

      const newRows = updatedRows.map((row, index) => ({
        ...row,
        id: index + 1,
      }))
      dispatch(setProgressScheduledTable({ rows: newRows, visibleRows: newRows }))
    }
  }

  const isSelected = (id: number) =>
    progressScheduledTable.selectedWorkflows.indexOf(id) !== -1
  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    progressScheduledTable.page > 0
      ? Math.max(
          0,
          (1 + progressScheduledTable.page) *
            progressScheduledTable.rowsPerPage -
            progressScheduledTable.rows.length,
        )
      : 0
  
      useEffect(() => {
        const visibleRows = stableSort(
          progressScheduledTable.filteredRows,
          getComparator(progressScheduledTable.order, progressScheduledTable.orderBy),
        ).slice(
          progressScheduledTable.page * progressScheduledTable.rowsPerPage,
          progressScheduledTable.page * progressScheduledTable.rowsPerPage +
          progressScheduledTable.rowsPerPage,
        )
        dispatch(setProgressScheduledTable({ visibleRows }))
      }, [
        progressScheduledTable.order,
        progressScheduledTable.orderBy,
        progressScheduledTable.page,
        progressScheduledTable.rowsPerPage,
        progressScheduledTable.filteredRows,
      ])

  return (
    <Box>
      <Paper sx={{ width: "100%", mb: 2 }} elevation={2}>
        <ToolBarWorkflow
          filterNumbers={progressScheduledTable.filtersCounter}
          filterClickedFunction={filterClicked}
          actionButtonName="Cancel selected workflows"
          numSelected={progressScheduledTable.selectedWorkflows.length}
          tableName={"Scheduled Workflows"}
          handleClickedFunction={removeSelected}
        />
        <Popover
          id={"Filters"}
          open={isFilterOpen}
          anchorEl={anchorEl}
          onClose={() => setFilterOpen(false)}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <Box sx={{ p: 2 }}>
            <FilterBar
              columns={columns}
              filters={progressScheduledTable.filters}
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
                    backgroundColor: theme => theme.palette.customGrey.main,
                  },
                }}
              >
                <TableCell align="right" colSpan={1} />
                <TableCell align="right" colSpan={1} />
                {/* <TableCell
                  sx={{
                    borderBottom: theme =>
                      `2px solid ${theme.palette.primary.light}`,
                  }}
                  align="center"
                  colSpan={1}
                >
                  Task Variant
                </TableCell> */}
                <TableCell
                  sx={{
                    borderBottom: theme =>
                      `2px solid ${theme.palette.primary.dark}`,
                  }}
                  align="center"
                  colSpan={paramLength.current}
                >
                  Parameters
                </TableCell>
                <TableCell align="right" colSpan={1} />
                <TableCell align="right" colSpan={1} />
              </TableRow>
              <TableRow
                sx={{
                  "& th": {
                    backgroundColor: theme => theme.palette.customGrey.main,
                  },
                }}
              >
                <TableCell
                  padding="checkbox"
                  key={"checkbox-cell"}
                  // align={"center"}
                  style={{ top: 57, minWidth: "50" }}
                ></TableCell>
                {columns.map(headCell => (
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
              {progressScheduledTable.visibleRows
                .slice(
                  progressScheduledTable.page *
                    progressScheduledTable.rowsPerPage,
                  progressScheduledTable.page *
                    progressScheduledTable.rowsPerPage +
                    progressScheduledTable.rowsPerPage,
                )
                .map((row, index) => {
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

                        let currentScheduledPosition = row.id

                        switch (column.id) {
                          case "action":
                            currentScheduledPosition = row.id

                            return (
                              <TableCell key={column.id} align={column.align}>
                                <span>
                                  <ArrowUp
                                    onClick={() =>
                                      handleIndexChange(-1, row.id)
                                    }
                                    sx={{
                                      cursor: "pointer",
                                      color: theme =>
                                        isStartRow(currentScheduledPosition)
                                          ? theme.palette.text.disabled
                                          : theme.palette.primary.main,
                                    }}
                                  />

                                  <ArrowDown
                                    onClick={() => handleIndexChange(1, row.id)}
                                    sx={{
                                      cursor: "pointer",
                                      color: theme =>
                                        isEndRow(currentScheduledPosition)
                                          ? theme.palette.text.disabled
                                          : theme.palette.primary.main,
                                    }}
                                  />
                                </span>
                                <Close
                                  onClick={removeSelected([row.id])} // TODO: Create function deleting the workflow (delete from scheduled? Or from whole database?)
                                  sx={{
                                    cursor: "pointer",
                                    color: theme => theme.palette.primary.main,
                                  }}
                                />
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
        {progressScheduledTable.rows.length > 5 && (
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={progressScheduledTable.rows.length}
            rowsPerPage={progressScheduledTable.rowsPerPage}
            page={progressScheduledTable.page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </Paper>
    </Box>
  )
}
