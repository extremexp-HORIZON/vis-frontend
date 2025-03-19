import React, { useState } from "react"
import {
  Box,
  MenuItem,
  Chip,
  Select,
  InputLabel,
  FormControl,
  createTheme,
  ThemeProvider,
} from "@mui/material"

interface BarChartControlPanelProps {
  originalColumns: Array<{ name: string; type: string }>
  barGroupBy: string[]
  setBarGroupBy: (value: string[]) => void
  barAggregation: { [key: string]: string[] }
  setBarAggregation: (value: { [key: string]: string[] }) => void
}

const BarChartControlPanel: React.FC<BarChartControlPanelProps> = ({
  originalColumns,
  barGroupBy,
  setBarGroupBy,
  barAggregation,
  setBarAggregation,
}) => {
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null) // Selected column for aggregation
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  // Handler for updating aggregation rules for a column
  const handleAggregationChange = (
    event: React.ChangeEvent<{ value: unknown }>,
  ) => {
    const value = event.target.value as string[]
    if (!selectedColumn) return
    setBarAggregation(prev => ({
      ...prev,
      [selectedColumn]: value,
    }))
  }

  // Handler for setting group-by columns
  const handleGroupByChange = (selected: string[]) => {
    setBarGroupBy(selected.includes("Not Group") ? [] : selected)
  }

  // Determines aggregation options based on column type
  const getAggregationOptions = () => {
    if (!selectedColumn) return []
    const column = originalColumns.find(col => col.name === selectedColumn)
    return column?.type === "DOUBLE" ||
      column?.type === "FLOAT" ||
      column?.type === "INTEGER"
      ? ["Avg", "Min", "Max", "Count"]
      : ["Count"]
  }

  const aggregationOptions = getAggregationOptions()

  // Custom theme
  const theme = createTheme({
    palette: {
      primary: { main: "#1976d2" },
      secondary: { main: "#dc004e" },
    },
    typography: {
      fontFamily: "Arial",
      h6: { fontWeight: 600 },
    },
    components: {
      MuiButton: {
        styleOverrides: { root: { borderRadius: "20px" } },
      },
    },
  })

  // Function to remove a specific aggregation rule
  const handleRemoveAggregation = (column: string, rule: string) => {
    setBarAggregation(prev => ({
      ...prev,
      [column]: prev[column].filter(r => r !== rule),
    }))
  }

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handlePopoverClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  return (
    <ThemeProvider theme={theme}>
   
    <Box sx={{ display: "flex", gap: "1rem",marginTop: "1rem",flexDirection: "column" }}>
          {/* Group By Selection */}
      <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              label="Category"
              multiple
              value={barGroupBy}
              onChange={e => handleGroupByChange(e.target.value as string[])}
              renderValue={(selected: any) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {selected.map((value: string) => (
                    <Chip
                      key={value}
                      label={value}
                      onDelete={() =>
                        handleGroupByChange(barGroupBy.filter(s => s !== value))
                      }
                    />
                  ))}
                </Box>
              )}
              MenuProps={{
                PaperProps: {
                  style: { maxHeight: 224, width: 250 },
                },
              }}
            >
              {/* <MenuItem value="Not Group">Not Group</MenuItem> */}
              {originalColumns
                .filter(col => col.type === "STRING")
                .map(col => (
                  <MenuItem key={col.name} value={col.name}>
                    {col.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          {/* Value Selection */}
          <FormControl fullWidth>
            <InputLabel>Value</InputLabel>
            <Select
              label="Value"
              value={selectedColumn || ""}
              onChange={e => setSelectedColumn(e.target.value as string)}
              MenuProps={{
                PaperProps: { style: { maxHeight: 224, width: 250 } },
              }}
            >
              {originalColumns
                .filter(col => col.type != "LOCAL_DATE_TIME")
                .map(col => (
                  <MenuItem key={col.name} value={col.name}>
                    {col.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          {/* Aggregation Selection */}
          {selectedColumn && (
            <FormControl fullWidth>
              <InputLabel>Aggregations</InputLabel>
              <Select
                label="Aggregations"
                multiple
                value={barAggregation[selectedColumn] || []}
                onChange={handleAggregationChange}
                renderValue={(selected: any) => (
                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
                  >
                    {selected.map((value: string) => (
                      <Chip
                        key={value}
                        label={value}
                        onDelete={() =>
                          handleAggregationChange({
                            target: {
                              value: (selected as string[]).filter(
                                v => v !== value,
                              ),
                            },
                          } as any)
                        }
                      />
                    ))}
                  </Box>
                )}
              >
                {aggregationOptions.map(rule => (
                  <MenuItem key={rule} value={rule}>
                    {rule.charAt(0).toUpperCase() + rule.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
    </ThemeProvider>
  )
}

export default BarChartControlPanel
