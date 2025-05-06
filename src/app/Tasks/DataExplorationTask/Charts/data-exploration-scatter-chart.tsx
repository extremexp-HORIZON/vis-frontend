import { Box, useTheme, useMediaQuery } from "@mui/material"
import { useEffect } from "react"
import { cloneDeep } from "lodash" // Import lodash for deep cloning
import { useAppDispatch, useAppSelector } from "../../../../store/store"
import ResponsiveCardVegaLite from "../../../../shared/components/responsive-card-vegalite"
import InfoMessage from "../../../../shared/components/InfoMessage"
import AssessmentIcon from "@mui/icons-material/Assessment"
import ScatterChartControlPanel from "../ChartControls/data-exploration-scatter-control"
import Uchart from "./data-exploration-u-chart"
import type { VisualColumn } from "../../../../shared/models/dataexploration.model";
import { defaultDataExplorationQuery } from "../../../../shared/models/dataexploration.model"
import { fetchDataExplorationData } from "../../../../shared/models/tasks/data-exploration-task.model"

const getColumnType = (columnType: string, fieldName?: string) => {
  if (fieldName?.toLowerCase() === "timestamp") return "temporal"
  switch (columnType) {
    case "DOUBLE":
    case "FLOAT":
    case "INTEGER":
      return "quantitative"
    case "LOCAL_DATE_TIME":
      return "temporal"
    case "STRING":
    default:
      return "ordinal"
  }
}


const ScatterChart = () => {
  const { tab } = useAppSelector(state => state.workflowPage)
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("xl"))
  const chartData = tab?.workflowTasks.dataExploration?.scatterChart?.data?.data || []
 useEffect(() => {
    const xAxis = tab?.workflowTasks.dataExploration?.controlPanel.xAxisScatter
    const yAxis = tab?.workflowTasks.dataExploration?.controlPanel.yAxisScatter
    const filters = tab?.workflowTasks.dataExploration?.controlPanel.filters
    const datasetId = tab?.dataTaskTable.selectedItem?.data?.source || ""
    const colorBy = tab?.workflowTasks?.dataExploration?.controlPanel?.colorBy

    const cols = Array.from(
      new Set([
        colorBy?.name,
        xAxis?.name,
        ...(yAxis?.length ? yAxis.map((axis: any) => axis.name) : []),
      ])
    ).filter(Boolean)  ;
     if (!datasetId || !xAxis || !yAxis?.length) return

    dispatch(
      fetchDataExplorationData({
        query: {
          ...defaultDataExplorationQuery,
          datasetId,
          columns: cols,
          filters,
          // limit: 5000,
        },
        metadata: {
          workflowId: tab?.workflowId || "",
          queryCase: "scatterChart",
        },
      })
    )
  }, [
    tab?.workflowTasks.dataExploration?.controlPanel.xAxisScatter,
    tab?.workflowTasks.dataExploration?.controlPanel.yAxisScatter,
    tab?.workflowTasks.dataExploration?.controlPanel.filters,
    tab?.dataTaskTable.selectedItem?.data?.source,
    tab?.workflowTasks.dataExploration?.controlPanel.colorBy,
  ])

 
  

  const info = (
    <InfoMessage
      message="Please select x-Axis, y-Axis and color fields to display the chart."
      type="info"
      icon={<AssessmentIcon sx={{ fontSize: 40, color: "info.main" }} />}
      fullHeight
  />
  )

  const getScatterChartSpec = ({
    data,
    xAxis,
    yAxis,
    displayMode,
    colorBy,
  }: {
    data: any[]
    xAxis: VisualColumn
    yAxis: VisualColumn[]
    displayMode: "overlay" | "stack"
    colorBy: VisualColumn
  }) => {
    const selection = {
      brush: {
        type: "interval",
        encodings: ["x", "y"],
      },
    }
  
    const getColumnType = (column: VisualColumn) => {
      if (column.name.toLowerCase() === "timestamp") return "temporal"
      switch (column.type) {
        case "INTEGER":
        case "FLOAT":
        case "DOUBLE":
          return "quantitative"
        case "LOCAL_DATE_TIME":
          return "temporal"
        default:
          return "ordinal"
      }
    }
  
    const colorField = colorBy?.name
    const colorType = colorBy ? getColumnType(colorBy) : null
    
    if (!xAxis?.name || !yAxis?.length) {
      return { data: { values: [] } } // or throw an error/log
    }
  
    if (displayMode === "stack") {
      return {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        data: { values: cloneDeep(data) },
        selection,
        mark: "point",
        encoding: {
          x: {
            field: xAxis.name,
            type: getColumnType(xAxis),
            axis: { title: xAxis.name },
          },
          y: {
            field: yAxis[0].name,
            type: getColumnType(yAxis[0]),
            axis: { title: yAxis[0].name },
          },
          ...(colorField && {
            color: {
              field: colorField,
              type: colorType,
              legend: { title: colorField },
            },
          }),
          tooltip: [
            { field: xAxis.name, type: getColumnType(xAxis) },
            // { field: yAxis[0].name, type: getColumnType(yAxis[0]) },
            ...(colorField ? [{ field: colorField, type: colorType }] : []),
          ],
        },
      }
    }
  
    // Stacked mode
    const layers = yAxis.map(y => ({
      mark: "point",
      encoding: {
        x: {
          field: xAxis.name,
          type: getColumnType(xAxis),
          axis: { title: xAxis.name },
        },
        y: {
          field: y.name,
          type: getColumnType(y),
          axis: { title: y.name },
        },
        ...(colorField && {
          color: {
            field: colorField,
            type: colorType,
            legend: { title: colorField },
          },
        }),
        tooltip: [
          { field: xAxis.name, type: getColumnType(xAxis) },
          { field: y.name, type: getColumnType(y) },
          ...(colorField ? [{ field: colorField, type: colorType }] : []),
        ],
      },
    }))
  
    return {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      data: { values: cloneDeep(data) },
      selection,
      layer: layers,
    }
  }
  
     
  const xAxis = tab?.workflowTasks.dataExploration?.controlPanel.xAxisScatter
  const yAxis = tab?.workflowTasks.dataExploration?.controlPanel.yAxisScatter
  const colorBy = tab?.workflowTasks?.dataExploration?.controlPanel?.colorBy
  const displayMode = tab?.workflowTasks.dataExploration?.controlPanel?.viewMode || "overlay"
  const hasValidXAxis = xAxis && xAxis.name
  const hasValidYAxis = Array.isArray(yAxis) && yAxis.length > 0
  const hasValidColorBy = colorBy && colorBy.name
  
  const shouldShowInfoMessage = !hasValidXAxis || !hasValidYAxis || !hasValidColorBy
  const umap=tab?.workflowTasks.dataExploration?.controlPanel.umap
  
    return (
        
          <Box sx={{ height: "99%" }}>
          {umap ? (
            <Uchart
            />
          ) :  <ResponsiveCardVegaLite
          spec={getScatterChartSpec({
            data: chartData,
            xAxis: xAxis as VisualColumn,
            yAxis: yAxis as VisualColumn[],
            displayMode: displayMode as "overlay" | "stack",
            colorBy: colorBy as VisualColumn,
          })}
          title={"Scatter Chart"}
          actions={false}
          controlPanel={<ScatterChartControlPanel />}
          blinkOnStart={true}
          infoMessage={info}
          showInfoMessage={shouldShowInfoMessage}
          maxHeight={500}
          aspectRatio={isSmallScreen ? 2.8 : 1.8}
        /> }
         
        </Box>
    );
  
}

export default ScatterChart
