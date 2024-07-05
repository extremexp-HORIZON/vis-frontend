import * as React from 'react';
import { Select, MenuItem, TextField, Box, FormControl, InputLabel, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';

const columns = [
  { id: 'workflowId', label: 'Workflow ID' },
  { id: 'train_model', label: 'Train Model' },
  { id: 'split_proportion', label: 'split_proportion' },
  { id: 'max_depth', label: 'max_depth' },
  { id: 'batch_size', label: 'batch_size' },
];

const operators = [
  { id: 'contains', label: 'contains' },
  { id: 'equals', label: 'equals' },
  { id: 'startsWith', label: 'starts with' },
  { id: 'endsWith', label: 'ends with' },
];

interface FilterBarProps {
  filters: { column: string, operator: string, value: string }[];
  onFilterChange: (index: number, column: string, operator: string, value: string) => void;
  onAddFilter: () => void;
  onRemoveFilter: (index: number) => void;
}

export default function FilterBar({ filters, onFilterChange, onAddFilter, onRemoveFilter }: FilterBarProps) {
  const [filterRowNumber, setFilterRowNumber] = React.useState(1);
  return (
    <Box>
      {filters.map((filter, index) => (
        <Box key={index} display="flex" gap={2} alignItems="center">
          <FormControl sx={{ width: '200px' }}>
            <InputLabel>Columns</InputLabel>
            <Select
              value={filter.column}
              onChange={(event) => onFilterChange(index, event.target.value, filter.operator, filter.value)}
            >
              {columns.map((column) => (
                <MenuItem key={column.id} value={column.id}>
                  {column.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ width: '200px' }}>
            <InputLabel>Operator</InputLabel>
            <Select
              value={filter.operator}
              onChange={(event) => onFilterChange(index, filter.column, event.target.value, filter.value)}
            >
              {operators.map((operator) => (
                <MenuItem key={operator.id} value={operator.id}>
                  {operator.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Value"
            value={filter.value}
            onChange={(event) => onFilterChange(index, filter.column, filter.operator, event.target.value)}
            variant="outlined"
          />
          <IconButton onClick={() => onRemoveFilter(index)}><CloseIcon /></IconButton>
        </Box>
      ))}
      <Box display="flex" justifyContent="center" gap={2} mt={2}>
        <IconButton onClick={onAddFilter}><AddIcon /></IconButton>
      </Box>
    </Box>
  );

}
