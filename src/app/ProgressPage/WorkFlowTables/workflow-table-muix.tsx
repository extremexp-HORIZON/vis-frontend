import type { GridColDef } from "@mui/x-data-grid"
import {
  DataGrid,
  GridToolbarColumnsButton,
  GridToolbarContainer,
} from "@mui/x-data-grid"
import ToolbarWorkflow from "./toolbar-workflow-table"
import ProgressPercentage from "./progress-percentage"
import Paper from "@mui/material/Paper"
import Box from "@mui/material/Box"
import PauseIcon from "@mui/icons-material/Pause"
import StopIcon from "@mui/icons-material/Stop"
import LaunchIcon from "@mui/icons-material/Launch"
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
import theme from "../../../mui-theme"
import { styled } from "@mui/material"

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

const WorkflowActions = (props: {
  currentStatus: string
  workflowId: string
  handleLaunchNewTab: (workflowId: string) => (e: React.SyntheticEvent) => void
}) => {
  const { currentStatus, workflowId, handleLaunchNewTab } = props

  return (
    <span onClick={event => event.stopPropagation()}>
      <LaunchIcon
        onClick={
          currentStatus !== "completed"
            ? () => {}
            : handleLaunchNewTab(workflowId)
        }
        style={{
          cursor: currentStatus !== "completed" ? "default" : "pointer",
          color:
            currentStatus !== "completed"
              ? theme.palette.action.disabled
              : theme.palette.primary.main,
        }}
      />
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
    zIndex: 100,
    backgroundColor: theme.palette.customGrey.main,
  },
  '& .MuiDataGrid-cell[data-field="action"]': {
    position: "sticky",
    right: 0,
    backgroundColor: theme.palette.customGrey.light,
    zIndex: 90,
  },
}))

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
            ...Array.from(uniqueParameters).reduce((acc, variant) => {
              acc[variant] =
                `${params?.find(param => param.name === variant)?.value}` || ""
              return acc
            }, {}),
            status: workflow.status,
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
          minWidth: key === "action" ? 100 : key.length * 10 - 30,
          flex: 1,
          align: "center",
          headerAlign: "center",
          sortable: key !== "action",
          type: typeof rows[0][key] === "number" ? "number" : "string",
          ...(key === "status" && {
            renderCell: params => (
              <ProgressPercentage
                progressNumber={fractionStrToDecimal(params.value)}
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

        <div style={{ height: 450, width: "100%" }}>
          <StyledDataGrid
            rows={progressWokflowsTable.rows}
            columns={columns}
            checkboxSelection
            pageSizeOptions={[10, 25, 100]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
          />
        </div>
      </Paper>
    </Box>
  )
}
