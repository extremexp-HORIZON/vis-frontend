import Paper from "@mui/material/Paper"
import { Vega } from "react-vega"

// Assuming dataExploration is passed as a prop or obtained from elsewhere
const BarChart = ({ dataExploration }) => {
  console.log("dataExplorationBArchaer", dataExploration)
  // Parse the data string from the dataExploration object
  const parsedData = dataExploration.data
  console.log("parasedData", parsedData)

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
  const transformedData = parsedData.flatMap(item =>
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
    description:
      "A grouped bar chart showing different numeric values by category.",
    autosize: { type: "fit", contains: "padding", resize: true },
    width: "container",
    // "height": "auto",
    data: {
      values: transformedData,
    },
    mark: "bar",
    params: [
      {
        name: "industry",
        select: { type: "point", fields: ["type"] }, // Selection on "type" field
        bind: "legend", // Bind this selection to the legend
      },
    ],
    encoding: {
      y: {
        field: xAxisColumn,
        type: "nominal",
        axis: { labelAngle: 0 },
        sort: null, // Sort by the x-axis values
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
          title: col.name, // Use the column name as the tooltip title
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

  return (
    <Paper
      className="Category-Item"
      elevation={2}
      sx={{
        borderRadius: 4,
        width: "inherit",
        display: "flex",
        flexDirection: "column",
        rowGap: 0,
        minWidth: "300px",
        height: "100%",
        overflow: "auto", // Allow scrolling if content is larger than container
        overscrollBehavior: "contain", // Prevent the bounce effect at the edges
        scrollBehavior: "smooth", // Enable smooth scrolling (optional)
      }}
    >
      <Vega spec={specification} actions={false} />
    </Paper>
  )
}

export default BarChart
