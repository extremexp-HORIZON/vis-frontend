import { Box, useTheme, useMediaQuery, Grid } from "@mui/material"
import { useEffect } from "react"
import { cloneDeep } from "lodash"
import { useAppDispatch, useAppSelector } from "../../../../store/store"
import ResponsiveCardVegaLite from "../../../../shared/components/responsive-card-vegalite"
import LineChartControlPanel from "../ChartControls/data-exploration-line-control"
import InfoMessage from "../../../../shared/components/InfoMessage"
import AssessmentIcon from "@mui/icons-material/Assessment"
import { fetchDataExplorationData } from "../../../../shared/models/tasks/data-exploration-task.model"
import type { VisualColumn } from "../../../../shared/models/dataexploration.model";
import { defaultDataExplorationQuery } from "../../../../shared/models/dataexploration.model"

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

const getAxisEncoding = (type: string, name?: string) => {
  const fieldType = getColumnType(type, name)
  return {
    type: fieldType,
    axis: {
      labelAngle: fieldType === "ordinal" ? -40 : 0,
      labelColor: "#333",
      titleColor: "#444",
      labelOverlap: fieldType === "ordinal" ? "greedy" : undefined,
    },
  }
}

const LineChart = () => {
  const { tab } = useAppSelector(state => state.workflowPage)
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("xl"))
  const dispatch = useAppDispatch()

  useEffect(() => {
    const xAxis = tab?.workflowTasks.dataExploration?.controlPanel.xAxis
    const yAxis = tab?.workflowTasks.dataExploration?.controlPanel.yAxis
    const filters = tab?.workflowTasks.dataExploration?.controlPanel.filters
    const datasetId = tab?.dataTaskTable.selectedItem?.data?.source || ""

    const cols = Array.from(new Set([xAxis?.name, ...(yAxis?.length ? yAxis.map((axis: any) => axis.name) : [])]))
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
          queryCase: "lineChart",
        },
      })
    )
  }, [
    tab?.workflowTasks.dataExploration?.controlPanel.xAxis,
    tab?.workflowTasks.dataExploration?.controlPanel.yAxis,
    tab?.workflowTasks.dataExploration?.controlPanel.filters,
    tab?.dataTaskTable.selectedItem?.data?.source,
  ])

  const chartData = tab?.workflowTasks.dataExploration?.lineChart?.data?.data || []
  const xAxis = tab?.workflowTasks.dataExploration?.controlPanel?.xAxis
  const yAxis = tab?.workflowTasks.dataExploration?.controlPanel?.yAxis
  const displayMode = tab?.workflowTasks.dataExploration?.controlPanel?.viewMode || "overlay"

  const getLineChartSpec = ({
    data,
    xAxis,
    yAxis,
  }: {
    data: any[]
    xAxis: VisualColumn
    yAxis: VisualColumn[]
  }) => {
    const xField = xAxis.name
    const longData: any[] = []
  
    data.forEach(row => {
      yAxis.forEach(y => {
        longData.push({
          [xField]: row[xField],
          value: row[y.name],
          variable: y.name,
        })
      })
    })
  
    return {
      data: { values: longData },
      mark: { type: "line", tooltip: true },
      encoding: {
        x: { field: xField, ...getAxisEncoding(xAxis.type, xAxis.name) },
        y: { field: "value", type: "quantitative", title: "Value" },
        color: { field: "variable", type: "nominal", title: "Metric" },
      },
    }
  }
  
  
  const getSingleLineSpec = ({
    data,
    xAxis,
    y,
  }: {
    data: any[]
    xAxis: VisualColumn
    y: VisualColumn
  }) => {
    return {
      data: {
        values: cloneDeep(data),
      },
      mark: { type: "line", tooltip: true },
      encoding: {
        x: {
          field: xAxis.name,
          ...getAxisEncoding(xAxis.type, xAxis.name),
        },
        y: {
          field: y.name,
          ...getAxisEncoding(y.type, y.name),

          
        },
      },
    }
  }
  
  const info = (
    <InfoMessage
      message="Please select x-Axis and y-Axis to display the chart."
      type="info"
      icon={<AssessmentIcon sx={{ fontSize: 40, color: "info.main" }} />}
      fullHeight
    />
  )

  const hasValidXAxis = xAxis && xAxis.name
  const hasValidYAxis = Array.isArray(yAxis) && yAxis.length > 0
  const shouldShowInfoMessage = !hasValidXAxis || !hasValidYAxis

  return (
    <Box sx={{ height: "99%" }}>
      {shouldShowInfoMessage ? (
        <ResponsiveCardVegaLite
          spec={{}}
          title="Line Chart"
          actions={false}
          controlPanel={<LineChartControlPanel />}
          infoMessage={info}
          showInfoMessage={true}
          maxHeight={isSmallScreen ? undefined : 500}
          aspectRatio={isSmallScreen ? 2.8 : 1.8}
        />
      ) : displayMode === "overlay" ? (
        <ResponsiveCardVegaLite
          spec={getLineChartSpec({
            data: chartData,
            xAxis: xAxis as VisualColumn,
            yAxis: yAxis as VisualColumn[],
          })}
          title="Line Chart"
          actions={false}
          controlPanel={<LineChartControlPanel />}
          maxHeight={500}
          aspectRatio={isSmallScreen ? 2.8 : 1.8}
          loading={tab?.workflowTasks.dataExploration?.lineChart?.loading}
        />
      ) : (
        <Grid container spacing={2}>
          {yAxis.map(y => (
            <Grid item xs={12} >
            <ResponsiveCardVegaLite
              key={y.name}
              spec={getSingleLineSpec({
                data: chartData,
                xAxis: xAxis as VisualColumn,
                y,
              })}
              title={y.name}
              actions={false}
              controlPanel={<LineChartControlPanel />}
              loading={tab?.workflowTasks.dataExploration?.lineChart?.loading}
              isStatic={false}
            />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}

export default LineChart
