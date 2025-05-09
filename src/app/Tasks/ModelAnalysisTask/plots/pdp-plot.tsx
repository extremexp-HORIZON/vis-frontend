import { useEffect } from "react"
import type { RootState } from "../../../../store/store"
import { useAppDispatch, useAppSelector } from "../../../../store/store"
import {
  fetchModelAnalysisExplainabilityPlot,
  setSelectedFeature,
} from "../../../../shared/models/tasks/model-analysis.model"
import { explainabilityQueryDefault } from "../../../../shared/models/tasks/explainability.model"
import type { IPlotModel } from "../../../../shared/models/plotmodel.model"
import theme from "../../../../mui-theme"
import ResponsiveCardVegaLite from "../../../../shared/components/responsive-card-vegalite"
import {
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material"
import InfoMessage from "../../../../shared/components/InfoMessage"
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded"
import { useParams } from "react-router-dom"

interface PdpPlotProps {
  explanation_type: string
}

const PdpPlot = (props: PdpPlotProps) => {
  const { explanation_type } = props
  const { tab, isTabInitialized } = useAppSelector(
    (state: RootState) => state.workflowPage,
  )
  const dispatch = useAppDispatch()
  const featureList =
    tab?.workflowTasks.modelAnalysis?.pdp.data?.featureList || null
  const plotModel = tab?.workflowTasks.modelAnalysis?.pdp
  const { experimentId } = useParams()

  useEffect(() => {
    if (tab && experimentId) {
      dispatch(
        fetchModelAnalysisExplainabilityPlot({
          query: {
            ...explainabilityQueryDefault,
            explanation_type: explanation_type,
            explanation_method: "pdp",
          },
          metadata: {
            workflowId: tab.workflowId,
            queryCase: "pdp",
            experimentId: experimentId,
          },
        }),
      )
    }
  }, [isTabInitialized])

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
  const spec = {
    width: "container",
    autosize: { type: "fit", contains: "padding", resize: true },
    data: {
      values: getVegaliteData(
        tab?.workflowTasks.modelAnalysis?.pdp?.data || null,
      ),
    },
    mark: {
      type: "line",
      tooltip: true,
      point: { size: 100, color: theme.palette.primary.main },
    },
    encoding: {
      x: {
        field:
          tab?.workflowTasks.modelAnalysis?.pdp?.data?.xAxis.axisName ||
          "xAxis default",
        type:
          tab?.workflowTasks.modelAnalysis?.pdp?.data?.xAxis.axisType ===
          "numerical"
            ? "quantitative"
            : "ordinal",
        // aggregate: "mean"
      },
      y: {
        field:
          tab?.workflowTasks.modelAnalysis?.pdp?.data?.yAxis.axisName ||
          "yAxis default",
        type:
          tab?.workflowTasks.modelAnalysis?.pdp?.data?.xAxis.axisType ===
          "numerical"
            ? "quantitative"
            : "ordinal",
      },
    },
  }
  const handleFeatureSelection =
    (plmodel: IPlotModel | null) => (e: { target: { value: string } }) => {
      dispatch(
        fetchModelAnalysisExplainabilityPlot({
          query: {
            ...explainabilityQueryDefault,
            explanation_type: plmodel?.explainabilityType || "",
            explanation_method: plmodel?.explanationMethod || "",
            feature1: e.target.value || "",
            feature2: plmodel?.features.feature2 || "",
          },
          metadata: {
            workflowId: tab?.workflowId || "",
            queryCase: plmodel?.explanationMethod,
            experimentId: experimentId || "",
          },
        }),
      )
      dispatch(setSelectedFeature({ plotType: "pdp", feature: e.target.value }))
    }

  const controlPanel = featureList && featureList?.length > 0 && (
    <FormControl fullWidth>
      <InputLabel id="feature-select-label">Feature</InputLabel>
      <Select
        labelId="feature-select-label"
        value={plotModel?.selectedFeature || ""}
        label="Feature"
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
        {featureList &&
          featureList.map(feature => (
            <MenuItem
              key={`${plotModel?.data?.plotName}-${feature}`}
              value={feature}
            >
              {feature}
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  )

  const loading = (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100%"
    >
      <CircularProgress />
    </Box>
  )

  const error = (
    <InfoMessage
      message="Error fetching pdp plot."
      type="info"
      icon={
        <ReportProblemRoundedIcon sx={{ fontSize: 40, color: "info.main" }} />
      }
      fullHeight
    />
  )

  const shouldShowLoading = !!plotModel?.loading
  const shouldShowError = !!plotModel?.error

  return (
    <ResponsiveCardVegaLite
      spec={spec}
      actions={false}
      title={plotModel?.data?.plotName || "pdp plot"}
      aspectRatio={2}
      maxHeight={400}
      controlPanel={controlPanel}
      showInfoMessage={shouldShowLoading || shouldShowError}
      infoMessage={
        shouldShowLoading ? loading : shouldShowError ? error : <></>
      }
      isStatic={false}
      details={plotModel?.data?.plotDescr || null}
    />
  )
}

export default PdpPlot
