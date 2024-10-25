import React, { useState, useEffect } from "react"
import { Box, ButtonGroup, Button, Paper } from "@mui/material"
import LineChart from "../Charts/LineChart"
import ChartButtonGroup from "../ChartControls/ChartButtonGroup"
import LineChartControlPanel from "../Charts/LineChartControlPanel"
import BarChartControlPanel from "../Charts/BarChartControlPanel"
import { fetchDataExploration } from "../../../../store/slices/dataExplorationSlice"
import { IFilter, VisualColumn } from "../../../../shared/models/dataexploration.model"
import BarChart from "../Charts/BarChart"
import { fetchDataExplorationData } from "../../../../shared/models/tasks/data-exploration-task.model"
import { useAppDispatch, useAppSelector } from "../../../../store/store"
import ScatterChartControlPanel from "../Charts/ScatterChartControlPanel"
import ScatterChart from "../Charts/ScatterChart"


interface IGraphContainer {
  linedata: any
  bardata:any
  filters: IFilter[]
  experimentId: string
  workflowId: string
  columns: VisualColumn[]
  originalColumns: VisualColumn[]
  chartType: "line" | "bar" | "scatter"
  setChartType: React.Dispatch<React.SetStateAction<"line" | "bar" | "scatter">>
  xAxis: VisualColumn
  xAxisScatter:VisualColumn
  colorBy: string;
  setColorBy: (colorBy: string) => void;
  setXAxis: React.Dispatch<React.SetStateAction<VisualColumn>>
  setXAxisScatter: React.Dispatch<React.SetStateAction<VisualColumn>>
  yAxis: VisualColumn[]
  yAxisScatter: VisualColumn[]
  setYAxis: React.Dispatch<React.SetStateAction<VisualColumn[]>>
  setYAxisScatter: React.Dispatch<React.SetStateAction<VisualColumn[]>>
  viewMode: "overlay" | "stacked"
  setViewMode: React.Dispatch<React.SetStateAction<"overlay" | "stacked">>
  groupFunction: string
  setGroupFunction: React.Dispatch<React.SetStateAction<string>>
  barGroupBy: string[]
  setBarGroupBy: React.Dispatch<React.SetStateAction<string[]>>
  barAggregation: any
  setBarAggregation: React.Dispatch<React.SetStateAction<any>>
}

const GraphContainer = (props: IGraphContainer) => {

  const {
    linedata,
    bardata,
    columns,
    originalColumns,
    experimentId,
    workflowId,
    filters,
    colorBy,
    setColorBy,
    chartType,
    setChartType,
    xAxis,
    xAxisScatter,
    setXAxis,
    setXAxisScatter,
    yAxis,
    yAxisScatter,
    setYAxis,
    setYAxisScatter,
    viewMode,
    setViewMode,
    groupFunction,
    setGroupFunction,
    barGroupBy,
    setBarGroupBy,
    barAggregation,
    setBarAggregation,
  } = props
  
  

  const dispatch = useAppDispatch()
  

  const handleFetchBarChartData = () => {
    dispatch(
      fetchDataExplorationData({
        query: {
          datasetId: `file://${experimentId}/dataset/${experimentId}_dataset.csv`,
          limit: 1000, // Default row limit
          columns: [], // Include selected columns in the payload
          filters: filters,
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

  


  console.log('bardata',bardata)


  
  return (
    <Paper>
      <Box sx={{ padding: "1rem", position: "relative" }}>
        {/* Container for Chart Buttons and View Mode Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          {/* Chart Selection Buttons */}
          <ChartButtonGroup chartType={chartType} setChartType={setChartType} />

          {/* Spacing between the buttons */}
          <Box sx={{ width: "1rem" }} />

          {/* View Mode Toggle (Overlay/Stacked) */}
          <ButtonGroup variant="contained" aria-label="view mode">
            <Button
              onClick={() => setViewMode("overlay")}
              disabled={viewMode === "overlay"}
            >
              Overlay View
            </Button>
            <Button
              onClick={() => setViewMode("stacked")}
              disabled={viewMode === "stacked"}
            >
              Stacked View
            </Button>
          </ButtonGroup>
        </Box>
        {chartType === "line" && (
          <LineChartControlPanel
            columns={columns}
            xAxis={xAxis}
            setXAxis={setXAxis}
            yAxis={yAxis}
            setYAxis={setYAxis}
            groupFunction={groupFunction}
            setGroupFunction={setGroupFunction}
          />
        )}
        {chartType === "bar" && (
          <BarChartControlPanel
            originalColumns={originalColumns}
            barGroupBy={barGroupBy}
            setBarGroupBy={setBarGroupBy}
            barAggregation={barAggregation}
            setBarAggregation={setBarAggregation}
            onFetchBarChartData={handleFetchBarChartData}
          />
        )}
        {chartType === "scatter" && 
        <ScatterChartControlPanel 
        columns={columns} 
        xAxis={xAxisScatter} 
        setXAxis={setXAxisScatter} 
        yAxis={yAxisScatter} 
        setYAxis={setYAxisScatter} 
        colorBy={colorBy}
        setColorBy={setColorBy}
        />}

        {/* Conditionally Render Chart Based on Selected Type */}
        <Box sx={{ marginTop: "2rem" }}>
          {chartType === "line" && (
            <LineChart
              viewMode={viewMode}
              data={linedata}
              xAxis={xAxis}
              yAxis={yAxis}
              groupFunction={""}
            />
          )}
          {chartType === "bar" && (
            <BarChart dataExploration={bardata} />
          )}
          {chartType === "scatter" && 
           <ScatterChart
           viewMode={viewMode}
           data={linedata}
           xAxis={xAxisScatter}
           yAxis={yAxisScatter}
           colorBy={colorBy}
           setColorBy={setColorBy}
           columns={columns}
         />
          }
        </Box>
      </Box>
    </Paper>
  )
}

export default GraphContainer
