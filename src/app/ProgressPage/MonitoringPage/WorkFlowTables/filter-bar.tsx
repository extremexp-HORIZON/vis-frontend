import {
  TextField,
  Box,
  IconButton,
  Chip,
  InputAdornment,
  Paper,
  Typography,
  Button,
  Divider,
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import CancelIcon from '@mui/icons-material/Cancel'
import CloseIcon from "@mui/icons-material/Close"
import type { GridColDef } from "@mui/x-data-grid"
import { useState, useRef, useEffect } from "react"

type CustomGridColDef = GridColDef & {
  field: string
  minWidth?: number
  flex?: number
  align?: "left" | "right" | "center"
  headerAlign?: "left" | "right" | "center"
}

const operators = [
  { id: "contains", label: "contains" },
  { id: "startsWith", label: "starts with" },
  { id: "endsWith", label: "ends with" },
  { id: "=", label: "=" },
  {id: ">", label: ">"},
  {id: "<", label: "<"},
  {id: ">=", label: ">="},
  {id: "<=", label: "<="},
]

interface FilterBarProps {
  columns: CustomGridColDef[]
  filters: { column: string; operator: string; value: string }[]
  onFilterChange: (
    index: number,
    column: string,
    operator: string,
    value: string,
  ) => void
  onAddFilter: () => void
  onRemoveFilter: (index: number) => void
  setFilterOpen: React.Dispatch<React.SetStateAction<boolean>>
}

enum FilterStep {
  IDLE = 'idle',
  COLUMN = 'column',
  OPERATOR = 'operator',
  VALUE = 'value'
}

export default function FilterBar({
  columns,
  filters,
  onFilterChange,
  onAddFilter,
  onRemoveFilter,
  setFilterOpen,
}: FilterBarProps) {
  const [inputValue, setInputValue] = useState("");
  const [currentStep, setCurrentStep] = useState<FilterStep>(FilterStep.IDLE);
  const [tempColumn, setTempColumn] = useState<string>("");
  const [tempOperator, setTempOperator] = useState<string>("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showAvailableColumns, setShowAvailableColumns] = useState<boolean>(true);
  const [showAvailableOperators, setShowAvailableOperators] = useState<boolean>(false);

  const validColumns = columns.filter(col => 
    col.field !== "rating" && col.field !== "status" && col.field !== "action"
  ).map(col => ({
    value: col.field,
    label: col.headerName as string
  }));

  // Focus the input field when the component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Update suggestions based on the current step and input value
  useEffect(() => {
    if (currentStep === FilterStep.COLUMN) {
      const filtered = validColumns.filter(col => 
        col.label.toLowerCase().includes(inputValue.toLowerCase())
      );
      setSuggestions(filtered);
      setShowAvailableColumns(inputValue.length === 0);
      setShowAvailableOperators(false);
    } else if (currentStep === FilterStep.OPERATOR) {
      const filtered = operators.filter(op => 
        op.label.toLowerCase().includes(inputValue.toLowerCase())
      );
      setSuggestions(filtered);
      setShowAvailableColumns(false);
      setShowAvailableOperators(inputValue.length === 0);
    } else {
      setSuggestions([]);
      setShowAvailableColumns(currentStep === FilterStep.IDLE);
      setShowAvailableOperators(false);
    }
  }, [currentStep, inputValue, validColumns]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    
    // If we're in IDLE state and user starts typing, move to COLUMN step
    if (currentStep === FilterStep.IDLE && event.target.value) {
      setCurrentStep(FilterStep.COLUMN);
      setShowAvailableColumns(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      
      if (currentStep === FilterStep.COLUMN && suggestions.length > 0) {
        selectColumn(suggestions[0].value);
      } else if (currentStep === FilterStep.OPERATOR && suggestions.length > 0) {
        selectOperator(suggestions[0].id);
      } else if (currentStep === FilterStep.VALUE && inputValue) {
        addFilter(inputValue);
      }
    } else if (event.key === 'Escape') {
      resetFilterProcess();
    } else if (event.key === 'Backspace' && inputValue === '') {
      // Go back a step when pressing backspace on an empty input field
      handleBackStep();
    }
  };

  const selectColumn = (columnValue: string) => {
    setTempColumn(columnValue);
    setCurrentStep(FilterStep.OPERATOR);
    setShowAvailableColumns(false);
    setShowAvailableOperators(true);
    setInputValue("");
  };

  const selectOperator = (operatorValue: string) => {
    setTempOperator(operatorValue);
    setCurrentStep(FilterStep.VALUE);
    setShowAvailableColumns(false);
    setShowAvailableOperators(false);
    setInputValue("");
  };

  const addFilter = (value: string) => {
    if (tempColumn && tempOperator && value) {
      onAddFilter();
      onFilterChange(filters.length, tempColumn, tempOperator, value);
      resetFilterProcess();
    }
  };

  const resetFilterProcess = () => {
    setCurrentStep(FilterStep.IDLE);
    setTempColumn("");
    setTempOperator("");
    setInputValue("");
    setShowAvailableColumns(true);
    setShowAvailableOperators(false);
  };

  const handleRemoveFilter = (index: number) => {
    onRemoveFilter(index);
  };

  const handleBackStep = () => {
    switch (currentStep) {
      case FilterStep.OPERATOR:
        setCurrentStep(FilterStep.COLUMN);
        setTempColumn("");
        setInputValue("");
        setShowAvailableColumns(true);
        setShowAvailableOperators(false);
        break;
      case FilterStep.VALUE:
        setCurrentStep(FilterStep.OPERATOR);
        setTempOperator("");
        setInputValue("");
        setShowAvailableColumns(false);
        setShowAvailableOperators(true);
        break;
      default:
        resetFilterProcess();
    }
  };

  const getPlaceholder = () => {
    switch (currentStep) {
      case FilterStep.COLUMN:
        return "Select or type a column...";
      case FilterStep.OPERATOR:
        return `${tempColumn} (select operator)`;
      case FilterStep.VALUE:
        return `${tempColumn} ${tempOperator} (enter value)`;
      default:
        return "Build a filter query...";
    }
  };

  // Function to render the input field with pills inside
  const renderInputWithPills = () => {
    return (
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        placeholder={getPlaceholder()}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        inputRef={inputRef}
        InputProps={{
          startAdornment: (
            <>
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
              {tempColumn && currentStep !== FilterStep.COLUMN && (
                <Chip
                  size="small"
                  label={tempColumn}
                  sx={{ mr: 0.5, height: 24 }}
                  color="primary"
                />
              )}
              {tempOperator && currentStep === FilterStep.VALUE && (
                <Chip
                  size="small"
                  label={tempOperator}
                  sx={{ mr: 0.5, height: 24 }}
                  color="primary"
                />
              )}
            </>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {inputValue && (
                <IconButton size="small" onClick={resetFilterProcess}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
              {(tempColumn || tempOperator) && !inputValue && (
                <IconButton size="small" onClick={handleBackStep}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </InputAdornment>
          ),
          sx: {
            // Add some padding to accommodate for the chips
            pl: 0.5,
            alignItems: 'center',
            gap: 0.5
          }
        }}
      />
    );
  };

  // Function to render available columns as chips
  const renderAvailableColumns = () => {
    if (!showAvailableColumns) return null;
    
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Available Columns
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {validColumns.map((column, index) => (
            <Chip
              key={index}
              size="small"
              label={column.label}
              onClick={() => selectColumn(column.value)}
              color="default"
              clickable
            />
          ))}
        </Box>
      </Box>
    );
  };

  // Function to render available operators as chips
  const renderAvailableOperators = () => {
    if (!showAvailableOperators) return null;
    
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Available Operators for {tempColumn}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {operators.map((op, index) => (
            <Chip
              key={index}
              size="small"
              label={op.label}
              onClick={() => selectOperator(op.id)}
              color="default"
              clickable
            />
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%'}}>
      {/* Search input */}
      <Box sx={{ position: 'relative' }}>
        {renderInputWithPills()}
        
        {/* Suggestions dropdown */}
        {suggestions.length > 0 && currentStep !== FilterStep.VALUE && !showAvailableColumns && !showAvailableOperators && (
          <Paper
            elevation={3}
            sx={{
              position: 'absolute',
              width: '100%',
              zIndex: 1000,
              mt: 0.5,
              maxHeight: 300,
              overflow: 'auto'
            }}
          >
            {suggestions.map((item, index) => (
              <Box 
                key={index}
                sx={{ 
                  p: 1.5, 
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
                onClick={() => {
                  if (currentStep === FilterStep.COLUMN) {
                    selectColumn(item.value);
                  } else if (currentStep === FilterStep.OPERATOR) {
                    selectOperator(item.id);
                  }
                }}
              >
                <Typography variant="body2">
                  {currentStep === FilterStep.COLUMN ? item.label : item.label}
                </Typography>
              </Box>
            ))}
          </Paper>
        )}
      </Box>

      {/* Available columns section */}
      {renderAvailableColumns()}

      {/* Available operators section */}
      {renderAvailableOperators()}

      {/* Remove the filter preview since we now show pills in the input */}
      
      {/* Help text only when not showing available options */}
      {currentStep !== FilterStep.IDLE && !showAvailableColumns && !showAvailableOperators && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          {currentStep === FilterStep.COLUMN && "Select a column or type to filter columns"}
          {currentStep === FilterStep.OPERATOR && "Select an operator (contains, =, >, <, etc.)"}
          {currentStep === FilterStep.VALUE && "Enter a value and press Enter to add the filter"}
        </Typography>
      )}
      
      <Divider sx={{ my: 2 }} />

      {/* Active filters */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Active Filters
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {filters.filter(f => f.column && f.operator && f.value).map((filter, index) => (
            <Chip
              key={index}
              size="small"
              label={`${filter.column} ${filter.operator} ${filter.value}`}
              onDelete={() => handleRemoveFilter(index)}
              deleteIcon={<CancelIcon />}
            />
          ))}
          
          {filters.filter(f => f.column && f.operator && f.value).length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No active filters
            </Typography>
          )}
        </Box>
      </Box>      
    </Box>
  );
}
