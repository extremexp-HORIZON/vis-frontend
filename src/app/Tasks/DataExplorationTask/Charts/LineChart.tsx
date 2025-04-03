import { Box, Paper, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { VegaLite } from "react-vega"
import { VisualColumn } from "../../../../shared/models/dataexploration.model"
import { cloneDeep } from "lodash" // Import lodash for deep cloning
import ResponsiveVegaLite from "../../../../shared/components/responsive-vegalite"

interface LineChartProps {
  viewMode: "overlay" | "stacked"
  data: any[]
  xAxis: VisualColumn | null
  yAxis: VisualColumn[] // Accept array of columns for Y-Axis
  groupFunction: string
}

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

const LineChart = ({
  viewMode,
  data,
  xAxis,
  yAxis,
  groupFunction,
}: LineChartProps) => {

  const [chartSpecs, setChartSpecs] = useState<any[]>([])
  const [dataCopy, setDataCopy] = useState<any[]>([]) // Define dataCopy here

  useEffect(() => {
    if (xAxis && yAxis.length > 0) {
      const yAxisFields = yAxis.map(axis => axis.name) // Get the names of the Y-axis fields
      const dataCopy = cloneDeep(data) // Deep clone the data
      
      setDataCopy(dataCopy)

      // Build the Vega-Lite specifications
      if (viewMode === "overlay") {
        const spec = {
          mark: "line",
          autosize: { type: "fit", contains: "padding", resize: true },
          width: 1000,
          height: 800,
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
              type: getColumnType(yAxis[0].type), // Assume the first yAxis type is representative
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
          autosize: { type: "fit", contains: "padding", resize: true },
          width: 1000,
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
          height: 800 / yAxis.length, // Height for individual stacked charts
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
  }, [xAxis, yAxis, viewMode, groupFunction, data]) // Watch for changes in these dependencies

  return chartSpecs.length > 0 ? (
    <>
      {chartSpecs.map((spec, index) => (
        <ResponsiveVegaLite
          key={index}
          spec={spec}
          data={{ table: dataCopy }}
          actions={false}
          height={viewMode === "overlay" ? 800 : 800 / yAxis.length}
          maxHeight={viewMode === "overlay" ? 800 : 800 / yAxis.length}
        />
      ))}
    </>
  ) : (
    <Box sx={{ display: "flex", height: "20rem", justifyContent: "center", alignItems: "center" }}>
    <Typography align="center" fontWeight="bold">Select x-Axis and y-Axis to display the chart.</Typography>
    </Box>
  )
}

export default LineChart
