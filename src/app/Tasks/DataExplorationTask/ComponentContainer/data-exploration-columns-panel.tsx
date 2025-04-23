import { useAppDispatch, useAppSelector } from "../../../../store/store"
import { Checkbox, FormControl, InputLabel, ListItemText, MenuItem, Select } from "@mui/material"
import { setControls } from "../../../../store/slices/workflowPageSlice"
import { fetchDataExplorationData } from "../../../../shared/models/tasks/data-exploration-task.model"
import { defaultDataExplorationQuery } from "../../../../shared/models/dataexploration.model"
import { useEffect } from "react"

const ColumnsPanel = () => {
  const dispatch = useAppDispatch()
  const { tab } = useAppSelector(state => state.workflowPage)

  const originalColumns = tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns || []
  const selectedColumns = tab?.workflowTasks.dataExploration?.controlPanel?.selectedColumns || []

  useEffect(() => {
    if(tab?.workflowTasks?.dataExploration?.controlPanel?.chartType === "datatable" && tab?.workflowTasks?.dataExploration?.metaData?.data) {
      handleFetchDataExploration(tab?.workflowTasks?.dataExploration?.controlPanel?.selectedColumns)
    }
  }, [tab?.workflowTasks?.dataExploration?.metaData?.data])

  const handleChange = (event: any) => {
    const selectedNames = event.target.value

    const selectedObjects = originalColumns.filter(col => selectedNames.includes(col.name))
    dispatch(setControls({ selectedColumns: selectedObjects }))
    if (selectedObjects.length) {
      handleFetchDataExploration(selectedObjects);
    }
  }

  const handleFetchDataExploration = (columns = selectedColumns) => {
    if (!columns?.length) return;
  
    dispatch(fetchDataExplorationData({
      query: {
        ...defaultDataExplorationQuery,
        datasetId: tab?.dataTaskTable.selectedItem?.data?.source || "",
        columns: columns.map(col => col.name),
        filters: tab?.workflowTasks.dataExploration?.controlPanel?.filters || [],
      },
      metadata: {
        workflowId: tab?.workflowId || "",
        queryCase: "chart",
      },
    }));
  };

  return (
    <FormControl fullWidth>
      <InputLabel id="column-select-label">Select Columns</InputLabel>
      <Select
        labelId="column-select-label"
        multiple
        label="Select Columns"
        value={selectedColumns.map(col => col.name)}
        onChange={handleChange}
        // onClose={handleFetchDataExploration}
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

export default ColumnsPanel
