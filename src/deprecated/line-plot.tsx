import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import { VegaLite } from "react-vega"
import InfoIcon from "@mui/icons-material/Info"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import { useEffect, useState } from "react"
import FormControl from "@mui/material/FormControl"
import { CircularProgress, useTheme } from "@mui/material"
import grey from "@mui/material/colors/grey"
import type { IPlotModel } from "../../../../shared/models/plotmodel.model"
import { useAppDispatch } from "../../../../store/store"
import type { AsyncThunk } from "@reduxjs/toolkit"
import red from "@mui/material/colors/red"
import {
  explainabilityQueryDefault,
  fetchExplainabilityPlotPayloadDefault,
} from "../../../../shared/models/tasks/explainability.model"

interface ILineplot {
  plotModel: {
    data: IPlotModel | null
    loading: boolean
    error: string | null
  } | null
  options: string[] | null
  fetchFunction: AsyncThunk<any, any, any>
  workflowId: string | number
  plotRequestMetadata: {
    model: string[]
    data: string
    train_index: string[]
    test_index: string[]
    target_column: string
  } | any
}

const LinePlot = (props: ILineplot) => {
  const { plotModel, options, fetchFunction, workflowId, plotRequestMetadata } = props
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const [selectedFeature, setSelectedFeature] = useState<string>("")

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

  useEffect(() => {
    if (plotModel?.data?.features && plotModel?.data?.features.feature1) {
      setSelectedFeature(plotModel?.data?.features.feature1)
    }
  }, [plotModel?.data?.features])

  const handleFeatureSelection =
    (plmodel: IPlotModel | null) => (e: { target: { value: string } }) => {
      console.log(plmodel)
      dispatch(
        fetchFunction({
          query: {
            ...explainabilityQueryDefault,
            explanation_type: plmodel?.explainabilityType || "",
            explanation_method: plmodel?.explanationMethod || "",
            feature1: e.target.value || "",
            feature2: plmodel?.features.feature2 || "",
            ...plotRequestMetadata
          },
          metadata: {
            workflowId: workflowId,
            queryCase: plmodel?.explanationMethod,
          },
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
          {plotModel?.data?.plotName || "Plot name"}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Box sx={{ position: "relative" }}>
          <Tooltip
            title={
              plotModel?.data?.plotDescr ||
              (plotModel && !plotModel.error
                ? "Description not available"
                : plotModel?.error)
            }
          >
            <InfoIcon
              sx={{
                padding: 1,
                zIndex: 100,
                color: plotModel && !plotModel.error ? grey[600] : red[800],
              }}
            />
          </Tooltip>
          {plotModel &&
            (plotModel.loading || !plotModel.data) &&
            !plotModel.error && (
              <CircularProgress
                size={28}
                sx={{
                  // color: green[500],
                  position: "absolute",
                  top: 6,
                  left: 6,
                  zIndex: 0,
                }}
              />
            )}
        </Box>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", px: 1.5 }}>
        <Typography fontSize={"0.8rem"}>
          {plotModel?.data?.explainabilityType === "featureExplanation"
            ? "Select Feature:"
            : "Select Hyperparameter"}
        </Typography>
        <FormControl sx={{ m: 1, minWidth: 120, maxHeight: 120 }} size="small">
          <Select
            value={selectedFeature}
            sx={{ fontSize: "0.8rem" }}
            onChange={handleFeatureSelection(plotModel?.data || null)}
            disabled={plotModel?.loading || !plotModel?.data}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 250,
                  maxWidth: 300,
                },
              },
            }}
          >
            {options &&
              options.map(feature => (
                <MenuItem
                  key={`${plotModel?.data?.plotName}-${feature}`}
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
            height: 300,
            autosize: { type: "fit", contains: "padding", resize: true },
            data: {
              values: getVegaliteData(plotModel?.data || null),
            },
            mark: {
              type: "line",
              tooltip: true,
              point: { size: 100, color: theme.palette.primary.main },
            },
            encoding: {
              x: {
                field: plotModel?.data?.xAxis.axisName || "xAxis default",
                type:
                  plotModel?.data?.xAxis.axisType === "numerical"
                    ? "quantitative"
                    : "ordinal",
                // aggregate: "mean"
              },
              y: {
                field: plotModel?.data?.yAxis.axisName || "yAxis default",
                type:
                  plotModel?.data?.xAxis.axisType === "numerical"
                    ? "quantitative"
                    : "ordinal",
              },
            },
          }}
        />
      </Box>
    </Paper>
  )
}

export default LinePlot
