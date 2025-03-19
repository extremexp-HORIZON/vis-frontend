import { useEffect, useState } from "react"
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Tooltip,
} from "@mui/material"
import { Vega } from "react-vega"
import InfoIcon from "@mui/icons-material/Info"
import grey from "@mui/material/colors/grey"
import { Task } from "../../../../shared/models/workflow.model"
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';

interface Metric {
  name: string
  value: number
  avgDiff: number
}

interface IRuntimeDecomposition {
  availableMetrics: Metric[] | null
  workflowId: number | string
  tasks: Task[] | null
}

const RuntimeDecomposition = (props: IRuntimeDecomposition) => {
  const { availableMetrics, tasks } = props
  const [specData, setSpecData] = useState<any>(null)

  useEffect(() => {
    if (tasks) {
      const data = tasks.map(task => ({
        task: task.name.replace(' ', '_'),
        start: new Date(task.start).getTime(),
        end: new Date(task.end).getTime(),
        duration: (new Date(task.end).getTime() - new Date(task.start).getTime()) / 1000, // duration in seconds
      }));
      setSpecData(data)
    }
  }, [tasks])

  return (
    <Paper
      className="Category-Item"
      elevation={2}
      sx={{
        borderRadius: 4,
        width: "inherit",
        display: "flex",
        flexDirection: "column",
        rowGap: 0,
        minWidth: "300px",
        height: "100%",
      }}
    >
      <Box
        sx={{
          px: 1.5,
          py: 0.5,
          display: "flex",
          alignItems: "center",
          borderBottom: `1px solid ${grey[400]}`,
        }}
      >
        <Typography fontSize={"1rem"} fontWeight={600}>
          {"Runtime Decomposition per Task"}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Tooltip title={"Description not available."}>
          <IconButton>
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </Box>
      {availableMetrics ? (
        <>
          <Box sx={{ width: "99%", p: 1, flex: 1, display: "flex", alignItems: "center"}}>
            <Vega
              actions={false}
              style={{ width: "95%" }}
              spec={{
                width: "container",
                height: 300,
                padding: 0,
                data: {
                  values: specData,
                },
                mark: "bar",
                encoding: {
                  y: {
                    field: "task",
                    type: "nominal",
                    axis: {
                      title: "Task",
                      titleFontWeight: "bold",
                    },
                  },
                  x: {
                    field: "duration",
                    type: "quantitative",
                    axis: {
                      title: "Duration (seconds)",
                      titleFontWeight: "bold",
                    },
                  },
                  color: {
                    value: "#4682b4",
                  },
                  tooltip: [
                    { field: "task", type: "nominal", title: "Task:" },
                    { field: "start", type: "temporal", title: "Start Time:" },
                    { field: "end", type: "temporal", title: "End Time:" },
                    { field: "duration", type: "quantitative", title: "Duration:" },
                  ],
                },
              }}
            />
          </Box>
        </>
      ) : (
        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 500}}>
              <ReportProblemRoundedIcon fontSize={"large"} sx={{color: theme => theme.palette.customGrey.dark}} />
              <Typography sx={{color: theme => theme.palette.customGrey.dark}} variant={"h6"}>{"No Runtime Data Available"}</Typography>
            </Box>
      )}
    </Paper>
  )
}

export default RuntimeDecomposition
