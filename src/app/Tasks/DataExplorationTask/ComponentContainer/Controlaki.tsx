import { useAppDispatch, useAppSelector } from "../../../../store/store"
import { Checkbox, FormControl, InputLabel, ListItemText, MenuItem, Select } from "@mui/material"
import { setControls } from "../../../../store/slices/workflowPageSlice"
import { fetchDataExplorationData } from "../../../../shared/models/tasks/data-exploration-task.model"
import { defaultDataExplorationQuery } from "../../../../shared/models/dataexploration.model"

const Controlaki = () => {
  const dispatch = useAppDispatch()
  const { tab } = useAppSelector(state => state.workflowPage)

  const originalColumns = tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns || []
  const selectedColumns = tab?.workflowTasks.dataExploration?.controlPanel?.selectedColumns || []

  const handleChange = (event: any) => {
    const selectedNames = event.target.value

    const selectedObjects = originalColumns.filter(col => selectedNames.includes(col.name))
    dispatch(setControls({ selectedColumns: selectedObjects }))
  }

  const handleFetchDataExploration = () => {
    if (!selectedColumns?.length) return

    dispatch(fetchDataExplorationData({
      query: {
        ...defaultDataExplorationQuery,
        datasetId: "I2Cat_phising/dataset/I2Cat_phising_dataset.csv",
        columns: selectedColumns.map(col => col.name),
        filters: tab?.workflowTasks.dataExploration?.controlPanel?.filters || [],
        limit: 100,
      },
      metadata: {
        workflowId: tab?.workflowId || "",
        queryCase: "chart",
      },
    }))
  }

  return (
    <FormControl fullWidth>
      <InputLabel id="column-select-label">Select Columns</InputLabel>
      <Select
        labelId="column-select-label"
        multiple
        value={selectedColumns.map(col => col.name)}
        onChange={handleChange}
        onClose={handleFetchDataExploration}
        renderValue={(selected) => selected.join(", ")}
        MenuProps={{
          PaperProps: { style: { maxHeight: 224, width: 250 } },
        }}
      >
        {originalColumns.map((column: any) => (
          <MenuItem key={column.name} value={column.name}>
            <Checkbox
              checked={selectedColumns.some(col => col.name === column.name)}
            />
            <ListItemText primary={column.name} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default Controlaki
