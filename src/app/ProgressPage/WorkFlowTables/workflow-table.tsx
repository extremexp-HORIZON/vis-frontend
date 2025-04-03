import type {
  GridColDef,
  GridColumnNode,
  GridRowSelectionModel,
} from "@mui/x-data-grid"
import { DataGrid } from "@mui/x-data-grid"
import ToolbarWorkflow from "./toolbar-workflow-table"
import Paper from "@mui/material/Paper"
import Box from "@mui/material/Box"
import PauseIcon from "@mui/icons-material/Pause"
import StopIcon from "@mui/icons-material/Stop"
import LaunchIcon from "@mui/icons-material/Launch"
import { setProgressWokflowsTable } from "../../../store/slices/progressPageSlice"
import { useAppDispatch, useAppSelector } from "../../../store/store"
import type { RootState } from "../../../store/store"
import { useEffect, useState } from "react"
import { Badge, Popover, Rating, styled } from "@mui/material"
import FilterBar from "./filter-bar"
import NoRowsOverlayWrapper from "./no-rows-overlay"
import ProgressBar from "./prgress-bar"

import theme from "../../../mui-theme"

const fractionStrToDecimal = (str: string): string => {
  const [numerator, denominator] = str.split("/").map(Number)
  if (isNaN(numerator) || isNaN(denominator) || denominator === 0) {
    return str
  }
  return (numerator / denominator).toString()
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
  [key: string]: any
}

let idCounter = 1

// WorkflowActions

const WorkflowRating = (props: { rating: number }) => {
  const { rating } = props
  return <Rating sx={{ verticalAlign: "middle" }} value={rating} size="small" />
}

const WorkflowActions = (props: {
  currentStatus: string
  workflowId: string
  handleLaunchNewTab: (workflowId: string) => (e: React.SyntheticEvent) => void
}) => {
  const { currentStatus, workflowId, handleLaunchNewTab } = props

  return (
    <span
      onClick={event => event.stopPropagation()}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <Badge
        color="secondary"
        badgeContent=""
        variant="dot"
        invisible={currentStatus !== "pending_input"}
      >
        <LaunchIcon
          onClick={
            currentStatus === "completed" || currentStatus === "pending_input"
              ? handleLaunchNewTab(workflowId)
              : () => {}
          }
          style={{
            cursor:
              currentStatus === "completed" || currentStatus === "pending_input"
                ? "pointer"
                : "default",
            color:
              currentStatus === "completed" || currentStatus === "pending_input"
                ? theme.palette.primary.main
                : theme.palette.action.disabled,
          }}
        />
      </Badge>
      {currentStatus !== "completed" && currentStatus !== "failed" && (
        <>
          <PauseIcon
            onClick={() => console.log("Pause clicked")}
            style={{ cursor: "pointer", color: theme.palette.primary.main }}
          />
          <StopIcon
            onClick={() => console.log("Stop clicked")}
            style={{ cursor: "pointer", color: theme.palette.primary.main }}
          />
        </>
      )}
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
    zIndex: 9999,
    backgroundColor: theme.palette.customGrey.main,
    borderLeft: "1px solid #ddd",
  },
  '& .MuiDataGrid-cell[data-field="action"]': {
    position: "sticky",
    right: 0,
    backgroundColor: theme.palette.customGrey.light,
    zIndex: 9999,
    borderLeft: "1px solid #ddd",
  },
}))

interface WorkFlowTableProps {
  handleChange: (
    newValue: number | string,
  ) => (event: React.SyntheticEvent) => void
}

export default function WorkflowTable(props: WorkFlowTableProps) {
  const { workflows, progressWokflowsTable } = useAppSelector(
    (state: RootState) => state.progressPage,
  )
  const { tabs } = useAppSelector((state: RootState) => state.workflowTabs)
  const { handleChange } = props
  const [isFilterOpen, setFilterOpen] = useState(false)
  const [uniqueParameters, setUniqueParameters] = useState<Set<string> | null>(
    null,
  )
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [uniqueMetrics, setUniqueMetrics] = useState<Set<string> | null>(null)

  const dispatch = useAppDispatch()

  const handleSelectionChange = (newSelection: GridRowSelectionModel) => {
    dispatch(setProgressWokflowsTable({ selectedWorkflows: newSelection }))
  }

  const handleLaunchNewTab = (workflowId: any) => (e: React.SyntheticEvent) => {
    handleChange(workflowId)(e)
  }

  const handleLaunchCompletedTab =
    (workflowId: any) => (e: React.SyntheticEvent) => {
      handleChange(workflowId)(e)
    }

  const filterClicked = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterOpen(!isFilterOpen)
    !isFilterOpen ? setAnchorEl(event.currentTarget) : setAnchorEl(null)
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
  }, [progressWokflowsTable.filters, progressWokflowsTable.rows])

  useEffect(() => {
    if (workflows.data.length > 0) {
      //find unique parameters of each workflow -> model traning task
      const uniqueParameters = new Set(
        workflows.data.reduce((acc: any[], workflow) => {
          const params = workflow.tasks.flatMap(task =>
            task.parameters ? task.parameters : [],
          )
          let paramNames = []
          if (params) {
            paramNames = params.map(param => param.name)
            return [...acc, ...paramNames]
          } else {
            return acc
          }
        }, []),
      )
      const uniqueMetrics = new Set(
        workflows.data.reduce((acc: any[], workflow) => {
          const metrics = workflow.metrics?.filter(
            metric =>
              metric.semantic_type && metric.semantic_type.includes("ML"),
          )
          let metricNames = []
          if (metrics) {
            metricNames = metrics.map(metric => metric.name)
            return [...acc, ...metricNames]
          } else {
            return [...acc]
          }
        }, []),
      )
      setUniqueParameters(uniqueParameters)
      setUniqueMetrics(uniqueMetrics)

      const row = {
        id: 0,
        workflowId: "",
        ...Array.from(uniqueParameters).reduce((acc, variant) => {
          acc[variant] = ""
          return acc
        }, {}),
        ...Array.from(uniqueMetrics).reduce((acc, variant) => {
          acc[variant] = ""
          return acc
        }, {}),
        status: "",
        rating: 2,
        action: "",
      }

      // Create rows for the table based on the unique parameters we found
      const rows = workflows.data
        .filter(workflow => workflow.status !== "scheduled")
        .map(workflow => {
          const params = workflow.tasks.flatMap(task =>
            task.parameters ? task.parameters : [],
          )
          const metrics = workflow?.metrics
          return {
            id: idCounter++,
            workflowId: workflow.workflowId,
            ...Array.from(uniqueParameters).reduce((acc, variant) => {
              acc[variant] =
                `${params?.find(param => param.name === variant)?.value}` || ""
              return acc
            }, {}),
            ...Array.from(uniqueMetrics).reduce((acc, variant) => {
              const value = metrics?.find(
                metric => metric.name === variant,
              )?.value
              acc[variant] = value != null ? value : "n/a"
              return acc
            }, {}),
            status: workflow.status,
            rating: 2,
            action: "",
          }
        })
        
      columns = Object.keys(rows.length > 0 ? rows[0] : row)
              .filter(key => key !== "id")
              .map(key => ({
                field: key,
                headerName: key.replace("_", " "),
                headerClassName:
                  key === "action"
                    ? "datagrid-header-fixed"
                    : "datagrid-header",
                minWidth:
                  key === "action"
                    ? 100
                    : key === "status"
                      ? key.length * 10 + 40
                      : key.length * 10,
                maxWidth: 200,
                flex: 1,
                align: "center",
                headerAlign: "center",
                sortable: key !== "action",
                type:
                  rows.length > 0 && typeof rows[0][key] === "number"
                    ? "number"
                    : "string",
                ...(key === "status" && {
                  renderCell: params => (
                    <ProgressBar
                      workflowStatus={params.value}
                      workflowId={params.row.workflowId}
                    />
                  ),
                }),
                ...(key === "action" && {
                  renderCell: params => {
                    const currentStatus = params.row.status
                    return (
                      <WorkflowActions
                        currentStatus={currentStatus}
                        workflowId={params.row.workflowId}
                        handleLaunchNewTab={handleLaunchNewTab}
                      />
                    )
                  },
                }),
                ...(key === "rating" && {
                  renderCell: params => {
                    const currentRating = params.row.rating
                    return <WorkflowRating rating={currentRating} />
                  },
                }),
              }))

      dispatch(
        setProgressWokflowsTable({
          rows,
          filteredRows: rows,
          visibleRows: rows.slice(0, progressWokflowsTable.rowsPerPage),
        }),
      )
    }
  }, [workflows])

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
          handleClickedFunction={handleLaunchCompletedTab}
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
              columns={columns}
              filters={progressWokflowsTable.filters}
              onFilterChange={handleFilterChange}
              onAddFilter={handleAddFilter}
              onRemoveFilter={handleRemoveFilter}
            />
          </Box>
        </Popover>

        <div style={{ height: 450, width: "100%" }}>
          <StyledDataGrid
            disableVirtualization
            rows={progressWokflowsTable.filteredRows}
            columns={columns}
            slots={{ noRowsOverlay: NoRowsOverlayWrapper }}
            slotProps={{ noRowsOverlay: { title: "No workflows available" } }}
            checkboxSelection
            onRowSelectionModelChange={handleSelectionChange}
            rowSelectionModel={progressWokflowsTable.selectedWorkflows}
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
              },
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
              },
              {
                groupId: "Metrics",
                headerClassName: "theme-parameters-group-2",
                children: uniqueMetrics
                  ? (Array.from(uniqueMetrics).map(
                      (metric): GridColumnNode => ({
                        field: metric,
                      }),
                    ) as GridColumnNode[])
                  : [],
              },
            ]}
          />
        </div>
      </Paper>
    </Box>
  )
}
