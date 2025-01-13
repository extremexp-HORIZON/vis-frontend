import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import { useEffect, useRef } from "react"
import Typography from "@mui/material/Typography"
import FormControl from "@mui/material/FormControl"
import Select, { SelectChangeEvent } from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
import { setProgressParallel } from "../../store/slices/progressPageSlice"
import _ from "lodash"
import ParallelCoordinateVega from "./parallel-coordinate-vega-plot"

const ParallelCoordinatePlot = () => {
  const { workflows, progressParallel } = useAppSelector(
    (state: RootState) => state.progressPage,
  )
  const parallelData = useRef<any[]>([])
  const foldArray = useRef<string[]>([])
  const tooltipArray = useRef<{ [key: string]: string }[]>([])

  const dispatch = useAppDispatch()

  useEffect(() => {
    if (workflows.data.length > 0) {
      const uniqueParameters = new Set(
        workflows.data.reduce((acc: any[], workflow) => {
          const params = workflow.tasks.find(
            task => task.id === "TrainModel",
          )?.parameters
          let paramNames = []
          if (params) {
            paramNames = params.map(param => param.name)
            return [...acc, ...paramNames]
          } else {
            return [...acc]
          }
        }, []),
      )
      foldArray.current = Array.from(uniqueParameters)
      const data = workflows.data
        .filter(workflow => workflow.status === "completed")
        .map(workflow => {
          const params = workflow.tasks.find(
            task => task.id === "TrainModel",
          )?.parameters
          return {
            ...Array.from(uniqueParameters).reduce((acc, variant) => {
              acc[variant] =
                params?.find(param => param.name === variant)?.value || ""
              return acc
            }, {}),
            ...workflow.metrics.reduce((acc, metric) => {
              return {
                ...acc,
                [metric.name]: metric.value,
              }
            }, {}),
            workflowId: workflow.name,
          }
        })
      parallelData.current = _.cloneDeep(data)
      const options = Array.from(
        new Set(
          workflows.data
            .filter(workflow => workflow.status === "completed")
            .reduce((acc: any[], workflow) => {
              const metrics = workflow.metrics.map((metric: any) => metric.name)
              return [...acc, ...metrics]
            }, []),
        ),
      )

      const selected = options[0]

      tooltipArray.current = (
        parallelData.current.at(0)
          ? Object.keys(parallelData.current.at(0))
          : []
      ).map(key => ({ field: key }))

      dispatch(
        setProgressParallel({
          data,
          options,
          selected,
        }),
      )
    }
  }, [dispatch, workflows])

  const handleMetricSelection = (event: SelectChangeEvent) => {
    dispatch(setProgressParallel({ selected: event.target.value as string }))
  }

  return (
    <>
      {progressParallel.data.length > 0 && (
        <Paper elevation={2}>
          <Box sx={{ display: "flex", alignItems: "center", px: 1.5 }}>
            <Typography fontSize={"0.8rem"}>Color by:</Typography>
            <FormControl
              sx={{ m: 1, minWidth: 120, maxHeight: 120 }}
              size="small"
            >
              <Select
                value={progressParallel.selected}
                sx={{ fontSize: "0.8rem" }}
                onChange={handleMetricSelection}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 250,
                      maxWidth: 300,
                    },
                  },
                }}
              >
                {progressParallel.options.map(feature => (
                  <MenuItem key={`${feature}`} value={feature}>
                    {feature}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ width: "99%", px: 1 }}>
            <ParallelCoordinateVega
              parallelData={parallelData}
              progressParallel={progressParallel}
              foldArray={foldArray}
            ></ParallelCoordinateVega>
          </Box>
        </Paper>
      )}
    </>
  )
}

export default ParallelCoordinatePlot
