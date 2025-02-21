import React, { useState, useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import {
  Box,
  Chip,
  Paper,
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
  lat:any
  lon:any
}

const MapChart = ({
  data,
  workflow,
  columns,
  colorBy,
  tripsMode,
  selectedColumns,
  lat,
  lon
}: IMapChartProps) => {
  console.log("lat,lon", lat,lon)
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef(null)
  const [colorMap, setColorMap] = useState<Record<string, string>>({})
  const [mapLayer, setMapLayer] = useState<keyof typeof layers>("osm")
  const [timestampField, setTimestampField] = useState<string>("timestamp")
  const [sliderValue, setSliderValue] = useState(0)

  useEffect(() => {
    const handleResize = () => {
      if (mapContainerRef.current) {
        mapContainerRef.current.style.height = `${window.innerHeight * 0.7}px`
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
    if (!lat || !lon) return // Skip map creation if fields are empty
  
    if (!mapRef.current && mapContainerRef.current && data.length > 0) {
      mapRef.current = L.map(mapContainerRef.current).setView(
        [data[1][lat], data[1][lon]],
        15,
      )
      L.tileLayer(layers[mapLayer]).addTo(mapRef.current)
    }
  }, [data, lat, lon, mapLayer])
  

  const renderTrips = (layerGroup: L.LayerGroup) => {
    const trips = {}
    const tripColorMap = generateTripColorMap(data, selectedColumns) // Use consistent colors

    data.forEach(row => {
      if (!row[lat] || !row[lon]) return
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
        row[lat],
        row[lon],
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
        L.circleMarker([row[lat], row[lon]], {
          radius: 5,
          fillColor: tripColor,
          color: tripColor,
          fillOpacity: 0.9,
          opacity: 1,
          weight: 5,
        })
          .addTo(layerGroup)
          .bindPopup(
            `<strong>Latitude:</strong> ${row[lat]} <br/>
                   <strong>Longitude:</strong> ${row[lon]} <br/>
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
      if (!row[lat] || !row[lon]) return
      const color =
        colorBy && colorBy !== "None"
          ? colorMap[row[colorBy]] || "blue"
          : "blue"

      L.circleMarker([row[lat], row[lon]], {
        radius: 5,
        fillColor: color,
        color: color,
        fillOpacity: 0.9,
      })
        .addTo(layerGroup)
        .bindPopup(
          `
          <strong>Latitude:</strong> ${row[lat]} <br/>
          <strong>Longitude:</strong> ${row[lon]} <br/>
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

    // if (data.length > 1) {
    //   const trajectoryCoords = data

    //     .filter(row => row[lat] && row[lon] && row.timestamp)
    //     .map(row => [row[lat], row[lon], row.timestamp])

    //   const marker = L.marker(trajectoryCoords[0], {
    //     icon: L.icon({
    //       iconUrl:
    //         "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    //       iconSize: [25, 41],
    //       iconAnchor: [12, 41],
    //     }),
    //   }).addTo(layerGroup)

      // Animate the marker along the trajectory
      // let index = sliderValue
      // if (index < trajectoryCoords.length) {
      //   marker
      //     .setLatLng(trajectoryCoords[index])
      //     .bindPopup(
      //       `Timestamp: ${new Date(trajectoryCoords[index][2]).toLocaleString()}`,
      //     )
      //   // .openPopup();
      // }
    // }

    const pointBounds = data.map(row =>
      row[lat] && row[lon] ? [row[lat], row[lon]] : [],
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
    lat,
    lon
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
  useEffect(() => {
    if (!mapRef.current || colorBy === "None") return

    const legend = L.control({ position: "topright" })

    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "info legend")
      div.style.background = "white"
      div.style.padding = "10px"
      div.style.borderRadius = "5px"
      div.style.boxShadow = "0 0 5px rgba(0,0,0,0.2)"

      div.innerHTML = `<strong>${colorBy}</strong><br/>`
      Object.entries(colorMap).forEach(([key, color]) => {
        div.innerHTML += `
          <div style="display: flex; align-items: center; margin-bottom: 5px;">
            <div style="width: 15px; height: 15px; background: ${color}; margin-right: 5px; border-radius: 3px;"></div>
            ${key}
          </div>
        `
      })

      return div
    }

    legend.addTo(mapRef.current)

    return () => {
      mapRef.current?.removeControl(legend)
    }
  }, [colorMap, colorBy])

  return (
    <>
      {/* <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        <Typography variant="body1" sx={{ marginBottom: 1, marginRight: 2 }}>
          Slide to animate through the points over time
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
            sx={{ width: "250px", maxWidth: "100%" }}
          />
        </ThemeProvider>
      </Box> */}

{(!lat || !lon) ? (
      <Typography  align="center" fontWeight="bold">
       Select latitude and longitude fields to display the map.
      </Typography>
    ) : (
      <Paper
        ref={mapContainerRef}
        
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
        overflow: "hidden", // Allow scrolling if content is larger than container
        overscrollBehavior: "contain", // Prevent the bounce effect at the edges
        scrollBehavior: "smooth", // Enable smooth scrolling (optional)
      }}
      />
    )}
    
    </>
  )
}

export default MapChart
