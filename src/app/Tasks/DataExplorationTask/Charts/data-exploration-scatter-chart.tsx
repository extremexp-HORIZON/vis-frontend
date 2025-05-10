import { Box, useTheme, useMediaQuery, Grid } from "@mui/material"
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

const MAX_UNIQUE_VALUES = 50

const getUniqueValueCount = (data: any[], field: string): number => {
  const values = new Set()
  data.forEach(row => values.add(row[field]))
  return values.size
}

const isTooManyUniqueValues = (field: VisualColumn | undefined, data: any[]) =>
  field?.type === "STRING" && getUniqueValueCount(data, field.name) > MAX_UNIQUE_VALUES


const getScatterChartOverlaySpec = ({
  data,
  xAxis,
  yAxis,
  colorBy,
}: {
  data: any[]
  xAxis: VisualColumn
  yAxis: VisualColumn[]
  colorBy?: VisualColumn
}) => {
  const colorField = colorBy?.name
  const colorType = colorBy ? getColumnType(colorBy.type, colorBy.name) : undefined

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: { values: cloneDeep(data) },
    selection: {
      brush: { type: "interval", encodings: ["x", "y"] },
    },
    layer: yAxis.map(y => ({
      mark: "point",
      encoding: {
        
        x: {
          field: xAxis.name,
          type: getColumnType(xAxis.type, xAxis.name),
          axis: {
            title: xAxis.name,
            labelLimit: 30,
            labelOverlap: true
          }
          
        },
        y: {
          field: y.name,
          type: getColumnType(y.type, y.name),
          axis: { title: y.name },
        },
        ...(colorField && !isTooManyUniqueValues(colorBy, data) && {
          color: {
            field: colorField,
            type: colorType,
            legend: {
              title: colorField,
              labelLimit: 20,
              symbolLimit: 50
            },            scale: {
              range: ["#ffffcc", "#a1dab4", "#41b6c4", "#225ea8"]
            }
          },
        }),
        tooltip: [
          { field: xAxis.name, type: getColumnType(xAxis.type, xAxis.name) },
          { field: y.name, type: getColumnType(y.type, y.name) },
          ...(colorField ? [{ field: colorField, type: colorType }] : []),
        ],
      },
    })),
  }
}

const getSingleScatterSpec = ({
  data,
  xAxis,
  y,
  colorBy,
}: {
  data: any[]
  xAxis: VisualColumn
  y: VisualColumn
  colorBy?: VisualColumn
}) => {
  const colorField = colorBy?.name
  const colorType = colorBy ? getColumnType(colorBy.type, colorBy.name) : undefined

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: { values: cloneDeep(data) },
    mark: "point",
    encoding: {
      x: {
        field: xAxis.name,
        type: getColumnType(xAxis.type, xAxis.name),
        axis: { title: xAxis.name },
      },
      y: {
        field: y.name,
        type: getColumnType(y.type, y.name),
        axis: { title: y.name },
      },
      ...(colorField && {
        color: {
          field: colorField,
          type: colorType,
          legend: { title: colorField },
          scale: {
              range: ["#ffffcc", "#a1dab4", "#41b6c4", "#225ea8"]
            }
        },
      }),
      tooltip: [
        { field: xAxis.name, type: getColumnType(xAxis.type, xAxis.name) },
        { field: y.name, type: getColumnType(y.type, y.name) },
        ...(colorField ? [{ field: colorField, type: colorType }] : []),
      ],
    },
  }
}


const ScatterChart = () => {
  const { tab } = useAppSelector(state => state.workflowPage)
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("xl"))

  const chartData = tab?.workflowTasks.dataExploration?.scatterChart?.data?.data || []
  const xAxis = tab?.workflowTasks.dataExploration?.controlPanel.xAxisScatter
  const yAxis = tab?.workflowTasks.dataExploration?.controlPanel.yAxisScatter
  const colorBy = tab?.workflowTasks?.dataExploration?.controlPanel?.colorBy
  const displayMode = tab?.workflowTasks.dataExploration?.controlPanel?.viewMode || "overlay"
  const umap = tab?.workflowTasks.dataExploration?.controlPanel.umap

  useEffect(() => {
    const filters = tab?.workflowTasks.dataExploration?.controlPanel.filters
    const datasetId = tab?.dataTaskTable.selectedItem?.data?.source || ""

    const cols = Array.from(
      new Set([
        colorBy?.name,
        xAxis?.name,
        ...(yAxis?.length ? yAxis.map((axis: any) => axis.name) : []),
      ])
    ).filter(Boolean)

    if (!datasetId || !xAxis || !yAxis?.length) return

    dispatch(
      fetchDataExplorationData({
        query: {
          ...defaultDataExplorationQuery,
          datasetId,
          columns: cols,
          filters,
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

  const hasValidXAxis = xAxis && xAxis.name
  const hasValidYAxis = Array.isArray(yAxis) && yAxis.length > 0
  const hasValidColorBy = colorBy && colorBy.name
  const shouldShowInfoMessage = !hasValidXAxis || !hasValidYAxis || !hasValidColorBy

  return (
    <Box sx={{ height: "99%" }}>
      {umap ? (
        <Uchart />
      ) : shouldShowInfoMessage ? (
        <ResponsiveCardVegaLite
          spec={{}}
          title="Scatter Chart"
          actions={false}
          controlPanel={<ScatterChartControlPanel />}
          infoMessage={info}
          showInfoMessage={true}
          maxHeight={isSmallScreen ? undefined : 500}
          aspectRatio={isSmallScreen ? 2.8 : 1.8}
        />
      ) : displayMode === "overlay" ? (
        <ResponsiveCardVegaLite
          spec={getScatterChartOverlaySpec({
            data: chartData,
            xAxis: xAxis as VisualColumn,
            yAxis: yAxis as VisualColumn[],
            colorBy: colorBy as VisualColumn,
          })}
          title="Scatter Chart"
          actions={false}
          controlPanel={<ScatterChartControlPanel />}
          blinkOnStart={true}
          infoMessage={info}
          showInfoMessage={false}
          maxHeight={500}
          aspectRatio={isSmallScreen ? 2.8 : 1.8}
          loading={tab?.workflowTasks.dataExploration?.scatterChart?.loading}
        />
      ) : (
        <Grid container spacing={2}>
          {yAxis.map(y => (
            <Grid item xs={12} key={y.name}>
              <ResponsiveCardVegaLite
                spec={getSingleScatterSpec({
                  data: chartData,
                  xAxis: xAxis as VisualColumn,
                  y,
                  colorBy: colorBy as VisualColumn,
                })}
                title={y.name}
                actions={false}
                controlPanel={<ScatterChartControlPanel />}
                loading={tab?.workflowTasks.dataExploration?.scatterChart?.loading}
                isStatic={false}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}

export default ScatterChart
