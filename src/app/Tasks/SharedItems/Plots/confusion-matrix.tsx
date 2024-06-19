import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import Paper from "@mui/material/Paper"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import { VegaLite } from "react-vega"
import InfoIcon from "@mui/icons-material/Info"
import grey from "@mui/material/colors/grey"
import { useEffect, useState } from "react"

interface ILineplot {
  metrics: any
  variantId: number
}

const ConfusionMatrix = (props: ILineplot) => {
  const { metrics, variantId } = props
  const [plotData, setPlotData] = useState<any>(null)

  useEffect(() => {
    if (metrics) {
      const filteredData = metrics.filter(
        (plot: any) => plot.id === variantId,
      )[0]
      setPlotData([
        { actual: 1, predicted: 1, count: filteredData.true_positives },
        { actual: 1, predicted: 0, count: filteredData.true_negatives },
        { actual: 0, predicted: 1, count: filteredData.false_positives },
        { actual: 0, predicted: 0, count: filteredData.false_negatives },
      ])
    }
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
        height: "70%",
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
          {"Confusion Matrix"}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Tooltip title={"A confusion matrix plot is a visual representation used to evaluate the performance of a classification algorithm."}>
          <IconButton>
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{ width: "99%", px: 1, py: 1, display: "flex", alignItems: "center", height: "100%" }}>
        <VegaLite
          actions={false}
          style={{ width: "90%" }}
          spec={{
            width: "container",
            height: 300,
            autosize: { type: "fit", contains: "padding", resize: true },
            data: {
              values: plotData,
            },
            layer: [
              {
                mark: "rect",
                encoding: {
                  x: {
                    field: "predicted",
                    type: "nominal",
                    title: "Predicted",
                  },
                  y: { field: "actual", type: "nominal", title: "Actual" },
                  color: {
                    field: "count",
                    type: "quantitative",
                    scale: { scheme: "blues" },
                    legend: null,
                  },
                },
              },
              {
                mark: { type: "text", fontSize: 45 },
                encoding: {
                  text: { field: "count", type: "quantitative", format: "d" },
                  x: { field: "predicted", type: "nominal" },
                  y: { field: "actual", type: "nominal" },
                  color: {
                    condition: {
                      test: "datum.count > 500",
                      value: "white",
                    },
                    value: "black",
                  },
                },
              },
            ],
          }}
        />
      </Box>
    </Paper>
  )
}

export default ConfusionMatrix
