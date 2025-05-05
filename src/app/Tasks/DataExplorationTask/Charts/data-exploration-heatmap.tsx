import { Box, useTheme, useMediaQuery } from "@mui/material"
import ResponsiveCardVegaLite from "../../../../shared/components/responsive-card-vegalite"
import BarChartControlPanel from "../ChartControls/data-exploration-bar-control"
import InfoMessage from "../../../../shared/components/InfoMessage"
import AssessmentIcon from "@mui/icons-material/Assessment"
import { useAppDispatch, useAppSelector } from "../../../../store/store"
import { useEffect } from "react"
import { fetchDataExplorationData } from "../../../../shared/models/tasks/data-exploration-task.model"
import { defaultDataExplorationQuery } from "../../../../shared/models/dataexploration.model"
import HeatMapControlPanel from "../ChartControls/data-exploration-heatmap-control"

// Assuming dataExploration is passed as a prop or obtained from elsewhere
const HeatMap = () => {
  const dispatch = useAppDispatch()
  const {tab} = useAppSelector(state => state.workflowPage)
    const theme = useTheme()
    
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("xl"))
    useEffect(() => {
      const groupBy = tab?.workflowTasks.dataExploration?.controlPanel.barGroupByHeat
      const aggregation = tab?.workflowTasks.dataExploration?.controlPanel.barAggregationHeat
      const datasetId = tab?.dataTaskTable.selectedItem?.data?.source || ""
      const filters = tab?.workflowTasks.dataExploration?.controlPanel.filters
    
      if (!datasetId || !groupBy?.length || !Object.keys(aggregation || {}).length ) {
        return // Don't dispatch if missing dataset, groupBy, or aggregation
      }
    
      dispatch(
        fetchDataExplorationData({
          query: {
            ...defaultDataExplorationQuery,
            datasetId,
            groupBy,
            aggregation,
            filters
          },
          metadata: {
            workflowId: tab?.workflowId || "",
            queryCase: "heatChart",
          },
        })
      )
    }, [
      tab?.workflowTasks.dataExploration?.controlPanel.barGroupByHeat,
      tab?.workflowTasks.dataExploration?.controlPanel.barAggregationHeat,
      tab?.dataTaskTable.selectedItem?.data?.source,
      tab?.workflowTasks.dataExploration?.controlPanel.filters

    ])
    

  
  

  const columns = tab?.workflowTasks.dataExploration?.heatChart.data?.columns
  const xAxisColumn = columns?.find(col => col.type === "STRING")?.name
  const aggregation = tab?.workflowTasks.dataExploration?.controlPanel.barAggregationHeat
  console.log("Aggregation:", aggregation)

  const categoricalColumns = columns?.filter(
    col => col.type === "STRING" && col.name !== xAxisColumn,
  )
  const yAxisColumns = columns
    ?.filter(col => col.type === "DOUBLE")
    .map(col => col.name)

  // Transform the data into a suitable format for grouped bar chart
  const transformedData = tab?.workflowTasks.dataExploration?.heatChart.data?.data.flatMap((item: { [x: string]: any }) =>
    yAxisColumns?.map(col => ({
      [xAxisColumn as string]: item[xAxisColumn as string],
      type: col, // Each numeric column becomes a type/category
      value: item[col], // The value for each column
      ...Object.fromEntries(
        (categoricalColumns || []).map(catCol => [catCol.name, item[catCol.name]]),
      ), // Include all categorical values
    })),
  )

  const groupByFields = tab?.workflowTasks.dataExploration?.controlPanel.barGroupByHeat || [];

  let specification;
  
  if (groupByFields.length === 2) {
    // Render heatmap
    specification = {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      description: "Heatmap showing aggregation values by two categorical variables.",
      data: { values: transformedData },
      mark: "rect",
      encoding: {
        x: {
          field: groupByFields[0],
          type: "nominal",
          axis: { title: groupByFields[0] }
        },
        y: {
          field: groupByFields[1],
          type: "nominal",
          axis: { title: groupByFields[1] }
        },
        color: {
          field: "value",
          type: "quantitative",
          title: "Value"
        },
        tooltip: [
          { field: groupByFields[0], type: "nominal" },
          { field: groupByFields[1], type: "nominal" },
          { field: "value", type: "quantitative" },
          { field: "type", type: "nominal" },
        ]
      }
    };
  } else {
    // Fallback to your current bar chart spec
    specification = {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      description: "A grouped bar chart showing different numeric values by category.",
      autosize: { type: "fit", contains: "padding", resize: true },
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
            tickCount: Math.floor(500 / 20),
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
          ...(categoricalColumns || []).map(col => ({
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
    };
  }
  
    

  

  const info = (
    <InfoMessage
      message="Please select both Group By and Aggregation to display the chart."

      type="info"
      icon={<AssessmentIcon sx={{ fontSize: 40, color: "info.main" }} />}
      fullHeight
  />
  
  )
  const shouldShowInfoMessage =
  tab?.workflowTasks.dataExploration?.controlPanel.barGroupByHeat.length === 0 || Object.keys(tab?.workflowTasks.dataExploration?.controlPanel.barAggregationHeat).length === 0
  return (
    <Box sx={{height: "99%"}}>
      <ResponsiveCardVegaLite 
        spec={specification} 
        actions={false} 
        title={"Heatmap"}
        maxHeight={500}
        aspectRatio={isSmallScreen ? 2.8 : 1.8}
        controlPanel={<HeatMapControlPanel/>}
        infoMessage={info}
        showInfoMessage={shouldShowInfoMessage}
      />
    </Box>
  )
}

export default HeatMap
