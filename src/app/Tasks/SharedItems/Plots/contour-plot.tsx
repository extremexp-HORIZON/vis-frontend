import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import Paper from "@mui/material/Paper"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import { Vega } from "react-vega"
import InfoIcon from "@mui/icons-material/Info"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import { SetStateAction, useEffect, useState } from "react"
import FormControl from "@mui/material/FormControl"
import grey from "@mui/material/colors/grey"
import { IPlotModel } from "../../../../shared/models/plotmodel.model"
import { useAppDispatch } from "../../../../store/store"
import { AsyncThunk } from "@reduxjs/toolkit"
import CircularProgress from "@mui/material/CircularProgress"
import { explainabilityQueryDefault, fetchExplainabilityPlotPayloadDefault } from "../../../../shared/models/tasks/explainability.model"

interface IContourplot {
  plotModel: {
    data: IPlotModel | null
    loading: boolean
    error: string | null
  } | null
  options: string[] | null
  fetchFunction: AsyncThunk<any, any, any>
  workflowId: string | number
  plotRequestMetadata: any
}

const ContourPlot = (props: IContourplot) => {
  const { plotModel, options, fetchFunction, workflowId, plotRequestMetadata } =
    props
  const dispatch = useAppDispatch()
  const [selectedFeature1, setSelectedFeature1] = useState<string>("")
  const [selectedFeature2, setSelectedFeature2] = useState<string>("")

  const getVegaliteData = (plmodel: IPlotModel | null) => {
    if (!plmodel) return []
    const data: { [x: string]: string | number }[] = []
    plmodel.xAxis.axisValues.map((xval, idx) => {
      plmodel.yAxis.axisValues.map((yVal, yIdx) => {
        data.push({
          [plmodel.xAxis.axisName]: xval,
          [plmodel.yAxis.axisName]: yVal,
          [plmodel.zAxis.axisName === null ? "value" : plmodel.zAxis.axisName]:
            parseFloat(JSON.parse(plmodel.zAxis.axisValues[yIdx])[idx]),
        })
      })
    })
    console.log(data)
    return data
  }

  useEffect(() => {
    if (plotModel?.data?.features && plotModel?.data?.features.feature1) {
      setSelectedFeature1(plotModel?.data?.features.feature1)
      setSelectedFeature2(plotModel?.data?.features.feature2)
    }
  }, [plotModel?.data?.features])

  const getAxisType = (axisType: string) => {
    if (axisType === "categorical") {
      return "nominal"
    } else {
      return "quantitative"
    }
  }

  const handleFeatureSelection =
    (plmodel: IPlotModel | null, featureNumber: number) =>
    (e: { target: { value: string } }) => {
      dispatch(
        fetchFunction({
          query: {
            ...explainabilityQueryDefault,
            explanationType: plmodel?.explainabilityType || "",
            explanationMethod: plmodel?.explanationMethod || "",
            feature1:
              featureNumber === 1 ? e.target.value : selectedFeature1 || "",
            feature2:
              featureNumber === 2 ? e.target.value : selectedFeature2 || "",
            ...plotRequestMetadata,
          },
          metadata: {
            workflowId: workflowId,
            queryCase: plmodel?.explanationMethod,
          },
        }),
      )
      featureNumber === 1
        ? setSelectedFeature1(e.target.value)
        : setSelectedFeature2(e.target.value)
    }

  return (
    <Paper
      className="Category-Item"
      elevation={2}
      sx={{
        borderRadius: 4,
        width: "inherit",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        rowGap: 0,
        minWidth: "300px",
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
            title={plotModel?.data?.plotDescr || "Description not available"}
          >
            <InfoIcon sx={{ padding: 1, zIndex: 100, color: grey[600] }} />
          </Tooltip>
          {plotModel && (plotModel.loading || !plotModel.data) && (
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
      <Box sx={{ display: "flex", flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center", px: 1.5 }}>
          <Typography fontSize={"0.8rem"}>Hyperparameter 1:</Typography>
          <FormControl
            sx={{ m: 1, minWidth: 120, maxHeight: 120 }}
            size="small"
          >
            <Select
              value={selectedFeature1}
              sx={{ fontSize: "0.8rem" }}
              disabled={plotModel?.loading}
              onChange={handleFeatureSelection(plotModel?.data || null, 1)}
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
                options
                  .filter(option => option !== selectedFeature2)
                  .map(feature => (
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
        <Box sx={{ display: "flex", alignItems: "center", px: 1.5 }}>
          <Typography fontSize={"0.8rem"}>Hyperparameter 2:</Typography>
          <FormControl
            sx={{ m: 1, minWidth: 120, maxHeight: 120 }}
            size="small"
          >
            <Select
              value={selectedFeature2}
              sx={{ fontSize: "0.8rem" }}
              disabled={plotModel?.loading}
              onChange={handleFeatureSelection(plotModel?.data || null, 2)}
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
                options
                  .filter(option => option !== selectedFeature1)
                  .map(feature => (
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
      </Box>
      <Box sx={{ width: "99%", px: 2, flex: 1 }}>
        <Vega
          actions={false}
          style={{ width: "95%", height: 400 }}
          spec={{
            width: "container",
            height: "container",
            autosize: { type: "fit", contains: "padding", resize: true },
            data: {
              values: getVegaliteData(plotModel?.data || null),
            },
            mark: { type: "rect", tooltip: { content: "data" } },
            encoding: {
              x: {
                field: plotModel?.data?.xAxis.axisName || "xAxis default",
                type: "nominal",
              },
              y: {
                field: plotModel?.data?.yAxis.axisName || "yAxis default",
                type: "nominal",
              },
              color: {
                field:
                  plotModel?.data?.zAxis.axisName === null
                    ? "value"
                    : plotModel?.data?.zAxis.axisName,
                type: "quantitative",
              },
              // tooltip: true,
            },
            config: {
              axis: { grid: true, tickBand: "extent" },
            },
          }}
        />
      </Box>
    </Paper>
  )
}

export default ContourPlot
