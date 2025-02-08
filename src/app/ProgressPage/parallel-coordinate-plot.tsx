import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import { useEffect, useRef, useState } from "react"
import Typography from "@mui/material/Typography"
import FormControl from "@mui/material/FormControl"
import Select, { SelectChangeEvent } from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
import { setProgressParallel } from "../../store/slices/progressPageSlice"
import _ from "lodash"
import ParallelCoordinateVega from "./parallel-coordinate-vega-plot"
import ReportProblemIcon from "@mui/icons-material/ReportProblem"

const ParallelCoordinatePlot = () => {
  const { workflows, progressParallel, progressGauges } = useAppSelector(
    (state: RootState) => state.progressPage,
  )
  const parallelData = useRef<any[]>([])
  const foldArray = useRef<string[]>([])
  const tooltipArray = useRef<{ [key: string]: string }[]>([])
  const [metricExist, setMetricExist] = useState<boolean>(false)

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
      let selected = progressParallel.selected
      let options = progressParallel.options
      if (progressParallel.options.length === 0) {
        options = Array.from(
          new Set(
            workflows.data
              // .filter(workflow => workflow.status === "completed")
              .reduce((acc: any[], workflow) => {
                const metrics = workflow.metrics
                  .filter(
                    m => m?.semantic_type && m.semantic_type.includes("ML"),
                  )
                  .map((metric: any) => metric.name)
                return [...acc, ...metrics]
              }, []),
          ),
        )
        selected = options[0]
      }
      tooltipArray.current = (
        parallelData.current.at(0)
          ? Object.keys(parallelData.current.at(0))
          : []
      ).map(key => ({ field: key }))

      const gaugeValue = progressGauges.find(
        gauge => gauge.name === selected,
      )?.value
      setMetricExist(Number.isNaN(gaugeValue) ? false : true)

      dispatch(
        setProgressParallel({
          data,
          options,
          selected,
        }),
      )
    }
  }, [workflows])

  const handleMetricSelection = (event: SelectChangeEvent) => {
    dispatch(setProgressParallel({ selected: event.target.value as string }))
    const gaugeValue = progressGauges.find(
      gauge => gauge.name === (event.target.value as string),
    )?.value
    setMetricExist(!Number.isNaN(gaugeValue))
  }

  return (
    <>
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
            {metricExist ? (
              <ParallelCoordinateVega
                parallelData={parallelData}
                progressParallel={progressParallel}
                foldArray={foldArray}
              ></ParallelCoordinateVega>
            ) : (
              <Box
                sx={{
                  width: "100%",
                  height: 300,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ReportProblemIcon fontSize="large" />
                <Typography>No Metric Data Available</Typography>
              </Box>
            )}
          </Box>
        </Paper>
      {/* )} */}
    </>
  )
}

export default ParallelCoordinatePlot
