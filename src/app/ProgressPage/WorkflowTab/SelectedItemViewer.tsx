import { Typography, Paper, Box } from "@mui/material"
import { useAppSelector } from "../../../store/store"

const SelectedItemViewer = () => {
  const selectedItem = useAppSelector(
    state => state.workflowPage.tab?.dataTaskTable.selectedItem
  )

  if (!selectedItem) return <Box sx={{ height: "100%",width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>No item selected</Box>

  return (
    <>
      <Typography variant="h6">Selected {selectedItem.type}</Typography>
      <pre>{JSON.stringify(selectedItem.data, null, 2)}</pre>
    </>
  )
}

export default SelectedItemViewer
