import * as React from 'react';
import { Select, MenuItem, TextField, Box, FormControl, InputLabel } from '@mui/material';

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
  onFilterChange: (column: string, operator: string, value: string) => void;
  onColumnChange: (columnSelected: string) => void;
  onOperatorChange: (operatorSelected: string) => void;
  onValueChange: (valueSelected: string) => void;
  filterValue: string;
  selectedColumn: string;
  selectedOperator: string;
}

export default function FilterBar({ onFilterChange, onColumnChange, onOperatorChange, onValueChange, selectedColumn, selectedOperator, filterValue }: FilterBarProps) {

  return (
    <Box display="flex" gap={2} alignItems="center" >
      <FormControl sx={{ width: '200px' }} >
        <InputLabel>Columns</InputLabel>
        <Select value={selectedColumn} onChange={() => onColumnChange}>
          {columns.map((column) => (
            <MenuItem onClick={() => onColumnChange(column.id)} key={column.id} value={column.id}>
              {column.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl sx={{ width: '200px' }}>
        <InputLabel>Operator</InputLabel>
        <Select value={selectedOperator} onChange={(event) => onOperatorChange}>
          {operators.map((operator) => (
            <MenuItem onClick={() => onOperatorChange(operator.id)} key={operator.id} value={operator.id}>
              {operator.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="Value"
        value={filterValue}
        onChange={(event) => onValueChange(event.target.value)}
        variant="outlined"
      />
    </Box >
  );
}
