import { Typography, Paper } from "@mui/material"
import { useAppSelector } from "../../../store/store"

const SelectedItemViewer = () => {
  const selectedItem = useAppSelector(
    state => state.workflowPage.tab?.dataTaskTable.selectedItem
  )

  if (!selectedItem) return <Paper sx={{ p: 2, width: "100%" }}>No item selected</Paper>

  return (
    <>
      <Typography variant="h6">Selected {selectedItem.type}</Typography>
      <pre>{JSON.stringify(selectedItem.data, null, 2)}</pre>
    </>
  )
}

export default SelectedItemViewer
