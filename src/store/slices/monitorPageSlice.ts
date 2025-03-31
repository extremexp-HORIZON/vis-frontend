import { createSlice } from "@reduxjs/toolkit"

interface IMonitoringPageSlice {
    parallel: {
        data: { [key: string]: any }[]
        options: string[]
        selected: string
      }
      workflowsTable: {
        order: "asc" | "desc"
        orderBy: string
        page: number
        rowsPerPage: number
        selectedWorkflows: number[]
        filters: { column: string; operator: string; value: string }[]
        rows: { [key: string]: any }[]
        filteredRows: { [key: string]: any }[]
        filtersCounter: number
        visibleRows: { [key: string]: any }[]
      }
      scheduledTable: {
        order: "asc" | "desc"
        orderBy: string
        page: number
        rowsPerPage: number
        selectedWorkflows: number[]
        filters: { column: string; operator: string; value: string }[]
        rows: { [key: string]: any }[]
        filteredRows: { [key: string]: any }[]
        filtersCounter: number
        visibleRows: { [key: string]: any }[]
      }
      visibleTable: string
}

const initialState: IMonitoringPageSlice = {
    parallel: { data: [], options: [], selected: "" },
    workflowsTable: {
      order: "asc",
      orderBy: "id",
      page: 0,
      rowsPerPage: 10,
      selectedWorkflows: [],
      filters: [],
      rows: [],
      filteredRows: [],
      filtersCounter: 0,
      visibleRows: [],
    },
    scheduledTable: {
      order: "asc",
      orderBy: "id",
      page: 0,
      rowsPerPage: 10,
      selectedWorkflows: [],
      filters: [],
      rows: [],
      filteredRows: [],
      filtersCounter: 0,
      visibleRows: [],
    },
    visibleTable: "workflows"
}

export const monitoringPageSlice = createSlice({
  name: "monitoringPage",
  initialState,
  reducers: {
    setParallel: (state, action) => {
      state.parallel = { ...state.parallel, ...action.payload }
    },
    setWorkflowsTable: (state, action) => {
      state.workflowsTable = {
        ...state.workflowsTable,
        ...action.payload,
      }
    },
    setScheduledTable: (state, action) => {
      state.scheduledTable = {
        ...state.scheduledTable,
        ...action.payload,
      }
    },
    setVisibleTable: (state, action) => {
      state.visibleTable = action.payload
    }
  }
})

export const {setParallel, setWorkflowsTable, setScheduledTable, setVisibleTable} = monitoringPageSlice.actions;