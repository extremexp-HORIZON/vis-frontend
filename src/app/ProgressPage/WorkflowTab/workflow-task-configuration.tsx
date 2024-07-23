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
  configuration: { [key: string]: any } | null
}

const WorkflowTaskConfiguration = (props: ITaskConfiguration) => {
  const { configuration } = props

  const convertParametersToString = (obj: { [key: string]: any }) => {
    const parametersString = Object.entries(obj)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ")
    return parametersString
  }

  return (
    <>
      {console.log(configuration)}
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
                {Object.keys(configuration).map((taskName, index) => (
                  <TableRow key={index}>
                    <TableCell>{taskName}</TableCell>
                    {Object.keys(configuration[taskName]).map(
                      (task: any, index: number) => (
                        <TableCell key={`${task}-${index}`}>
                          {typeof configuration[taskName][task] === "string"
                            ? configuration[taskName][task]
                            : convertParametersToString(
                                configuration[taskName][task],
                              )}
                        </TableCell>
                      ),
                    )}
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
