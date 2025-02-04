import {
  Select,
  MenuItem,
  TextField,
  Box,
  FormControl,
  InputLabel,
  IconButton,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import AddIcon from "@mui/icons-material/Add"
import type { GridColDef } from "@mui/x-data-grid"

type CustomGridColDef = GridColDef & {
  field: string
  minWidth?: number
  flex?: number
  align?: "left" | "right" | "center"
  headerAlign?: "left" | "right" | "center"
}

const operators = [
  { id: "contains", label: "contains" },
  { id: "equals", label: "equals" },
  { id: "startsWith", label: "starts with" },
  { id: "endsWith", label: "ends with" },
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
}

export default function FilterBar({
  columns,
  filters,
  onFilterChange,
  onAddFilter,
  onRemoveFilter,
}: FilterBarProps) {
  return (
    <Box>
      {filters.map((filter, index) => (
        <Box key={index} display="flex" gap={2} alignItems="center">
          <FormControl sx={{ width: "200px" }}>
            <InputLabel>Columns</InputLabel>
            <Select
              value={filter.column}
              onChange={event =>
                onFilterChange(
                  index,
                  event.target.value,
                  filter.operator,
                  filter.value,
                )
              }
            >
              {columns.map((column: CustomGridColDef) => (
                <MenuItem key={column.field} value={column.field}>
                  {column.headerName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ width: "200px" }}>
            <InputLabel>Operator</InputLabel>
            <Select
              value={filter.operator}
              onChange={event =>
                onFilterChange(
                  index,
                  filter.column,
                  event.target.value,
                  filter.value,
                )
              }
            >
              {operators.map(operator => (
                <MenuItem key={operator.id} value={operator.id}>
                  {operator.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Value"
            value={filter.value}
            onChange={event =>
              onFilterChange(
                index,
                filter.column,
                filter.operator,
                event.target.value,
              )
            }
            variant="outlined"
          />
          <IconButton onClick={() => onRemoveFilter(index)}>
            <CloseIcon />
          </IconButton>
        </Box>
      ))}
      <Box display="flex" justifyContent="center" gap={2} mt={2}>
        <IconButton onClick={onAddFilter}>
          <AddIcon />
        </IconButton>
      </Box>
    </Box>
  )
}
