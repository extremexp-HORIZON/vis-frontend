import { createSlice } from "@reduxjs/toolkit"
import type { CustomGridColDef } from "../../shared/types/table-types"

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
        hoveredWorkflowId: string | number | null; // Add this field

        filters: { column: string; operator: string; value: string }[]
        rows: { [key: string]: any }[]
        filteredRows: { [key: string]: any }[]
        filtersCounter: number
        visibleRows: { [key: string]: any }[]
        columns: CustomGridColDef[]
        visibleColumns: { [key: string]: any }[]
        columnsVisibilityModel: { [field: string]: boolean }
        aggregatedRows: { [key: string]: any }[]
        groupBy: string[]
        uniqueMetrics: string[]
        uniqueParameters: string[]
        uniqueTasks: string[]
        initialized: boolean
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
        columns: CustomGridColDef[]
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
      rowsPerPage: 50,
      selectedWorkflows: [],
      workflowColors: {}, // Initialize the color mapping
      hoveredWorkflowId: null, // Initialize as null

      filters: [{column: '', operator: '', value: ''}],
      rows: [],
      filteredRows: [],
      filtersCounter: 0,
      visibleRows: [],
      columns: [],
      visibleColumns: [],
      columnsVisibilityModel: {},
      aggregatedRows: [],
      groupBy: [],
      uniqueMetrics: [],
      uniqueParameters: [],
      uniqueTasks: [],
      initialized: false
    },
    scheduledTable: {
      order: "asc",
      orderBy: "id",
      page: 0,
      rowsPerPage: 50,
      selectedWorkflows: [],
      filters: [{column: '', operator: '', value: ''}],
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
      const { rows = [], ...rest } = action.payload;
    
      // If rows are included in the payload, assign colors
      if (rows.length > 0) {
        const existingColors = new Set(Object.values(state.workflowsTable.workflowColors));
        const newWorkflowColors = { ...state.workflowsTable.workflowColors };
    
        rows.forEach((row: { id: any }) => {
          const workflowId = row.id; // Adjust if your workflow ID field has a different name
          if (!newWorkflowColors[workflowId]) {
            newWorkflowColors[workflowId] = generateUniqueColor(existingColors);
            existingColors.add(newWorkflowColors[workflowId]);
          }
        });
    
        state.workflowsTable.workflowColors = newWorkflowColors;
      }
    
      state.workflowsTable = {
        ...state.workflowsTable,
        ...rest,
        ...(rows.length > 0 && { rows }) // only overwrite rows if included
      };
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
    bulkToggleWorkflowSelection: (state, action) => {
      const workflowIds: string[] = action.payload;
    
      const existingColors = new Set(Object.values(state.workflowsTable.workflowColors));
    
      workflowIds.forEach((workflowId) => {
        const index = state.workflowsTable.selectedWorkflows.indexOf(workflowId);
    
        if (index === -1) {
          state.workflowsTable.selectedWorkflows.push(workflowId);
    
          if (!state.workflowsTable.workflowColors[workflowId]) {
            state.workflowsTable.workflowColors[workflowId] = generateUniqueColor(existingColors);
            existingColors.add(state.workflowsTable.workflowColors[workflowId]); // Avoid duplicates
          }
        }
      });
    },    
    setGroupBy: (state, action) => {
      state.workflowsTable.groupBy = action.payload
    },
    setHoveredWorkflow: (state, action) => {
      state.workflowsTable.hoveredWorkflowId = action.payload;
    },
    updateWorkflowRatingLocally: (state, action) => {
      const { workflowId, rating } = action.payload;
    
      const updateRowRating = (rows: any[]) =>
        rows.map((row) =>
          row.workflowId === workflowId
            ? { ...row, rating }
            : row
        );
    
      state.workflowsTable.rows = updateRowRating(state.workflowsTable.rows);
      state.workflowsTable.filteredRows = updateRowRating(state.workflowsTable.filteredRows);
      state.workflowsTable.visibleRows = updateRowRating(state.workflowsTable.visibleRows);
    },    
  }
})

export const {setParallel, setWorkflowsTable, setScheduledTable, setVisibleTable, setSelectedTab, toggleWorkflowSelection,bulkToggleWorkflowSelection, setGroupBy, 
  setHoveredWorkflow, updateWorkflowRatingLocally
} = monitoringPageSlice.actions;