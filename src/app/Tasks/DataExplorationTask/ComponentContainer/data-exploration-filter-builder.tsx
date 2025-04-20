import React, { useState } from "react"
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Box,
  Button,
  ThemeProvider,
  createTheme,
  Chip,
} from "@mui/material"
import { useAppDispatch, useAppSelector } from "../../../../store/store"
import { setControls } from "../../../../store/slices/workflowPageSlice"
import { defaultDataExplorationQuery } from "../../../../shared/models/dataexploration.model"
import { fetchDataExplorationData } from "../../../../shared/models/tasks/data-exploration-task.model"

const FilterBuilder = () => {
  const dispatch = useAppDispatch()
  const { tab } = useAppSelector(state => state.workflowPage)

  const originalColumns =
    tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns || []
  const uniqueValues =
    tab?.workflowTasks.dataExploration?.metaData.data?.uniqueColumnValues || []

  // Local states for selected filter input
  const [selectedColumn, setSelectedColumn] = useState("")
  const [filterType, setFilterType] = useState("")
  const [equalsValue, setEqualsValue] = useState("")

  const handleAddFilter = () => {
    if (!selectedColumn || !filterType) return

    const newFilter =
      filterType === "equals"
        ? { column: selectedColumn, type: "equals", value: equalsValue }
        : { column: selectedColumn, type: "range" }

    // Step 1: Update Redux with new filter
    const existingFilters =
      tab?.workflowTasks.dataExploration?.controlPanel?.filters || []
    const updatedFilters = [...existingFilters, newFilter]

    dispatch(setControls({ filters: updatedFilters }))

    // Step 2: Fetch data immediately with updated filters
    dispatch(
      fetchDataExplorationData({
        query: {
          ...defaultDataExplorationQuery,
          datasetId:  tab?.dataTaskTable.selectedItem?.data?.source || "",
          filters: updatedFilters,
          columns:
            tab?.workflowTasks.dataExploration?.controlPanel?.selectedColumns?.map(
              col => col.name,
            ) || [],
        },
        metadata: {
          workflowId: tab?.workflowId || "",
          queryCase: "chart",
        },
      }),
    )
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

  const handleDeleteFilter = (indexToDelete: number) => {
    const existingFilters =
      tab?.workflowTasks.dataExploration?.controlPanel?.filters || []

    const updatedFilters = existingFilters.filter(
      (_: any, idx: number) => idx !== indexToDelete,
    )

    dispatch(setControls({ filters: updatedFilters }))

    dispatch(
      fetchDataExplorationData({
        query: {
          ...defaultDataExplorationQuery,
          datasetId:  tab?.dataTaskTable.selectedItem?.data?.source || "",
          filters: updatedFilters,
          columns:
            tab?.workflowTasks.dataExploration?.controlPanel?.selectedColumns?.map(
              col => col.name,
            ) || [],
        },
        metadata: {
          workflowId: tab?.workflowId || "",
          queryCase: "chart",
        },
      }),
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <Box display="flex" flexDirection="column" gap={2}>
        {/* Column Selector */}
        <FormControl fullWidth>
          <InputLabel id="column-select-label">Column</InputLabel>
          <Select
            labelId="column-select-label"
            value={selectedColumn}
            label="Column"
            onChange={e => {
              setSelectedColumn(e.target.value)
              setFilterType("")
              setEqualsValue("")
            }}
            MenuProps={{
              PaperProps: { style: { maxHeight: 224, width: 250 } },
            }}
          >
            {originalColumns.map((col: any) => (
              <MenuItem key={col.name} value={col.name}>
                {col.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Filter Type Selector */}
        {selectedColumn && (
          <FormControl fullWidth>
            <InputLabel id="filter-type-label">Filter Type</InputLabel>
            <Select
              labelId="filter-type-label"
              value={filterType}
              label="Filter Type"
              onChange={e => setFilterType(e.target.value)}
              MenuProps={{
                PaperProps: { style: { maxHeight: 224, width: 250 } },
              }}
            >
              <MenuItem value="equals">Equals</MenuItem>
              <MenuItem value="range">Range</MenuItem>
            </Select>
          </FormControl>
        )}

        {/* Equals Value Selector */}
        {selectedColumn && filterType === "equals" && (
          <FormControl fullWidth>
            <InputLabel id="equals-value-label">Value</InputLabel>
            <Select
              labelId="equals-value-label"
              value={equalsValue}
              label="Value"
              onChange={e => setEqualsValue(e.target.value)}
              MenuProps={{
                PaperProps: { style: { maxHeight: 224, width: 250 } },
              }}
            >
              {uniqueValues[selectedColumn]?.map((value: any) => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Submit */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddFilter}
          disabled={!filterType}
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
        <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
          {(
            tab?.workflowTasks.dataExploration?.controlPanel?.filters || []
          ).map((filter: any, index: number) => (
            <Chip
              key={index}
              label={`${filter.column} ${filter.type} ${
                filter.type === "equals" ? filter.value : ""
              }`}
              onDelete={() => handleDeleteFilter(index)}
              color="primary"
              // variant="outlined"
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
    </ThemeProvider>
  )
}

export default FilterBuilder
