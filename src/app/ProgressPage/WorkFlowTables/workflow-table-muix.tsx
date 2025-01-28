import type { GridColDef } from "@mui/x-data-grid"
import { DataGrid, GridToolbarContainer } from "@mui/x-data-grid"
import ToolbarWorkflow from "./toolbar-workflow-table"
import ProgressPercentage from "./progress-percentage"
import Paper from "@mui/material/Paper"
import Box from "@mui/material/Box"
import PauseIcon from "@mui/icons-material/Pause"
import StopIcon from "@mui/icons-material/Stop"
import LaunchIcon from "@mui/icons-material/Launch"
import theme from "../../../mui-theme"
import { setProgressWokflowsTable } from "../../../store/slices/progressPageSlice"
import { useAppDispatch, useAppSelector } from "../../../store/store"
import type { RootState } from "../../../store/store"
import {
  addCompareCompletedTab,
  addTab,
} from "../../../store/slices/workflowTabsSlice"
import { id } from "vega"
import { useEffect } from "react"
import TableContainer from "@mui/material/TableContainer"

const fractionStrToDecimal = (str: string): string => {
  const [numerator, denominator] = str.split("/").map(Number)
  if (isNaN(numerator) || isNaN(denominator) || denominator === 0) {
    return str
  }
  return (numerator / denominator).toString()
}

const handleLaunchNewTab = (workflowId: any) => (e: React.SyntheticEvent) => {
  console.log("handleLaunchNewTab")
  // if (tabs.find(tab => tab.workflowId === workflowId)) return
  // dispatch(addTab({ workflowId, workflows }))
  // handleChange(workflowId)(e)
}

const handleLaunchCompletedTab =
  (workflowId: any) => (e: React.SyntheticEvent) => {
    console.log("handleLaunchCompletedTab")
    // if (tabs.find(tab => tab.workflowId === workflowId)) return
    // dispatch(addCompareCompletedTab(workflows))
    // handleChange(workflowId)(e)
  }

const filterClicked = (event: React.MouseEvent<HTMLButtonElement>) => {
  console.log("Filter is clicked")
  // setFilterOpen(!isFilterOpen)
  // !isFilterOpen ? setAnchorEl(event.currentTarget) : setAnchorEl(null)
}

interface Column extends GridColDef<{ [key: string]: any }> {
  id: keyof Data
  label: string
  minWidth?: number
  align?: "right" | "left" | "center" | "inherit" | "justify" | undefined
  numeric?: boolean
  sortable?: boolean
  constraint?: boolean
}

let columns: Column[] = []

export interface Data {
  [key: string]: any
}

let idCounter = 1
let paramlength = 0

export default function WorkflowDataGrid() {
  const { workflows, progressWokflowsTable } = useAppSelector(
    (state: RootState) => state.progressPage,
  )
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (workflows.data.length > 0) {
      //find unique parameters of each workflow -> model traning task
      const uniqueParameters = new Set(
        workflows.data.reduce((acc: any[], workflow) => {
          const params = workflow.tasks.find(
            task => task.id === "TrainModel",
          )?.parameters
          let paramNames = []
          if (params) {
            paramNames = params.map(param => param.name)
            return [...acc, ...paramNames]
          } else {
            return [...acc]
          }
        }, []),
      )

      // Create rows for the table based on the unique parameters we found
      const rows = workflows.data
        .filter(workflow => workflow.status !== "scheduled")
        .map(workflow => {
          const params = workflow.tasks.find(
            task => task.id === "TrainModel",
          )?.parameters
          return {
            id: idCounter++,
            workflowId: workflow.workflowId,
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
      // const constrainsNames = Object.keys(workflows.data[0].constraints)
      columns = Object.keys(rows[0])
        .filter(key => key !== "id")
        .map(key => ({
          field: key, // Add this property
          type: "string", // Add this property (or use a different type if needed)
          id: key,
          label: key,
          minWidth: key === "action" ? 100 : 50,
          numeric: typeof rows[0][key] === "number" ? true : false,
          align: "center",
          sortable: key !== "action" ? true : false,
          flex: 1
          // constraint: constrainsNames.includes(key) ? true : false
        }))

      columns.forEach(col => {
        if (col.field === "status") {
          col.renderCell = params => (
            <ProgressPercentage
              progressNumber={fractionStrToDecimal(params.value)}
            />
          )
        }

        if (col.field === "action") {
          col.renderCell = params => {
            const currentStatus = params.row.status
            return (
              <span>
                <LaunchIcon
                  onClick={
                    currentStatus !== "completed"
                      ? () => {}
                      : handleLaunchNewTab(params.row.workflowId)
                  }
                  style={{
                    cursor:
                      currentStatus !== "completed" ? "default" : "pointer",
                    color:
                      currentStatus !== "completed"
                        ? theme.palette.action.disabled
                        : theme.palette.primary.main,
                  }}
                />
                {currentStatus !== "completed" &&
                  currentStatus !== "failed" && (
                    <>
                      <PauseIcon
                        onClick={() => console.log("Pause clicked")}
                        style={{
                          cursor: "pointer",
                          color: theme.palette.primary.main,
                        }}
                      />
                      <StopIcon
                        onClick={() => console.log("Stop clicked")}
                        style={{
                          cursor: "pointer",
                          color: theme.palette.primary.main,
                        }}
                      />
                    </>
                  )}
              </span>
            )
          }
        }
      })

      paramlength = uniqueParameters.size
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
        {/* Toolbar for Workflow Actions */}
        <ToolbarWorkflow
          actionButtonName="Compare selected workflows"
          secondActionButtonName="Compare completed workflows"
          tableName="Workflow Execution"
          numSelected={progressWokflowsTable.selectedWorkflows.length}
          filterNumbers={progressWokflowsTable.filtersCounter}
          filterClickedFunction={filterClicked}
          handleClickedFunction={handleLaunchCompletedTab}
        />

        <div style={{ height: 450, width: "100%" }}>
          <DataGrid
            rows={progressWokflowsTable.rows} 
            columns={columns}
            checkboxSelection
            pageSizeOptions={[10, 25, 100]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
            components={{
              Toolbar: () => (
                <GridToolbarContainer>
                  {/* Add additional toolbar elements here if needed */}
                </GridToolbarContainer>
              ),
            }}
          />
        </div>
      </Paper>
    </Box>
  )
}
