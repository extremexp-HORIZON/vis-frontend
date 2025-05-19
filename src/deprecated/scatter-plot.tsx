import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import Paper from "@mui/material/Paper"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import { VegaLite, Vega } from "react-vega"
import InfoIcon from "@mui/icons-material/Info"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import { SetStateAction, useEffect, useState } from "react"
import FormControl from "@mui/material/FormControl"
import { useTheme } from "@mui/material"
import type { IPlotModel } from "../shared/models/plotmodel.model"
import { useAppDispatch } from "../store/store"
import { fetchExplanation } from "../store/slices/explainabilitySlice"

interface ILineplot {
  width: string
  plotModel: IPlotModel | null
  options: string[]
}

const getVegaliteData = (plmodel: IPlotModel | null) => {
  if (!plmodel) return []
  const data: { [x: string]: string }[] = []
  plmodel.xAxis.axisValues.forEach((val, idx) => {
    data.push({
      [plmodel.xAxis.axisName]: val,
      [plmodel.yAxis.axisName]: plmodel.yAxis.axisValues[idx],
    })
  })
  return data
}

const LinePlot = (props: ILineplot) => {
  const { width, plotModel, options } = props
  const dispatch = useAppDispatch()
  const theme = useTheme();
  const [selectedFeature, setSelectedFeature] = useState<string>("")
  const [aggregateData, setAggregateData] = useState<boolean>(false)

  useEffect(() => {
    if (options.length > 0) {
      setSelectedFeature(options[0])
    }
  }, [])

  const handleFeatureSelection =
    (plmodel: IPlotModel | null) =>
    (e: { target: { value: string } }) => {
      dispatch(
        fetchExplanation({
          explanationType: plmodel?.explainabilityType || "",
          explanationMethod: plmodel?.explanationMethod || "",
          model: plmodel?.explainabilityModel || "",
          feature1: e.target.value || "",
          feature2: plmodel?.features.feature2 || "",
        }),
      )
      setSelectedFeature(e.target.value)
    }

  return (
    <Paper
      className="Category-Item"
      elevation={2}
      sx={{
        borderRadius: 4,
        width: width,
        display: "flex",
        flexDirection: "column",
        rowGap: 0,
        minWidth: "300px",
      }}
    >
      <Box sx={{ px: 1.5, pt: 1.5, display: "flex", alignItems: "center" }}>
        <Typography fontSize={"1rem"} fontWeight={600}>
          {plotModel?.plotName || "Plot name"}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Tooltip title={plotModel?.plotDescr || "Description not available"}>
          <IconButton>
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", px: 1.5 }}>
        <Typography fontSize={"0.8rem"}>
          {plotModel?.explainabilityType === "featureExplanation"
            ? "Select Feature:"
            : "Select Hyperparameter"}
        </Typography>
        <FormControl sx={{ m: 1, minWidth: 120, maxHeight: 120 }} size="small">
          <Select
            value={selectedFeature}
            sx={{ fontSize: "0.8rem" }}
            onChange={handleFeatureSelection(plotModel)}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 250,
                  maxWidth: 300,
                },
              },
            }}
          >
            {options.map(feature => (
              <MenuItem
                key={`${plotModel?.plotName}-${feature}`}
                value={feature}
              >
                {feature}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ width: "99%", px: 1 }}>
        <VegaLite
          actions={false}
          style={{ width: "90%" }}
          spec={{
            width: "container",
            autosize: { type: "fit", contains: "padding", resize: true },
            data: {
              values: getVegaliteData(plotModel),
            },
            mark: { type: "line", tooltip: true, point: { size: 100, color: theme.palette.primary.main } },
            encoding: {
              x: {
                field: plotModel?.xAxis.axisName || "xAxis default",
                type: plotModel?.xAxis.axisType === "numerical" ? "quantitative" : "ordinal",
                // aggregate: "mean"
              },
              y: {
                field: plotModel?.yAxis.axisName || "yAxis default",
                type: plotModel?.xAxis.axisType === "numerical" ? "quantitative" : "ordinal",
                
              },
            },
          }}
        />
      </Box>
    </Paper>
  )
}

export default LinePlot
