import { useEffect, useState } from "react"
import { useAppSelector, RootState } from "../../../../store/store"
import { VegaLite } from "react-vega"
import ResponsiveCardVegaLite from "../../../../shared/components/responsive-card-vegalite"
import { Box, useTheme, useMediaQuery } from "@mui/material"
import ScatterChartControlPanel from "../ChartControls/data-exploration-scatter-control"


const Uchart = () => {
  const [umapResult, setUmapResult] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const tab = useAppSelector((state: RootState) => state.workflowPage.tab)
const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("xl"))

  useEffect(() => {
    const sendUmapRequest = async () => {
      setLoading(true)
      setError(null)

      try {
        const raw = tab?.workflowTasks.dataExploration?.chart.data?.data
        const parsedData = typeof raw === "string" ? JSON.parse(raw) : raw

        const umapPayload = parsedData.map(row => Object.values(row))

        const response = await fetch("http://localhost:8080/api/data/umap", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(umapPayload),
        })

        if (!response.ok) throw new Error("Failed to fetch UMAP results")

        const result = await response.json()
        setUmapResult(result)
      } catch (err: any) {
        console.error("UMAP error:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (tab?.workflowTasks.dataExploration?.chart.data?.data) {
      sendUmapRequest()
    }
  }, [tab?.workflowTasks.dataExploration?.chart.data?.data])

  if (loading) return <div>Loading UMAP...</div>
  if (error) return <div>Error: {error}</div>
  if (!umapResult || umapResult.length === 0) return <div>No UMAP data</div>

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
  const chartData = umapResult.map((point: number[]) => ({
    x: point[0],
    y: point[1],
  }))

  return (
   
    <Box sx={{height: "100%"}}>

      <ResponsiveCardVegaLite spec={spec} data={{ table: chartData }} actions={false}          maxHeight={500}
      aspectRatio={isSmallScreen ? 2.8 : 1.8}
      controlPanel={<ScatterChartControlPanel/>} />

    </Box>
  )
}

export default Uchart
