import Box from "@mui/material/Box"

import Typography from "@mui/material/Typography"
import FormControl from "@mui/material/FormControl"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import type { Dispatch, SetStateAction } from "react"
import { useEffect, useState } from "react"
import _ from "lodash"
import { Checkbox, useTheme } from "@mui/material"
import ResponsiveCardVegaLite from "../../../../shared/components/responsive-card-vegalite"
import InfoMessage from "../../../../shared/components/InfoMessage"
import AssessmentIcon from "@mui/icons-material/Assessment"

interface ControlPanelProps {
  xAxisOption: string
  yAxisOption: string
  setXAxisOption: (val: string) => void
  setYAxisOption: (val: string) => void
  handleCheckboxChange: (event: React.ChangeEvent) => void
  checkbox: boolean
  options: string[]
  plotData: any
}

const ControlPanel = ({
  xAxisOption,
  yAxisOption,
  setXAxisOption,
  setYAxisOption,
  handleCheckboxChange,
  checkbox,
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
      <Box sx={{ display: "flex", flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center", px: 1.5 }}>
          <Typography fontSize={"0.8rem"}>x-axis:</Typography>
          <FormControl sx={{ m: 1, minWidth: 120, maxHeight: 120 }} size="small">
            <Select
              value={xAxisOption}
              disabled={plotData?.loading || !plotData?.data}
              sx={{ fontSize: "0.8rem" }}
              onChange={handleAxisSelection("x")}
              MenuProps={{ PaperProps: { style: { maxHeight: 250, maxWidth: 300 } } }}
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

        <Box sx={{ display: "flex", alignItems: "center", px: 1.5 }}>
          <Typography fontSize={"0.8rem"}>y-axis:</Typography>
          <FormControl sx={{ m: 1, minWidth: 120, maxHeight: 120 }} size="small">
            <Select
              value={yAxisOption}
              sx={{ fontSize: "0.8rem" }}
              disabled={plotData?.loading || !plotData?.data}
              onChange={handleAxisSelection("y")}
              MenuProps={{ PaperProps: { style: { maxHeight: 250, maxWidth: 300 } } }}
            >
              {options
                .filter(option => option !== xAxisOption)
                .map((feature, idx) => (
                  <MenuItem key={`yAxis-${feature}-${idx}`} value={feature}>
                    {feature}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          px: 1.5,
        }}
      >
        <Typography fontSize={"0.8rem"}>Misclassified Instances:</Typography>
        <Checkbox
          checked={checkbox}
          onChange={handleCheckboxChange}
          disabled={plotData?.loading || !plotData?.data}
        />
      </Box>
    </>
  )
}


interface IInstanceClassification {
  plotData: {
    data: Array<{
      [key: string]: any;
      label: string;
      prediction: string;
    }>
    loading: boolean
    error: string | null
  } | null
  point: any
  setPoint: Dispatch<SetStateAction<any>>
}

const InstanceClassification = (props: IInstanceClassification) => {
  const theme = useTheme()
  const { plotData, setPoint, point } = props
  console.log("InstanceClassification plotData", plotData)
  const [options, setOptions] = useState<string[]>([])
  const [xAxisOption, setXAxisOption] = useState<string>("")
  const [yAxisOption, setYAxisOption] = useState<string>("")
  const [checkbox, setCheckbox] = useState<boolean>(false)

  const getVegaData = (data: any) => {
    let newData: any[] = _.cloneDeep(data)
    if (checkbox) {
      newData = newData.filter(d => d.actual !== d.predicted)
    }
    return newData
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

  const handleCheckboxChange = (event: React.ChangeEvent) => {
    setCheckbox((event.target as HTMLInputElement).checked)
    setPoint(null)
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
    <InfoMessage
      message="Loading data..."
      type="info"
      icon={<AssessmentIcon sx={{ fontSize: 40, color: "info.main" }} />}
      fullHeight
    />
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
            select: "point",
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
          tooltip: true,
          size: 100,
          color: theme.palette.primary.main,
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
          color: {
            condition: {
              param: "pts",
              field: "actual",
              type: "nominal",
              scale: { scheme: "category10" },
              legend: null,
            },
            value: "grey",
          },
        },
      }}
        title={"Instance Classification Chart"}
        actions={false}
        controlPanel={ <ControlPanel
          xAxisOption={xAxisOption}
          yAxisOption={yAxisOption}
          setXAxisOption={setXAxisOption}
          setYAxisOption={setYAxisOption}
          handleCheckboxChange={handleCheckboxChange}
          checkbox={checkbox}
          options={options}
          plotData={plotData}
        />}
        onNewView={handleNewView}
        infoMessage={info}
        showInfoMessage={shouldShowInfoMessage}
        maxHeight={500}
        
        aspectRatio={2}
      />
        
    
    
  )
}

export default InstanceClassification
