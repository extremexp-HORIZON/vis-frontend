import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import Paper from "@mui/material/Paper"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import InfoIcon from "@mui/icons-material/Info"
import { useEffect, useState } from "react"
import Grid from "@mui/material/Grid"
import grey from "@mui/material/colors/grey"
import { green, red } from "@mui/material/colors"
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

interface ITableComponent {
  plotModel: any[]
  variantId: number
}

const ModelStatistics = (props: ITableComponent) => {
  const { plotModel, variantId } = props
  const [statistics, setStatistics] = useState<any>({})

  useEffect(() => {
    const selectedModelInfo = plotModel.filter((plot: any) => plot.id === variantId)[0]
    const restModelInfo = plotModel.filter((plot: any) => plot.id !== variantId)
    const restModelGroupedInfo = restModelInfo.reduce((acc: any, curval: any) => (
      {...acc, precision: [...acc.precision, curval.precision],
      runtime: [...acc.runtime, curval.runtime],
      recall: [...acc.recall, curval.recall],
      accuracy: [...acc.accuracy, curval.accuracy]
    }
    ), {precision: [], runtime: [], recall: [], accuracy: []})
    const finalStatistics = {avgPrecision: restModelGroupedInfo.precision.reduce((acc: number, curval: number, arr: []) => acc + curval, 0) / restModelGroupedInfo.precision.length,
    avgRuntime: restModelGroupedInfo.runtime.reduce((acc: number, curval: number) => acc + curval, 0) / restModelGroupedInfo.runtime.length,
    avgRecall: restModelGroupedInfo.recall.reduce((acc: number, curval: number) => acc + curval, 0) / restModelGroupedInfo.recall.length,
    avgAccuracy: restModelGroupedInfo.accuracy.reduce((acc: number, curval: number) => acc + curval, 0) / restModelGroupedInfo.accuracy.length}
    const final = {
      row1: [
        {name: "Precision", value: selectedModelInfo.precision, avgDiff: (selectedModelInfo.precision/finalStatistics.avgPrecision * 100) - 100},
        {name: "Runtime", value: selectedModelInfo.runtime, avgDiff: (selectedModelInfo.runtime/finalStatistics.avgRuntime * 100) - 100},
      ],
      row2: [
        {name: "Recall", value: selectedModelInfo.recall, avgDiff: (selectedModelInfo.recall/finalStatistics.avgRecall * 100) - 100},
        {name: "Accuracy", value: selectedModelInfo.accuracy, avgDiff: (selectedModelInfo.accuracy/finalStatistics.avgAccuracy * 100) - 100}
      ]
    }
    setStatistics(final)
  }, [])

  return (
    <>
      <Box
        className="Category-Item"
        // elevation={2}
        sx={{
          borderRadius: 4,
          display: "flex",
          flexDirection: "column",
          rowGap: 0,
          minWidth: "300px",
          overflow: "hidden",
        }}
      >
        {/* <Box sx={{ px: 1.5, pt: 1.5, display: "flex", alignItems: "center", borderBottom: `1px solid ${grey[400]}` }}>
          <Typography fontSize={"1rem"} fontWeight={600}>
            {"Model Statistics"}
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Tooltip title={"Model Statistics"}>
            <IconButton>
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Box> */}
        <Grid sx={{ p: 2 }} container spacing={3}>
          {Object.keys(statistics).map((key: string, index: number) => (
            <Grid xs={12} md={12} lg={6} key={`statistics-row-${index}`} item container spacing={2}>
            {statistics[key].map((metric: any) => (
              <Grid key={`statistics-${metric.name}`} xs={12} md={6} item>
              <Paper sx={{p: 2}}>
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "centers", columnGap: 1 }}>
                  <Typography fontWeight={600}>{metric.name}:</Typography>
                  <Typography>{parseFloat(metric.value).toFixed(3)}{metric.name === "Runtime" && "s"}</Typography>
                </Box>
                <Box sx={{ textAlign: "center", display: "flex", justifyContent: "center" }}>
                  {metric.avgDiff > 0 ? <ArrowDropUpIcon sx={{color: green[400]}}/> : <ArrowDropDownIcon sx={{color: red[400]}}/>}
                <Typography sx={{mr: 0.5}}>{parseInt(metric.avgDiff)}%</Typography>
                <Typography>vs. experiment average</Typography>
                </Box>
              </Paper>
            </Grid>))}
          </Grid>
          ))}
        </Grid>
      </Box>
    </>
  )
}
export default ModelStatistics
