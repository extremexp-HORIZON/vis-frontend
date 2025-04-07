import { createSlice } from "@reduxjs/toolkit"
import WorkflowTab from "../../app/ProgressPage/WorkflowTab/workflow-tab"
import WorkflowTable from "../../app/ProgressPage/MonitoringPage/WorkFlowTables/workflow-table"

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
        selectedWorkflows: string[]
        workflowColors: { [key: string]: string } // New mapping for workflow colors

        filters: { column: string; operator: string; value: string }[]
        rows: { [key: string]: any }[]
        filteredRows: { [key: string]: any }[]
        filtersCounter: number
        visibleRows: { [key: string]: any }[]
        columns: { [key: string]: any }[]
        visibleColumns: { [key: string]: any }[]
        columnsVisibilityModel: { [field: string]: boolean }
        aggregatedRows: { [key: string]: any }[]
        aggregatedColumns: { [key: string]: any }[]
        groupBy: string[]
        uniqueMetrics: string[]
        uniqueParameters: string[]
        uniqueTasks: string[]
      }
      scheduledTable: {
        order: "asc" | "desc"
        orderBy: string
        page: number
        rowsPerPage: number
        selectedWorkflows: string[]
        filters: { column: string; operator: string; value: string }[]
        rows: { [key: string]: any }[]
        filteredRows: { [key: string]: any }[]
        filtersCounter: number
        visibleRows: { [key: string]: any }[]
        columns: { [key: string]: any }[]
        columnsVisibilityModel: { [field: string]: boolean },
        uniqueParameters: string[]
        uniqueTasks: string[]  
      }
      visibleTable: string
      selectedTab: number
}

const generateUniqueColor = (existingColors: Set<string>) => {
  const colors = [
    "#1F77B4", 
  "#FF7F0E", 
  "#2CA02C", 
  "#D62728", 
  "#9467BD", // Purple
  "#8C564B", // Brown
  "#E377C2", // Pink
  "#17BECF", // Cyan
  "#AEC7E8", // Light Blue
  "#FFBB78", // Light Orange
  "#98DF8A", // Light Green
  "#FF9896", // Light Red
  "#C5B0D5", // Light Purple
  "#C49C94", // Light Brown
  "#F7B6D2", // Light Pink
  "#9EDAE5", // Light Cyan
  ];

  const availableColors = colors.filter(color => !existingColors.has(color));

  // If all colors are used, recycle but prioritize uniqueness
  if (availableColors.length === 0) return colors[Math.floor(Math.random() * colors.length)];

  const newColor = availableColors[Math.floor(Math.random() * availableColors.length)];
  return newColor;
};
const initialState: IMonitoringPageSlice = {
    parallel: { data: [], options: [], selected: "" },
    workflowsTable: {
      order: "asc",
      orderBy: "id",
      page: 0,
      rowsPerPage: 10,
      selectedWorkflows: [],
      workflowColors: {}, // Initialize the color mapping

      filters: [],
      rows: [],
      filteredRows: [],
      filtersCounter: 0,
      visibleRows: [],
      columns: [],
      visibleColumns: [],
      columnsVisibilityModel: {},
      aggregatedRows: [],
      aggregatedColumns: [],
      groupBy: [],
      uniqueMetrics: [],
      uniqueParameters: [],
      uniqueTasks: []
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
      columns: [],
      columnsVisibilityModel: {},
      uniqueParameters: [],
      uniqueTasks: []
    },
    visibleTable: "workflows",
    selectedTab: 0
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
    },
    setSelectedTab: (state, action) => {
      state.selectedTab = action.payload
    },
    toggleWorkflowSelection: (state, action) => {
      const workflowId = action.payload;
      const index = state.workflowsTable.selectedWorkflows.indexOf(workflowId);

      if (index === -1) {
        // Add workflow and assign a unique color
        state.workflowsTable.selectedWorkflows.push(workflowId);

        const existingColors = new Set(Object.values(state.workflowsTable.workflowColors));
        if (!state.workflowsTable.workflowColors[workflowId]) {
          state.workflowsTable.workflowColors[workflowId] = generateUniqueColor(existingColors);
        }
      } else {
        // Remove workflow but keep its color mapping
        state.workflowsTable.selectedWorkflows.splice(index, 1);
      }
    },
    setGroupBy: (state, action) => {
      state.workflowsTable.groupBy = action.payload
    }
  }
})

export const {setParallel, setWorkflowsTable, setScheduledTable, setVisibleTable, setSelectedTab, toggleWorkflowSelection, setGroupBy 
} = monitoringPageSlice.actions;