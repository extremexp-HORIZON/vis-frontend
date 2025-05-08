import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import FormControl from "@mui/material/FormControl"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import type { Dispatch, SetStateAction } from "react"
import { useEffect, useState } from "react"
import _ from "lodash"
import { CircularProgress, InputLabel, useTheme } from "@mui/material"
import ResponsiveCardVegaLite from "../../../../shared/components/responsive-card-vegalite"
import ShowChartIcon from "@mui/icons-material/ShowChart"

interface ControlPanelProps {
  xAxisOption: string
  yAxisOption: string
  setXAxisOption: (val: string) => void
  setYAxisOption: (val: string) => void
  showMisclassifiedOnly: boolean
  options: string[]
  plotData: any
}

const ControlPanel = ({
  xAxisOption,
  yAxisOption,
  setXAxisOption,
  setYAxisOption,
  options,
  plotData,
}: ControlPanelProps) => {
  const handleAxisSelection =
    (axis: "x" | "y") => (e: { target: { value: string } }) => {
      if (axis === "x") setXAxisOption(e.target.value)
      else setYAxisOption(e.target.value)
    }

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "row", gap: 2, px: 1.5 }}>
        {/* X-Axis Selector */}
        <FormControl fullWidth>
            <InputLabel id="x-axis-select-label">
              <Box display="flex" alignItems="center" gap={1}>
                <ShowChartIcon fontSize="small" />
                X-Axis
              </Box>
            </InputLabel>
            <Select
              labelId="x-axis-select-label"
              label="X-Axis-----"
              disabled={plotData?.loading || !plotData?.data}
              value={xAxisOption}
              onChange={handleAxisSelection("x")}
              MenuProps={{
                PaperProps: { style: { maxHeight: 224, width: 250 } },
              }}
            >
              {options
                .filter(option => option !== yAxisOption)
                .map((feature, idx) => (
                  <MenuItem key={`xAxis-${feature}-${idx}`} value={feature}>
                    {feature}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="y-axis-select-label">
              <Box display="flex" alignItems="center" gap={1}>
                <ShowChartIcon fontSize="small" />
                Y-Axis
              </Box>
            </InputLabel>
            <Select
              labelId="y-axis-select-label"
              label="Y-Axis-----"
              disabled={plotData?.loading || !plotData?.data}
              value={xAxisOption}
              onChange={handleAxisSelection("y")}
              MenuProps={{
                PaperProps: { style: { maxHeight: 224, width: 250 } },
              }}
            >
              {options
                .filter(option => option !== yAxisOption)
                .map((feature, idx) => (
                  <MenuItem key={`xAxis-${feature}-${idx}`} value={feature}>
                    {feature}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          px: 1.5,
        }}
      >
      </Box>
    </>
  )
}

interface IInstanceClassification {
  plotData: {
    data: Array<{
      [key: string]: any
      label: string
      prediction: string
    }>
    loading: boolean
    error: string | null
  } | null
  point: any
  showMisclassifiedOnly: boolean
  setPoint: Dispatch<SetStateAction<any>>
}

const InstanceClassification = (props: IInstanceClassification) => {
  const theme = useTheme()
  const { plotData, setPoint, point, showMisclassifiedOnly } = props
  console.log("InstanceClassification plotData", plotData)
  const [options, setOptions] = useState<string[]>([])
  const [xAxisOption, setXAxisOption] = useState<string>("")
  const [yAxisOption, setYAxisOption] = useState<string>("")

  // const getVegaData = (data: any) => {
  //   let newData: any[] = _.cloneDeep(data)
  //   if (checkbox) {
  //     newData = newData.filter(d => d.actual !== d.predicted)
  //   }
  //   return newData
  // }
  const getVegaData = (data: any) => {
    let newData = _.cloneDeep(data)
    return newData.map((d: { actual: any; predicted: any }) => ({
      ...d,
      isMisclassified: d.actual !== d.predicted,
    }))
  }

  useEffect(() => {
    if (plotData && plotData.data) {
      setOptions(Object.keys(plotData.data[0]))
    }
  }, [plotData])

  useEffect(() => {
    if (options.length > 0) {
      setXAxisOption(options[0])
      setYAxisOption(options[1])
    }
  }, [options])

  const handleAxisSelection =
    (axis: string) => (e: { target: { value: string } }) => {
      if (axis === "x") {
        setXAxisOption(e.target.value)
      } else {
        setYAxisOption(e.target.value)
      }
    }

  const handleNewView = (view: any) => {
    view.addEventListener("click", (event: any, item: any) => {
      if (item && item.datum) {
        setPoint(item.datum)
      } else {
        setPoint(null)
      }
    })
  }

  const info = (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100%"
    >
      <CircularProgress />
      <Typography fontSize={"0.8rem"} sx={{ ml: 1 }}>
        {plotData?.loading ? "Loading..." : "No data available"}
      </Typography>
    </Box>
  )
  const shouldShowInfoMessage = plotData?.loading || !plotData?.data

  return (
    <ResponsiveCardVegaLite
      spec={{
        width: "container",
        height: "container",
        autosize: { type: "fit", contains: "padding", resize: true },
        data: {
          values: getVegaData(plotData?.data ?? []),
        },
        params: [
          {
            name: "pts",
            select: { type: "point", toggle: false },
            bind: "legend",
          },
          {
            name: "highlight",
            select: { type: "point", on: "click", clear: "clickoff" }
          },
          {
            name: "panZoom",
            select: "interval",
            bind: "scales",
          },
        ],
        mark: {
          type: "point",
          filled: true,
          size: 100,
        },

        encoding: {
          x: {
            field: xAxisOption || "xAxis default",
            type: "quantitative",
          },
          y: {
            field: yAxisOption || "yAxis default",
            type: "quantitative",
          },
          color: showMisclassifiedOnly
            ? {
              field: "isMisclassified",
              type: "nominal",
              scale: {
                domain: [false, true],
                range: ["#cccccc", "#ff0000"],
              },
              legend: {
                title: "Misclassified",
                labelExpr: "datum.label === 'true' ? 'Misclassified' : 'Correct'",
              },
            }
            : {
              field: "predicted", 
              type: "nominal",
              scale: {
                range: ["#1f77b4", "#2ca02c"],
              },
              legend: {
                title: "Predicted Class",
              },
            },
          opacity: showMisclassifiedOnly
            ? {
              field: "isMisclassified",
              type: "nominal",
              scale: {
                domain: [false, true],
                range: [0.45, 1.0],
              },
            }
            : {
              value: 0.8,
            },
          stroke: {
            condition: {
              param: "highlight",
              empty: false,
              value: "black", 
            },
            value: "transparent"
          },
          strokeWidth: {
            condition: {
              param: "highlight", 
              empty: false, 
              value: 2 
            },
            value: 0
          },
          tooltip: [
            { field: "actual", type: "nominal", title: "Actual" },
            { field: "predicted", type: "nominal", title: "Predicted" },
            { field: xAxisOption || "xAxis default", type: "quantitative", title: xAxisOption },
            { field: yAxisOption || "yAxis default", type: "quantitative", title: yAxisOption },
          ]
        },
      }}
      title={"Instance Classification Chart"}
      actions={false}
      controlPanel={
        <ControlPanel
          xAxisOption={xAxisOption}
          yAxisOption={yAxisOption}
          setXAxisOption={setXAxisOption}
          setYAxisOption={setYAxisOption}
          showMisclassifiedOnly={showMisclassifiedOnly}
          options={options}
          plotData={plotData}
        />
      }
      onNewView={handleNewView}
      infoMessage={info}
      showInfoMessage={shouldShowInfoMessage}
      aspectRatio={2}
      maxHeight={480}
      isStatic={true}
    />
  )
}

export default InstanceClassification
