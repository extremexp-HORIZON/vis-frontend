import React, { useEffect } from "react"
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  OutlinedInput,
  Checkbox,
} from "@mui/material"
import { useAppDispatch, useAppSelector } from "../../../../store/store"
import { setControls } from "../../../../store/slices/workflowPageSlice"

const LineChartControlPanel = () => {
  const dispatch = useAppDispatch()
  const tab = useAppSelector(state => state.workflowPage.tab)
  const controlPanel = tab?.workflowTasks.dataExploration?.controlPanel
  const columns = tab?.workflowTasks.dataExploration?.controlPanel?.selectedColumns || []

  const xAxis = controlPanel?.xAxis
  const yAxis = controlPanel?.yAxis || []
 

  // Auto-clean yAxis if columns no longer exist
  useEffect(() => {
    const validYAxis = yAxis.filter(yCol => columns.find(col => col.name === yCol.name))
    if (validYAxis.length !== yAxis.length) {
      dispatch(setControls({ yAxis: validYAxis }))
    }
  }, [columns, yAxis])

  const handleXAxisChange = (event: { target: { value: string } }) => {
    const selected = columns.find(col => col.name === event.target.value)
    if (selected) {
      dispatch(setControls({ xAxis: selected }))
    }
  }

  const handleYAxisChange = (event: { target: { value: any } }) => {
    const selectedNames = event.target.value
    const selectedCols = selectedNames
      .map((name: string) => columns.find(col => col.name === name))
      .filter(Boolean)
    dispatch(setControls({ yAxis: selectedCols }))
  }

  return (
    columns.length > 0 && (
      <Box sx={{ display: "flex", gap: "1rem", marginTop: "1rem", flexDirection: "column" }}>
        {/* X-Axis Selector */}
        <FormControl fullWidth>
          <InputLabel id="x-axis-select-label">X-Axis</InputLabel>
          <Select
            labelId="x-axis-select-label"
            value={xAxis?.name || ""}
            onChange={handleXAxisChange}
            label="X-Axis"
            MenuProps={{ PaperProps: { style: { maxHeight: 224, width: 250 } } }}
          >
            {columns.map(col => (
              <MenuItem key={col.name} value={col.name}>
                {col.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Y-Axis Multi-Selector */}
        <FormControl fullWidth>
          <InputLabel id="y-axis-multi-select-label">Y-Axis</InputLabel>
          <Select
            labelId="y-axis-multi-select-label"
            multiple
            value={yAxis.map(col => col.name)}
            onChange={handleYAxisChange}
            input={<OutlinedInput label="Y-Axis" />}
            renderValue={(selected) => selected.join(", ")}
            MenuProps={{ PaperProps: { style: { maxHeight: 224, width: 250 } } }}
          >
            {columns.map(col => (
              <MenuItem key={col.name} value={col.name}>
                <Checkbox checked={yAxis.some(yCol => yCol.name === col.name)} />
                {col.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    )
  )
}

export default LineChartControlPanel
