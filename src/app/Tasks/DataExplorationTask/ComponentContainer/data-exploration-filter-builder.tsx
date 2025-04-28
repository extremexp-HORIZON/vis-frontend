import React, { useEffect, useState } from "react"
import {
  Box,
  Button,
  Chip,
  createTheme,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Popover,
  Select,
  Slider,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material"
import { useAppDispatch, useAppSelector } from "../../../../store/store"
import { setControls } from "../../../../store/slices/workflowPageSlice"
import AddIcon from "@mui/icons-material/Add"
import FilterListIcon from "@mui/icons-material/FilterList"
import CloseIcon from "@mui/icons-material/Close"
import { ThemeProvider } from "@emotion/react"

const FilterBuilder = () => {
  const dispatch = useAppDispatch()
  const { tab } = useAppSelector(state => state.workflowPage)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const originalColumns =
    tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns || []
  const uniqueValues =
    tab?.workflowTasks.dataExploration?.metaData.data?.uniqueColumnValues || []
  const activeFilters =
    tab?.workflowTasks.dataExploration?.controlPanel?.filters || []

  // Local states for selected filter input
  const [selectedColumn, setSelectedColumn] = useState("")
  const [filterType, setFilterType] = useState("")
  const [equalsValue, setEqualsValue] = useState("")
  const [rangeValue, setRangeValue] = useState<number[]>([0, 100])
  const [showAllColumns, setShowAllColumns] = useState(false)
  const theme = createTheme({
    palette: {
      primary: {
        main: "#1976d2",
      },
      secondary: {
        main: "#dc004e",
      },
    },
    typography: {
      fontFamily: "Arial",
      h6: {
        fontWeight: 600,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: "20px", // Example of button customization
          },
        },
      },
    },
  })

  // Popover controls
  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => setAnchorEl(null)
  const open = Boolean(anchorEl)

  // Helper functions
  const getMinMax = (values: number[] = []) => {
    if (!values.length) return [0, 100]
    return [Math.min(...values), Math.max(...values)]
  }

  // Effects
  useEffect(() => {
    if (selectedColumn && filterType === "range") {
      const values = uniqueValues[selectedColumn] || []
      const [min, max] = getMinMax(values)
      setRangeValue([min, max])
    }
  }, [selectedColumn, filterType])

  // Handler functions
  const handleAddFilter = () => {
    if (!selectedColumn || !filterType) return

    const newFilter =
      filterType === "equals"
        ? { column: selectedColumn, type: "equals", value: equalsValue }
        : {
            column: selectedColumn,
            type: "range",
            min: rangeValue[0],
            max: rangeValue[1],
          }

    const updatedFilters = [...activeFilters, newFilter]
    dispatch(setControls({ filters: updatedFilters }))
    // fetchDataWithFilters(updatedFilters)
    resetForm()
  }

  const handleDeleteFilter = (indexToDelete: number) => {
    const updatedFilters = activeFilters.filter(
      (_, idx) => idx !== indexToDelete,
    )
    dispatch(setControls({ filters: updatedFilters }))
    // fetchDataWithFilters(updatedFilters)
  }

  const resetForm = () => {
    setSelectedColumn("")
    setFilterType("")
    setEqualsValue("")
  }

  // const fetchDataWithFilters = (filters: any[]) => {
  //   dispatch(
  //     fetchDataExplorationData({
  //       query: {
  //         ...defaultDataExplorationQuery,
  //         datasetId: tab?.dataTaskTable.selectedItem?.data?.source || "",
  //         filters,
  //         columns: tab?.workflowTasks.dataExploration?.controlPanel?.selectedColumns?.map(col => col.name) || [],
  //       },
  //       metadata: {
  //         workflowId: tab?.workflowId || "",
  //         queryCase: "chart",
  //       },
  //     })
  //   )
  // }

  const handleColumnSelect = (columnName: string) => {
    setSelectedColumn(columnName)
    setFilterType("")
    setEqualsValue("")
  }

  // Component sections
  const SectionHeader = ({
    icon,
    title,
  }: {
    icon: React.ReactNode
    title: string
  }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        borderBottom: `1px solid rgba(0, 0, 0, 0.08)`,
        px: 2,
        py: 1.5,
        background: "linear-gradient(to right, #f1f5f9, #f8fafc)",
        borderTopLeftRadius: "10px",
        borderTopRightRadius: "10px",
        margin: 0,
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#3566b5",
          mr: 1.5,
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="subtitle1"
        sx={{
          display: "flex",
          alignItems: "center",
          fontWeight: 600,
          color: "#1e3a5f",
          letterSpacing: "0.3px",
        }}
      >
        {title}
      </Typography>
    </Box>
  )

  const SuggestedColumns = () => {
    const columnsToShow = showAllColumns
      ? originalColumns
      : originalColumns.slice(0, 5)
    const hasMore = originalColumns.length > 5

    return (
      <Box sx={{ px: 2, py: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
            Suggested Columns
          </Typography>
          {hasMore && (
            <Button
              size="small"
              onClick={() => setShowAllColumns(!showAllColumns)}
              sx={{ fontSize: "0.75rem", ml: 1 }}
            >
              {showAllColumns
                ? "Show Less"
                : `Show More (${originalColumns.length - 5})`}
            </Button>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            overflowX: "auto",
            py: 1,
            "&::-webkit-scrollbar": {
              height: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0,0,0,0.2)",
              borderRadius: "3px",
            },
          }}
        >
          {columnsToShow.map((col: any) => (
            <Chip
              key={col.name}
              label={col.name}
              onClick={() => handleColumnSelect(col.name)}
              variant={selectedColumn === col.name ? "filled" : "outlined"}
              color={selectedColumn === col.name ? "primary" : "default"}
              sx={{
                flexShrink: 0,
                cursor: "pointer",
                "&:hover": {
                  backgroundColor:
                    selectedColumn === col.name ? "" : "action.hover",
                },
              }}
            />
          ))}
        </Box>
      </Box>
    )
  }

  const FilterForm = () => (
    <Box display="flex" flexDirection="column" gap={2} p={2}>
      {/* Suggested Columns */}
      <SuggestedColumns />

      {/* Filter Type Selector */}
      {selectedColumn && (
        <FormControl fullWidth size="small">
          <InputLabel id="filter-type-label">Filter Type</InputLabel>
          <Select
            labelId="filter-type-label"
            value={filterType}
            label="Filter Type"
            onChange={e => setFilterType(e.target.value)}
          >
            <MenuItem value="equals">Equals</MenuItem>
            <MenuItem value="range">Range</MenuItem>
          </Select>
        </FormControl>
      )}

      {/* Equals Value Selector */}
      {selectedColumn && filterType === "equals" && (
        <FormControl fullWidth size="small">
          <InputLabel id="equals-value-label">Value</InputLabel>
          <Select
            labelId="equals-value-label"
            value={equalsValue}
            label="Value"
            onChange={e => setEqualsValue(e.target.value)}
          >
            {uniqueValues[selectedColumn]?.map((value: any) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Range Slider */}
      {selectedColumn && filterType === "range" && (
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="body2" gutterBottom>
            Range: {rangeValue[0]} - {rangeValue[1]}
          </Typography>
          <ThemeProvider theme={theme}>
            <Slider
              value={rangeValue}
              onChange={(e, newValue) => setRangeValue(newValue as number[])}
              valueLabelDisplay="auto"
              min={getMinMax(uniqueValues[selectedColumn])[0]}
              max={getMinMax(uniqueValues[selectedColumn])[1]}
              size="small"
            />
          </ThemeProvider>
        </Box>
      )}

      {/* Add Filter Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddFilter}
        disabled={!filterType}
        startIcon={<AddIcon />}
        size="small"
        sx={{ alignSelf: "center", mt: 1 }}
      >
        Add Filter
      </Button>
    </Box>
  )

  const ActiveFiltersList = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
        Active Filters
      </Typography>

      {activeFilters.length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontStyle: "italic" }}
        >
          No active filters
        </Typography>
      ) : (
        <List dense sx={{ maxHeight: 200, overflow: "auto" }}>
          {activeFilters.map((filter: any, index: number) => (
            <ListItem
              key={index}
              disablePadding
              secondaryAction={
                <IconButton
                  edge="end"
                  onClick={() => handleDeleteFilter(index)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemButton sx={{ px: 1 }}>
                <ListItemText
                  primary={`${filter.column} ${filter.type}`}
                  secondary={
                    filter.type === "equals"
                      ? filter.value
                      : `${filter.min} - ${filter.max}`
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  )

  return (
    <>
      <Tooltip title="Filters">
        <IconButton onClick={handleOpen}>
          <FilterListIcon color="primary" fontSize="medium" />
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        PaperProps={{
          elevation: 3,
          sx: {
            width: 350,
            maxHeight: 500,
            overflow: "hidden",
            padding: 0,
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.16)",
            border: "1px solid rgba(0,0,0,0.04)",
            mt: 1,
          },
        }}
      >
        <SectionHeader
          icon={<FilterListIcon fontSize="small" />}
          title="Filter Data"
        />
        <FilterForm />
        <Divider />
        <ActiveFiltersList />
      </Popover>
    </>
  )
}

export default FilterBuilder
