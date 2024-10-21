import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import Paper from "@mui/material/Paper"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import { VegaLite } from "react-vega"
import InfoIcon from "@mui/icons-material/Info"
import grey from "@mui/material/colors/grey"
import { useEffect, useState } from "react"
import { IDataExplorationResponse } from "../../../../shared/models/dataexploration.model"
import CircularProgress from "@mui/material/CircularProgress"
import Skeleton from "@mui/material/Skeleton"

interface ILineplot {
  confusionMatrix: {
    data: IDataExplorationResponse | null
    loading: boolean
    error: string | null
  } | null
}

const ConfusionMatrix = (props: ILineplot) => {
  const { confusionMatrix } = props
  const [plotData, setPlotData] = useState<any>(null)

  useEffect(() => {
    if (confusionMatrix && confusionMatrix.data) {
      const matrix = confusionMatrix.data.data[0]
      const formattedData: any = []

      Object.keys(matrix).forEach(key => {
        if (key.startsWith("tp") || key.startsWith("fp")) {
          const actual = parseInt(key[2])
          const predicted = parseInt(key[3])
          formattedData.push({
            actual,
            predicted,
            count: matrix[key],
          })
        }
      })

      setPlotData(formattedData)
    }
  }, [confusionMatrix])

  return (
    <>
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
            {"Confusion Matrix"}
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Box sx={{ position: "relative" }}>
            <Tooltip
              title={
                "A confusion matrix plot is a visual representation used to evaluate the performance of a classification algorithm."
              }
            >
              <InfoIcon sx={{ padding: 1, zIndex: 100, color: grey[600] }} />
            </Tooltip>
            {(confusionMatrix && (confusionMatrix.loading || !confusionMatrix.data)) && (
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
        <Box
          sx={{
            width: "99%",
            px: 1,
            py: 1,
            display: "flex",
            alignItems: "center",
            height: "100%",
          }}
        >
          {!plotData ? (
            <Skeleton variant="rounded" width={"90%"} height={450} />
          ) : (
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
                      text: {
                        field: "count",
                        type: "quantitative",
                        format: "d",
                      },
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
          )}
        </Box>
      </Paper>
    </>
  )
}

export default ConfusionMatrix
