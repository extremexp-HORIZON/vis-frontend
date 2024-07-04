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
}

export default function FilterBar({ onFilterChange }: FilterBarProps) {
  const [selectedColumn, setSelectedColumn] = React.useState('');
  const [selectedOperator, setSelectedOperator] = React.useState('');
  const [filterValue, setFilterValue] = React.useState('');

  const handleColumnChange = (columnSelected: string) => {
    setSelectedColumn(columnSelected);
  };

  const handleOperatorChange = (operatorSelected: string) => {
    setSelectedOperator(operatorSelected);
  };

  const handleValueChange = (valueSelected: string) => {
    setFilterValue(valueSelected);
  };

  React.useEffect(() => {
    if (selectedColumn && selectedOperator && (filterValue || filterValue === '')) {
      onFilterChange(selectedColumn, selectedOperator, filterValue);
    }
  }, [selectedColumn, selectedOperator, filterValue]);

  return (
    <Box display="flex" gap={2} alignItems="center" >
      <FormControl sx={{ width: '200px' }} >
        <InputLabel>Columns</InputLabel>
        <Select value={selectedColumn} onChange={() => handleColumnChange}>
          {columns.map((column) => (
            <MenuItem onClick={() => handleColumnChange(column.id)} key={column.id} value={column.id}>
              {column.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl sx={{ width: '200px' }}>
        <InputLabel>Operator</InputLabel>
        <Select value={selectedOperator} onChange={(event) => handleOperatorChange}>
          {operators.map((operator) => (
            <MenuItem onClick={() => handleOperatorChange(operator.id)} key={operator.id} value={operator.id}>
              {operator.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="Value"
        value={filterValue}
        onChange={(event) => handleValueChange(event.target.value)}
        variant="outlined"
      />
    </Box >
  );
}
