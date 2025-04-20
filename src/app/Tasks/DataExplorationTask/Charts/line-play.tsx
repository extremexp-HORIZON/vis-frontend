import ResponsiveCardVegaLite from "../../../../shared/components/responsive-card-vegalite"
import { useAppDispatch, useAppSelector } from "../../../../store/store"
import { VegaLite } from "react-vega"
import LineChartControlPanel from "../ChartControls/data-exploration-line-control"
import { cloneDeep } from "lodash"
import { useEffect } from "react"
import { defaultDataExplorationQuery } from "../../../../shared/models/dataexploration.model"
import { useMemo } from "react"
import { fetchDataExplorationData } from "../../../../shared/models/tasks/data-exploration-task.model"

const FunLinePlot = () => {
    const { tab } = useAppSelector(state => state.workflowPage)
    const xAxis = tab?.workflowTasks.dataExploration?.controlPanel.xAxis 
    const yAxis = tab?.workflowTasks.dataExploration?.controlPanel.yAxis || []
    const viewMode = tab?.workflowTasks.dataExploration?.controlPanel.viewMode
    const renderData=tab?.workflowTasks.dataExploration?.chart.data?.data
    const dispatch = useAppDispatch()

    useEffect(() => {
           dispatch(
                 fetchDataExplorationData({
                   query: {
                     ...defaultDataExplorationQuery,
                     datasetId:  tab?.dataTaskTable.selectedItem?.data?.source || "",
                     filters: tab?.workflowTasks.dataExploration?.controlPanel?.filters || [],
                     columns:[xAxis!.name, ...yAxis.map(col => col.name)] ,
                   },
                   metadata: {
                     workflowId: tab?.workflowId || "",
                     queryCase: "chart",
                   },
                 }),
     
                )
        
      }, [tab?.dataTaskTable.selectedItem?.data?.source,viewMode])
      if (!renderData || renderData.length === 0) {
        return <div className="text-sm text-gray-500">Loading chart data...</div>
      }


    // const overlayData = useMemo(() => {
    //   if (!renderData || yAxis.length === 0) return []
    
    //   return renderData.flatMap((row, index) =>
    //     yAxis.map(y => ({
    //       x: row[xAxis.name],
    //       value: row[y.name],
    //       series: y.label || y.name
    //     }))
    //   )
    // }, [renderData, xAxis, yAxis])
    

    // const spec = {
    //     width: 400,
    //     height: 300,
    //     mark: "line",
    //     encoding: {
    //       x: { field: xAxis?.name, type: "quantitative" },
    //       y: { field: yAxis[0]?.name, type: "quantitative" },
    //     },
    //     data: { name: "table" }
    //   }
      
    //   const overlaySpec = {
    //     mark: "line",
    //     encoding: {
    //       x: { field: "x", type: "quantitative" },
    //       y: { field: "value", type: "quantitative" },
    //       color: { field: "series", type: "nominal" }
    //     },
    //     data: { name: "table" }
    //   }

    //   const stackedCharts = yAxis.map((y, idx) => {
    //     const data = renderData.map(row => ({
    //       x: row[xAxis.name],
    //       y: row[y.name]
    //     }))
      
    //     const spec = {
    //       mark: "line",
    //       encoding: {
    //         x: { field: "x",axis:xAxis?.name , type: "quantitative" },
    //         y: { field: "y", type: "quantitative" }
    //       },
    //       data: { name: "table" }
    //     }
      
    //     return (
    //       <div key={idx} className="mb-6">
    //         <h4 className="text-sm font-semibold mb-2">{y.label || y.name}</h4>
    //         <VegaLite spec={spec} data={{ table: data }} />
    //       </div>
    //     )
    //   })
      
      

      return (
        <>
          {/* <LineChartControlPanel />
      
          {viewMode === "overlay" ? (
            <VegaLite spec={overlaySpec} data={{ table: overlayData }} />
          ) : (
            stackedCharts
          )} */}
        </>
      )
      
}

export default FunLinePlot