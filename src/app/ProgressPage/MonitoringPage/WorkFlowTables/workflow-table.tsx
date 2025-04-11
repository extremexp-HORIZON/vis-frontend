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
import { setSelectedTab, setWorkflowsTable, toggleWorkflowSelection } from "../../../../store/slices/monitorPageSlice"
import { useAppDispatch, useAppSelector } from "../../../../store/store"
import type { RootState } from "../../../../store/store"
import { useEffect, useState } from "react"
import { Badge, IconButton, Popover, Rating, styled, useTheme } from "@mui/material"
import FilterBar from "./filter-bar"
import NoRowsOverlayWrapper from "./no-rows-overlay"
import ProgressBar from "./prgress-bar"

import theme from "../../../../mui-theme"

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
  // Add pagination styling
  "& .MuiDataGrid-footerContainer": {
    minHeight: "56px",
    borderTop: "1px solid rgba(224, 224, 224, 1)",
  },
  "& .MuiTablePagination-root": {
    overflow: "visible",
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
  const { workflowsTable, selectedTab } = useAppSelector(
    (state: RootState) => state.monitorPage
  )
  const { handleChange } = props
  const [isFilterOpen, setFilterOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  const dispatch = useAppDispatch()

  const handleSelectionChange = (newSelection: GridRowSelectionModel) => {
    newSelection.forEach(workflowId => {
      dispatch(toggleWorkflowSelection(workflowId));

  });
  dispatch(setWorkflowsTable({ selectedWorkflows: newSelection }))
  }

  const handleLaunchNewTab = (workflowId: any) => (e: React.SyntheticEvent) => {
    handleChange(workflowId)(e)
  }

  const handleLaunchCompletedTab =
    (workflowId: any) => (e: React.SyntheticEvent) => {
      dispatch(setSelectedTab(1))
    }

  const filterClicked = (event: React.MouseEvent<HTMLElement>) => {
    setFilterOpen(!isFilterOpen)
    !isFilterOpen ? setAnchorEl(event.currentTarget as HTMLButtonElement) : setAnchorEl(null)
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

  const handleAggregation = (
    rows: any[],
    groupKeys: string[],
    metricKeys: string[]  
  ): any[] => {
    const grouped = new Map<string, any[]>()

    rows.forEach(row => {
      const key = groupKeys.map(k => row[k]).join('|')
      if (!grouped.has(key)) grouped.set(key, [])
      grouped.get(key)?.push(row)
    })

    let idCounter = 0
    const aggregatedRows: any[] = []

    for (const [key, group] of grouped.entries()) {
      const values = group[0]
      const summary: any = {
        id: idCounter++,
        isGroupSummary: true,
        workflowId: `${group.length} workflows`,
      }
  
      groupKeys.forEach(param => {
        summary[param] = values[param]
      })  

      metricKeys.forEach(metric => {
        const validValues = group.map(row => row[metric]).filter((v: any) => typeof v === 'number')
        if (validValues.length > 0) {
          const avg = validValues.reduce((sum, val) => sum + val, 0) / validValues.length
          summary[metric] = Number(avg.toFixed(3))
        } else {
          summary[metric] = "n/a"
        }
      })
      aggregatedRows.push(summary)
    }
  
    return aggregatedRows
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
          case "=":
            return !Number.isNaN(Number(cellValue)) ? Number(cellValue) === Number(filterValue) : cellValue === filterValue
          case "startsWith":
            return cellValue.startsWith(filterValue)
          case "endsWith":
            return cellValue.endsWith(filterValue)
          case ">":
            return !Number.isNaN(Number(cellValue)) ? Number(cellValue) > Number(filterValue) : true
          case "<":
            return !Number.isNaN(Number(cellValue)) ? Number(cellValue) < Number(filterValue) : true
          case ">=":
            return !Number.isNaN(Number(cellValue)) ? Number(cellValue) >= Number(filterValue) : true
          case "<=":
            return !Number.isNaN(Number(cellValue)) ? Number(cellValue) <= Number(filterValue) : true
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
      const uniqueTasks = new Set(
        workflows.data.reduce((acc: any[], workflow) => {
          const tasks = workflow?.tasks
          let taskNames = []
          if(tasks) {
            taskNames = tasks.filter(task => task.variant && task.variant !== task.name).map(task => task.name)
            return [...acc, ...taskNames]
          } else {
            return [...acc]
          }
        }, [])
      )

      // Create rows for the table based on the unique parameters we found
      const rows = workflows.data
        .filter(workflow => workflow.status !== "SCHEDULED")
        .map(workflow => {
          const params = workflow.params
          const metrics = workflow?.metrics
          const tasks = workflow?.tasks
          return {
            id: workflow.id,
            workflowId: workflow.id,
            ...Array.from(uniqueTasks).reduce((acc, variant) => {
              acc[variant] =
                tasks?.find(task => task.name === variant)?.variant || ""
              return acc
            }, {}),
            ...Array.from(uniqueParameters).reduce((acc, variant) => {
              acc[variant] =
                `${params?.find(param => param.name === variant)?.value}` || ""
              return acc
            }, {}),
            ...Array.from(uniqueMetrics).reduce((acc, variant) => {
              if (metrics && metrics.length > 0) {
                const matchingMetrics = metrics.filter(metric => metric.name === variant)
            
                // Pick the one with highest step or fallback to latest timestamp
                const latestMetric = matchingMetrics.reduce((latest, current) => {
                  if (current.step != null && latest.step != null) {
                    return current.step > latest.step ? current : latest
                  } else {
                    return current.timestamp > latest.timestamp ? current : latest
                  }
                }, matchingMetrics[0])
            
                acc[variant] = latestMetric?.value != null ? latestMetric.value : "n/a"
              } else {
                acc[variant] = "n/a"
              }
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
          maxWidth: key === "action" ? 100 : 500,
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
          visibleColumns: columns,
          columnsVisibilityModel: visibilityModel,
          uniqueMetrics: Array.from(uniqueMetrics),
          uniqueParameters: Array.from(uniqueParameters),
          uniqueTasks: Array.from(uniqueTasks)
        }),
      )
    }
  }, [workflows])

  useEffect(() => {
    if (workflowsTable.groupBy.length > 0 && workflowsTable.filteredRows.length > 0) {
      const aggregatedRows = handleAggregation(
        workflowsTable.filteredRows,
        workflowsTable.groupBy,
        workflowsTable.uniqueMetrics
      )

      const allowedFields = new Set([
        "workflowId",
        ...workflowsTable.groupBy,
        ...workflowsTable.uniqueMetrics,
      ])
  
      const reducedColumns = workflowsTable.columns.filter(col =>
        allowedFields.has(col.field)
      )
      
      dispatch(setWorkflowsTable({
        visibleRows: aggregatedRows,
        aggregatedRows: aggregatedRows,
        visibleColumns: reducedColumns
      }))
    } else {
      dispatch(setWorkflowsTable({
        visibleRows: workflowsTable.filteredRows,
        aggregatedRows: [],
        visibleColumns: workflowsTable.columns,
      }))
    }
  }, [workflowsTable.groupBy, workflowsTable.filteredRows, workflowsTable.uniqueMetrics])
    

  return (
    <Box sx={{height: "100%" }}>
      <Paper elevation={2} sx={{height: "100%", width: "100%", mb: 2}}>
        <Box >
          <ToolbarWorkflow
            key="workflows-toolbar"
            actionButtonName="Compare selected workflows"
            tableName="Workflow Execution"
            numSelected={workflowsTable.selectedWorkflows.length}
            filterNumbers={workflowsTable.filtersCounter}
            filterClickedFunction={filterClicked}
            handleClickedFunction={handleLaunchCompletedTab}
            onRemoveFilter={handleRemoveFilter}
            groupByOptions={Array.from(new Set([...workflowsTable.uniqueTasks, ...workflowsTable.uniqueParameters]))}
            filters={workflowsTable.filters}
            onFilterChange={handleFilterChange}
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
              setFilterOpen={setFilterOpen}
            />
          </Box>
        </Popover>

        <div style={{ height: 'calc(100% - 64px)', width: "100%" }}>
          <StyledDataGrid
            disableVirtualization
            density="compact"
            rows={workflowsTable.visibleRows}
            columns={workflowsTable.visibleColumns as CustomGridColDef[]}
            columnVisibilityModel={workflowsTable.columnsVisibilityModel}
            disableColumnFilter
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
                paginationModel: { pageSize: 50 },
              },
            }}
            columnGroupingModel={[
              {
                groupId: "Parameters",
                headerClassName: "theme-parameters-group",
                children: workflowsTable.uniqueParameters.length > 0
                  ? (workflowsTable.uniqueParameters.map(
                      (param): GridColumnNode => ({
                        field: param,
                      }),
                    ) as GridColumnNode[])
                  : [],
              },
              {
                groupId: "Metrics",
                headerClassName: "theme-parameters-group-2",
                children: workflowsTable.uniqueMetrics.length > 0 ? (
                  workflowsTable.uniqueMetrics.map(
                    (metric): GridColumnNode => ({
                      field: metric,
                    }),
                  ) as GridColumnNode[]
                ) : []
              },
              {
                groupId: "Task Variants",
                headerClassName: "theme-parameters-group-2",
                children: workflowsTable.uniqueTasks.length > 0 ? (
                  workflowsTable.uniqueTasks.map(
                    (task): GridColumnNode => ({
                      field: task,
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
