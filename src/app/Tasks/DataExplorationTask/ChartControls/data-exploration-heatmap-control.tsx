import type React from "react"
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

const HeatMapControlPanel = () => {
  const dispatch = useAppDispatch()
  const { tab } = useAppSelector(state => state.workflowPage)
  const selectedColumn =
  tab?.workflowTasks.dataExploration?.controlPanel.selectedMeasureColumnHeat || null

  // Handler for updating aggregation rules for a column
  const handleAggregationChange = (
    event: React.ChangeEvent<{ value: unknown }>,
  ) => {
    const value = event.target.value as string[]
    if (!selectedColumn) return
    const currentAgg =
      tab?.workflowTasks.dataExploration?.controlPanel.barAggregationHeat || {}

    dispatch(
      setControls({
        barAggregationHeat: {
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

  const handleAggregationDelete = (toDelete: string) => {
    if (!selectedColumn) return
    const currentAgg =
      tab?.workflowTasks.dataExploration?.controlPanel.barAggregationHeat || {}
    const updated = (currentAgg[selectedColumn] || []).filter(
      (agg: string) => agg !== toDelete,
    )
  
    dispatch(
      setControls({
        barAggregationHeat: {
          ...currentAgg,
          [selectedColumn]: updated,
        },
      }),
    )
  }
  

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
              tab?.workflowTasks.dataExploration?.controlPanel.barGroupByHeat || []
            }
            onChange={e => {
                const selected = e.target.value as string[]
                if (selected.length <= 2) {
                  dispatch(setControls({ barGroupByHeat: selected }))
                }
              }}
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
                            barGroupByHeat: selected.filter(
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
                <MenuItem
                key={col.name}
                value={col.name}
                disabled={
                  (tab?.workflowTasks.dataExploration?.controlPanel.barGroupByHeat?.length ?? 0) >= 2 &&
                  !tab?.workflowTasks.dataExploration?.controlPanel.barGroupByHeat?.includes(col.name)
                }
              >
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
  label="Measure (Value Column)"
  value={selectedColumn || ""}
  onChange={e => {
    const newColumn = e.target.value as string
    const currentAgg = tab?.workflowTasks.dataExploration?.controlPanel.barAggregationHeat || {}

    // Clear previous aggregation and set new selected column
    dispatch(
      setControls({
        selectedMeasureColumnHeat: newColumn,
        barAggregationHeat: {
          [newColumn]: [], // Reset aggregation for new column
        },
      }),
    )
  }}
  MenuProps={{
    PaperProps: { style: { maxHeight: 224, width: 250 } },
  }}
>
  {tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns
    .filter(col => col.type !== "LOCAL_DATE_TIME")
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
  label="Apply Aggregation"
  value={
    tab?.workflowTasks.dataExploration?.controlPanel.barAggregationHeat[selectedColumn]?.[0] || ""
  }
  onChange={event => {
    const value = event.target.value as string
    if (!selectedColumn) return
    const currentAgg =
      tab?.workflowTasks.dataExploration?.controlPanel.barAggregationHeat || {}

    dispatch(
      setControls({
        barAggregationHeat: {
          ...currentAgg,
          [selectedColumn]: [value], // wrap in array since your state expects an array
        },
      }),
    )
  }}
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
      {/* Selection Summary */}
{/* <Box
  sx={{
    p: 2,
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
    mt: 2,
  }}
>
  <strong>Selections Summary:</strong>

  <Box mt={1}>
    <strong>Group By:</strong>{" "}
    {(tab?.workflowTasks.dataExploration?.controlPanel.barGroupBy || []).length > 0 ? (
      (tab?.workflowTasks.dataExploration?.controlPanel.barGroupBy || []).map((item: string) => (
        <Chip key={item} label={item} size="small" sx={{ m: 0.5 }} />
      ))
    ) : (
      <em>None</em>
    )}
  </Box>

  <Box mt={1}>
    <strong>Measure:</strong>{" "}
    {selectedColumn ? (
      <Chip label={selectedColumn} size="small" sx={{ m: 0.5 }} />
    ) : (
      <em>None</em>
    )}
  </Box>

  <Box mt={1}>
    <strong>Aggregations:</strong>{" "}
    {selectedColumn &&
    (tab?.workflowTasks.dataExploration?.controlPanel.barAggregation?.[selectedColumn] || []).length > 0 ? (
      (tab?.workflowTasks.dataExploration?.controlPanel.barAggregation?.[selectedColumn] || []).map(
        (agg: string) => (
          <Chip key={agg} label={agg} size="small" sx={{ m: 0.5 }} />
        ),
      )
    ) : (
      <em>None</em>
    )}
  </Box>
</Box> */}

    </ThemeProvider>
  )
}

export default HeatMapControlPanel
