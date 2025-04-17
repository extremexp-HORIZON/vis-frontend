import { Box, Typography, useTheme, useMediaQuery } from "@mui/material"
import ResponsiveCardVegaLite from "../../../../shared/components/responsive-card-vegalite"
import BarChartControlPanel from "../ChartControls/data-exploration-bar-control"
import InfoMessage from "../../../../shared/components/InfoMessage"
import AssessmentIcon from "@mui/icons-material/Assessment"
import { useAppDispatch, useAppSelector } from "../../../../store/store"

// Assuming dataExploration is passed as a prop or obtained from elsewhere
const BarChart = ({ dataExploration,barGroupBy,barAggregation }) => {
  const dispatch = useAppDispatch()
  const {tab} = useAppSelector(state => state.workflowPage)
  console.log("bar",barAggregation,barGroupBy)
    const theme = useTheme()
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("xl"))

  
  
  // Parse the data string from the dataExploration object
  const parsedData = dataExploration.data

  // Extract the columns information
  const columns = dataExploration.columns

  // Identify the column for the x-axis (which should be a string)
  const xAxisColumn = columns.find(col => col.type === "STRING").name

  // Identify all other categorical columns
  const categoricalColumns = columns.filter(
    col => col.type === "STRING" && col.name !== xAxisColumn,
  )

  // Identify the columns for the y-axis (which should be numeric, DOUBLE)
  const yAxisColumns = columns
    .filter(col => col.type === "DOUBLE")
    .map(col => col.name)

  // Transform the data into a suitable format for grouped bar chart
  const transformedData = tab?.workflowTasks.dataExploration?.chart.data?.data.flatMap(item =>
    yAxisColumns.map(col => ({
      [xAxisColumn]: item[xAxisColumn],
      type: col, // Each numeric column becomes a type/category
      value: item[col], // The value for each column
      ...Object.fromEntries(
        categoricalColumns.map(catCol => [catCol.name, item[catCol.name]]),
      ), // Include all categorical values
    })),
  )

  // Create a dynamic Vega specification
  const specification = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "A grouped bar chart showing different numeric values by category.",
    autosize: { type: "fit", contains: "padding", resize: true },
    width: 1000,
    height: 800, // Fixed height
    data: { values: transformedData },
    mark: "bar",
    params: [
      {
        name: "industry",
        select: { type: "point", fields: ["type"] },
        bind: "legend",
      },
    ],
    encoding: {
      y: {
        field: xAxisColumn,
        type: "nominal",
        axis: {
          labelAngle: 0,
          labelLimit: 100,
          labelOverlap: "parity",
          tickCount: Math.floor(850 / 20), // Show only ticks that fit within height 800
        },
        sort: null,
      },
      x: {
        field: "value",
        type: "quantitative",
        title: "Value",
      },
      color: {
        field: "type",
        type: "nominal",
        title: "Metric",
      },
      xOffset: {
        field: "type",
        type: "nominal",
      },
      tooltip: [
        { field: xAxisColumn, type: "nominal", title: xAxisColumn },
        ...categoricalColumns.map(col => ({
          field: col.name,
          type: "nominal",
          title: col.name,
        })),
        { field: "value", type: "quantitative", title: "Value" },
        { field: "type", type: "nominal", title: "Metric" },
      ],
      opacity: {
        condition: { param: "industry", value: 1 },
        value: 0.01,
      },
    },
  }
  

  const info = (
    <InfoMessage
      message="Please select both Group By and Aggregation to display the chart."

      type="info"
      icon={<AssessmentIcon sx={{ fontSize: 40, color: "info.main" }} />}
      fullHeight
  />
  
  )
  const shouldShowInfoMessage = !barGroupBy || !barAggregation

  return (
    <Box sx={{height: "100%"}}>
      <ResponsiveCardVegaLite 
        spec={specification} 
        actions={false} 
        maxHeight={500}
        aspectRatio={isSmallScreen ? 2.8 : 1.8}
        controlPanel={<BarChartControlPanel/>}
        infoMessage={info}
        showInfoMessage={shouldShowInfoMessage}
      />
    </Box>
  )
}

export default BarChart
