import React, { Dispatch, SetStateAction, useEffect, useState } from "react"
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Tooltip,
  Slider,
  Chip,
} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import InfoIcon from "@mui/icons-material/Info"
import { grey } from "@mui/material/colors"
import ViewColumnIcon from "@mui/icons-material/ViewColumn"
import FilterAltIcon from "@mui/icons-material/FilterAlt"
import { createTheme, ThemeProvider } from "@mui/material"
import {
  IFilter,
  VisualColumn,
} from "../../../../shared/models/dataexploration.model"
import LineChartControlPanel from "../Charts/LineChartControlPanel"
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest"
import BarChartControlPanel from "../Charts/BarChartControlPanel"
import ScatterChartControlPanel from "../Charts/ScatterChartControlPanel"
import MapControls from "../Charts/MapChartControlPanel"

interface IControlPanel {
  originalColumns: VisualColumn[]
  selectedColumns: VisualColumn[]
  setSelectedColumns: Dispatch<SetStateAction<VisualColumn[]>>
  onFetchData: () => void
  filters: IFilter[]
  setFilters: Dispatch<SetStateAction<IFilter[]>>
  uniqueValues: string[]
  chartType: "datatable" | "line" | "bar" | "scatter" | "map"
  columns: VisualColumn[]
  xAxis: VisualColumn
  setXAxis: React.Dispatch<React.SetStateAction<VisualColumn>>
  yAxis: VisualColumn[]
  setYAxis: React.Dispatch<React.SetStateAction<VisualColumn[]>>
  barGroupBy: string[]
  setBarGroupBy: (value: string[]) => void
  barAggregation: { [key: string]: string[] }
  setBarAggregation: (value: { [key: string]: string[] }) => void
  yAxisScatter: VisualColumn[]
  setYAxisScatter: React.Dispatch<React.SetStateAction<VisualColumn[]>>
  xAxisScatter: VisualColumn
  setXAxisScatter: React.Dispatch<React.SetStateAction<VisualColumn>>

  colorBy: string
  setColorBy: (colorBy: string) => void
  datamap: any
  colorByMap: string
  setColorByMap: Dispatch<SetStateAction<string>>
  columnsMap: any
  columnsMapDouble: any

  tripsMode: boolean
  setTripsMode: Dispatch<SetStateAction<boolean>>
  selectedColumnsMap: any
  setSelectedColumnsMap: (selectedColumnMap: any) => void
  lat: VisualColumn
  setLat: React.Dispatch<React.SetStateAction<VisualColumn>>
  lon: VisualColumn
  setLon: React.Dispatch<React.SetStateAction<VisualColumn>>

}

const ControlPanel = (props: IControlPanel) => {
  const {
    originalColumns,
    selectedColumns,
    setSelectedColumns,
    onFetchData,
    filters,
    setFilters,
    uniqueValues,
    chartType,
    columns,
    xAxis,
    setXAxis,
    yAxis,
    setYAxis,
    barGroupBy,
    setBarGroupBy,
    barAggregation,
    setBarAggregation,
    yAxisScatter,
    setYAxisScatter,
    xAxisScatter,
    setXAxisScatter,
    colorBy,
    setColorBy,
    datamap,
    colorByMap,
    setColorByMap,
    columnsMap,
    tripsMode,
    setTripsMode,
    selectedColumnsMap,
    setSelectedColumnsMap,
    lat,
    setLat,
    lon,
    setLon,
    columnsMapDouble
  } = props
  const handleChange = event => {
    const {
      target: { value },
    } = event
    setSelectedColumns(typeof value === "string" ? value.split(",") : value)
  }

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
  console.log("lat",lat,lon)
  const [showColumnDropdown, setShowColumnDropdown] = useState(true)
  const [showChartTypeDropdown, setShowChartTypeDropdown] = useState(true)
  const [showFilterDropdown, setShowFilterDropdown] = useState(true)
  const [filterColumn, setFilterColumn] = useState("") // Selected column
  const [filterType, setFilterType] = useState("equals") // 'equals' or 'range'
  const [filterValue, setFilterValue] = useState("") // For equals, or range object {min, max}
  const [sliderRange, setSliderRange] = useState([0, 100]) // Min and Max values for the slider

  // useEffect(() => {
  //   onFetchData()
  // }, [filters]) // Runs every time filters change
  useEffect(() => {
    // Update slider range (min, max) whenever a new column is selected for range filtering
    if (
      filterType === "range" &&
      originalColumns.find(col => col.name === filterColumn)?.type !==
        "STRING" &&
      originalColumns.find(col => col.name === filterColumn)?.type !==
        "LOCAL_DATE_TIME"
    ) {
      const columnValues =
        uniqueValues[filterColumn]?.map(Number).filter(v => !isNaN(v)) || []
      const min = Math.min(...columnValues)
      const max = Math.max(...columnValues)
      setSliderRange([min, max])
      setFilterValue({ min, max }) // Set default slider values to min and max
    }
    if (
      filterType === "range" &&
      originalColumns.find(col => col.name === filterColumn)?.type === "STRING"
    ) {
      setFilterType("equals") // Switch to 'equals' filtering when a string column is selected(
    }

    if (
      filterType === "range" &&
      originalColumns.find(col => col.name === filterColumn)?.type ===
        "LOCAL_DATE_TIME"
    ) {
      const columnValues = (uniqueValues[filterColumn] || [])
        .map(dateStr => new Date(dateStr).getTime())
        .filter(timestamp => !isNaN(timestamp))

      if (columnValues.length > 0) {
        const min = Math.min(...columnValues)
        const max = Math.max(...columnValues)

        setSliderRange([
          new Date(min).toISOString().slice(0, 16),
          new Date(max).toISOString().slice(0, 16),
        ])
        setFilterValue({
          min: new Date(min).toISOString().slice(0, 16),
          max: new Date(max).toISOString().slice(0, 16),
        })
      }
    }
  }, [filterColumn, filterType, uniqueValues])

  const handleAddFilter = () => {
    const newFilter = {
      column: filterColumn,
      type: filterType,
      // If filterType is 'equals', only add the 'value'
      value: filterType === "equals" ? filterValue : undefined,
      // If filterType is 'range', add 'min' and 'max' as top-level properties
      ...(filterType === "range" && {
        min: filterValue.min,
        max: filterValue.max,
      }),
    }

    setFilters([...filters, newFilter])
  }

  const handleDeleteFilter = index => {
    const updatedFilters = filters.filter((_, i) => i !== index)
    setFilters(updatedFilters)
  }
  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      if (
        originalColumns.find(col => col.name === filterColumn)?.type ===
        "LOCAL_DATE_TIME"
      ) {
        // If the filter column is of type LOCAL_DATE_TIME (date), convert the slider values to ISO strings
        setFilterValue({
          min: new Date(newValue[0]).toISOString().slice(0, 16),
          max: new Date(newValue[1]).toISOString().slice(0, 16),
        })
      } else {
        // Otherwise, for numeric values, just set the min and max directly
        setFilterValue({ min: newValue[0], max: newValue[1] })
      }
    }
  }

  // Determine the display value for the Select component
  const getDisplayValue = () => {
    if (selectedColumns.length === 0) return "None selected"
    if (selectedColumns.length === originalColumns.length) return "All selected"
    return selectedColumns.join(", ") // Show selected columns
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: "25%", padding: 2, borderRight: "1px solid #ccc" }}>
        <Box sx={{ marginTop: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              borderBottom: `1px solid ${grey[400]}`,
            }}
          >
            <ViewColumnIcon />
            <Typography
              variant="h6"
              onClick={() => setShowColumnDropdown(!showColumnDropdown)}
              sx={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                ml: 1,
                fontWeight: "bold",
              }}
              color="primary"
            >
              Columns
              <ExpandMoreIcon
                sx={{
                  color: "primary",
                  transform: showColumnDropdown
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                  transition: "transform 0.3s ease-in-out",
                }}
              />
            </Typography>
          </Box>
          <Box sx={{ marginTop: 3 }} /> {/* Adjust spacing as needed */}
          {showColumnDropdown && (
            <FormControl fullWidth>
              <InputLabel id="column-select-label">Select Columns</InputLabel>
              <Select
                labelId="column-select-label"
                multiple
                label="Select Columns"
                value={selectedColumns}
                onChange={handleChange}
                renderValue={getDisplayValue} // Use the new display function
                onClose={onFetchData}
                MenuProps={{
                  PaperProps: { style: { maxHeight: 224, width: 250 } },
                }}
              >
                {originalColumns.map((column: any) => (
                  <MenuItem key={column.name} value={column.name}>
                    <Checkbox
                      checked={selectedColumns.indexOf(column.name) > -1}
                    />
                    <ListItemText primary={column.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <Box sx={{ marginTop: 3 }} /> {/* Adjust spacing as needed */}
          <Box sx={{ marginTop: 3 }} /> {/* Adjust spacing as needed */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              borderBottom: `1px solid ${grey[400]}`,
            }}
          >
            <FilterAltIcon />
            <Typography
              variant="h6"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              sx={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                ml: 1,
                fontWeight: "bold",
              }}
              color="primary"
            >
              Filters
              <ExpandMoreIcon
                sx={{
                  color: "primary",
                  transform: showFilterDropdown
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                  transition: "transform 0.3s ease-in-out",
                }}
              />
            </Typography>
          </Box>
          {showFilterDropdown && (
            <Box>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="column-select-label">Select Column</InputLabel>
                <Select
                  labelId="column-select-label"
                  value={filterColumn}
                  label="Select Column"
                  onChange={e => setFilterColumn(e.target.value)}
                  MenuProps={{
                    PaperProps: { style: { maxHeight: 224, width: 250 } },
                  }}
                >
                  {originalColumns.map((column: any) => (
                    <MenuItem key={column.name} value={column.name}>
                      <ListItemText primary={column.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="type-select-label">
                  Select Filter Type
                </InputLabel>
                <Select
                  labelId="type-select-label"
                  label="Select Filter Type"
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  MenuProps={{
                    PaperProps: { style: { maxHeight: 224, width: 250 } },
                  }}
                >
                  <MenuItem value="equals">Equals</MenuItem>
                  <MenuItem
                    value="range"
                    disabled={
                      originalColumns.find(col => col.name === filterColumn)
                        ?.type === "STRING"
                    }
                  >
                    Range
                  </MenuItem>
                </Select>
              </FormControl>

              {filterType === "equals" ? (
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel id="value-select-label">Select Value</InputLabel>
                  <Select
                    labelId="value-select-label"
                    id="value-select"
                    label="Select Value"
                    value={filterValue}
                    onChange={e => setFilterValue(e.target.value)}
                    MenuProps={{
                      PaperProps: { style: { maxHeight: 224, width: 250 } },
                    }}
                  >
                    {uniqueValues[filterColumn]?.slice(0, 100).map(value => (
                      <MenuItem key={value} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <Box sx={{ mt: 2 }}>
                  <Typography gutterBottom>Range</Typography>

                  {/* Conditionally render the slider based on the type */}
                  {filterType === "range" &&
                  originalColumns.find(col => col.name === filterColumn)
                    ?.type === "LOCAL_DATE_TIME" ? (
                    // For date-time range slider
                    <>
                      <Slider
                        value={[
                          new Date(filterValue.min).getTime(),
                          new Date(filterValue.max).getTime(),
                        ]}
                        onChange={handleSliderChange}
                        valueLabelDisplay="auto"
                        min={new Date(sliderRange[0]).getTime()}
                        max={new Date(sliderRange[1]).getTime()}
                        // valueLabelFormat={(value) => new Date(value).toISOString().slice(0, 16)} // Format label as ISO string
                      />
                      {/* <Typography>Min: {new Date(filterValue.min).toISOString().slice(0, 16)}</Typography>
                    <Typography>Max: {new Date(filterValue.max).toISOString().slice(0, 16)}</Typography> */}
                    </>
                  ) : (
                    // For numeric range slider
                    <>
                      <Slider
                        value={[filterValue.min, filterValue.max]}
                        onChange={handleSliderChange}
                        valueLabelDisplay="auto"
                        min={sliderRange[0]}
                        max={sliderRange[1]}
                      />
                      <Typography>Min: {filterValue.min}</Typography>
                      <Typography>Max: {filterValue.max}</Typography>
                    </>
                  )}
                </Box>
              )}

              <Button
                variant="contained"
                color="primary"
                onClick={handleAddFilter}
                sx={{
                  mt: 2,
                  "&:hover": {
                    backgroundColor: theme => theme.palette.primary.dark,
                    transform: "scale(1.05)",
                  },
                }}
              >
                Add Filter
              </Button>

              {/* Render Filters */}
              <Box sx={{ mt: 3, display: "flex", flexWrap: "wrap", gap: 1 }}>
                {filters.map((filter, index) => (
                  <Chip
                    key={index}
                    label={`${filter.column} ${filter.type} ${
                      filter.type === "equals"
                        ? filter.value
                        : `${filter.min} - ${filter.max}`
                    }`}
                    onDelete={() => handleDeleteFilter(index)}
                    color="primary"
                    sx={{
                      margin: 0.5,
                      minWidth: "200px", // Set a minimum width to prevent shrinking
                      maxWidth: "200px", // Set a max width so it won't grow indefinitely
                      whiteSpace: "nowrap", // Prevent text from wrapping
                      overflow: "hidden", // Hide the overflowed text
                      textOverflow: "ellipsis", // Show ellipsis when text overflows
                      transition: "max-width 0.3s ease", // Smooth transition when expanding
                      "&:hover": {
                        maxWidth: "500px", // Allow it to expand on hover (set to desired max width)
                        whiteSpace: "normal", // Allow the text to wrap normally on hover
                        // backgroundColor: theme => theme.palette.action.hover,  // Highlight on hover
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>

        <Box sx={{ marginTop: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              borderBottom: `1px solid ${grey[400]}`,
            }}
          >
            <SettingsSuggestIcon />
            <Typography
              variant="h6"
              onClick={() => setShowChartTypeDropdown(!showChartTypeDropdown)}
              sx={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                ml: 1,
                fontWeight: "bold",
              }}
              color="primary"
            >
              Options{" "}
              <ExpandMoreIcon
                sx={{
                  color: "primary",
                  transform: showChartTypeDropdown
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                  transition: "transform 0.3s ease-in-out",
                }}
              />
              {/* <Tooltip title="Select the columns for display." arrow>
                  <InfoIcon
                    sx={{ marginLeft: 1, fontSize: 16, color: "gray" }}
                  />
                </Tooltip> */}
            </Typography>
          </Box>
          {showChartTypeDropdown && (
            <Box>
              {chartType === "line" && (
                <LineChartControlPanel
                  columns={columns}
                  xAxis={xAxis}
                  setXAxis={setXAxis}
                  yAxis={yAxis}
                  setYAxis={setYAxis}
                />
              )}

              {chartType === "bar" && (
                <BarChartControlPanel
                  originalColumns={originalColumns}
                  barGroupBy={barGroupBy}
                  setBarGroupBy={setBarGroupBy}
                  barAggregation={barAggregation}
                  setBarAggregation={setBarAggregation}
                />
              )}

              {chartType === "scatter" && (
                <ScatterChartControlPanel
                  columns={columns}
                  xAxis={xAxisScatter}
                  setXAxis={setXAxisScatter}
                  yAxis={yAxisScatter}
                  setYAxis={setYAxisScatter}
                  colorBy={colorBy}
                  setColorBy={setColorBy}
                />
              )}
              {chartType === "map" && (
                <MapControls
                  columns={columnsMap}
                  colorBy={colorByMap}
                  setColorBy={setColorByMap}
                  selectedColumns={selectedColumnsMap}
                  setSelectedColumns={setSelectedColumnsMap}
                  timestampField={"timestamp"}
                  data={[datamap]}
                  tripsMode={tripsMode}
                  setTripsMode={setTripsMode}
                  sliderValue={0}
                  setSliderValue={function (
                    value: React.SetStateAction<number>,
                  ): void {
                    throw new Error("Function not implemented.")
                  }}
                  lat={lat}
                  lon={lon}
                  setLat={setLat}
                  setLon={setLon}
                  columnsMapDouble={columnsMapDouble}
                />
              )}
            </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default ControlPanel
