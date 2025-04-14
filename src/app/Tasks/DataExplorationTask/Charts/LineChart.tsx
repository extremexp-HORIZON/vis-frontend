import { Box, Paper, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { VegaLite } from "react-vega"
import { VisualColumn } from "../../../../shared/models/dataexploration.model"
import { cloneDeep } from "lodash" // Import lodash for deep cloning
import ResponsiveVegaLite from "../../../../shared/components/responsive-vegalite"
import { useAppDispatch, useAppSelector } from "../../../../store/store"
import ResponsiveCardVegaLite from "../../../../shared/components/responsive-card-vegalite"
import LineChartControlPanel from "./LineChartControlPanel"



const getColumnType = (columnType: string) => {
  switch (columnType) {
    case "DOUBLE":
    case "FLOAT":
    case "INTEGER":
      return "quantitative" // Numbers -> quantitative
    case "LOCAL_DATE_TIME":
      return "temporal"
    case "STRING":
    default:
      return "nominal" // Text -> nominal or ordinal
  }
}

const LineChart = (
 ) => {

  const [chartSpecs, setChartSpecs] = useState<any[]>([])
  const [dataCopy, setDataCopy] = useState<any[]>([]) // Define dataCopy here
  const dispatch = useAppDispatch()
    const { tab } = useAppSelector(state => state.workflowPage)

  useEffect(() => {
   if (tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns && tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns.length > 0) {
      const xAxis = tab?.workflowTasks.dataExploration?.controlPanel.xAxis
      const yAxis = tab?.workflowTasks.dataExploration?.controlPanel.yAxis
      const data = tab?.workflowTasks.dataExploration?.chart.data?.data
      const yAxisFields = yAxis.map(axis => axis.name) // Get the names of the Y-axis fields
      const dataCopy = cloneDeep(data) // Deep clone the data
      
      setDataCopy(dataCopy)

      // Build the Vega-Lite specifications
      if (tab?.workflowTasks.dataExploration?.controlPanel.viewMode === "overlay") {
        const spec = {
          mark: "line",
          // autosize: { type: "fit", contains: "padding", resize: true },
          // width: 1000,
          // height: 800,
          params: [
            {
              name: "grid",
              select: {
                type: "interval",
                encodings: ["x"], // Enable interval selection for zooming on the x-axis
              },
              bind: "scales",
            },
          ],
          encoding: {
            x: {
              field: xAxis.name,
              type: getColumnType(xAxis.type), // Dynamically determine xAxis type
              axis: { title: `${xAxis.name}` }, // Title for X-axis
            },
            y: {
              field: "value", // Use the value field after folding
              type: "quantitative", // Y-axis type is representative
              axis: { title: "Values" }, // Common title for Y-axis
            },
            color: {
              field: "variable",
              type: "nominal",
              legend: {
                // Add this line if you want to keep the legend in overlay mode
                title: "Variables",
              },
            }, // Color based on the variable
          },
          transform: [
            {
              fold: yAxisFields, // Fold Y-axis fields to render multiple lines
              as: ["variable", "value"], // Rename folded fields to 'variable' and 'value'
            },
          ],
          data: { name: "table" }, // Data for Vega-Lite
        }
        setChartSpecs([spec]) // Set the single spec for overlay mode
      } else {
        // Stacked mode: Create separate specs for each Y-axis
        const specs = yAxis.map(axis => ({
          mark: "line",
          // autosize: { type: "fit", contains: "padding", resize: true },
          // width: 1000,
          params: [
            {
              name: "grid",
              select: {
                type: "interval",
                encodings: ["x"], // Enable interval selection for zooming on the x-axis
              },
              bind: "scales", // Bind to the scales
            },
          ],
          // height: 800 / yAxis.length, // Height for individual stacked charts
          encoding: {
            x: {
              field: xAxis.name,
              type: getColumnType(xAxis.type), // Dynamically determine xAxis type
              axis: { title: `${xAxis.name}` }, // Title for X-axis
            },
            y: {
              field: axis.name, // Each chart corresponds to one Y-axis
              type: getColumnType(axis.type),
              axis: { title: `${axis.name}` }, // Title for each Y-axis
            },
            color: {
              field: "variable",
              type: "nominal",
              legend: null, // This will hide the legend in stacked mode
            }, // Color based on the variable
          },
          data: { name: "table" }, // Data for Vega-Lite
        }))
        setChartSpecs(specs) // Set specs for all Y-axes in stacked mode
      }
    }
  }, [tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns, tab?.workflowTasks.dataExploration?.controlPanel.xAxis, tab?.workflowTasks.dataExploration?.controlPanel.yAxis, tab?.workflowTasks.dataExploration?.controlPanel.viewMode, dataCopy]) // Watch for changes in these dependencies

  return (
    <>
      {chartSpecs.map((spec, index) => (
        <ResponsiveCardVegaLite
          key={index}
          spec={spec}
          data={{ table: dataCopy }}
          actions={false}
          height={tab?.workflowTasks.dataExploration?.controlPanel.viewMode === "overlay" ? 800 : 800 / tab?.workflowTasks.dataExploration?.controlPanel?.yAxis?.length || 800}
          maxHeight={tab?.workflowTasks.dataExploration?.controlPanel.viewMode === "overlay" ? 800 : 800 / tab?.workflowTasks.dataExploration?.controlPanel?.yAxis?.length}
          controlPanel={<LineChartControlPanel/>}
          blinkOnStart={true}
        />
      ))}
    </>
  ) 
}

export default LineChart
