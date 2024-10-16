import React from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select, OutlinedInput, Checkbox } from '@mui/material';

const LineChartControlPanel = ({ columns, xAxis, setXAxis, yAxis, setYAxis, groupFunction, setGroupFunction }) => {
  return (
    <Box sx={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
      {/* X-Axis Selector */}
      <FormControl fullWidth>
        <InputLabel id="x-axis-select-label">X-Axis</InputLabel>
        <Select
          labelId="x-axis-select-label"
          value={xAxis ? xAxis.name : ''} // Display column name if xAxis is selected
          onChange={(e) => {
            const selectedColumn = columns.find((col) => col.name === e.target.value);
            setXAxis(selectedColumn); // Set the entire column object as xAxis
          }}
          label="X-Axis"
          MenuProps={{ PaperProps: { style: { maxHeight: 224, width: 250 } } }}

        >
          {columns.map((col) => (
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
          value={yAxis.map((col) => col.name)} // Display names of selected yAxis columns
          onChange={(e) => {
            const selectedColumns = e.target.value.map((name) => columns.find((col) => col.name === name));
            setYAxis(selectedColumns); // Set array of column objects as yAxis
          }}
          input={<OutlinedInput label="Y-Axis" />}
          renderValue={(selected) => selected.join(', ')}
          MenuProps={{ PaperProps: { style: { maxHeight: 224, width: 250 } } }}

        >
          {columns.map((col) => (
            <MenuItem key={col.name} value={col.name}>
              <Checkbox checked={yAxis.some((yCol) => yCol.name === col.name)} />
              {col.name} {/* Only show the column name */}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Group Function Selector */}
      <FormControl fullWidth>
        <InputLabel id="group-function-select-label">Group Function</InputLabel>
        <Select
          labelId="group-function-select-label"
          value={groupFunction}
          onChange={(e) => setGroupFunction(e.target.value)}
          label="Group Function"
        >
          <MenuItem value="sum">Sum</MenuItem>
          <MenuItem value="avg">Average</MenuItem>
          <MenuItem value="max">Max</MenuItem>
          <MenuItem value="min">Min</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default LineChartControlPanel;

