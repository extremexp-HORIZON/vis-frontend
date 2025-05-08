import { useState, useRef, useEffect } from "react"
import "leaflet/dist/leaflet.css"
import { useAppDispatch, useAppSelector } from "../../../../store/store"
import { fetchDataExplorationData } from "../../../../shared/models/tasks/data-exploration-task.model"
import { defaultDataExplorationQuery } from "../../../../shared/models/dataexploration.model"
import L from "leaflet"
// @ts-ignore
import "leaflet.heat"
const COLOR_PALETTE = [
  "#1f77b4", // blue
  "#ff7f0e", // orange
  "#2ca02c", // green
  "#d62728", // red
  "#9467bd", // purple
]

const MapChart = () => {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const leafletMapRef = useRef<L.Map | null>(null)
  const markerLayerRef = useRef<L.LayerGroup | null>(null)
  const heatLayerRef = useRef<L.HeatLayer | null>(null)

  const { tab } = useAppSelector(state => state.workflowPage)
  const dispatch = useAppDispatch()

  const lat = tab?.workflowTasks.dataExploration?.controlPanel.lat
  const lon = tab?.workflowTasks.dataExploration?.controlPanel.lon
  const useHeatmap = tab?.workflowTasks.dataExploration?.controlPanel.heatmap
  const filters = tab?.workflowTasks.dataExploration?.controlPanel.filters
  const data = tab?.workflowTasks.dataExploration?.mapChart.data?.data || []
  const colorByMap = tab?.workflowTasks.dataExploration?.controlPanel.colorByMap
  const [colorMap, setColorMap] = useState<Map<string, string>>(new Map())
  const segmentBy = tab?.workflowTasks.dataExploration?.controlPanel.segmentBy
  const timestampField = "timestamp"

  // Fetch data
  useEffect(() => {
    const filters = tab?.workflowTasks.dataExploration?.controlPanel.filters
    const datasetId = tab?.dataTaskTable.selectedItem?.data?.source || ""
    if (!datasetId || !lat || !lon || !colorByMap || colorByMap === "None")
      return

    dispatch(
      fetchDataExplorationData({
        query: {
          ...defaultDataExplorationQuery,
          datasetId,
          columns: [lat, lon, colorByMap],
          filters,
          limit: 200,
        },
        metadata: {
          workflowId: tab?.workflowId || "",
          queryCase: "mapChart",
        },
      }),
    )
  }, [
    lat,
    lon,
    tab?.dataTaskTable.selectedItem?.data?.source,
    colorByMap,
    filters,
  ])

  // Initialize map
  useEffect(() => {
    if (
      !mapRef.current ||
      leafletMapRef.current ||
      !lat ||
      !lon ||
      colorByMap === "None"
    )
      return

    leafletMapRef.current = L.map(mapRef.current).setView([38.015, 23.834], 16)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
      leafletMapRef.current,
    )

    markerLayerRef.current = L.layerGroup().addTo(leafletMapRef.current)
  }, [lat, lon, colorByMap, data, filters])
  console.log("data", data)

  useEffect(() => {
    if (!data.length || !colorByMap || colorByMap === "None") return

    const categories = Array.from(
      new Set(data.map((row: any) => row[colorByMap])),
    )
    const newColorMap = new Map<string, string>()

    categories.forEach((category, index) => {
      // Get a color from the COLOR_PALETTE or generate your own strategy here
      newColorMap.set(category, COLOR_PALETTE[index % COLOR_PALETTE.length])
    })

    setColorMap(newColorMap)
  }, [colorByMap, data, filters])

  // Update markers
  useEffect(() => {
    if (
      !leafletMapRef.current ||
      !lat ||
      !lon ||
      !markerLayerRef.current ||
      !colorMap ||
      colorByMap === "None"
    )
      return

    if (markerLayerRef.current) markerLayerRef.current.clearLayers()
    if (heatLayerRef.current) {
      heatLayerRef.current.remove()
      heatLayerRef.current = null
    }

    if (useHeatmap) {
      const heatData = data
        .map((row: any) => {
          const latVal = parseFloat(row[lat])
          const lonVal = parseFloat(row[lon])
          if (!isNaN(latVal) && !isNaN(lonVal)) {
            return [latVal, lonVal, 0.5] // [lat, lon, intensity]
          }
          return null
        })
        .filter(Boolean)

      heatLayerRef.current = (L as any).heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
      })
      heatLayerRef.current.addTo(leafletMapRef.current!)
    } else {
      // Marker rendering as before
      data.forEach((row: any) => {
        const latVal = parseFloat(row[lat])
        const lonVal = parseFloat(row[lon])
        const category = row[colorByMap || ""]
        if (!isNaN(latVal) && !isNaN(lonVal) && category) {
          const color = colorMap.get(category) || "#000000"
          L.marker([latVal, lonVal], {
            icon: L.divIcon({
              className: "",
              html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
              iconSize: [12, 12],
              iconAnchor: [6, 6],
            }),
          })
            .bindTooltip(category, { permanent: false, direction: "top" })
            .addTo(markerLayerRef.current!)
        }
      })
    }

    // Remove existing legend if it exists
    const existingLegend = document.querySelector(".leaflet-legend")
    if (existingLegend) existingLegend.remove()
    if (!useHeatmap && data.length > 0) {
      const legend = L.control({ position: "topright" })

      legend.onAdd = function () {
        const div = L.DomUtil.create("div", "leaflet-legend")
        div.style.background = "white"
        div.style.padding = "8px"
        div.style.borderRadius = "4px"
        div.style.boxShadow = "0 0 6px rgba(0,0,0,0.2)"
        div.innerHTML = `<strong>${colorByMap}</strong><br/>`

        const firstEntries = Array.from(colorMap.entries()).slice(0, 10)

        // Iterate through the first 10 entries
        firstEntries.forEach(([category, color]) => {
          div.innerHTML += `
      <div style="display: flex; align-items: center; margin-bottom: 4px;">
        <div style="width: 12px; height: 12px; background:${color}; border-radius: 50%; margin-right: 6px;"></div>
        ${category}
      </div>
    `
        })

        return div
      }
      legend.addTo(leafletMapRef.current!)
    }
    // Optionally pan to average center
    if (data.length) {
      const avgLat =
        data.reduce(
          (sum: number, r: { [x: string]: string }) => sum + parseFloat(r[lat]),
          0,
        ) / data.length
      const avgLon =
        data.reduce(
          (sum: number, r: { [x: string]: string }) => sum + parseFloat(r[lon]),
          0,
        ) / data.length
      leafletMapRef.current.setView([avgLat, avgLon], 16)
    }
  }, [data, lat, lon, colorMap, useHeatmap, filters])
  useEffect(() => {
    setTimeout(() => {
      leafletMapRef.current?.invalidateSize()
    }, 100) // give the layout a moment to settle
  }, [lat, lon])

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
}

export default MapChart
