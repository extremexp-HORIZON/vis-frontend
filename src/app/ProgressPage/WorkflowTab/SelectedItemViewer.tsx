import { Paper, Typography, Divider, Box } from "@mui/material"
import { useAppSelector } from "../../../store/store"

const SelectedItemViewer = () => {
  const { selectedItem, selectedTask } = useAppSelector(
    state =>
      state.workflowPage.tab?.dataTaskTable ?? {
        selectedItem: null,
        selectedTask: null,
      },
  )

  if (selectedTask) {
    return (
      <Paper sx={{ p: 3, height: "100%", overflow: "auto" }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Task Overview
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Name:</Typography>
          <Typography>{selectedTask.name}</Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Variant:</Typography>
          <Typography>{selectedTask.variant}</Typography>
        </Box>

        {selectedTask.command && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Command:</Typography>
            <Typography>{selectedTask.command}</Typography>
          </Box>
        )}

        {/* You can add more fields if available like: runtime, env, etc */}
      </Paper>
    )
  }

  if (selectedItem) {
    return (
      <Paper sx={{ p: 3, height: "100%", overflow: "auto" }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          {selectedItem.type} Details
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <pre style={{ fontSize: 14 }}>
          {JSON.stringify(selectedItem.data, null, 2)}
        </pre>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 3, height: "100%", overflow: "auto" }}>
      <Typography variant="body1" color="text.secondary">
        No selection yet. Click a task or item to view its details.
      </Typography>
    </Paper>
  )
}

export default SelectedItemViewer
