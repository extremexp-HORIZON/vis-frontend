import { useEffect } from "react"
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  OutlinedInput,
  Checkbox,
} from "@mui/material"
import { useAppDispatch, useAppSelector } from "../../../../store/store"
import { setControls } from "../../../../store/slices/workflowPageSlice"

const ScatterChartControlPanel = () => {
  const dispatch = useAppDispatch()
  const { tab } = useAppSelector(state => state.workflowPage)
  const xAxis = tab?.workflowTasks.dataExploration?.controlPanel.xAxisScatter

  useEffect(() => {
    if (
      tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns &&
      tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns
        .length > 0
    ) {
      // Filter the yAxis columns to keep only the ones that still exist in `columns`
      const validYAxis =
        tab?.workflowTasks.dataExploration?.controlPanel.yAxisScatter?.filter(
          yCol =>
            tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns.find(
              col => col.name === yCol.name,
            ),
        )

      if (
        validYAxis?.length !==
        tab?.workflowTasks.dataExploration?.controlPanel.yAxisScatter?.length
      ) {
        dispatch(setControls({ yAxisScatter: validYAxis }))
      }
    }
  }, [
    tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns,
    tab?.workflowTasks.dataExploration?.controlPanel.yAxisScatter,
  ])

  return (
    tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns &&
    tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns.length >
      0 && (
      <Box
        sx={{
          display: "flex",
          gap: "1rem",
          marginTop: "1rem",
          flexDirection: "column",
        }}
      >
        {/* X-Axis Selector */}
        <FormControl fullWidth>
          <InputLabel id="x-axis-select-label">X-Axis</InputLabel>
          <Select
            labelId="x-axis-select-label"
            value={xAxis ? xAxis.name : ""} // Display column name if xAxis is selected
            onChange={e => {
              const selectedColumn =
                tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns?.find(
                  col => col.name === e.target.value,
                )
              dispatch(setControls({ xAxisScatter: selectedColumn }))
            }}
            label="X-Axis"
            MenuProps={{
              PaperProps: { style: { maxHeight: 224, width: 250 } },
            }}
          >
            {tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns?.map(
              col => (
                <MenuItem key={col.name} value={col.name}>
                  {col.name} {/* Only show the column name */}
                </MenuItem>
              ),
            )}
          </Select>
        </FormControl>

        {/* Y-Axis Multi-Selector */}
        <FormControl fullWidth>
          <InputLabel id="y-axis-multi-select-label">Y-Axis</InputLabel>
          <Select
            labelId="y-axis-multi-select-label"
            multiple
            value={tab?.workflowTasks.dataExploration?.controlPanel.yAxisScatter.map(
              col => col.name,
            )} // Display names of selected yAxis columns
            onChange={e => {
              const selectedColumns = Array.isArray(e.target.value)
                ? e.target.value.map(name =>
                    tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns.find(
                      col => col.name === name,
                    ),
                  )
                : [
                    tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns.find(
                      col => col.name === e.target.value,
                    ),
                  ]
              const validColumns = selectedColumns.filter(
                col => col !== undefined,
              )
              dispatch(setControls({ yAxisScatter: validColumns }))
            }}
            input={<OutlinedInput label="Y-Axis" />}
            renderValue={selected => selected.join(", ")}
            MenuProps={{
              PaperProps: { style: { maxHeight: 224, width: 250 } },
            }}
          >
            {tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns.map(
              col => (
                <MenuItem key={col.name} value={col.name}>
                  <Checkbox
                    checked={tab?.workflowTasks.dataExploration?.controlPanel.yAxisScatter.some(
                      yCol => yCol.name === col.name,
                    )}
                  />
                  {col.name} {/* Only show the column name */}
                </MenuItem>
              ),
            )}
          </Select>
        </FormControl>

        {/* Color By Selector */}
        <FormControl fullWidth>
          <InputLabel id="color-by-select-label">Color By</InputLabel>
          <Select
            labelId="color-by-select-label"
            value={
              tab?.workflowTasks.dataExploration?.controlPanel.colorBy
                ? tab?.workflowTasks.dataExploration?.controlPanel.colorBy.name
                : ""
            }
            onChange={e => {
              const selectedColumn =
                tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns?.find(
                  col => col.name === e.target.value,
                )
              dispatch(setControls({ colorBy: selectedColumn }))
            }}
            label="Color By"
            MenuProps={{
              PaperProps: { style: { maxHeight: 224, width: 250 } },
            }}
          >
            {tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns?.map(
              col => (
                <MenuItem key={col.name} value={col.name}>
                  {col.name} {/* Only show the column name */}
                </MenuItem>
              ),
            )}
          </Select>
        </FormControl>
      </Box>
    )
  )
}

export default ScatterChartControlPanel
