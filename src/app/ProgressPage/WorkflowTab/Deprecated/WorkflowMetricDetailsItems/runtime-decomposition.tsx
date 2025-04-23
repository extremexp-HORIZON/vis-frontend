import { useEffect, useState } from "react"
import { useAppSelector } from "../../../../../store/store"
import { Box} from "@mui/material"
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded"
import type { RootState } from "../../../../../store/store"
import ResponsiveCardVegaLite from "../../../../../shared/components/responsive-card-vegalite"
import InfoMessage from "../../../../../shared/components/InfoMessage"

const RuntimeDecomposition = () => {
  const { tab } = useAppSelector((state: RootState) => state.workflowPage)
  const tasks = tab?.workflowConfiguration?.tasks
  const [specData, setSpecData] = useState<any[]>([])

  useEffect(() => {
    if (tasks?.length) {
      const formatted = tasks.map(task => ({
        task: task.name.replace(/\s+/g, "_"),
        start: task.startTime,
        end: task.endTime,
        duration: ((task.endTime ?? 0) - (task.startTime ?? 0)) / 1000, // in seconds
      }))
      setSpecData(formatted)
    }
  }, [tasks])

  return (
    <>
      {tasks?.length ? (
        <Box
          sx={{
            width: "99%",
            pt: 1,
            flex: 1,
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            gap: 1
          }}
        >
           <Box sx={{ width: '100%' }}>
          <ResponsiveCardVegaLite
            title={"Runtime Decomposition per Task"}
            actions={false}
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
                  {
                    field: "duration",
                    type: "quantitative",
                    title: "Duration:",
                  },
                ],
              },
            }}
          />
          </Box>
        </Box>
      ) : (
        <InfoMessage 
          message="No runtime data available."
          type="info"
          icon={<ReportProblemRoundedIcon sx={{ fontSize: 40, color: "info.main" }} />}
          fullHeight
      />
      )}
    </>
  )
}

export default RuntimeDecomposition
