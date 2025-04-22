import { useEffect, useState } from "react"
import { useAppSelector, RootState, useAppDispatch } from "../../../../store/store"
import ResponsiveCardVegaLite from "../../../../shared/components/responsive-card-vegalite"
import { Box, useTheme, useMediaQuery } from "@mui/material"
import ScatterChartControlPanel from "../ChartControls/data-exploration-scatter-control"
import { fetchUmap } from "../../../../shared/models/tasks/data-exploration-task.model"


const Uchart = () => {
  const tab = useAppSelector((state: RootState) => state.workflowPage.tab)
const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("xl"))
  const dispatch = useAppDispatch()

  const raw = tab?.workflowTasks.dataExploration?.chart.data?.data
  const parsedData = typeof raw === "string" ? JSON.parse(raw) : raw

  useEffect(() => {
    if (tab?.workflowTasks.dataExploration?.chart.data?.data) {
      // Ensure payload is proper 2D array of numbers
      const umapPayload = parsedData.map(row => 
        Object.values(row).map(val => parseFloat(val))
      );
      
      dispatch(fetchUmap({
        data: umapPayload,
        metadata: {
          workflowId: tab?.workflowId,
          queryCase: "umap"
        }
      }))
    }
  }, [tab?.workflowTasks.dataExploration?.chart.data?.data, dispatch])

  

  // Prepare VegaLite spec
  const spec = {
    mark: "point",
    encoding: {
      x: { field: "x", type: "quantitative" },
      y: { field: "y", type: "quantitative" },
    },
    data: { name: "table" },
  }

  // Format result to match the spec's expectations
  const chartData = tab?.workflowTasks.dataExploration?.umap?.data?.map((point: number[]) => ({
    x: point[0],
    y: point[1],
  })) || []; // Fallback to empty array if any part is null/undefined
  console.log('Full umap object:', tab?.workflowTasks.dataExploration?.umap);
  console.log('UMAP data:', tab?.workflowTasks.dataExploration?.umap?.data);

  return (
   
    <Box sx={{height: "100%"}}>

      <ResponsiveCardVegaLite spec={spec} data={{ table: chartData }} actions={false}          maxHeight={500}
      aspectRatio={isSmallScreen ? 2.8 : 1.8}
      controlPanel={<ScatterChartControlPanel/>} />

    </Box>
  )
}

export default Uchart
