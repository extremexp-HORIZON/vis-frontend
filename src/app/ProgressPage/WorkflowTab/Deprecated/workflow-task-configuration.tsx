import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Paper from "@mui/material/Paper"
import { ITask } from "../../../../shared/models/experiment/task.model"
import { IParam } from "../../../../shared/models/experiment/param.model"
import LaunchIcon from "@mui/icons-material/Launch"
import { IconButton, Tooltip } from "@mui/material"

import theme from "../../../../mui-theme"

interface ITaskConfiguration {
  configuration: ITask[] | null
  params: IParam[] | null
  handleOpenTask: (taskName: string) => void
}

const WorkflowTaskConfiguration = (props: ITaskConfiguration) => {
  const { configuration, params, handleOpenTask } = props

  const convertParametersToString = (obj: IParam[]) => obj
    .map((param) => `${param.name}: ${param.value}`)
    .join(", ")

  return (
    <>
      <Box>
        {configuration && (
          <TableContainer component={Paper}>
            <Table aria-label="task configuration table">
              <TableHead sx={{background: theme.palette.customGrey.main}}>
                <TableRow>
                  <TableCell>Task</TableCell>
                  <TableCell>Variant</TableCell>
                  <TableCell>Parameters</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {configuration.map((task, index) => (
                  <TableRow key={index}>
                    <TableCell>{task.name}</TableCell>
                    <TableCell>{task.variant || "-"}</TableCell>
                    <TableCell>
                      {params?.find(param => param.task === task.name) ?
                        convertParametersToString(params) : "-"}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="open task" placement="right">
                        <IconButton onClick={() => handleOpenTask(task.name)}>
                          <LaunchIcon style={{color: theme.palette.primary.main }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
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
