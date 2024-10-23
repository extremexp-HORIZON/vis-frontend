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


interface IGraphContainer {
  linedata: any
  bardata:any
  filters: IFilter[]
  experimentId: string
  workflowId: string
  columns: VisualColumn[]
  chartType: "line" | "bar" | "scatter"
  setChartType: React.Dispatch<React.SetStateAction<"line" | "bar" | "scatter">>
  xAxis: VisualColumn
  setXAxis: React.Dispatch<React.SetStateAction<VisualColumn>>
  yAxis: VisualColumn[]
  setYAxis: React.Dispatch<React.SetStateAction<VisualColumn[]>>
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
    experimentId,
    workflowId,
    filters,
    chartType,
    setChartType,
    xAxis,
    setXAxis,
    yAxis,
    setYAxis,
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
            originalColumns={columns}
            barGroupBy={barGroupBy}
            setBarGroupBy={setBarGroupBy}
            barAggregation={barAggregation}
            setBarAggregation={setBarAggregation}
            onFetchBarChartData={handleFetchBarChartData}
          />
        )}
        {chartType === "scatter" && <p>Scatter Plot Controls</p>}

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

            // bardata && bardata.length > 0 ? (
            //   <BarChart dataExploration={bardata} />
            // ) : (
            //   <p>No bar chart data available. Please fetch data first.</p> // Display a message if no bardata
            // )
          )}
          {chartType === "scatter" && <p>Scatter Plot</p>}
        </Box>
      </Box>
    </Paper>
  )
}

export default GraphContainer
