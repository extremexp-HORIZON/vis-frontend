import React, { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../../../store/store"
import { fetchDataExploration } from "../../../../store/slices/dataExplorationSlice"
import TableExpand from "../DataTable/TableExpand"
import ControlPanel from "../ChartControls/ControlPanel" // Import the new ControlPanel component
import {
  Box,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@mui/material"
import {
  IDataExplorationRequest,
  IFilter,
  VisualColumn,
} from "../../../../shared/models/dataexploration.model" // Ensure correct path
import TableChartIcon from "@mui/icons-material/TableChartSharp"
import AddchartIcon from "@mui/icons-material/Addchart"
import GraphContainer from "./GraphContainer"
import { useParams } from "react-router-dom"
import { IWorkflowTabModel } from "../../../../shared/models/workflow.tab.model"
import { fetchDataExplorationData } from "../../../../shared/models/tasks/data-exploration-task.model"

interface IDataExplorationComponent {
  workflow: IWorkflowTabModel | null
}

const DataExplorationComponent = (props: IDataExplorationComponent) => {
  const { workflow } = props
  const dispatch = useAppDispatch()
  const {} = useAppSelector(state => state.workflowTabs)
  const [columns, setColumns] = useState<any[]>([])
  const [originalColumns, setOriginalColumns] = useState<any>([])
  const [selectedColumns, setSelectedColumns] = useState<any>([])
  const [rowLimit, setRowLimit] = useState(1000)
  const [activeChartTab, setActiveChartTab] = useState(0)
  const [filters, setFilters] = useState<IFilter[]>([])
  const [uniqueColumnValues, setUniqueColumnValues] = useState<string[]>([])
  const { experimentId } = useParams()
  const [xAxis, setXAxis] = useState<VisualColumn>({ name: "", type: "" })
  const [xAxisScatter, setXAxisScatter] = useState<VisualColumn>({ name: "", type: "" })
  const [yAxis, setYAxis] = useState<VisualColumn[]>([])
  const [yAxisScatter, setYAxisScatter] = useState<VisualColumn[]>([])
  const [groupFunction, setGroupFunction] = useState<string>("sum")
  const [barGroupBy, setBarGroupBy] = useState<string[]>([]) // State for bar chart grouping
  const [barAggregation, setBarAggregation] = useState<any>({}) // State for bar chart aggregation
  const [viewMode, setViewMode] = useState<"overlay" | "stacked">("overlay")
  const [chartType, setChartType] = useState<"line" | "bar" | "scatter">("line")
  const [colorBy, setColorBy] = useState('None');



  const taskDependancies = workflow?.workflowTasks.dataExploration
  const workflowId = workflow?.workflowId

  useEffect(() => {
    if (workflow && experimentId) {
      dispatch(
        fetchDataExplorationData({
          query: {
            datasetId: `file://${experimentId}/dataset/${experimentId}_dataset.csv`,
            limit: rowLimit, 
            columns: [], 
            filters: [],
            groupBy: [],
            aggregation: {},
            offset: 0,
          },
          metadata: {
            workflowId: workflowId || "",
            queryCase: "lineChart",
          },
        }),
      );
      dispatch(
        fetchDataExplorationData({
          query: {
            datasetId: `file://${experimentId}/dataset/${experimentId}_dataset.csv`,
            limit: rowLimit, 
            columns: [], 
            filters: [],
            groupBy: [],
            aggregation: {},
            offset: 0,
          },
          metadata: {
            workflowId: workflowId || "",
            queryCase: "barChart",
          },
        }),
      );

    }
    
  }, [])

  useEffect(() => {
    if(taskDependancies?.lineChart.data) {
      setColumns(taskDependancies?.lineChart.data.columns)
      setOriginalColumns(taskDependancies?.lineChart.data.originalColumns) 
      setUniqueColumnValues(taskDependancies?.lineChart.data.uniqueColumnValues)
    }
  }, [taskDependancies?.lineChart.data,xAxis,yAxis,xAxisScatter,yAxisScatter,colorBy])

  useEffect(() => {
    if (taskDependancies?.lineChart.data) {
      if (selectedColumns.length === 0) {
        setSelectedColumns(taskDependancies.lineChart.data.originalColumns.map((col: any) => col.name))
      }
    }
  }, [selectedColumns]) 
  
  const handleFetchData = () => {
    dispatch(
      fetchDataExplorationData({
        query: {
          datasetId: `file://${experimentId}/dataset/${experimentId}_dataset.csv`,
          limit: rowLimit, // Default row limit
          columns: selectedColumns, // Include selected columns in the payload
          filters: filters,
        },
        metadata: {
          workflowId: workflowId || "",
          queryCase: "lineChart",
        },
      }),
    )
  }

 
  return (
    <>
      {console.log("workflow",workflow)}
      <Paper>
        <Box sx={{ display: "flex", height: "100vh" }}>
          {/* Control Panel */}
          <ControlPanel
            originalColumns={originalColumns}
            selectedColumns={selectedColumns}
            setSelectedColumns={setSelectedColumns}
            rowLimit={rowLimit}
            setRowLimit={setRowLimit}
            onFetchData={handleFetchData} // Pass the fetchData function to ControlPanel
            filters={filters}
            setFilters={setFilters}
            uniqueValues={uniqueColumnValues}
          />
          <Box sx={{ flexGrow: 1, overflow: "auto" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "1rem",
              }}
            >
              <Tabs
                value={activeChartTab}
                onChange={(e, newValue) => setActiveChartTab(newValue)}
              >
                <Tab label="Data Table" icon={<TableChartIcon />} />
                <Tab label="Charts" icon={<AddchartIcon />} />
              </Tabs>
            </Box>
            {activeChartTab === 0 && taskDependancies?.lineChart.data && (
              <Box sx={{ width: "100%", height: "100%", overflowX: "auto" }}>
                {" "}
                {/* Enable horizontal scroll */}
                <TableExpand data={taskDependancies?.lineChart.data?.data} columns={taskDependancies?.lineChart.data?.columns || null} datetimeColumn="" />
              </Box>
            )}
            {activeChartTab === 1 && (
              <GraphContainer
                linedata={workflow?.workflowTasks.dataExploration?.lineChart.data?.data}
                bardata={workflow?.workflowTasks.dataExploration?.barChart.data}
                experimentId={experimentId}
                workflowId={workflow.workflowId}
                columns={columns}
                filters={filters}
                chartType={chartType}
                setChartType={setChartType}
                xAxis={xAxis}
                setXAxis={setXAxis}
                colorBy={colorBy}
                setColorBy={setColorBy}

                xAxisScatter={xAxisScatter}
                setXAxisScatter={setXAxisScatter}
                yAxis={yAxis}
                setYAxis={setYAxis}
                yAxisScatter={yAxisScatter}
                setYAxisScatter={setYAxisScatter}
                viewMode={viewMode}
                setViewMode={setViewMode}
                groupFunction={groupFunction}
                setGroupFunction={setGroupFunction}
                barGroupBy={barGroupBy}
                setBarGroupBy={setBarGroupBy}
                barAggregation={barAggregation}
                setBarAggregation={setBarAggregation}
              />
            )}
          </Box>
        </Box>
      </Paper>
    </>
  )
}

export default DataExplorationComponent
