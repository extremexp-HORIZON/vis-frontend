import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Paper from "@mui/material/Paper"

interface ITaskConfiguration {
  variants: { [key: string]: number | string } | null
  model: string | null; // Adjusted to directly be a string
}


const WorkflowTaskConfiguration = (props: ITaskConfiguration) => {
  const { variants,model } = props


  const tasks = [
    { task: "Data Split", variant: "-", parameters: "-" },
    { task: "Data Augmentation", variant: "-", parameters: "-" },
    {
      task: "Model Training",
      variant: model || "-",
      parameters:
        Object.entries(variants as object)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ") || null,
    },
  ]

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table aria-label="task configuration table">
          <TableHead>
            <TableRow>
              <TableCell>Task</TableCell>
              <TableCell>Variant</TableCell>
              <TableCell>Parameters</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task, index) => (
              <TableRow key={index}>
                <TableCell>{task.task}</TableCell>
                <TableCell>{task.variant}</TableCell>
                <TableCell>{task.parameters}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default WorkflowTaskConfiguration
