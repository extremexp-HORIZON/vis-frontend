import React, { useEffect } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select, OutlinedInput, Checkbox, SelectChangeEvent, Typography } from '@mui/material';
import { VisualColumn } from '../../../../shared/models/dataexploration.model';

interface ScatterChartControlPanelProps {
  columns: VisualColumn[];
  xAxis: VisualColumn;
  setXAxis: React.Dispatch<React.SetStateAction<VisualColumn>>
  yAxis: VisualColumn[];
  setYAxis: React.Dispatch<React.SetStateAction<VisualColumn[]>>
  colorBy: string;
  setColorBy: (colorBy: string) => void;

 
}



const ScatterChartControlPanel = ({ columns, xAxis, setXAxis, yAxis, setYAxis, colorBy, setColorBy }:ScatterChartControlPanelProps) => {
  console.log(columns)
  console.log(xAxis)
  useEffect(() => {
    if (columns && columns.length > 0) {

      // Check if current xAxis is still valid
      if (!xAxis || !columns.find(col => col.name === xAxis.name)) {
        setXAxis(columns[0]); // Use 'LOCAL DATE TIME' column if found, otherwise default to first column
      }

      // Filter the yAxis columns to keep only the ones that still exist in `columns`
      const validYAxis = yAxis.filter(yCol => columns.find(col => col.name === yCol.name));

      if (validYAxis.length !== yAxis.length) {
        setYAxis(validYAxis); // Reset the yAxis to only valid columns if any are invalid
      }

      // Ensure there is at least one column selected in yAxis
      if (validYAxis.length === 0 && columns.length > 1) {
        setYAxis([columns[1]]); // Set yAxis to the second column if no valid yAxis exists
      }
    }
  }, [columns, xAxis, yAxis, setXAxis, setYAxis,colorBy,setColorBy]);

  const handleColorByChange = (event: SelectChangeEvent<string>) => {
    setColorBy(event.target.value as string);
}




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
            setXAxis(selectedColumn ?? xAxis); // Use the nullish coalescing operator to provide a default value
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
            const selectedColumns = Array.isArray(e.target.value) ? e.target.value.map((name) => columns.find((col) => col.name === name)) : [columns.find((col) => col.name === e.target.value)];
            const validColumns = selectedColumns.filter((col) => col !== undefined);
            setYAxis(validColumns);
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
            {/* Color By Selector */}


      <FormControl fullWidth>
        <InputLabel id="color-by-select-label">Color by</InputLabel>
        <Select
          labelId="color-by-select-label"
          value={colorBy} // Display column name if xAxis is selected
          onChange={handleColorByChange}

          label="Color by"
          MenuProps={{ PaperProps: { style: { maxHeight: 224, width: 250 } } }}

        >
          {columns.map((col) => (
            <MenuItem key={col.name} value={col.name}>
              {col.name} {/* Only show the column name */}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

    
    </Box>
  );
};

export default ScatterChartControlPanel;

