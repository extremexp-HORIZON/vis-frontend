import type React from "react";
import { useState } from "react"
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
import { useAppDispatch, useAppSelector } from "../../../../store/store"
import { setControls } from "../../../../store/slices/workflowPageSlice"
import CategoryIcon from "@mui/icons-material/Category"
import BarChartIcon from "@mui/icons-material/BarChart"
import FunctionsIcon from "@mui/icons-material/Functions"

const BarChartControlPanel = () => {
  const dispatch = useAppDispatch()
  const { tab } = useAppSelector(state => state.workflowPage)
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null) // Selected column for aggregation

  // Handler for updating aggregation rules for a column
  const handleAggregationChange = (
    event: React.ChangeEvent<{ value: unknown }>,
  ) => {
    const value = event.target.value as string[]
    if (!selectedColumn) return
    const currentAgg =
  tab?.workflowTasks.dataExploration?.controlPanel.barAggregation || {}

dispatch(
  setControls({
    barAggregation: {
      ...currentAgg,
      [selectedColumn]: value,
    },
  }),
)

  }

  const getAggregationOptions = () => {
    if (!selectedColumn) return []
    const column =
      tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns.find(
        col => col.name === selectedColumn,
      )
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

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          gap: "1rem",
          flexDirection: "column",
        }}
      >
        {/* Group By Selection */}
        <FormControl fullWidth>
          <InputLabel>
            <Box display="flex" alignItems="center" gap={1}>
              <CategoryIcon fontSize="small" />
              Group By (Category)
            </Box>
          </InputLabel>{" "}
          <Select
            label="Group By (Category) okkk    "
            multiple
            value={
              tab?.workflowTasks.dataExploration?.controlPanel.barGroupBy || []
            }
            onChange={e =>
              dispatch(setControls({ barGroupBy: e.target.value }))
            }
            renderValue={(selected: any) =>
              selected.length === 0 ? (
                <em>Select categories to group by</em>
              ) : (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {selected.map((value: string) => (
                    <Chip
                      key={value}
                      label={value}
                      onDelete={() =>
                        dispatch(
                          setControls({
                            barGroupBy: selected.filter(
                              (v: string) => v !== value,
                            ),
                          }),
                        )
                      }
                    />
                  ))}
                </Box>
              )
            }
            MenuProps={{
              PaperProps: {
                style: { maxHeight: 224, width: 250 },
              },
            }}
          >
            {/* <MenuItem value="Not Group">Not Group</MenuItem> */}
            {tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns
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
          <InputLabel>
            <Box display="flex" alignItems="center" gap={1}>
              <BarChartIcon fontSize="small" />
              Measure (Value Column)
            </Box>
          </InputLabel>
          <Select
            label="Measure (Value Column)ooo"
            value={selectedColumn || ""}
            onChange={e => setSelectedColumn(e.target.value as string)}
            MenuProps={{
              PaperProps: { style: { maxHeight: 224, width: 250 } },
            }}
          >
            {tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns
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
            <InputLabel>
              <Box display="flex" alignItems="center" gap={1}>
                <FunctionsIcon fontSize="small" />
                Apply Aggregation(s)
              </Box>
            </InputLabel>
            <Select
              size="small"
              label="Apply Aggregation(s)oook"
              multiple
              value={
                tab?.workflowTasks.dataExploration?.controlPanel.barAggregation[
                  selectedColumn
                ] || []
              }
              onChange={event => {
                const value = event.target.value as string[]
                if (!selectedColumn) return
                const currentAgg =
  tab?.workflowTasks.dataExploration?.controlPanel.barAggregation || {}

dispatch(
  setControls({
    barAggregation: {
      ...currentAgg,
      [selectedColumn]: value,
    },
  }),
)
              }}
              renderValue={(selected: any) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {selected.map((value: string) => (
                    <Chip
                      size="small"
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
