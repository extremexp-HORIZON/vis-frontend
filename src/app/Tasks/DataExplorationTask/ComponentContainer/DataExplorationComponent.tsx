import React, { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../../../store/store"
import ControlPanel from "../ChartControls/ControlPanel" // Import the new ControlPanel component
import { Box, CircularProgress, Grid, Tooltip, Typography } from "@mui/material"
import {
  defaultDataExplorationQuery,
  IFilter,
  VisualColumn,
} from "../../../../shared/models/dataexploration.model" // Ensure correct path
import GraphContainer from "./GraphContainer"
import { useParams } from "react-router-dom"
import { IWorkflowTabModel } from "../../../../shared/models/workflow.tab.model"
import { fetchDataExplorationData, fetchMetaData } from "../../../../shared/models/tasks/data-exploration-task.model"
import { grey } from "@mui/material/colors"
import InfoIcon from "@mui/icons-material/Info"
import MultiTimeSeriesVisualization from "../multi-ts-visualization/MultiTimeSeriesVisualization"

interface IDataExplorationComponent {
  workflow: IWorkflowTabModel | null
}
const DataExplorationComponent = (props: IDataExplorationComponent) => {
  const { workflow } = props
  const dispatch = useAppDispatch()
  const {} = useAppSelector(state => state.workflowTabs)
  const [columns, setColumns] = useState<any[]>([])
  const [selectedColumns, setSelectedColumns] = useState<any>([])
  const [rowLimit, setRowLimit] = useState(1000)
  const [filters, setFilters] = useState<IFilter[]>([])
  const { experimentId } = useParams()
  const [xAxis, setXAxis] = useState<VisualColumn>({ name: "", type: "" })
  const [lat,setLat] = useState<string>("")
  const [lon,setLon] = useState<string>("")


  const [xAxisScatter, setXAxisScatter] = useState<VisualColumn>({
    name: "",
    type: "",
  })
  const [yAxis, setYAxis] = useState<VisualColumn[]>([])
  const [yAxisScatter, setYAxisScatter] = useState<VisualColumn[]>([])
  const [barGroupBy, setBarGroupBy] = useState<string[]>([])
  const [barAggregation, setBarAggregation] = useState<any>({})
  const [viewMode, setViewMode] = useState<"overlay" | "stacked">("overlay")
  const [chartType, setChartType] = useState<
    "datatable" | "line" | "bar" | "scatter" | "map"
  >("datatable")
  const [colorBy, setColorBy] = useState("None")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 100
  const totalPages = Math.ceil(
    (workflow?.workflowTasks?.dataExploration?.lineChart?.data?.querySize ??
      0) / pageSize,
  )
  const taskDependancies = workflow?.workflowTasks.dataExploration
  const workflowId = workflow?.workflowId
  // const [offset, setOffset] = useState((currentPage - 1) * pageSize)

  //mapcontrols
    const [colorByMap, setColorByMap] = useState<string | null>("None") // Set initial color to 'default'
      const [tripsMode, setTripsMode] = useState<boolean>(false)
        const [selectedColumnsMap, setSelectedColumnsMap] = useState<string[]>([])
      
    
  


  const handleFetchData = () => {
    if (
      barGroupBy.length > 0 &&
      Object.keys(barAggregation).length > 0 &&
      chartType === "bar"
    ) {
      dispatch(
        fetchDataExplorationData({
          query: {
            datasetId: `${experimentId}/dataset/${experimentId}_dataset.csv`,
            limit: 0, // Default row limit
            columns: [], // Include selected columns in the payload
            filters: [],
            groupBy: barGroupBy,
            aggregation: barAggregation,
          },
          metadata: {
            workflowId: workflowId || "",
            queryCase: "barChart",
          },
        }),
      )
    }
    if (chartType === "line" || chartType === "datatable" || chartType === "scatter") {
      dispatch(
        fetchDataExplorationData({
          query: {
            datasetId: `${experimentId}/dataset/${experimentId}_dataset.csv`,
            limit: pageSize, // Default row limit
            columns: selectedColumns, // Include selected columns in the payload
            filters: filters,
            offset: 0,
            groupBy: ["handlefetchdata gia line,"],
          },
          metadata: {
            workflowId: workflowId || "",
            queryCase: "lineChart",
          },
        }),
      )
      dispatch(
        fetchDataExplorationData({
          query: {
            datasetId: `${experimentId}/dataset/${experimentId}_dataset.csv`,
            limit: 2000, // Default row limit
            columns: selectedColumns, // Include selected columns in the payload
            filters: filters,
            offset: 0,
            groupBy: ["handlefetchdata gia ,scatter"],
          },
          metadata: {
            workflowId: workflowId || "",
            queryCase: "scatterChart",
          },
        }),
      )
    }
  }

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setCurrentPage(value)
  }
  useEffect(() => {
    if (workflow && experimentId) {
      if (experimentId === "ideko") {
        if (
          workflow.workflowTasks.dataExploration?.multipleTimeSeries.data ===
          null
        ) {
          dispatch(
            fetchDataExplorationData({
              query: {
                ...defaultDataExplorationQuery,
                datasetId: `${experimentId}/datasets/LG600B6-100636-IDK`,
              },
              metadata: {
                workflowId: workflowId || "",
                queryCase: "multipleTimeSeries",
              },
            }),
          )
        }
      } else {
        if (workflow.workflowTasks.dataExploration?.barChart.data === null) {
          dispatch(
            fetchDataExplorationData({
              query: {
                datasetId: `${experimentId}/dataset/${experimentId}_dataset.csv`,
                limit: 10,
                columns: [],
                filters: [],
                groupBy: ["arxiko gia bar"],
                aggregation: {},
                offset: 0,
              },
              metadata: {
                workflowId: workflowId || "",
                queryCase: "barChart",
              },
            }),
          )
        }
        if (workflow.workflowTasks.dataExploration?.metaData.data === null) {
          dispatch(
            fetchMetaData({
              query: {
                
                datasetId: `${experimentId}/dataset/${experimentId}_dataset.csv`,
                limit: 10,
                columns: [],
                filters: [],
                groupBy: [],
                aggregation: {},
                offset: 0,
              },
              metadata: {
                workflowId: workflowId || "",
                queryCase: "metaData",
              },
            }),
          )
        }
        if (workflow.workflowTasks.dataExploration?.scatterChart.data === null) {
          dispatch(
            fetchDataExplorationData({
              query: {
                datasetId: `${experimentId}/dataset/${experimentId}_dataset.csv`,
                limit: 2000,
                columns: [],
                filters: [],
                groupBy: ["arxikogiascatter"],
                aggregation: {},
                offset: 0,
              },
              metadata: {
                workflowId: workflowId || "",
                queryCase: "scatterChart",
              },
            }),
          )
        }
        if (workflow.workflowTasks.dataExploration?.mapChart.data === null) {
          dispatch(
                    fetchDataExplorationData({
                      query: {
                        datasetId: "/test/newresult.csv",
                        limit: 0,
                        columns: [],
                        filters: [],
                        groupBy: ["arxiko gia map"],
                        aggregation: {},
                        offset: 0,
                      },
                      metadata: {
                        workflowId: workflowId || "",
                        queryCase: "mapChart",
                      },
                    }),
                  )
        }
      }
    }
  }, [])

  useEffect(() => {
    if (taskDependancies?.lineChart.data) {
      setColumns(taskDependancies?.lineChart.data.columns)
    }
  }, [taskDependancies?.lineChart.data])

  useEffect(() => {
    if (taskDependancies?.lineChart.data) {
      if (selectedColumns.length === 0) {
        setSelectedColumns(
          taskDependancies.lineChart.data.originalColumns.map(
            (col: any) => col.name,
          ),
        )
      }
    }
  }, [selectedColumns])

  useEffect(() => {
    if (barGroupBy.length > 0 && Object.keys(barAggregation).length > 0) {
      handleFetchData()
    }
  }, [barGroupBy, barAggregation])

  useEffect(() => {
    if (workflow && experimentId) {
      if (filters.length > 0) {
        setCurrentPage(1)
      }
      const offset = (currentPage - 1) * pageSize
      dispatch(
        fetchDataExplorationData({
          query: {
            datasetId: `${experimentId}/dataset/${experimentId}_dataset.csv`,
            limit: pageSize,
            columns: selectedColumns,
            filters: filters,
            groupBy: ["linechart meta apo filter kai pagination"],
            aggregation: {},
            offset: offset,
          },
          metadata: {
            workflowId: workflowId || "",
            queryCase: "lineChart",
          },
        }),
      )
     
    }
  }, [currentPage, pageSize, filters])
  useEffect(() => {
    dispatch(
      fetchDataExplorationData({
        query: {
          datasetId: `${experimentId}/dataset/${experimentId}_dataset.csv`,
          limit: 2000, // Default row limit
          columns: selectedColumns, // Include selected columns in the payload
          filters: filters,
          offset: 0,
          groupBy: ["scatterchart meta apo filter"],
        },
        metadata: {
          workflowId: workflowId || "",
          queryCase: "scatterChart",
        },
      }),
    )
  }, [filters])

  return (
    <Grid
      className="Category-Item"
      sx={{
        borderRadius: 4,
        display: "flex",
        flexDirection: "column",
        minWidth: "300px",
        overflow: "hidden",
        border: `1px solid ${grey[400]}`,
        height: 1100,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          height: "3.5rem",
          display: "flex",
          alignItems: "center",
          backgroundColor: grey[300],
        }}
      >
        <Typography fontSize={"1.2rem"}>Data Exploration of {experimentId}</Typography>
        <Box sx={{ flex: 1 }} />
        <Box sx={{ position: "relative" }}>
          <Tooltip title="Explore your data through interactive charts and tables. Use the control panel to filter and select columns.">
            <InfoIcon sx={{ padding: 1, zIndex: 100, color: grey[600] }} />
          </Tooltip>
          {(workflow?.workflowTasks.dataExploration?.multipleTimeSeries
            .loading ||
            workflow?.workflowTasks.dataExploration?.lineChart.loading 
            // || workflow?.workflowTasks.dataExploration?.scatterChart.loading 
            // || workflow?.workflowTasks.dataExploration?.barChart.loading
          || workflow?.workflowTasks.dataExploration?.mapChart.loading) && (
            <CircularProgress
              size={28}
              sx={{
                position: "absolute",
                top: 6,
                left: 6,
                zIndex: 0,
              }}
            />
          )}
        </Box>
      </Box>

      {/* Main Content */}
      {experimentId === "ideko" ? (
        <MultiTimeSeriesVisualization
          multipleTimeSeries={
            workflow?.workflowTasks.dataExploration?.multipleTimeSeries || null
          }
        />
      ) : (
        <Box sx={{ display: "flex", height: "100vh",padding: 1 }}>
          {/* Control Panel */}
          <ControlPanel
              originalColumns={workflow?.workflowTasks.dataExploration?.metaData.data
                ?.originalColumns || []}
              selectedColumns={selectedColumns}
              setSelectedColumns={setSelectedColumns}
              onFetchData={handleFetchData}
              filters={filters}
              setFilters={setFilters}
              uniqueValues={workflow?.workflowTasks.dataExploration?.metaData.data
                ?.uniqueColumnValues || []}
              chartType={chartType}
              columns={columns}
              xAxis={xAxis}
              setXAxis={setXAxis}
              yAxis={yAxis}
              setYAxis={setYAxis}
              barGroupBy={barGroupBy}
              setBarGroupBy={setBarGroupBy}
              barAggregation={barAggregation}
              setBarAggregation={setBarAggregation} 
              yAxisScatter={yAxisScatter} 
              setYAxisScatter={setYAxisScatter}
              xAxisScatter={xAxisScatter} 
              setXAxisScatter={setXAxisScatter} 
              colorBy={colorBy} 
              setColorBy={setColorBy}   
              datamap={workflow.workflowTasks.dataExploration?.mapChart.data?.data ||
                []}   
                
              colorByMap={colorByMap}
              setColorByMap={setColorByMap}
              columnsMap={workflow.workflowTasks.dataExploration?.mapChart.data?.originalColumns.filter(col=>col.type==="STRING").map(col=>col.name)}
              columnsMapDouble={workflow.workflowTasks.dataExploration?.mapChart.data?.originalColumns.filter(col=>col.type==="DOUBLE").map(col=>col.name)}
              tripsMode={tripsMode}
              setTripsMode={setTripsMode}
              selectedColumnsMap={selectedColumnsMap} 
              setSelectedColumnsMap={setSelectedColumnsMap}
              lat={lat}
              setLat={setLat}
              lon={lon}
              setLon={setLon}
              />

          {/* Graph Container */}
          <Box sx={{ flex: 1, overflow: "auto" }}>
            {workflow?.workflowTasks.dataExploration?.lineChart.data && workflow?.workflowTasks.dataExploration?.metaData.data &&
            workflow?.workflowTasks.dataExploration?.scatterChart.data && workflow?.workflowTasks.dataExploration?.mapChart.data && (
              <GraphContainer
                  workflow={workflow}
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  chartType={chartType}
                  setChartType={setChartType}
                  xAxis={xAxis}
                  colorBy={colorBy}
                  setColorBy={setColorBy}
                  xAxisScatter={xAxisScatter}
                  yAxis={yAxis}
                  yAxisScatter={yAxisScatter}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  colorByMap={colorByMap}
                  tripsMode={tripsMode}
                  selectedColumnsMap={selectedColumnsMap}
                  barGroupBy={barGroupBy}
                  barAggregation={barAggregation}
                  lat={lat}
                  lon={lon}
                             />
            )}
          </Box>
        </Box>
      )}
    </Grid>
  )
}

export default DataExplorationComponent
