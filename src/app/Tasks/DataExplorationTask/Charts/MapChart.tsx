// import React, { useState, useEffect, useRef } from "react"
// import L from "leaflet"
// import "leaflet/dist/leaflet.css"
// import {
//   Box,
//   MenuItem,
//   Select,
//   FormControl,
//   InputLabel,
//   Checkbox,
//   ListItemText,
//   Typography,
//   OutlinedInput,
// } from "@mui/material"
// import { useAppDispatch } from "../../../../store/store"
// import { fetchDataExplorationData } from "../../../../shared/models/tasks/data-exploration-task.model"

// const App = () => {
//   const mapRef = useRef<L.Map | null>(null)
//   const mapContainerRef = useRef(null)
//   const [data, setData] = useState<any[]>([])
//   const [selectedColumns, setSelectedColumns] = useState<string[]>([])
//   const [columns, setColumns] = useState<string[]>([])
//   const [colorMap, setColorMap] = useState<Record<string, string>>({})
//   const [mapLayer, setMapLayer] = useState<keyof typeof layers>("osm")
//   const layers = {
//     osm: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
//     satellite: "https://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}&s=Ga",
//   }
//   const dispatch = useAppDispatch()

//   useEffect(() => {
//     const fetchData = async () => {
//       const resultAction = await dispatch(
//         fetchDataExplorationData({
//           query: {
//             datasetId: "/test/newresult.csv",
//             limit: 0,
//             columns: [],
//             filters: [],
//             groupBy: [],
//             aggregation: {},
//             offset: 0,
//           },
//           metadata: {
//             workflowId: "",
//             queryCase: "mapChart",
//           },
//         }),
//       )
//       if (fetchDataExplorationData.fulfilled.match(resultAction)) {
//         const data = resultAction.payload
//         setData(JSON.parse(data.data))

//         // Extract column names that are strings (for dropdown options)
//         const stringColumns = Object.keys(
//           JSON.parse(data.data)[0] || {},
//         ).filter(key => typeof JSON.parse(data.data)[0][key] === "string" && key !== "timestamp" )
//         setColumns(stringColumns)
//       }
//     }
//     fetchData()
//   }, [dispatch])

//   const generateColorMap = (data: any[], groupKeys: string[]) => {
//     const colors: Record<string, string> = {}
//     data.forEach(row => {
//       const compositeKey = groupKeys.map(key => row[key]).join("-")
//       if (!colors[compositeKey]) {
//         colors[compositeKey] = generateRandomColor()
//       }
//     })
//     return colors
//   }

//   const handleColumnSelectionChange = (
//     event: React.ChangeEvent<{ value: unknown }>,
//   ) => {
//     setSelectedColumns(event.target.value as string[])
//   }

//   useEffect(() => {
//     if (data.length > 0 && selectedColumns.length > 0) {
//       const colors = generateColorMap(data, selectedColumns)
//       setColorMap(colors)
//     }
//   }, [data, selectedColumns])

//   useEffect(() => {
//     if (!mapRef.current && mapContainerRef.current && data.length > 0) {
//       mapRef.current = L.map(mapContainerRef.current).setView(
//         [data[0].latitude, data[0].longitude],
//         15,
//       )
//       L.tileLayer(layers[mapLayer]).addTo(mapRef.current)
//     }
//   }, [data])

//   useEffect(() => {
//     if (mapRef.current) {
//       mapRef.current.eachLayer(layer => {
//         if (layer instanceof L.TileLayer) {
//           mapRef.current?.removeLayer(layer)
//         }
//       })
//       L.tileLayer(layers[mapLayer]).addTo(mapRef.current)
//     }
//   }, [mapLayer])

//   useEffect(() => {
//     if (!mapRef.current) return

//     mapRef.current.eachLayer(layer => {
//       if (layer instanceof L.LayerGroup) {
//         mapRef.current?.removeLayer(layer)
//       }
//     })

//     const layerGroup = L.layerGroup().addTo(mapRef.current)

//     data.forEach(row => {
//       if (row.latitude && row.longitude) {
//         const compositeKey = selectedColumns.map(key => row[key]).join("-")
//         const color = colorMap[compositeKey] || "#3388FF"
//         L.circleMarker([row.latitude, row.longitude], {
//           radius: 10,
//           color,
//           weight: 2,
//           opacity: 1,
//           fillOpacity: 1,
//         })
//           .addTo(layerGroup)
//           .bindPopup(
//             `<div>
//                ${selectedColumns.map(col => `<p><strong>${col}:</strong> ${row[col]}</p>`).join("")}
//                <p><strong>Latitude:</strong> ${row.latitude}</p>
//                <p><strong>Longitude:</strong> ${row.longitude}</p>
//              </div>`,
//           )
//       }
//     })
//   }, [data, selectedColumns, colorMap])

//   const generateRandomColor = () =>
//     `#${Math.floor(Math.random() * 16777215)
//       .toString(16)
//       .padStart(6, "0")}`

//   return (
//     <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//       <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
//         <FormControl sx={{ flex: 1 }}>
//           <InputLabel id="select-columns-label">Segment By</InputLabel>
//           <Select
//             labelId="select-columns-label"
//             multiple
//             value={selectedColumns}
//             onChange={handleColumnSelectionChange}
//             renderValue={selected => selected.join(", ")}
//             input={<OutlinedInput label="Segment By" />}
//             sx={{ width: "20%" }}
//           >
//             {columns.map(column => (
//               <MenuItem key={column} value={column}>
//                 <Checkbox checked={selectedColumns.includes(column)} />
//                 <ListItemText primary={column} />
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>
//       </Box>

//       <Box sx={{ position: "relative", height: "700px", width: "100%" }}>
//         <Box
//           ref={mapContainerRef}
//           sx={{
//             height: "100%",
//             width: "100%",
//             borderRadius: 2,
//             boxShadow: 3,
//           }}
//         />
//         <Box
//           sx={{
//             position: "absolute",
//             top: "10px",
//             right: "10px",
//             display: "flex",
//             flexDirection: "column",
//             gap: 1,
//             p: 2,
//             border: "1px solid #ccc",
//             borderRadius: 2,
//             backgroundColor: "#fff",
//             boxShadow: 1,
//             zIndex: 1000, // Ensures it appears above the map
//           }}
//         >
//           <Typography
//             variant="h6"
//             sx={{ mb: 1, textAlign: "center", width: "100%" }}
//           >
//             Legend
//           </Typography>
//           {Object.entries(colorMap).map(([key, color]) => {
//             const keyParts = key.split("-") // Split composite keys
//             return (
//               <Box
//                 key={key}
//                 sx={{ display: "flex", alignItems: "center", gap: 1 }}
//               >
//                 <Box
//                   sx={{
//                     width: 16,
//                     height: 16,
//                     borderRadius: "50%",
//                     backgroundColor: color,
//                   }}
//                 />
//                 <Typography variant="body2">
//                   {selectedColumns.map((col, index) => (
//                     <span key={col}>
//                       <strong>{col}:</strong> {keyParts[index]}
//                       {index < selectedColumns.length - 1 ? ", " : ""}
//                     </span>
//                   ))}
//                 </Typography>
//               </Box>
//             )
//           })}
//         </Box>
//       </Box>
//     </Box>
//   )
// }

// export default App

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
} from "@mui/material"
import { useAppDispatch } from "../../../../store/store"
import { fetchDataExplorationData } from "../../../../shared/models/tasks/data-exploration-task.model"
import { ExpandMore } from "@mui/icons-material"

const App = () => {
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

  const layers = {
    osm: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    satellite: "https://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}&s=Ga",
  }
  const dispatch = useAppDispatch()

  useEffect(() => {
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
        const data = resultAction.payload
        setData(JSON.parse(data.data))

        // Extract column names that are strings (for dropdown options)
        const stringColumns = Object.keys(
          JSON.parse(data.data)[0] || {},
        ).filter(
          key =>
            typeof JSON.parse(data.data)[0][key] === "string" &&
            key !== "timestamp",
        )

        const potentialLatColumns = ["lat", "latitude"]
        const potentialLonColumns = ["lon", "longitude"]
        const integerColumns = Object.keys(
          JSON.parse(data.data)[0] || {},
        ).filter(key => typeof JSON.parse(data.data)[0][key] === "number")

        const detectedLatitude =
          integerColumns.find(col =>
            potentialLatColumns.includes(col.toLowerCase()),
          ) || ""
        const detectedLongitude =
          integerColumns.find(col =>
            potentialLonColumns.includes(col.toLowerCase()),
          ) || ""
        console.log("detectedLatitude", detectedLatitude)

        setLatitudeField(detectedLatitude)
        setLongitudeField(detectedLongitude)
        setColumns(stringColumns)
        setIntColumns(integerColumns)
      }
    }
    fetchData()
  }, [dispatch])

  useEffect(() => {
    setTripsMode(!!timestampField && selectedColumns.length > 0)
  }, [timestampField, selectedColumns])

  const generateColorMap = (data: any[], colorBy: string) => {
    const colors: Record<string, string> = {}
    const categories = [...new Set(data.map(row => row[colorBy]))] // Get unique categories
    categories.forEach(category => {
      colors[category] = generateRandomColor() // Assign a random color to each category
    })
    return colors
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
      const trips: Record<string, any[]> = {}
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
        console.log("trips", trips)
        const tripCoords = trips[tripKey].map(row => [
          row.latitude,
          row.longitude,
        ])
        L.polyline(tripCoords, { color: generateRandomColor(), weight: 4 })
          .addTo(layerGroup)
          .bindTooltip(
            `<strong>Trip:</strong> ${tripKey} <br/>
             <strong>Segmented By:</strong> ${selectedColumns.join(", ")}`
          )
                    .on("mouseover", function (e) {
            this.openTooltip()
            this.bringToFront()
          })
          .on("mouseout", function (e) {
            this.closeTooltip()
          })
          .on("click", function (e) {
            layerGroup.eachLayer(layer => layer.setStyle({ opacity: 0.5 }))
            e.target.setStyle({ opacity: 1, weight: 8 })
            const tripBounds = e.target.getBounds()
  mapRef.current?.fitBounds(tripBounds, { padding: [20, 20] })
  


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
          radius: 3,
          color: color,
          fillOpacity: 0.5,
        })
          .addTo(layerGroup)
          .bindPopup(
            `
            <strong>Latitude:</strong> ${row.latitude} <br/>
            <strong>Longitude:</strong> ${row.longitude} <br/>
            <strong>Timestamp:</strong> ${row.timestamp} <br/>
          `,
          )
          .bindTooltip(`Latitude: ${row.latitude}, Longitude: ${row.longitude}`)
          .on("mouseover", function () {
            this.openTooltip()
          })
          .on("mouseout", function () {
            this.closeTooltip()
          })
      })

      const pointBounds = data.map(row =>
        row.latitude && row.longitude ? [row.latitude, row.longitude] : [],
      )
      if (pointBounds.length > 0) {
        const bounds = L.latLngBounds(pointBounds)
        mapRef.current.fitBounds(bounds)
      }
    }
  }, [data, selectedColumns, tripsMode, timestampField, colorBy, colorMap])

  const generateRandomColor = () =>
    `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")}`

  const handleSegmentByChange = (
    event: React.ChangeEvent<{ value: unknown }>,
  ) => {
    setSelectedColumns(event.target.value as string[])
    setColorBy("None") // Reset Color By to default
  }

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>Field Selection</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>Timestamp Field</InputLabel>
                  <Select
                    value={timestampField}
                    onChange={e => setTimestampField(e.target.value)}
                    disabled={!columns.some(col => col === "timestamp")}
                    renderValue={selected => selected}
                    input={<OutlinedInput label="Timestamp Field" />}
                  >
                    {columns.map(col => (
                      <MenuItem key={col} value={col}>
                        {col}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>Latitude Field</InputLabel>
                  <Select
                    value={latitudeField}
                    onChange={e => setLatitudeField(e.target.value)}
                    input={<OutlinedInput label="Latitude Field" />}
                    disabled={!intColumns.some(col => col === "otinani")}
                  >
                    {intColumns.map(col => (
                      <MenuItem key={col} value={col}>
                        {col}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>Longitude Field</InputLabel>
                  <Select
                    value={longitudeField}
                    onChange={e => setLongitudeField(e.target.value)}
                    input={<OutlinedInput label="Longitude Field" />}
                    disabled={!intColumns.some(col => col === "otinani")}
                  >
                    {intColumns.map(col => (
                      <MenuItem key={col} value={col}>
                        {col}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </AccordionDetails>
          </Accordion>

          <FormControl sx={{ flex: 1 }}>
            <InputLabel>Color By</InputLabel>
            <Select
              value={colorBy}
              onChange={e => setColorBy(e.target.value)}
              disabled={tripsMode} // Disable when showing paths
              input={<OutlinedInput label="Color By" />}
            >
              <MenuItem value="None">None</MenuItem>
              {columns.map(col => (
                <MenuItem key={col} value={col}>
                  {col}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl disabled={!timestampField} sx={{ flex: 1 }}>
            <InputLabel>Segment By</InputLabel>
            <Select
              multiple
              value={selectedColumns}
              onChange={handleSegmentByChange}
              renderValue={selected => selected.join(", ")}
              input={<OutlinedInput label="Segment By" />}
            >
              {columns.map(col => (
                <MenuItem key={col} value={col}>
                  <Checkbox checked={selectedColumns.includes(col)} />
                  <ListItemText primary={col} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Paper
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
            overflow: "auto", // Allow scrolling if content is larger than container
            overscrollBehavior: "contain", // Prevent the bounce effect at the edges
            scrollBehavior: "smooth", // Enable smooth scrolling (optional)
          }}
        >
          <Box
            ref={mapContainerRef}
            sx={{ height: "700px", width: "100%", border: "1px solid gray" }}
          />
        </Paper>
      </Box>
    </>
  )
}

export default App
