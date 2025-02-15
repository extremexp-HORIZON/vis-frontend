import React, { useState, useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import {
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
  Typography,
  OutlinedInput,
  Paper,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  Slider,
  ThemeProvider,
  createTheme,
  Divider,
} from "@mui/material"
import { ExpandMore } from "@mui/icons-material"
import MapControlPanel from "./MapChartControlPanel"

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
const MapChart = (rawData: any) => {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef(null)
  const [data, setData] = useState<any[]>([])
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [intColumns, setIntColumns] = useState<string[]>([])
  const [colorMap, setColorMap] = useState<Record<string, string>>({})
  const [mapLayer, setMapLayer] = useState<keyof typeof layers>("osm")
  const [timestampField, setTimestampField] = useState<string>("timestamp")
  const [tripsMode, setTripsMode] = useState<boolean>(false)
  const [colorBy, setColorBy] = useState<string | null>("None") // Set initial color to 'default'

  const [latitudeField, setLatitudeField] = useState<string>("")
  const [longitudeField, setLongitudeField] = useState<string>("")
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
    if (rawData) {
      try {
        const parsedData = rawData.rawData;
        setData(parsedData);

        const stringColumns = Object.keys(parsedData[0] || {}).filter(
          (key) => typeof parsedData[0][key] === "string" && key !== "timestamp"
        );

        const potentialLatColumns = ["lat", "latitude"];
        const potentialLonColumns = ["lon", "longitude"];
        const integerColumns = Object.keys(parsedData[0] || {}).filter(
          (key) => typeof parsedData[0][key] === "number"
        );

        const detectedLatitude =
          integerColumns.find((col) =>
            potentialLatColumns.includes(col.toLowerCase())
          ) || "";
        const detectedLongitude =
          integerColumns.find((col) =>
            potentialLonColumns.includes(col.toLowerCase())
          ) || "";

        setLatitudeField(detectedLatitude);
        setLongitudeField(detectedLongitude);
        setColumns(stringColumns);
        setIntColumns(integerColumns);
      } catch (err) {
        console.error("Error parsing data:", err);
      }
    }
  }, [rawData]);

  useEffect(() => {
    setTripsMode(!!timestampField && selectedColumns.length > 0)
  }, [timestampField, selectedColumns])

  const generateColorMap = (data: any[], colorBy: string) => {
    const uniqueCategories = [...new Set(data.map(row => row[colorBy]))]
    const colorMapping: Record<string, string> = {}

    uniqueCategories.forEach((category, index) => {
      colorMapping[category] = COLOR_PALETTE[index % COLOR_PALETTE.length] // Ensure cycling through colors
    })

    return colorMapping
  }

  useEffect(() => {
    if (colorBy && colorBy !== "None") {
      const newColorMap = generateColorMap(data, colorBy)
      setColorMap(newColorMap)
    } else {
      setColorMap({}) // Reset color map if "default" is selected
    }
  }, [data, colorBy])

  useEffect(() => {
    if (data.length > 0 && selectedColumns.length > 0) {
      const colors = generateColorMap(data, selectedColumns)
      setColorMap(colors)
    }
  }, [data, selectedColumns])

  useEffect(() => {
    if (!mapRef.current && mapContainerRef.current && data.length > 0) {
      mapRef.current = L.map(mapContainerRef.current).setView(
        [data[0].latitude, data[0].longitude],
        15,
      )
      L.tileLayer(layers[mapLayer]).addTo(mapRef.current)
    }
  }, [data])

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.eachLayer(layer => {
        if (layer instanceof L.TileLayer) {
          mapRef.current?.removeLayer(layer)
        }
      })
      L.tileLayer(layers[mapLayer]).addTo(mapRef.current)
    }
  }, [mapLayer])

  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.eachLayer(layer => {
      if (!(layer instanceof L.TileLayer)) {
        mapRef.current.removeLayer(layer)
      }
    })

    const layerGroup = L.layerGroup().addTo(mapRef.current)

    if (tripsMode) {
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
    } else {
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
  }, [
    data,
    selectedColumns,
    tripsMode,
    timestampField,
    colorBy,
    colorMap,
    sliderValue,
  ])

  useEffect(() => {
    if (colorBy && colorBy !== "None") {
      setColorMap(generateColorMap(data, colorBy))
    } else {
      setColorMap({})
    }
  }, [data, colorBy])
  const handleSegmentByChange = (
    event: React.ChangeEvent<{ value: unknown }>,
  ) => {
    const selected = event.target.value as string[]
    setSelectedColumns(selected)

    // Reset Color By if segments are selected
    if (selected.length > 0) {
      setColorBy("None")
    }
    if (selected.length === 0) {
      setColorMap({})
    }
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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {/* Render the Control Panel */}
      <MapControlPanel
        timestampField={timestampField}
        onTimestampChange={setTimestampField}
        latitudeField={latitudeField}
        onLatitudeChange={setLatitudeField}
        longitudeField={longitudeField}
        onLongitudeChange={setLongitudeField}
        colorBy={colorBy}
        onColorByChange={setColorBy}
        selectedColumns={selectedColumns}
        onSegmentByChange={setSelectedColumns}
        columns={columns}
        intColumns={intColumns}
        sliderValue={sliderValue}
        onSliderChange={setSliderValue}
        tripsMode={tripsMode}
        data={data}
      />

      {/* Render the Map */}
      <Paper
        className="Category-Item"
        elevation={2}
        sx={{
          borderRadius: 4,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          rowGap: 0,
          height: "100%",
          overflow: "hidden",
        }}
      >
        <Box
          ref={mapContainerRef}
          sx={{
            height: "30vh",
            width: "100%",
            borderRadius: 4,
            border: "1px solid rgba(0, 0, 0, 0.2)",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            overflowX: "hidden",
            overflowY: "hidden",
          }}
        />
      </Paper>
    </Box>
  );
};

export default MapChart;
