import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Paper from "@mui/material/Paper"
import { Parameter, Task } from "../../../shared/models/workflow.model"

interface ITaskConfiguration {
  configuration: Task[] | null
}

const WorkflowTaskConfiguration = (props: ITaskConfiguration) => {
  const { configuration } = props

  const convertParametersToString = (obj: Parameter[]) => obj
    .map((param) => `${param.name}: ${param.value}`)
    .join(", ")

  return (
    <>
      <Box>
        {configuration && (
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
                {configuration.map((task, index) => (
                  <TableRow key={index}>
                    <TableCell>{task.name}</TableCell>
                    <TableCell>{task.variant || "-"}</TableCell>
                    <TableCell>
                      {task.parameters ?
                        convertParametersToString(task.parameters) : "-"}
                    </TableCell>
                    {/* {configuration.map((task: any, index: number) => (
                      <TableCell key={`${task}-${index}`}>
                        {typeof configuration[taskName][task] === "string"
                          ? configuration[taskName][task]
                          : convertParametersToString(
                              configuration[taskName][task],
                            )}
                      </TableCell>
                    ))} */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </>
  )
}

export default WorkflowTaskConfiguration
