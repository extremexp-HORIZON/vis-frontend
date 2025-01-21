


import React, { useState, useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import {
  Button,
  Slider,
  Box,
  Grid,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Paper,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  createTheme,
} from "@mui/material"
import {
  RootState,
  useAppDispatch,
  useAppSelector,
} from "../../../../store/store"
import { ThemeProvider } from "@emotion/react"
import { fetchDataExplorationData } from "../../../../shared/models/tasks/data-exploration-task.model"
interface DataItem {
  timestamp: string
  latitude: number
  longitude: number
  speed: number
  batteryLevel: number
  odometer: number
  userId: string
  activityType: string
  isMoving: boolean
  accuracy: number
  batteryCharging: boolean
  purpose: string
  altitude: number
  accurarcy: number
  activityConfidence: number
  heading: number
  locationId: string
  source: string
  used: string
}

const App = () => {
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.CircleMarker | null>(null)
  const mapContainerRef = useRef(null)
  const [data, setData] = useState<DataItem[]>([])
  const [index, setIndex] = useState(0)
  const [colorBy, setColorBy] = useState("speed")
  const [sizeBy, setSizeBy] = useState("batteryLevel")
  const [backtraceMode, setBacktraceMode] = useState(true)
  const [showDetails, setShowDetails] = useState(false)
  const layers = {
    osm: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    satellite: "https://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}&s=Ga",
  }
  const [mapLayer, setMapLayer] = useState<keyof typeof layers>("osm")

  const theme = createTheme({
    palette: {
      primary: {
        main: "#1976d2",
      },
      secondary: {
        main: "#dc004e",
      },
    },
    typography: {
      fontFamily: "Arial",
      h6: {
        fontWeight: 600,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: "20px", // Example of button customization
          },
        },
      },
    },
  })

  const filteredData = data
  console.log(filteredData)

  const dataExploration = useAppSelector(
    (state: RootState) => state.dataExploration.dataExploration?.data,
  )
  const dispatch = useAppDispatch()

  console.log(dataExploration)

  useEffect(() => {
    let data = null // Local variable

    const fetchData = async () => {
      const resultAction = await dispatch(
        fetchDataExplorationData({
          query: {
            datasetId: "/test/newresult.csv",
            limit: 0,
            columns: [],
            filters: [],
            groupBy: [],
            aggregation: {},
            offset: 0,
          },
          metadata: {
            workflowId: "",
            queryCase: "mapChart",
          },
        }),
      )

      if (fetchDataExplorationData.fulfilled.match(resultAction)) {
        data = resultAction.payload // Save data locally
        console.log("Fetched Data:", data.data) // You can log or use it locally
        setData(JSON.parse(data.data))
      }
    }

    fetchData()
  }, [dispatch])

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
      // Remove the previous tile layer
      mapRef.current.eachLayer(layer => {
        if (layer instanceof L.TileLayer) {
          mapRef.current?.removeLayer(layer)
        }
      })

      // Add the new tile layer
      L.tileLayer(layers[mapLayer]).addTo(mapRef.current)
    }
  }, [mapLayer]) // Now the effect runs when mapLayer changes

  useEffect(() => {
    if (!mapRef.current || data.length === 0) return

    const layerGroup = L.layerGroup().addTo(mapRef.current) // Clear and manage markers
    if (backtraceMode) {
      data.forEach(row => {
        if (row.latitude && row.longitude) {
          const speedColor = colorBy === "none" 
          ? "blue" // Default color

          : colorBy === "speed"
                        ? row.speed > 20
                ? "red"
                : row.speed > 5
                  ? "orange"
                  : "green"
              : colorBy === "batteryLevel"
                ? row.batteryLevel > 0.5
                  ? "green"
                  : row.batteryLevel > 0.2
                    ? "orange"
                    : "red"
                : "blue"

                const size = sizeBy === "none"
                ? 8 // Default size

                : sizeBy === "batteryLevel"
                ? Math.round(row.batteryLevel * 10)
              : sizeBy === "odometer"
                ? Math.min(Math.max(row.odometer / 100, 5), 20)
                : 8

          const marker = L.circleMarker([row.latitude, row.longitude], {
            color: speedColor,
            radius: size,
            fillOpacity: 1,
          })
            .bindPopup(
              `<b>User ID:</b> ${row.userId || "Unknown"}<br>
             <b>Speed:</b> <span style="color:${speedColor}">${row.speed} km/h</span><br>
             <b>Battery:</b> <span style="color:${speedColor}">${Math.round(row.batteryLevel * 100)}%</span>`,
            )
            .addTo(layerGroup)
        }
      })
    } else {
      if (data.length > 0) {
        const currentTimestamp = data[index]?.timestamp

        // Filter data by selected user or timestamp
        const filteredRows = data.filter(
          item => item.timestamp === currentTimestamp,
        )

        if (filteredRows.length > 0) {
          filteredRows.forEach(row => {
            if (row.latitude && row.longitude) {
              // Store the past trip points

              // Marker properties
              const speedColor = colorBy === "none" 
              ? "blue" // Default color
    
              : colorBy === "speed"
                  ? row.speed > 20
                    ? "red"
                    : row.speed > 5
                      ? "orange"
                      : "green"
                  : colorBy === "batteryLevel"
                    ? row.batteryLevel > 0.5
                      ? "green"
                      : row.batteryLevel > 0.2
                        ? "orange"
                        : "red"
                    : "blue"

            const size = sizeBy === "none"
                ? 8 // Default size

                : sizeBy === "batteryLevel"
                  ? Math.round(row.batteryLevel * 10)
                  : sizeBy === "odometer"
                    ? Math.min(Math.max(row.odometer / 100, 5), 20)
                    : 8

              // Create the marker for the current position
              if (!markerRef.current) {
                markerRef.current = L.circleMarker(
                  [row.latitude, row.longitude],
                  {
                    color: speedColor,
                    radius: size,
                    fillOpacity: 1,
                  },
                ).addTo(mapRef.current!)
              } else {
                markerRef.current
                  .setLatLng([row.latitude, row.longitude])
                  .setStyle({
                    color: speedColor,
                    radius: size,
                    fillOpacity: 1,
                  })
                  .bindPopup(
                    `<b>User ID:</b> ${row.userId || "Unknown"}<br>
                                <b>Speed:</b> <span style="color:${speedColor}">${row.speed} km/h</span><br>
                                <b>Battery:</b> <span style="color:${speedColor}">${Math.round(row.batteryLevel * 100)}%</span>`,
                  )
                  .openPopup()
              }
            }
          })
        }

        setTimeout(() => setIndex(prev => prev + 1), 1000) // Adjust this based on how you want to update the index
      }
    }

    return () => {
      mapRef.current?.removeLayer(layerGroup) // Clean up on re-render
    }
  }, [index, data, backtraceMode, colorBy, sizeBy])

  return (
    <Box sx={{ textAlign: "center", padding: 2 }}>
      <Grid container spacing={2} justifyContent="center" alignItems="center">
        <Grid item xs={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Color By</InputLabel>
            <Select
              value={colorBy}
              onChange={e => setColorBy(e.target.value)}
              label="Color By"
            >            
              <MenuItem value="none">None</MenuItem> {/* Add None option */}
              <MenuItem value="speed">Speed</MenuItem>
              <MenuItem value="batteryLevel">Battery Level</MenuItem>
              <MenuItem value="isMoving">Movement Status</MenuItem>

            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Sized By</InputLabel>
            <Select
              value={sizeBy}
              onChange={e => setSizeBy(e.target.value)}
              label="Sized By"
            >
              <MenuItem value="none">None</MenuItem> {/* Add None option */}
              <MenuItem value="batteryLevel">Battery Level</MenuItem>
              <MenuItem value="odometer">Odometer</MenuItem>
              <MenuItem value="altitude">Altitude</MenuItem>

            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Map Layer</InputLabel>
            <Select
              value={mapLayer}
              onChange={e => setMapLayer(e.target.value as keyof typeof layers)}
              label="Map Layer"
            >
              <MenuItem value="osm">Street Map</MenuItem>
              <MenuItem value="satellite">Satellite</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} md={3}>
          <Button
            variant="contained"
            color={backtraceMode ? "secondary" : "primary"}
            onClick={() => setBacktraceMode(!backtraceMode)}
            style={{ marginLeft: "10px" }}
          >
            {backtraceMode ? "Switch to Live Mode" : "Enable Backtrace"}
          </Button>
          {!backtraceMode && (

          <Button
            variant={showDetails ? "outlined" : "contained"}
            onClick={() => setShowDetails(!showDetails)}
            sx={{ marginLeft: "10px" }}
          >
            {showDetails ? "Hide Details" : "Show Details"}
          </Button>
          )}
        </Grid>
      </Grid>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "start",
          marginTop: 2,
          gap: 2,
        }}
      >
        <Box
          ref={mapContainerRef}
          sx={{ height: "700px", width: "70%", borderRadius: 2, boxShadow: 3 }}
        />

        {showDetails && !backtraceMode && (
          <Paper
            elevation={3}
            sx={{
              width: "30%",
              padding: 2,
              borderRadius: 2,
              bgcolor: "#f4f4f4",
            }}
          >
            <Typography variant="h6" align="center">
              📍 Live Tracking Details
            </Typography>

            {filteredData[index] ? (
              <Card sx={{ mt: 1 }}>
                <CardContent>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Typography sx={{ fontWeight: "bold" }}>
                            User ID
                          </Typography>
                        }
                        secondary={filteredData[index]?.userId || "-"}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Typography sx={{ fontWeight: "bold" }}>
                            Speed
                          </Typography>
                        }
                        secondary={`${filteredData[index]?.speed || "-"} km/h`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Typography sx={{ fontWeight: "bold" }}>
                            Motion
                          </Typography>
                        }
                        secondary={
                          filteredData[index]?.isMoving
                            ? "🚶‍♂️ Moving"
                            : "🛑 Stopped"
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Typography sx={{ fontWeight: "bold" }}>
                            GPS Accuracy
                          </Typography>
                        }
                        secondary={`${filteredData[index]?.accuracy || "-"} meters`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Typography sx={{ fontWeight: "bold" }}>
                            Distance Traveled
                          </Typography>
                        }
                        secondary={
                          filteredData[index]?.odometer
                            ? `${(filteredData[index]?.odometer / 1000).toFixed(2)} km`
                            : "-"
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Typography sx={{ fontWeight: "bold" }}>
                            Activity
                          </Typography>
                        }
                        secondary={filteredData[index]?.activityType || "-"}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Typography sx={{ fontWeight: "bold" }}>
                            Battery Level
                          </Typography>
                        }
                        secondary={`${Math.round((filteredData[index]?.batteryLevel || 0) * 100)}%`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Typography sx={{ fontWeight: "bold" }}>
                            Charging
                          </Typography>
                        }
                        secondary={
                          filteredData[index]?.batteryCharging
                            ? "⚡ Plugged In"
                            : "🔋 Not Charging"
                        }
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            ) : (
              <Typography align="center" color="textSecondary">
                No Data Available
              </Typography>
            )}
          </Paper>
        )}
      </Box>
      <Grid item xs={12} padding={5}>
        {/* <Typography gutterBottom>Timeline Control</Typography> */}
         {!backtraceMode && (

        <ThemeProvider theme={theme}>
          <Slider
            value={index}
            onChange={(e, newValue) => setIndex(newValue as number)}
            min={0}
            max={data.length - 1}
            valueLabelDisplay="auto"
            valueLabelFormat={value =>
              data[value]
                ? new Date(data[value].timestamp).toLocaleString()
                : "N/A"
            }
            sx={{ width: "80%" }}
          />
        </ThemeProvider>
        )}
      </Grid>
    </Box>
  )
}

export default App

