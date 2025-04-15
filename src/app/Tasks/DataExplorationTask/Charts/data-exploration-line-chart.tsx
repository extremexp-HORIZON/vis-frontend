import { Box, useTheme, useMediaQuery } from "@mui/material"
import { useEffect, useRef, useState } from "react"
import { cloneDeep } from "lodash" // Import lodash for deep cloning
import { useAppSelector } from "../../../../store/store"
import ResponsiveCardVegaLite from "../../../../shared/components/responsive-card-vegalite"
import LineChartControlPanel from "../ChartControls/data-exploration-line-control"
import InfoMessage from "../../../../shared/components/InfoMessage"
import AssessmentIcon from "@mui/icons-material/Assessment"



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
  const { tab } = useAppSelector(state => state.workflowPage)
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("xl"))

  useEffect(() => {
      const xAxis = tab?.workflowTasks.dataExploration?.controlPanel.xAxis
      const yAxis = tab?.workflowTasks.dataExploration?.controlPanel.yAxis
      const data = tab?.workflowTasks.dataExploration?.chart.data?.data
      const yAxisFields = yAxis?.map(axis => axis.name) // Get the names of the Y-axis fields
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
              field: xAxis?.name,
              type: getColumnType(xAxis ? xAxis.type : ''), // Dynamically determine xAxis type
              axis: { title: `${xAxis?.name}` }, // Title for X-axis
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
        const specs = yAxis?.map(axis => ({
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
              field: xAxis?.name,
              type: getColumnType(xAxis ? xAxis.type : ''), // Dynamically determine xAxis type
              axis: { title: `${xAxis?.name}` }, // Title for X-axis
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
        setChartSpecs(specs ?? []) // Set specs for all Y-axes in stacked mode
      }
    
  }, 
  [
    tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns,
    tab?.workflowTasks.dataExploration?.controlPanel?.xAxis,
    tab?.workflowTasks.dataExploration?.controlPanel?.yAxis,
    tab?.workflowTasks.dataExploration?.controlPanel?.viewMode,
    tab?.workflowTasks.dataExploration?.chart?.data?.data,
  ]) // Watch for changes in these dependencies

  const info = (
    <InfoMessage
      message="Please select x-Axis and y-Axis to display the chart."
      type="info"
      icon={<AssessmentIcon sx={{ fontSize: 40, color: "info.main" }} />}
      fullHeight
  />
  )
  const xAxis = tab?.workflowTasks.dataExploration?.controlPanel?.xAxis
  const yAxis = tab?.workflowTasks.dataExploration?.controlPanel?.yAxis
  
  const hasValidXAxis = xAxis && xAxis.name
  const hasValidYAxis = Array.isArray(yAxis) && yAxis.length > 0
  
  const shouldShowInfoMessage = !hasValidXAxis || !hasValidYAxis
  
  
  

  return (
    <Box sx={{height: "100%"}}>
      {chartSpecs.map((spec, index) => (
        <ResponsiveCardVegaLite
          key={index}
          spec={spec}
          data={{ table: dataCopy }}
          actions={false}
          controlPanel={<LineChartControlPanel/>}
          blinkOnStart={true}
          infoMessage={info}
          showInfoMessage={shouldShowInfoMessage}
          maxHeight={650}
          aspectRatio={isSmallScreen ? 1.9 : 1.4}
        />
      ))}
    </Box>
  ) 
}

export default LineChart
