
import React, { useState,useEffect } from 'react';
import {
  TextField, Button, MenuItem, Select, FormControl, InputLabel, Box,
  Typography, OutlinedInput, IconButton, Tooltip, Popover, Slider,
  Badge, Chip,
  Autocomplete,
  Popper
} from '@mui/material';
import { grey } from '@mui/material/colors';
import ClearIcon from '@mui/icons-material/Clear';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterListIcon from '@mui/icons-material/FilterList';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { IFilter } from '../../../../shared/models/dataexploration.model';
import { createTheme,ThemeProvider } from '@mui/material';

interface IFilterFormProps {
  columns: {
    field: string;
    headerName: string;
    type: string; // Column type (e.g., 'number', 'string', 'date')
  }[];
 data: any[];  // Add data to props

  onAddFilter: (filter: any) => void;
  onRemoveFilter: (index: number) => void;
  filters: IFilter[];
  onRemoveAllFilters: () => void;
}

const FilterForm: React.FC<IFilterFormProps> = ({
  columns,data, onAddFilter, onRemoveFilter, filters, onRemoveAllFilters 
}) => {
  const [selectedColumn, setSelectedColumn] = useState('');
  const [filterType, setFilterType] = useState('equals');
  const [filterValue, setFilterValue] = useState<string | number>('');
  const [filterRange, setFilterRange] = useState<[number, number]>([0, 100]);
  const [filterDateRange, setFilterDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [uniqueValues, setUniqueValues] = useState<string[]>([]);  // State for unique values

  const theme = createTheme({
    palette: {
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
    typography: {
      fontFamily: 'Arial',
      h6: {
        fontWeight: 600,
      },
   },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '20px',  // Example of button customization
          },
        },
      },
    },
  });
 useEffect(() => {
  if (selectedColumn && (filterType === 'equals')) {
    const values = data.map(row => row[selectedColumn]);
    const unique = Array.from(new Set(values));  // Get unique values
    setUniqueValues(unique);
  } else {
    setUniqueValues([]);
  }
}, [selectedColumn, filterType, data]);
const [rangeMin, setRangeMin] = useState<number>(0);
const [rangeMax, setRangeMax] = useState<number>(100); // Default values, will be updated

useEffect(() => {
  if (selectedColumn) {
    const values = data.map(row => row[selectedColumn]).filter(value => typeof value === 'number');
    setRangeMin(Math.min(...values));
    setRangeMax(Math.max(...values));
    setFilterRange([Math.min(...values), Math.max(...values)]); // Initialize range to min and max
  }
}, [selectedColumn, data]);
  const handlePopoverOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const handleAddFilter = () => {
    let value: any;
    
    // Handle different filter types
    if (filterType === 'range') {
      value = { min: filterRange[0], max: filterRange[1] };
    } else if (filterType === 'dateRange') {
      value = { min: filterDateRange[0], max: filterDateRange[1] };
    } else {
      value = filterValue;
    }

    const newFilter = {
      column: selectedColumn,
      type: filterType,
      value
    };

    onAddFilter(newFilter);
    handlePopoverClose();

    resetForm();
  };

  const resetForm = () => {
    setSelectedColumn('');
    setFilterType('equals');
    setFilterValue('');
    setFilterRange([0, 100]);
    setFilterDateRange([null, null]);
  };


  return (
    <ThemeProvider theme={theme}>

    <Box sx={{ p: 2 }}>
      {/* Filter Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${grey[400]}` }}>
        <Tooltip title="Open filters">
          <Button aria-describedby={id} variant="text" onClick={handlePopoverOpen} size="small">
            <FilterListIcon />
            <Typography sx={{ ml: 1 }}>Filters</Typography>
          </Button>
        </Tooltip>
        {filters.length > 0 && (
          <Badge color="secondary" badgeContent={filters.length} sx={{ ml: 2 }}>
            <FilterAltIcon color="primary" />
          </Badge>
        )}
      </Box>

      {/* Popover Form for Filters */}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box p={2} sx={{ width: '300px' }}>
          {/* Column Selection */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Column</InputLabel>
            <Select
              value={selectedColumn}
              label="Column"
              onChange={(e) => setSelectedColumn(e.target.value)}
              MenuProps={{ PaperProps: { style: { maxHeight: 224, width: 250 } } }}
            >
              {columns.map(col => (
                <MenuItem key={col.field} value={col.field}>{col.headerName}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Filter Type Selection */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Filter Type</InputLabel>
            <Select
              value={filterType}
              label="Filter Type"
              onChange={(e) => setFilterType(e.target.value)}
              
            >
              <MenuItem value="equals">Equals</MenuItem>
              <MenuItem value="range">Range</MenuItem>
             
              <MenuItem value="dateRange">Date Range</MenuItem>
            </Select>
          </FormControl>

          {/* Conditional Input Fields Based on Type */}
          {filterType === 'range' ? (
            <Box>
            <Slider
              value={filterRange}
              onChange={(e, newValue) => setFilterRange(newValue as [number, number])}
              valueLabelDisplay="on" // Show value labels on the slider
              min={rangeMin}
              max={rangeMax}
            />
            
          </Box>
        
          ) : filterType === 'dateRange' ? (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <DateRangeIcon />
              <TextField
                label="Start Date"
                type="date"
                onChange={(e) => setFilterDateRange([new Date(e.target.value), filterDateRange[1]])}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Date"
                type="date"
                onChange={(e) => setFilterDateRange([filterDateRange[0], new Date(e.target.value)])}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          ) : (
            <Autocomplete
              fullWidth
              options={uniqueValues} // Array of unique values for autocomplete
              getOptionLabel={(option) => option.toString()} // Converts option to string for display
              value={filterValue as string}
              onChange={(e, newValue) => setFilterValue(newValue as string)}
              renderInput={(params) => <TextField {...params} label="Value" />}
              PopperComponent={(props) => (
                <Popper {...props} placement="bottom-start" />
              )}
            
              // Limit number of visible items and make it scrollable
              ListboxProps={{
                style: {
                  maxHeight: '200px', // Limit visible height of the dropdown (about 5 options)
                  overflow: 'auto' // Enables scrolling when dropdown exceeds maxHeight
                }
              }}
            />
          )}

          {/* Add Filter Button */}
          <Button fullWidth onClick={handleAddFilter} variant="contained" sx={{ mt: 2 }}>
            Add Filter
          </Button>
        </Box>
      </Popover>

      {/* Display Applied Filters */}
      <Box sx={{ mt: 2 }}>
        {filters.map((filter, index) => (
          <Chip
            key={index}
            label={`${filter.column} ${filter.type} ${typeof filter.value === 'object' ? `from ${filter.value.min} to ${filter.value.max}` : filter.value}`}
            onDelete={() => onRemoveFilter(index)}
            sx={{ margin: 0.5, backgroundColor: grey[200] }}
            deleteIcon={<ClearIcon />}
          />
        ))}
        {filters.length > 0 && (
          <Button onClick={onRemoveAllFilters} variant="outlined" color="error" sx={{ mt: 1 }}>
            Clear All Filters
          </Button>
        )}
      </Box>
    </Box>
    </ThemeProvider>
  );
};

export default FilterForm;

