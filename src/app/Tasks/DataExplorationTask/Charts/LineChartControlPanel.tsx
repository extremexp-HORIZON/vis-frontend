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
import { VisualColumn } from "../../../../shared/models/dataexploration.model"

interface LineChartControlPanelProps {
  columns: VisualColumn[]
  xAxis: VisualColumn
  setXAxis: React.Dispatch<React.SetStateAction<VisualColumn>>
  yAxis: VisualColumn[]
  setYAxis: React.Dispatch<React.SetStateAction<VisualColumn[]>>

}

const LineChartControlPanel = ({
  columns,
  xAxis,
  setXAxis,
  yAxis,
  setYAxis,
}: LineChartControlPanelProps) => {
 
  useEffect(() => {
    if (columns && columns.length > 0) {
      // Filter the yAxis columns to keep only the ones that still exist in `columns`
      const validYAxis = yAxis.filter(yCol =>
        columns.find(col => col.name === yCol.name),
      )

      if (validYAxis.length !== yAxis.length) {
        setYAxis(validYAxis) // Reset the yAxis to only valid columns if any are invalid
      }
    }
  }, [columns, yAxis, setYAxis])

  return (
    <Box sx={{ display: "flex", gap: "1rem",marginTop: "1rem",flexDirection: "column" }}>
      {/* X-Axis Selector */}
      <FormControl fullWidth>
        <InputLabel id="x-axis-select-label">X-Axis</InputLabel>
        <Select
          labelId="x-axis-select-label"
          value={xAxis ? xAxis.name : ""} // Display column name if xAxis is selected
          onChange={e => {
            const selectedColumn = columns.find(
              col => col.name === e.target.value,
            )
            setXAxis(selectedColumn ?? xAxis) // Use the nullish coalescing operator to provide a default value
          }}
          label="X-Axis"
          MenuProps={{ PaperProps: { style: { maxHeight: 224, width: 250 } } }}
        >
          {columns.map(col => (
            <MenuItem key={col.name} value={col.name}>
              {col.name} {/* Only show the column name */}
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
          value={yAxis.map(col => col.name)} // Display names of selected yAxis columns
          onChange={e => {
            const selectedColumns = Array.isArray(e.target.value)
              ? e.target.value.map(name =>
                  columns.find(col => col.name === name),
                )
              : [columns.find(col => col.name === e.target.value)]
            const validColumns = selectedColumns.filter(
              col => col !== undefined,
            )
            setYAxis(validColumns)
          }}
          input={<OutlinedInput label="Y-Axis" />}
          renderValue={selected => selected.join(", ")}
          MenuProps={{ PaperProps: { style: { maxHeight: 224, width: 250 } } }}
        >
          {columns.map(col => (
            <MenuItem key={col.name} value={col.name}>
              <Checkbox checked={yAxis.some(yCol => yCol.name === col.name)} />
              {col.name} {/* Only show the column name */}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  )
}

export default LineChartControlPanel
