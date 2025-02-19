import React, { useState, useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import {
  Box,
  Chip,
  Slider,
  ThemeProvider,
  Typography,
  createTheme,
} from "@mui/material"

import { IDataExploration } from "../../../../shared/models/tasks/data-exploration-task.model"

const COLOR_PALETTE = [
  "#E6194B",
  "#3CB44B",
  "#FFE119",
  "#0082C8",
  "#F58231",
  "#911EB4",
  "#46F0F0",
  "#F032E6",
  "#D2F53C",
  "#FABEBE",
  "#008080",
  "#E6BEFF",
  "#AA6E28",
  "#800000",
  "#808000",
  "#000080",
  "#808080",
  "#FFFFFF",
  "#000000",
  "#A9A9A9",
]

const layers = {
  osm: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  satellite: "https://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}&s=Ga",
}
interface IMapChartProps {
  data: any
  workflow: IDataExploration
  columns: any
  colorBy: any
  tripsMode: boolean
  selectedColumns: any
}

const MapChart = ({
  data,
  workflow,
  columns,
  colorBy,
  tripsMode,
  selectedColumns,
}: IMapChartProps) => {
  console.log("workflow", workflow)
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef(null)
  const [colorMap, setColorMap] = useState<Record<string, string>>({})
  const [mapLayer, setMapLayer] = useState<keyof typeof layers>("osm")
  const [timestampField, setTimestampField] = useState<string>("timestamp")
  const [sliderValue, setSliderValue] = useState(0)

  useEffect(() => {
    const handleResize = () => {
      if (mapContainerRef.current) {
        mapContainerRef.current.style.height = `${window.innerHeight * 0.6}px`
      }
    }
    window.addEventListener("resize", handleResize)
    handleResize()
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (colorBy && colorBy !== "None") {
      const newColorMap = generateColorMap(data, colorBy)
      setColorMap(newColorMap)
    } else if (selectedColumns.length > 0) {
      const newColorMap = generateColorMap(data, selectedColumns.join("-"))
      setColorMap(newColorMap)
    } else {
      setColorMap({})
    }
  }, [data, colorBy, selectedColumns])

  useEffect(() => {
    if (!mapRef.current && mapContainerRef.current && data.length > 0) {
      mapRef.current = L.map(mapContainerRef.current).setView(
        [data[0].latitude, data[0].longitude],
        15,
      )
      L.tileLayer(layers[mapLayer]).addTo(mapRef.current)
    }
  }, [data])

  const renderTrips = (layerGroup: L.LayerGroup) => {
    const trips = {}
    const tripColorMap = generateTripColorMap(data, selectedColumns) // Use consistent colors

    data.forEach(row => {
      if (!row.latitude || !row.longitude) return
      const tripKey = selectedColumns.map(col => row[col]).join("-")
      if (!trips[tripKey]) trips[tripKey] = []
      trips[tripKey].push(row)
    })

    Object.keys(trips).forEach(tripKey => {
      trips[tripKey].sort(
        (a, b) =>
          new Date(a[timestampField]).getTime() -
          new Date(b[timestampField]).getTime(),
      )

      const tripCoords = trips[tripKey].map(row => [
        row.latitude,
        row.longitude,
      ])
      const tripColor = tripColorMap[tripKey]

      // Draw the trip polyline
      L.polyline(tripCoords, { color: tripColor, weight: 4 })
        .addTo(layerGroup)
        .bindTooltip(
          `<strong>Trip:</strong> ${tripKey} <br/>
                   <strong>Segmented By:</strong> ${selectedColumns.join(", ")}`,
        )
        .on("mouseover", function () {
          this.openTooltip()
          this.bringToFront()
        })
        .on("mouseout", function () {
          this.closeTooltip()
        })
        .on("click", function (e) {
          layerGroup.eachLayer(layer => layer.setStyle({ opacity: 0.3 }))
          e.target.setStyle({ opacity: 1, weight: 4 })
          const tripBounds = e.target.getBounds()
          mapRef.current?.fitBounds(tripBounds, { padding: [20, 20] })
        })

      // Add circle markers for each trip point
      trips[tripKey].forEach(row => {
        L.circleMarker([row.latitude, row.longitude], {
          radius: 5,
          fillColor: tripColor,
          color: tripColor,
          fillOpacity: 0.9,
          opacity: 1,
          weight: 5,
        })
          .addTo(layerGroup)
          .bindPopup(
            `<strong>Latitude:</strong> ${row.latitude} <br/>
                   <strong>Longitude:</strong> ${row.longitude} <br/>
                   <strong>Timestamp:</strong> ${new Date(row[timestampField]).toLocaleDateString()} <br/>`,
          )
          // .bindTooltip(
          //   `Latitude: ${row.latitude}, Longitude: ${row.longitude}`,
          // )
          .on("mouseover", function () {
            this.openTooltip()
          })
          .on("mouseout", function () {
            this.closeTooltip()
          })
      })
    })
  }

  const renderMarkers = (layerGroup: L.LayerGroup) => {
    data.forEach(row => {
      if (!row.latitude || !row.longitude) return
      const color =
        colorBy && colorBy !== "None"
          ? colorMap[row[colorBy]] || "blue"
          : "blue"

      L.circleMarker([row.latitude, row.longitude], {
        radius: 5,
        fillColor: color,
        color: color,
        fillOpacity: 0.9,
      })
        .addTo(layerGroup)
        .bindPopup(
          `
          <strong>Latitude:</strong> ${row.latitude} <br/>
          <strong>Longitude:</strong> ${row.longitude} <br/>
          <strong>Timestamp:</strong> ${new Date(row.timestamp).toLocaleDateString()} <br/>
          
        `,
        )
        // .bindTooltip(`Latitude: ${row.latitude}, Longitude: ${row.longitude}`)
        .on("mouseover", function () {
          this.openTooltip()
        })
        .on("mouseout", function () {
          this.closeTooltip()
        })
        .on("click", function () {
          this.setStyle({ radius: 8, fillOpacity: 1 })
        })
    })

    if (data.length > 1) {
      const trajectoryCoords = data

        .filter(row => row.latitude && row.longitude && row.timestamp)
        .map(row => [row.latitude, row.longitude, row.timestamp])

      const marker = L.marker(trajectoryCoords[0], {
        icon: L.icon({
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        }),
      }).addTo(layerGroup)

      // Animate the marker along the trajectory
      let index = sliderValue
      if (index < trajectoryCoords.length) {
        marker
          .setLatLng(trajectoryCoords[index])
          .bindPopup(
            `Timestamp: ${new Date(trajectoryCoords[index][2]).toLocaleString()}`,
          )
        // .openPopup();
      }
    }

    const pointBounds = data.map(row =>
      row.latitude && row.longitude ? [row.latitude, row.longitude] : [],
    )
    if (pointBounds.length > 0) {
      const bounds = L.latLngBounds(pointBounds)
      mapRef.current.fitBounds(bounds)
    }
  }

  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.eachLayer(layer => {
      if (!(layer instanceof L.TileLayer)) {
        mapRef.current.removeLayer(layer)
      }
    })

    const layerGroup = L.layerGroup().addTo(mapRef.current)

    if (tripsMode) {
      renderTrips(layerGroup)
    } else {
      renderMarkers(layerGroup)
    }
  }, [
    data,
    selectedColumns,
    tripsMode,
    timestampField,
    colorBy,
    colorMap,
    sliderValue,
  ])

  const theme = createTheme({
    palette: {
      primary: { main: "#1976d2" },
      secondary: { main: "#dc004e" },
    },
    typography: {
      fontFamily: "Arial",
      h6: { fontWeight: 600 },
    },
  })

  useEffect(() => {
    if (colorBy && colorBy !== "None") {
      setColorMap(generateColorMap(data, colorBy))
    } else {
      setColorMap({})
    }
  }, [data, colorBy])

  const generateColorMap = (data: any[], colorBy: string) => {
    const uniqueCategories = [...new Set(data.map(row => row[colorBy]))]
    const colorMapping: Record<string, string> = {}

    uniqueCategories.forEach((category, index) => {
      colorMapping[category] = COLOR_PALETTE[index % COLOR_PALETTE.length] // Ensure cycling through colors
    })

    return colorMapping
  }

  const generateTripColorMap = (data: any[], selectedColumns: string[]) => {
    const uniqueTripKeys = [
      ...new Set(
        data.map(row => selectedColumns.map(col => row[col]).join("-")),
      ),
    ]

    const colorMapping: Record<string, string> = {}

    uniqueTripKeys.forEach((tripKey, index) => {
      colorMapping[tripKey] = COLOR_PALETTE[index % COLOR_PALETTE.length] // Cycle through fixed colors
    })

    return colorMapping
  }

  return (
    <>
      <Box ref={mapContainerRef} />

      {!tripsMode && (
        <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <Typography variant="body1" sx={{ marginBottom: 1 }}>
            Color categories based on the selected field:
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: "1rem",
              marginTop: "1rem",
              flexDirection: "row",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                maxHeight: 100, // Set max height for scroll control
                maxWidth: 600,
                overflowY: "auto", // Enable vertical scrolling
                padding: 1,
                border: "1px solid #ccc", // Optional: Adds a border for clarity
                borderRadius: 2,
              }}
            >
              {Object.entries(colorMap).map(([key, color]) => (
                <Chip
                  label={key}
                  sx={{
                    backgroundColor: color,
                    color: "white",
                    marginRight: 1,
                  }}
                  key={key}
                />
              ))}
            </Box>
            <Box >
              <Typography variant="body1" sx={{ marginBottom: 1 }}>
                Use the slider to animate through the data points over time.
              </Typography>
              <ThemeProvider theme={theme}>
                <Slider
                  value={sliderValue}
                  onChange={(e, newValue) => setSliderValue(newValue)}
                  valueLabelDisplay="auto"
                  valueLabelFormat={value =>
                    new Date(data[value].timestamp).toLocaleString()
                  }
                  min={0}
                  max={data.length - 1}
                />
              </ThemeProvider>
            </Box>
          </Box>
        </Box>
      )}
    </>
  )
}

export default MapChart
