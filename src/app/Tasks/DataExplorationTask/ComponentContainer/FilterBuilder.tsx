import React, { useState } from "react"
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Box,
  Button,
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
  console.log("uniqueValues", uniqueValues)

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
          datasetId: "I2Cat_phising/dataset/I2Cat_phising_dataset.csv",
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
      >
        Add Filter
      </Button>
    </Box>
  )
}

export default FilterBuilder
