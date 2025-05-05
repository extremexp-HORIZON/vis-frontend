import { useEffect } from "react"
import { RootState, useAppDispatch, useAppSelector } from "../../../../store/store"
import { fetchModelAnalysisExplainabilityPlot, setSelectedFeature } from "../../../../shared/models/tasks/model-analysis.model"
import { explainabilityQueryDefault } from "../../../../shared/models/tasks/explainability.model"
import { IPlotModel } from "../../../../shared/models/plotmodel.model"
import theme from "../../../../mui-theme"
import ResponsiveCardVegaLite from "../../../../shared/components/responsive-card-vegalite"
import { Box, CircularProgress, FormControl, InputLabel, MenuItem, Select } from "@mui/material"
import InfoMessage from "../../../../shared/components/InfoMessage"
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded"

interface AlePlotProps {
    model: string[]
    data: string
    train_index: any[]
    test_index: any[]
    target_column: string
}

const AlePlot = (props: AlePlotProps) => {
    const {model, data, train_index, test_index, target_column} = props
    const { tab, isTabInitialized } = useAppSelector((state: RootState) => state.workflowPage)
    const dispatch = useAppDispatch()
    const featureList = tab?.workflowTasks.modelAnalysis?.ale.data?.featureList || null
    const plotModel = tab?.workflowTasks.modelAnalysis?.ale

    useEffect(() => {
        if(tab) {
            dispatch(
                fetchModelAnalysisExplainabilityPlot({
                  query: {
                    ...explainabilityQueryDefault,
                    explanation_type: "featureExplanation",
                    explanation_method: "ale",
                    model: model,
                    data: data,
                    train_index: train_index,
                    test_index: test_index,
                    target_column: target_column,
                    },
                    metadata: {
                      workflowId: tab.workflowId,
                      queryCase: "ale",
                    },
                }),
            )
        }

    },[isTabInitialized])

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

    const spec={
        width: "container",
        autosize: { type: "fit", contains: "padding", resize: true },
        data: {
          values: getVegaliteData(tab?.workflowTasks.modelAnalysis?.ale?.data || null),
        },
        mark: {
          type: "line",
          tooltip: true,
          point: { size: 100, color: theme.palette.primary.main },
        },
        encoding: {
          x: {
            field: tab?.workflowTasks.modelAnalysis?.ale?.data?.xAxis.axisName || "xAxis default",
            type:
            tab?.workflowTasks.modelAnalysis?.ale?.data?.xAxis.axisType === "numerical"
                ? "quantitative"
                : "ordinal",
            // aggregate: "mean"
          },
          y: {
            field: tab?.workflowTasks.modelAnalysis?.ale?.data?.yAxis.axisName || "yAxis default",
            type:
            tab?.workflowTasks.modelAnalysis?.ale?.data?.xAxis.axisType === "numerical"
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
                model: model,
                data: data,
                train_index: train_index,
                test_index: test_index,
                target_column: target_column,
          },
              metadata: {
                workflowId: tab?.workflowId || "",
                queryCase: plmodel?.explanationMethod,
              },
            }),
          )
          dispatch(setSelectedFeature({plotType: "ale", feature: e.target.value}))
    }

    const controlPanel = featureList && featureList?.length > 0 && (
        <FormControl fullWidth>
        <InputLabel id="feature-select-label" >
            Feature
        </InputLabel>
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
          message="Error fetching ale plot."
          type="info" 
          icon={<ReportProblemRoundedIcon sx={{ fontSize: 40, color: "info.main" }} />}
          fullHeight
      />
      )
    

    const shouldShowLoading = !!plotModel?.loading
    const shouldShowError = !!plotModel?.error
    

    return (
        <ResponsiveCardVegaLite
          spec={spec}
          actions={false}
          title={plotModel?.data?.plotName || "ale plot"}
          aspectRatio={2}
          maxHeight={400}
          controlPanel={controlPanel}
          showInfoMessage={ shouldShowLoading || shouldShowError}
          infoMessage={shouldShowLoading ? loading : shouldShowError ? error : <></>}
          isStatic={false}
        />
    )
}

export default AlePlot