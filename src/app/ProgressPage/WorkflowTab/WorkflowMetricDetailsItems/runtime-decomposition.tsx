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

interface Metric {
  name: string
  value: number
  avgDiff: number
}

interface IRuntimeDecomposition {
  availableMetrics: Metric[] | null
  workflowId: number | string
}

const RuntimeDecomposition = (props: IRuntimeDecomposition) => {
  const { availableMetrics } = props
  const [specData, setSpecData] = useState<any>(null)

  useEffect(() => {
    const totalRuntime = Math.floor(Math.random() * 30) + 1
    const modelTrainingRuntime = 2.4
    const remainingRuntime = totalRuntime - modelTrainingRuntime

    const splitRemainingTime = (tasks: any[]) => {
      let timeLeft = remainingRuntime
      return tasks.map((task: any, index) => {
        const time =
          index === tasks.length - 1 ? timeLeft : Math.random() * timeLeft
        timeLeft -= time
        return time
      })
    }

    const [dataAugmentationTime, splitDataTime] = splitRemainingTime([{}, {}])

    const data = [
      {
        task: "Split_Data", start: 0, end: dataAugmentationTime,
      },
      { task: "Model_Training",
        start: dataAugmentationTime + modelTrainingRuntime,
        end: totalRuntime,
       },
      {
        task: "Data_Augmentation",
        start: dataAugmentationTime,
        end: dataAugmentationTime + modelTrainingRuntime,
      },
      
    ]

    setSpecData(data)
  }, [])

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
                padding:0,
                data: {
                  values: specData,
                },
                mark: "bar",
                encoding: {
                  y: {
                    field: "task",
                    type: "nominal",
                    axis: {
                      title: "task",
                      titleFontWeight: "bold",
                    },
                  },
                  x: {
                    field: "start",
                    type: "quantitative",
                    scale: { nice: false },
                  },
                  x2: { field: "end" },
                  color: {
                    value: "#4682b4",
                  },
                },
              }}
            />
          </Box>
        </>
      ) : (
        <Typography>No metrics available</Typography>
      )}
    </Paper>
  )
}

export default RuntimeDecomposition
