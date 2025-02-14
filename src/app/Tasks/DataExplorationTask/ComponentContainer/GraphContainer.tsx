import React from "react"
import { Box, ButtonGroup, Button, Paper, Pagination } from "@mui/material"
import LineChart from "../Charts/LineChart"
import ChartButtonGroup from "../ChartControls/ChartButtonGroup"
import { VisualColumn } from "../../../../shared/models/dataexploration.model"
import BarChart from "../Charts/BarChart"
import ScatterChartControlPanel from "../Charts/ScatterChartControlPanel"
import ScatterChart from "../Charts/ScatterChart"
import MapChart from "../Charts/MapChart"
import TableExpand from "../DataTable/TableExpand"
import { IWorkflowTabModel } from "../../../../shared/models/workflow.tab.model"

interface IGraphContainer {
  
  chartType: "datatable" | "line" | "bar" | "scatter" | "map"
  setChartType: React.Dispatch<
    React.SetStateAction<"datatable" | "line" | "bar" | "scatter" | "map">
  >
  xAxis: VisualColumn
  xAxisScatter: VisualColumn
  colorBy: string
  setColorBy: (colorBy: string) => void
  yAxis: VisualColumn[]
  yAxisScatter: VisualColumn[]
  
  viewMode: "overlay" | "stacked"
  setViewMode: React.Dispatch<React.SetStateAction<"overlay" | "stacked">>
  
  count: number
  page: number
  onChange: (event: React.ChangeEvent<unknown>, value: number) => void
  workflow: IWorkflowTabModel
}

const GraphContainer = (props: IGraphContainer) => {
  const {
   
    colorBy,
    setColorBy,
    chartType,
    setChartType,
    xAxis,
    xAxisScatter,
    
    yAxis,
    yAxisScatter,
    
    viewMode,
    setViewMode,
    
    count,
    page,
    onChange,
    workflow
  } = props


  return (
    <Paper>
      <Box sx={{ padding: "1rem" }}>
        {/* Container for Chart Buttons and View Mode Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "flex-end",
            flexDirection: "column", // Stack elements verticall
          }}
        >
          {/* Chart Selection Buttons */}
          <ChartButtonGroup chartType={chartType} setChartType={setChartType} />

          {/* Spacing between the buttons */}
          <Box sx={{ width: "1rem", padding: "1rem" }} />

          {/* View Mode Toggle (Overlay/Stacked) */}
          <ButtonGroup
            variant="contained"
            aria-label="view mode"
            sx={{
              display:
                chartType === "map" ||
                chartType === "bar" ||
                chartType === "datatable"
                  ? "none"
                  : "flex",
            }}
          >
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
        

        {/* Conditionally Render Chart Based on Selected Type */}
        <Box sx={{ marginTop: "1rem" }}>

          {chartType === "line" && (
            <LineChart
              viewMode={viewMode}
              data={workflow.workflowTasks.dataExploration?.lineChart.data?.data}
              xAxis={xAxis}
              yAxis={yAxis}
              groupFunction={""}
            />
          )}

          {chartType === "bar" && (  
            <BarChart 
            dataExploration={workflow.workflowTasks.dataExploration?.barChart.data} 
            />
          )}

          {chartType === "scatter" && (
            <ScatterChart
              viewMode={viewMode}
              data={workflow.workflowTasks.dataExploration?.scatterChart.data?.data}
              xAxis={xAxisScatter} 
              yAxis={yAxisScatter}
              colorBy={colorBy}
              setColorBy={setColorBy}
              columns={workflow.workflowTasks.dataExploration?.lineChart.data?.columns||[]}
            />
          )}
          {chartType === "map" && 
          <MapChart rawData={workflow.workflowTasks.dataExploration?.mapChart.data?.data || []}
           />}
          
          {chartType === "datatable" && (
            <Box sx={{ width: "100%", overflowX: "hidden" }}>
              <TableExpand
                data={workflow.workflowTasks.dataExploration?.lineChart.data?.data}
                columns={workflow.workflowTasks.dataExploration?.lineChart.data
                  ?.columns || []}
                datetimeColumn=""
              />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "right",
                  marginTop: "1rem",
                  padding: "1rem",
                }}
              >
                <Pagination
                  count={count}
                  page={page}
                  onChange={onChange}
                  variant="outlined"
                />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  )
}

export default GraphContainer
