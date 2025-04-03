import Paper from "@mui/material/Paper"
import Box from "@mui/material/Box"
import ArrowUp from "@mui/icons-material/KeyboardArrowUp"
import ArrowDown from "@mui/icons-material/KeyboardArrowDown"
import { Close, Visibility } from "@mui/icons-material"
import ToolBarWorkflow from "./toolbar-workflow-table"
import FilterBar from "./filter-bar"
import { Popover, styled } from "@mui/material"
import { RootState, useAppDispatch, useAppSelector } from "../../../store/store"
import { useEffect, useRef, useState } from "react"
import { setProgressScheduledTable } from "../../../store/slices/progressPageSlice"
import type { GridColDef, GridRowSelectionModel, GridColumnNode } from "@mui/x-data-grid"
import { DataGrid } from "@mui/x-data-grid"
import NoRowsOverlayWrapper from "./no-rows-overlay"
import theme from "../../../mui-theme"


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

type CustomGridColDef = GridColDef & {
  field: string
  minWidth?: number
  flex?: number
  align?: "left" | "right" | "center"
  headerAlign?: "left" | "right" | "center"
}
let columns: CustomGridColDef[] = []

export interface Data {
  [key: string]: string | number | boolean
}

let idCounter = 1

// interface ScheduleTableProps {
//   handleChange: (newValue: number) => (event: React.SyntheticEvent) => void;
// }

const WorkflowActions = (props: {
  id: number,
}) => {
  const { id } = props
  const dispatch = useAppDispatch();
  const { progressScheduledTable } = useAppSelector(
    (state: RootState) => state.progressPage,
  )

  const handleIndexChange = (indexChange: number, id: number) => {
    const rowIndex = progressScheduledTable.rows.findIndex(row => row.id === id)
    const newIndex = rowIndex + indexChange
    if (newIndex < 0 || newIndex >= progressScheduledTable.rows.length) {
      return
    } else {
      const updatedRows = [...progressScheduledTable.rows]
      const [movedRow] = updatedRows.splice(rowIndex, 1)
      updatedRows.splice(newIndex, 0, movedRow)

      const newRows = updatedRows.map((row, index) => ({
        ...row,
        id: index + 1,
      }))
      dispatch(
        setProgressScheduledTable({ rows: newRows, visibleRows: newRows }),
      )
    }
  }

  const removeRow =
  (list: Number) => {
    let filteredWorkflows = progressScheduledTable.rows.filter(
        row => !(row.id === id),
      )
    dispatch(
      setProgressScheduledTable({
        rows: filteredWorkflows,
        visibleRows: filteredWorkflows,
        selectedWorkflows: [],
      }),
    )
  }

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

  return (
    <span onClick={event => event.stopPropagation()} style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
      <ArrowUp
        onClick={() => handleIndexChange(-1, id)}
        sx={{
          cursor: "pointer",
          color: theme =>
            isStartRow(id)
              ? theme.palette.text.disabled
              : theme.palette.primary.main,
        }}
      />
      <ArrowDown
        onClick={() => handleIndexChange(1, id)}
        sx={{
          cursor: "pointer",
          color: theme =>
            isEndRow(id)
              ? theme.palette.text.disabled
              : theme.palette.primary.main,
        }}
      />
      <Close
        onClick={() => removeRow(id)} // TODO: Create function deleting the workflow (delete from scheduled? Or from whole database?)
        sx={{
          cursor: "pointer",
          color: theme => theme.palette.primary.main,
        }}
      />
    </span>
  )
}

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  "& .MuiDataGrid-scrollbarFiller": {
    backgroundColor: theme.palette.customGrey.main,
  },
  "& .MuiDataGrid-columnHeader": {
    backgroundColor: theme.palette.customGrey.main,
  },
  '& .MuiDataGrid-columnHeader[data-field="__check__"]': {
    backgroundColor: theme.palette.customGrey.main,
  },
  "& .MuiDataGrid-columnHeaderTitle": {
    whiteSpace: "nowrap",
    overflow: "visible",
  },
  "& .datagrid-header-fixed": {
    // Action column
    position: "sticky",
    right: 0,
    zIndex: 100,
    backgroundColor: theme.palette.customGrey.main,
    borderLeft: "1px solid #ddd",
  },
  '& .MuiDataGrid-cell[data-field="action"]': {
    position: "sticky",
    right: 0,
    backgroundColor: theme.palette.customGrey.light,
    zIndex: 90,
    borderLeft: "1px solid #ddd",
  },
}))

export default function ScheduleTable() {
  // const { handleChange } = props;
  const { workflows, progressScheduledTable } = useAppSelector(
    (state: RootState) => state.progressPage,
  )
  const dispatch = useAppDispatch()
  const [uniqueParameters, setUniqueParameters] = useState<Set<string> | null>(
    null,
  )
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [isFilterOpen, setFilterOpen] = useState(false)
  const paramLength = useRef(0)

  useEffect(() => {
    if (workflows.data.length > 0) {
      const uniqueParameters = new Set(
        workflows.data.reduce((acc: any[], workflow) => {
          const params = workflow.tasks.flatMap(
            task => task.parameters ? task.parameters : [])
          let paramNames = []
          if (params) {
            paramNames = params.map(param => param.name)
            return [...acc, ...paramNames]
          } else {
            return acc
          }
        }, []),
      )
      setUniqueParameters(uniqueParameters)
      const rows = workflows.data
        .filter(workflow => workflow.status === "scheduled")
        .map(workflow => {
          const params = workflow.tasks.flatMap(
            task => task.parameters ? task.parameters : [])
          return {
            id: idCounter++,
            workflowId: workflow.name,
            // "Train Model": workflow.variabilityPoints["Model Training"].Variant,
            ...Array.from(uniqueParameters).reduce((acc, variant) => {
              acc[variant] =
                `${params?.find(param => param.name === variant)?.value}` || ""
              return acc
            }, {}),
            status: workflow.status,
            // ...Object.keys(workflow.constraints)
            //   .map(key => ({ [key]: workflow.constraints[key] }))
            //   .reduce((acc, constraint) => ({ ...acc, ...constraint }), {}),
            action: "",
          }
        })
        .sort((a, b) => a.id - b.id)
      const workflow = workflows.data[0]
      const params = workflow.tasks.find(
        task => task.id === "TrainModel",
      )?.parameters
      const infoRow = {
        id: idCounter++,
        workflowId: workflow.name,
        // "Train Model": workflow.variabilityPoints["Model Training"].Variant,
        ...Array.from(uniqueParameters).reduce((acc, variant) => {
          acc[variant] =
            `${params?.find(param => param.name === variant)?.value}` || ""
          return acc
        }, {}),
        status: workflow.status,
        // ...Object.keys(workflow.constraints)
        //   .map(key => ({ [key]: workflow.constraints[key] }))
        //   .reduce((acc, constraint) => ({ ...acc, ...constraint }), {}),
        action: "",
      }
      // .filter(workflow => workflow.status === "scheduled")
      // .map(workflow => {
      //   const params = workflow.tasks.find(
      //     task => task.id === "TrainModel",
      //   )?.parameters
      //   return {
      //     id: idCounter++,
      //     workflowId: workflow.name,
      //     // "Train Model": workflow.variabilityPoints["Model Training"].Variant,
      //     ...Array.from(uniqueParameters).reduce((acc, variant) => {
      //       acc[variant] =
      //         `${params?.find(param => param.name === variant)?.value}` || ""
      //       return acc
      //     }, {}),
      //     status: workflow.status,
      //     // ...Object.keys(workflow.constraints)
      //     //   .map(key => ({ [key]: workflow.constraints[key] }))
      //     //   .reduce((acc, constraint) => ({ ...acc, ...constraint }), {}),
      //     action: "",
      //   }
      // })
      columns =
        infoRow
          ? Object.keys(infoRow)
              .filter(key => key !== "id")
              .map(key => ({
                field: key,
                headerName: key.replace("_", " "),
                headerClassName:
                key === "action" ? "datagrid-header-fixed" : "datagrid-header",
                minWidth: key === "action" ? 100 : key === "status" ? key.length * 10 + 40 : key.length * 10,
                maxWidth: 200,
                flex: 1,
                align: "center",
                headerAlign: "center",
                sortable: false,    
                type: (rows.length > 0 && typeof rows[0][key] === "number") ? "number" : "string",
                ...(key === "action" && {
                  renderCell: (params) => {
                    return (
                      <WorkflowActions
                        id={params.row.id}
                      />
                    )
                  }
                })
              }))
          : []
      paramLength.current = uniqueParameters.size
      dispatch(
        setProgressScheduledTable({ rows, visibleRows: rows, rowsPerPage: 10 }),
      )
    }
  }, [workflows])

  const filterClicked = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterOpen(!isFilterOpen)
    !isFilterOpen ? setAnchorEl(event.currentTarget) : setAnchorEl(null)
  }

  const removeSelected =
    (list: Number[] | string) => (e: React.SyntheticEvent) => {
      let filteredWorkflows
      if (typeof list !== "string") {
        filteredWorkflows = progressScheduledTable.rows.filter(
          row => !list.includes(row.id),
        )
      } else {
        filteredWorkflows = progressScheduledTable.rows.filter(
          row => !progressScheduledTable.selectedWorkflows.includes(row.id),
        )
      }
      dispatch(
        setProgressScheduledTable({
          rows: filteredWorkflows,
          visibleRows: filteredWorkflows,
          selectedWorkflows: [],
        }),
      )
    }

    const handleSelectionChange = (newSelection: GridRowSelectionModel) => {
      dispatch(setProgressScheduledTable({ selectedWorkflows: newSelection }))
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
    dispatch(
      setProgressScheduledTable({
        filters: [
          ...progressScheduledTable.filters,
          { column: "", operator: "", value: "" },
        ],
      }),
    )
  }

  const handleRemoveFilter = (index: number) => {
    const newFilters = progressScheduledTable.filters.filter(
      (_, i) => i !== index,
    )
    dispatch(setProgressScheduledTable({ filters: newFilters }))
  }

  useEffect(() => {
      if(progressScheduledTable.rows.length === 0) return
      let counter = 0
      let newRows = progressScheduledTable.rows
      if(progressScheduledTable.filters.length > 0) {
      for (let i = 0; i < progressScheduledTable.filters.length; i++) {
        if (progressScheduledTable.filters[i].value !== "") {
          counter++
        }
      }
      // dispatch(setProgressScheduledTable({ filtersCounter: counter }))
       newRows = progressScheduledTable.rows.filter(row => {
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
    }
    dispatch(
        setProgressScheduledTable({
          filtersCounter: counter,
          filteredRows: newRows,
        }),
      )
  }, [progressScheduledTable.filters])

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
        <div style={{ height: 450, width: "100%" }}>
          <StyledDataGrid
            disableVirtualization
            rows={progressScheduledTable.visibleRows}
            columns={columns}
            slots={{noRowsOverlay: NoRowsOverlayWrapper}}
            slotProps={{noRowsOverlay: {title: "No scheduled workflows"}}}
            checkboxSelection
            onRowSelectionModelChange={handleSelectionChange}
            sx={{
              "& .MuiDataGrid-selectedRowCount": {
                visibility: "hidden", // Remove the selection count text on the bottom because we implement it in the header
              },
              "& .theme-parameters-group": {
                textAlign: "center",
                justifyContent: "center",
                position: "relative",
                display: "grid",
                width: "100%",
                "&::after": {
                  content: '""',
                  display: "block",
                  width: "100%",
                  height: "2px",
                  backgroundColor: theme.palette.primary.main,
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                },
              },
              "& .theme-parameters-group-2": {
                textAlign: "center",
                justifyContent: "center",
                position: "relative",
                display: "grid",
                width: "100%",
                "&::after": {
                  content: '""',
                  display: "block",
                  width: "100%",
                  height: "2px",
                  backgroundColor: theme.palette.secondary.dark,
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                },
              }
            }}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
            columnGroupingModel={[
              {
                groupId: "Parameters",
                headerClassName: "theme-parameters-group",
                children: uniqueParameters
                  ? (Array.from(uniqueParameters).map(
                      (param): GridColumnNode => ({
                        field: param,
                      }),
                    ) as GridColumnNode[])
                  : [],
              }
            ]}
          />
        </div>
      </Paper>
    </Box>
  )
}
