import React, { useState } from 'react';
import { TextField, Button, MenuItem, Select, FormControl, InputLabel, Box, Typography, OutlinedInput, Paper, IconButton, Tooltip } from '@mui/material';
import { grey } from '@mui/material/colors';
import InfoIcon from "@mui/icons-material/Info"
import MinimizeIcon from '@mui/icons-material/Minimize';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import { IFilter } from '../../../shared/models/dataexploration.model';

interface IFilterFormProps {
  columns: {
    field: string;
    headerName: string;
  }[];
  onAddFilter: (filter: any) => void;
  onRemoveFilter: (index: number) => void;
  filters: IFilter[];
  onRemoveAllFilters: () => void;
}

const FilterForm: React.FC<IFilterFormProps> = ({ columns, onAddFilter, onRemoveFilter, filters, onRemoveAllFilters }) => {
    const [selectedColumn, setSelectedColumn] = React.useState('');
    const [filterType, setFilterType] = React.useState('equals');
    const [filterMin, setFilterMin] = useState(''); // Min value for range
    const [filterMax, setFilterMax] = useState(''); // Max value for range
    const [filterValue, setFilterValue] = useState('');
    const [isVisible, setIsVisible] = useState(true); // State for visibility toggle
    
    const [isMaximized, setIsMaximized] = useState(false); // State for maximize toggle
    
    const handleMinimize = () => {
        setIsVisible(!isVisible); // Toggles the visibility of the chart
    };

    const handleMaximize = () => {
        setIsMaximized(!isMaximized); // Toggles maximization of the chart area
    };
  
    const handleAddFilter = () => {
      let value = {};
      if (filterType === 'equals') {
          value = { value: filterValue }; // Use filterMin as the value for equals
      } else if (filterType === 'range') {
          if (filterMin && filterMax) {
              value = { min: filterMin, max: filterMax };
          } else {
              alert("Please enter both minimum and maximum values.");
              return;
          }
      };
  
      const newFilter = {
        column: selectedColumn,
        type: filterType,
        value: value
      } as {
        column: string;
        type: string;
        value: any;
      };


      console.log('filtro',filters);

      

      
      onAddFilter(newFilter);
      console.log('Adding filter:', newFilter);  // Log new filter
      console.log('Current filters:', filters); // Log all current filters after addition
      setSelectedColumn('');
      setFilterType('equals');
      setFilterValue('');
    };

    const resetFilters = () => {
        setSelectedColumn('');
        setFilterType('equals');
        setFilterValue('');
        onRemoveAllFilters();
    };
  
    return (
      <Paper className="Category-Item"
      elevation={2}
      sx={{
        borderRadius: 2,
        width: "inherit",
        display: "flex",
        flexDirection: "column",
        rowGap: 0,
        minWidth: "300px",
        height: "99%",
      }}>

    <Box sx={{ px: 1.5, py: 0.5, display: "flex", alignItems: "center", borderBottom: `1px solid ${grey[400]}` }}>


    <Typography fontSize={"1rem"} fontWeight={600}>
        Filter Selection 
    </Typography>
    <Box sx={{ flex: 1 }} />

<Tooltip title={"Description not available"}>
  <IconButton>
    <InfoIcon />
  </IconButton>
</Tooltip>
<IconButton onClick={handleMinimize} size="large">
        <MinimizeIcon />
      </IconButton>
      <IconButton onClick={handleMaximize} size="large">
        {isMaximized ? <FullscreenIcon /> : <FullscreenIcon />}
      </IconButton>
</Box>
{isVisible && (
<Box>
        <FormControl fullWidth margin="normal">
          <InputLabel>Column</InputLabel>
          <Select
            value={selectedColumn}
            label="Column"
            onChange={(e) => setSelectedColumn(e.target.value)}
            input={<OutlinedInput id="select-multiple-chip" label="Column" />}
                MenuProps={{
                    PaperProps: {
                        style: {
                            maxHeight: 224,
                            width: 250,
                        },
                    },
                }}
          >
            {columns.map((col) => (
              <MenuItem key={col.field} value={col.field}>{col.headerName}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel>Type</InputLabel>
          <Select
            value={filterType}
            label="Type"
            onChange={(e) => setFilterType(e.target.value)}
          >
            <MenuItem value="equals">Equals</MenuItem>
            <MenuItem value="range">Range</MenuItem>
          </Select>
        </FormControl>
        {filterType === 'range' ? (
                      <Box sx={{ display: 'flex', gap: 2 }}>

                        <TextField
                            fullWidth
                            label="Minimum Value"
                            value={filterMin}
                            onChange={(e) => setFilterMin(e.target.value)}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Maximum Value"
                            value={filterMax}
                            onChange={(e) => setFilterMax(e.target.value)}
                            margin="normal"
                        />
                    </Box>
                ) : (
                    <TextField
                        fullWidth
                        label="Value"
                        value={filterValue} // Reuse filterMin for the 'equals' case
                        onChange={(e) => setFilterValue(e.target.value)}
                        margin="normal"
                    />
                )}
        <Button onClick={handleAddFilter} variant="text" color="primary">Add Filter</Button>
        <Button onClick={resetFilters} variant="text" color="secondary" >
            Clear Filters
        </Button>
        <Box>
        {filters.map((filter, index) => (
          <Box key={index} sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
      {filter.column} {filter.type} {filter.type === 'equals' ? (filter.value as { value?: string | number }).value : `${(filter.value as { min?: string | number }).min} to ${(filter.value as { max?: string | number }).max}`}
      
      <Button onClick={() => onRemoveFilter(index)}>Remove</Button>
      
          </Box>
        ))}
      </Box>
      </Box>
)}
      </Paper>
    );
  };
  
  export default FilterForm;
