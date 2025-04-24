import { Box, useTheme, useMediaQuery, Typography } from "@mui/material"
import { useEffect, useRef, useState } from "react"
import { cloneDeep } from "lodash" // Import lodash for deep cloning
import { useAppSelector } from "../../../../store/store"
import ResponsiveCardVegaLite from "../../../../shared/components/responsive-card-vegalite"
import InfoMessage from "../../../../shared/components/InfoMessage"
import AssessmentIcon from "@mui/icons-material/Assessment"
import ScatterChartControlPanel from "../ChartControls/data-exploration-scatter-control"
import Uchart from "./data-exploration-u-chart"

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

const ScatterChart = (
 ) => {

  const [chartSpecs, setChartSpecs] = useState<any[]>([])
  const [dataCopy, setDataCopy] = useState<any[]>([]) // Define dataCopy here
  const { tab } = useAppSelector(state => state.workflowPage)
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("xl"))

  useEffect(() => {
      const xAxis = tab?.workflowTasks.dataExploration?.controlPanel.xAxisScatter
      const yAxis = tab?.workflowTasks.dataExploration?.controlPanel.yAxisScatter
      const data = tab?.workflowTasks.dataExploration?.chart.data?.data
      const yAxisFields = yAxis?.map(axis => axis.name) // Get the names of the Y-axis fields
      const colorBy = tab?.workflowTasks?.dataExploration?.controlPanel?.colorBy?.name  
      const dataCopy = cloneDeep(data) // Deep clone the data
      setDataCopy(dataCopy)

      // Build the Vega-Lite specifications
      if (tab?.workflowTasks.dataExploration?.controlPanel.viewMode === "overlay") {
        const spec = {
          mark: "point",
          // autosize: { type: "fit", contains: "padding", resize: true },
          // width: 1000,
          // height: 800,
          selection: {
            paintbrush: {
              type: 'multi',
              on: 'mouseover',
            //   nearest: true
            }
          },
         
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
              condition: {
                selection: 'paintbrush',
                field: colorBy && colorBy !== "None" ? colorBy : 'variable',
                type: getColumnType(tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns.find(column => column.name === colorBy)?.type || 'nominal'),
                title: colorBy!=="None" ? colorBy: "Variables"
              },
              value: 'grey' // Default color for unselected points
            },
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
          mark: "point",
          // autosize: { type: "fit", contains: "padding", resize: true },
          // width: 1000,
         selection: {
           paintbrush: {
             type: 'multi',
             on: 'mouseover',
           //   nearest: true
           }
         },
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
              condition: {
                selection: 'paintbrush',
                field: colorBy && colorBy !== "None" ? colorBy : 'variable',
                type: getColumnType(tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns.find(column => column.name === colorBy)?.type || 'nominal'),
                title: colorBy!=="None" ? colorBy: "variable"
              },
              value: 'grey'
            },
          },
          data: { name: "table" }, // Data for Vega-Lite
        }))
        setChartSpecs(specs ?? []) // Set specs for all Y-axes in stacked mode
      }
    
  }, 
  [
    tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns,
    tab?.workflowTasks.dataExploration?.controlPanel?.xAxisScatter,
    tab?.workflowTasks.dataExploration?.controlPanel?.yAxisScatter,
    tab?.workflowTasks.dataExploration?.controlPanel?.viewMode,
    tab?.workflowTasks.dataExploration?.chart?.data?.data,
    tab?.workflowTasks.dataExploration?.controlPanel?.colorBy,
  ]) // Watch for changes in these dependencies

  const info = (
    <InfoMessage
      message="Please select x-Axis and y-Axis to display the chart."
      type="info"
      icon={<AssessmentIcon sx={{ fontSize: 40, color: "info.main" }} />}
      fullHeight
  />
  )
  const xAxis = tab?.workflowTasks.dataExploration?.controlPanel?.xAxisScatter
  const yAxis = tab?.workflowTasks.dataExploration?.controlPanel?.yAxisScatter
  
  const hasValidXAxis = xAxis && xAxis.name
  const hasValidYAxis = Array.isArray(yAxis) && yAxis.length > 0
  
  const shouldShowInfoMessage = !hasValidXAxis || !hasValidYAxis
  
  const umap=tab?.workflowTasks.dataExploration?.controlPanel.umap
  

    return (
      <Box sx={{ height: "100%" }}>
        {umap ? (
          <ResponsiveCardVegaLite
          spec={[]}
          data={{ table: dataCopy }}
          actions={false}
          controlPanel={<ScatterChartControlPanel />}
          blinkOnStart={true}
          infoMessage={info}
          showInfoMessage={false}
          maxHeight={500}
          aspectRatio={isSmallScreen ? 2.8 : 1.8}
        />
         
        ) : (
          chartSpecs.map((spec, index) => (
            <ResponsiveCardVegaLite
              key={index}
              spec={spec}
              data={{ table: dataCopy }}
              actions={false}
              controlPanel={<ScatterChartControlPanel />}
              blinkOnStart={true}
              infoMessage={info}
              showInfoMessage={shouldShowInfoMessage}
              maxHeight={500}
              aspectRatio={isSmallScreen ? 2.8 : 1.8}
            />
          ))
        )}
      </Box>
    )
  
}

export default ScatterChart
