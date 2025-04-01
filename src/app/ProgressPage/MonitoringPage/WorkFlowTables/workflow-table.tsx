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
import { setWorkflowsTable } from "../../../../store/slices/monitorPageSlice"
import { useAppDispatch, useAppSelector } from "../../../../store/store"
import type { RootState } from "../../../../store/store"
import { useEffect, useState } from "react"
import { Badge, IconButton, Popover, Rating, styled, useTheme } from "@mui/material"
import FilterBar from "./filter-bar"
import NoRowsOverlayWrapper from "./no-rows-overlay"
import ProgressBar from "./prgress-bar"

import theme from "../../../../mui-theme"
import { useNavigate, useParams } from "react-router-dom"

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
  return <Rating sx={{verticalAlign: "middle"}} value={rating} size="small" />
}

const WorkflowActions = (props: {
  currentStatus: string
  workflowId: string
  handleLaunchNewTab: (workflowId: string) => (e: React.SyntheticEvent) => void
}) => {
  const { currentStatus, workflowId, handleLaunchNewTab } = props

  return (
    <span onClick={event => event.stopPropagation()} style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
      <Badge color="secondary" badgeContent="" variant="dot" invisible={currentStatus !== "pending_input"}>
      <IconButton           
        onClick={
          (currentStatus === "COMPLETED" || currentStatus === "pending_input")
            ? handleLaunchNewTab(workflowId)
            : () => {}
        }
      >
        <LaunchIcon
          style={{
            cursor: (currentStatus === "COMPLETED" || currentStatus === "pending_input") ? "pointer" : "default",
            color:
            (currentStatus === "COMPLETED" || currentStatus === "pending_input")
                ? theme.palette.primary.main
                : theme.palette.action.disabled,
          }}
        />
      </IconButton>
        </Badge>
      {currentStatus !== "COMPLETED" && currentStatus !== "FAILED" && (
        <>
          <IconButton onClick={() => console.log("Pause clicked")} >
            <PauseIcon
              style={{ cursor: "pointer", color: theme.palette.primary.main }}
            />
          </IconButton>
          <IconButton onClick={() => console.log("Stop clicked")}>
            <StopIcon
              style={{ cursor: "pointer", color: theme.palette.primary.main }}
            />
          </IconButton>
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
  const { workflows } = useAppSelector(
    (state: RootState) => state.progressPage,
  )
  const { workflowsTable } = useAppSelector(
    (state: RootState) => state.monitorPage
  )
  const { handleChange } = props
  const [isFilterOpen, setFilterOpen] = useState(false)
  const [uniqueParameters, setUniqueParameters] = useState<Set<string> | null>(
    null,
  )
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [uniqueMetrics, setUniqueMetrics] = useState<Set<string> | null>(null)
  const navigate = useNavigate()
  const {experimentId} = useParams()

  const dispatch = useAppDispatch()

  const handleSelectionChange = (newSelection: GridRowSelectionModel) => {
    dispatch(setWorkflowsTable({ selectedWorkflows: newSelection }))
  }

  const handleLaunchNewTab = (workflowId: any) => (e: React.SyntheticEvent) => {
    handleChange(workflowId)(e)
  }

  const handleLaunchCompletedTab =
    (workflowId: any) => (e: React.SyntheticEvent) => {
      navigate(`/${experimentId}/comparative-analysis`)
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
    const newFilters = [...workflowsTable.filters]
    newFilters[index] = { column, operator, value }
    dispatch(setWorkflowsTable({ filters: newFilters }))
  }

  const handleAddFilter = () => {
    const newFilters = [
      ...workflowsTable.filters,
      { column: "", operator: "", value: "" },
    ]
    dispatch(setWorkflowsTable({ filters: newFilters }))
  }

  const handleRemoveFilter = (index: number) => {
    const newFilters = workflowsTable.filters.filter(
      (_, i) => i !== index,
    )
    dispatch(setWorkflowsTable({ filters: newFilters }))
  }

  useEffect(() => {
    let counter = 0
    for (let i = 0; i < workflowsTable.filters.length; i++) {
      if (workflowsTable.filters[i].value !== "") {
        counter++
      }
    }
    dispatch(setWorkflowsTable({ filtersCounter: counter }))
    const filteredRows = workflowsTable.rows.filter(row => {
      return workflowsTable.filters.every(filter => {
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
    dispatch(setWorkflowsTable({ filteredRows }))
  }, [workflowsTable.filters, workflowsTable.rows])

  useEffect(() => {
    if (workflows.data.length > 0) {
      //find unique parameters of each workflow -> model traning task
      const uniqueParameters = new Set(
        workflows.data.reduce((acc: any[], workflow) => {
          const params = workflow.params
          let paramNames = []
          if (params) {
            paramNames = params.map(param => param.name)
            return [...acc, ...paramNames]
          } else {
            return [...acc]
          }
        }, []),
      )
      const uniqueMetrics = new Set(
        workflows.data.reduce((acc: any[], workflow) => {
          const metrics = workflow.metrics
          let metricNames = []
          if(metrics) {
            metricNames = metrics.map(metric => metric.name)
            return [...acc, ...metricNames]
          } else {
            return [...acc]
          }
        }, [])
      )
      setUniqueParameters(uniqueParameters)
      setUniqueMetrics(uniqueMetrics)
      // Create rows for the table based on the unique parameters we found
      const rows = workflows.data
        .filter(workflow => workflow.status !== "SCHEDULED")
        .map(workflow => {
          const params = workflow.params
          const metrics = workflow?.metrics
          return {
            id: idCounter++,
            workflowId: workflow.id,
            ...Array.from(uniqueParameters).reduce((acc, variant) => {
              acc[variant] =
                `${params?.find(param => param.name === variant)?.value}` || ""
              return acc
            }, {}),
            ...Array.from(uniqueMetrics).reduce((acc, variant) => {
              const value = metrics?.find(metric => metric.name === variant)?.value
              acc[variant] = value != null ? value : "n/a"
              return acc
            }, {}),
            status: workflow.status,
            rating: 2,
            action: "",
          }
        })

      columns = Object.keys(rows[0])
        .filter(key => key !== "id")
        .map(key => ({
          field: key,
          headerName: key.replace("_", " "),
          headerClassName:
            key === "action" ? "datagrid-header-fixed" : "datagrid-header",
          minWidth: key === "action" ? 100 : key === "status" ? key.length * 10 + 40 : key.length * 10,
          flex: 1,
          align: "center",
          headerAlign: "center",
          sortable: key !== "action",
          type: rows.length > 0 && typeof rows[0][key] === "number" ? "number" : "string",
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
              return (
                <WorkflowRating
                  rating={currentRating} />
              )
            },
          }),
        }))

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
          columnsVisibilityModel: visibilityModel
        }),
      )
    }
  }, [workflows])

  return (
    <Box sx={{height: "100%"}}>
      <Paper elevation={2} sx={{height: "100%", width: "100%", mb: 2}}>
        <Box sx={{height: "15%"}} >
          <ToolbarWorkflow
            actionButtonName="Compare selected workflows"
            tableName="Workflow Execution"
            numSelected={workflowsTable.selectedWorkflows.length}
            filterNumbers={workflowsTable.filtersCounter}
            filterClickedFunction={filterClicked}
            handleClickedFunction={handleLaunchCompletedTab}
            tableId="workflows"
            onRemoveFilter={handleRemoveFilter}
          />
        </Box>
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
              filters={workflowsTable.filters}
              onFilterChange={handleFilterChange}
              onAddFilter={handleAddFilter}
              onRemoveFilter={handleRemoveFilter}
            />
          </Box>
        </Popover>

        <div style={{ height: "85%", width: "100%" }}>
          <StyledDataGrid
            disableVirtualization
            density="compact"
            rows={workflowsTable.filteredRows}
            columns={workflowsTable.columns as CustomGridColDef[]}
            columnVisibilityModel={workflowsTable.columnsVisibilityModel}
            onColumnVisibilityModelChange={(model) =>
              dispatch(setWorkflowsTable({ columnsVisibilityModel: model }))
            }          
            slots={{noRowsOverlay: NoRowsOverlayWrapper}}
            slotProps={{noRowsOverlay: {title: "No workflows available"}}}
            checkboxSelection
            onRowSelectionModelChange={handleSelectionChange}
            rowSelectionModel={workflowsTable.selectedWorkflows}
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
              },
              {
                groupId: "Metrics",
                headerClassName: "theme-parameters-group-2",
                children: uniqueMetrics ? (
                  Array.from(uniqueMetrics).map(
                    (metric): GridColumnNode => ({
                      field: metric,
                    }),
                  ) as GridColumnNode[]
                ) : []
              }
            ]}
          />
        </div>
      </Paper>
    </Box>
  )
}
