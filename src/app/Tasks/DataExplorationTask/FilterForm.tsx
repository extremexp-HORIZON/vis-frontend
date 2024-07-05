import React, { useState } from 'react';
import { TextField, Button, MenuItem, Select, FormControl, InputLabel, Box, Typography, OutlinedInput, IconButton, Tooltip, Popover } from '@mui/material';
import { grey } from '@mui/material/colors';
import ClearIcon from '@mui/icons-material/Clear';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
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

type FilterValue = 
  | { value: string | number }
  | { min: string | number; max: string | number };

const FilterForm: React.FC<IFilterFormProps> = ({ columns, onAddFilter, onRemoveFilter, filters, onRemoveAllFilters }) => {
  const [selectedColumn, setSelectedColumn] = useState('');
  const [filterType, setFilterType] = useState('equals');
  const [filterMin, setFilterMin] = useState('');
  const [filterMax, setFilterMax] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const handleAddFilter = () => {
    let value = {};
    if (filterType === 'equals') {
      value = { value: filterValue };
    } else if (filterType === 'range') {
      if (filterMin && filterMax) {
        value = { min: filterMin, max: filterMax };
      } else {
        alert("Please enter both minimum and maximum values.");
        return;
      }
    }

    const newFilter = {
      column: selectedColumn,
      type: filterType,
      value: value
    } as {
      column: string;
      type: string;
      value: any;
    };

    onAddFilter(newFilter);
    handlePopoverClose();
    setSelectedColumn('');
    setFilterType('equals');
    setFilterValue('');
  };

  const resetFilters = () => {
    setSelectedColumn('');
    setFilterType('equals');
    setFilterValue('');
    onRemoveAllFilters();
    handlePopoverClose();
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ px: 1.5, py: 0.5, display: "flex", alignItems: "center", borderBottom: `1px solid ${grey[400]}` }}>
        <Button aria-describedby={id} variant="text" onClick={handlePopoverOpen} size="small" type="button">
          <FilterAltIcon/>
          <Typography fontSize={"1rem"} fontWeight={600} sx={{ ml: 1, textTransform:"none"}}>
            Filters
          </Typography>
        </Button>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          sx={{ width: '300px' }}
        >
          <Box p={2}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Column</InputLabel>
              <Select
                value={selectedColumn}
                label="Column"
                onChange={(e) => setSelectedColumn(e.target.value)}
                input={<OutlinedInput id="select-multiple-chip" label="Column" />}
                MenuProps={{ PaperProps: { style: { maxHeight: 224, width: 250 } } }}
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
                <TextField fullWidth label="Minimum Value" value={filterMin} onChange={(e) => setFilterMin(e.target.value)} margin="normal" />
                <TextField fullWidth label="Maximum Value" value={filterMax} onChange={(e) => setFilterMax(e.target.value)} margin="normal" />
              </Box>
            ) : (
              <TextField fullWidth label="Value" value={filterValue} onChange={(e) => setFilterValue(e.target.value)} margin="normal" />
            )}
            <Button onClick={handleAddFilter} variant="text" color="primary" type="button">Add Filter</Button>
          </Box>
        </Popover>
      </Box>
      <Box sx={{ p: 1, display: filters.length ? 'block' : 'none' }}>
        {filters.map((filter, index) => (
          <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, bgcolor: grey[200], p: 1, borderRadius: 1 }}>
            <Typography variant="body2">
              {filter.column} {filter.type} 
              {typeof filter.value === 'object' && filter.value !== null ? 
                (filter.type === 'equals' ? ` ${filter.value?.value}` : ` ${filter.value.min} to ${filter.value.max}`) 
                : filter.value}
            </Typography>
            <IconButton size="small" onClick={() => onRemoveFilter(index)} type="button">
              <ClearIcon />
            </IconButton>
          </Box>
        ))}
        {filters.length > 0 && (
          <Button size="small" onClick={resetFilters} sx={{ mt: 1 }} type="button">
            Clear All Filters
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default FilterForm;
