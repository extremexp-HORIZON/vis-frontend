import { useEffect, useState } from 'react';
import type { RootState } from '../../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import { explainabilityQueryDefault } from '../../../../shared/models/tasks/explainability.model';
import type { IPlotModel } from '../../../../shared/models/plotmodel.model';
import theme from '../../../../mui-theme';
import ResponsiveCardVegaLite from '../../../../shared/components/responsive-card-vegalite';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import InfoMessage from '../../../../shared/components/InfoMessage';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import { useParams } from 'react-router-dom';
import Loader from '../../../../shared/components/loader';
import { fetchModelAnalysisExplainabilityPlot, setAleOrPdpSelections, setSelectedFeature } from '../../../../store/slices/explainabilitySlice';

interface PdpPlotProps {
  explanation_type: string
}

const PdpPlot = (props: PdpPlotProps) => {
  const { explanation_type } = props;
  const { tab, isTabInitialized } = useAppSelector(
    (state: RootState) => state.workflowPage,
  );
  const dispatch = useAppDispatch();
  const featureOrHyperparameterList = explanation_type === 'hyperparameterExplanation' || explanation_type === 'experimentExplanation'
    ? tab?.workflowTasks.modelAnalysis?.pdp.data?.hyperparameterList || null
    : tab?.workflowTasks.modelAnalysis?.pdp.data?.featureList || null;

  const plotModel = tab?.workflowTasks.modelAnalysis?.pdp;
  const { experimentId } = useParams();
  const defaultTargetMetric = tab?.workflowMetrics?.data?.[0]?.name ?? '';

  const selectedFeature = plotModel?.selectedFeature ?? '';
  const selectedTargetMetric = plotModel?.targetMetric ?? defaultTargetMetric;

  const [pendingFeature, setPendingFeature] = useState(selectedFeature);
  const [pendingTargetMetric, setPendingTargetMetric] = useState(selectedTargetMetric);

  useEffect(() => {
    if (tab && experimentId) {
      dispatch(
        fetchModelAnalysisExplainabilityPlot({
          query: {
            ...explainabilityQueryDefault,
            explanation_type: explanation_type,
            explanation_method: 'pdp',
            ...(explanation_type === 'hyperparameterExplanation' || explanation_type === 'experimentExplanation'
              ? { target_metric: defaultTargetMetric }
              : {}),
          },
          metadata: {
            workflowId: tab.workflowId,
            queryCase: 'pdp',
            experimentId: experimentId,
          },
        }),
      );
    }
  }, [isTabInitialized]);

  useEffect(() => {
    setPendingFeature(selectedFeature);
    setPendingTargetMetric(selectedTargetMetric);
  }, [selectedFeature, selectedTargetMetric]);

  const getVegaliteData = (plmodel: IPlotModel | null) => {
    if (!plmodel) return [];
    const data: { [x: string]: string }[] = [];

    plmodel.xAxis.axisValues.forEach((val, idx) => {
      data.push({
        [plmodel.xAxis.axisName]: val,
        [plmodel.yAxis.axisName]: plmodel.yAxis.axisValues[idx],
      });
    });

    return data;
  };
  const spec = {
    width: 'container',
    autosize: { type: 'fit', contains: 'padding', resize: true },
    data: {
      values: getVegaliteData(
        tab?.workflowTasks.modelAnalysis?.pdp?.data || null,
      ),
    },
    mark: {
      type: 'line',
      tooltip: true,
      point: { size: 20, color: theme.palette.primary.main },
    },
    encoding: {
      x: {
        field:
          tab?.workflowTasks.modelAnalysis?.pdp?.data?.xAxis.axisName ||
          'xAxis default',

        type:
          tab?.workflowTasks.modelAnalysis?.pdp?.data?.xAxis.axisType ===
          'numerical'
            ? 'quantitative'
            : 'ordinal',
        // aggregate: "mean"
      },
      y: {
        field:
          tab?.workflowTasks.modelAnalysis?.pdp?.data?.yAxis.axisName ||
          'yAxis default',
        title: 'Average Predicted Value',

        type:
          tab?.workflowTasks.modelAnalysis?.pdp?.data?.xAxis.axisType ===
          'numerical'
            ? 'quantitative'
            : 'ordinal',
        axis: {
          format: '.3f',
        },
      },
    },
  };

  const dispatchPdpFetch = (feature: string, targetMetric?: string) => {
    dispatch(
      fetchModelAnalysisExplainabilityPlot({
        query: {
          ...explainabilityQueryDefault,
          explanation_type,
          explanation_method: 'pdp',
          feature1: feature,
          feature2: plotModel?.data?.features?.feature2 ?? '',
          ...((explanation_type === 'hyperparameterExplanation' || explanation_type === 'experimentExplanation') && targetMetric
            ? { target_metric: targetMetric }
            : {}),
        },
        metadata: {
          workflowId: tab?.workflowId || '',
          queryCase: 'pdp',
          experimentId: experimentId || '',
        },
      }),
    );
  };

  const handleFeatureSelect = (value: string) => {
    setPendingFeature(value);
    if (explanation_type !== 'hyperparameterExplanation' && explanation_type !== 'experimentExplanation') {
      dispatch(setSelectedFeature({ plotType: 'pdp', feature: value }));
      dispatchPdpFetch(value);
    }
  };

  const handleTargetMetricSelect = (value: string) => {
    setPendingTargetMetric(value);
  };

  const handleApply = () => {
    dispatch(
      setAleOrPdpSelections({
        plotType: 'pdp',
        feature: pendingFeature,
        targetMetric: pendingTargetMetric,
      }),
    );
    dispatchPdpFetch(pendingFeature, pendingTargetMetric);
  };

  const controlPanel =
    featureOrHyperparameterList && featureOrHyperparameterList.length > 0 && (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel id="feature-select-label">
              {explanation_type === 'hyperparameterExplanation' ? 'Hyperparameter' : 'Feature'}
            </InputLabel>
            <Select
              labelId="feature-select-label"
              value={pendingFeature}
              label={explanation_type === 'hyperparameterExplanation' ? 'Hyperparameter' : 'Feature'}
              onChange={(e) => handleFeatureSelect(e.target.value)}
              disabled={plotModel?.loading || !plotModel?.data}
              MenuProps={{
                PaperProps: { style: { maxHeight: 250, maxWidth: 300 } },
              }}
            >
              {featureOrHyperparameterList.map((feature) => (
                <MenuItem key={`${plotModel?.data?.plotName}-${feature}`} value={feature}>
                  {feature}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {(explanation_type === 'hyperparameterExplanation' || explanation_type === 'experimentExplanation') && (
            <FormControl fullWidth>
              <InputLabel id="target-metric-label">Target Metric</InputLabel>
              <Select
                labelId="target-metric-label"
                value={pendingTargetMetric}
                label="Target Metric"
                onChange={(e) => handleTargetMetricSelect(e.target.value)}
                disabled={plotModel?.loading || !plotModel?.data}
                MenuProps={{
                  PaperProps: { style: { maxHeight: 250, maxWidth: 300 } },
                }}
              >
                {tab?.workflowMetrics?.data?.map((metric) => (
                  <MenuItem key={metric.name} value={metric.name}>
                    {metric.name}
                  </MenuItem>
                )) ?? null}
              </Select>
            </FormControl>
          )}
        </Box>

        {(explanation_type === 'hyperparameterExplanation' || explanation_type === 'experimentExplanation') && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={handleApply}
              disabled={
                !!plotModel?.loading ||
                !plotModel?.data ||
                !pendingFeature ||
                !pendingTargetMetric ||
                (pendingFeature === (plotModel?.selectedFeature ?? '') &&
                  pendingTargetMetric === (plotModel?.targetMetric ?? defaultTargetMetric))
              }
            >
              Apply Selections
            </Button>
          </Box>
        )}
      </Box>
    );

  const loading = (
    <Loader />
  );

  const error = (
    <InfoMessage
      message="Error fetching pdp plot."
      type="info"
      icon={
        <ReportProblemRoundedIcon sx={{ fontSize: 40, color: 'info.main' }} />
      }
      fullHeight
    />
  );

  const shouldShowLoading = !!plotModel?.loading;
  const shouldShowError = !!plotModel?.error;

  return (
    <ResponsiveCardVegaLite
      spec={spec}
      actions={false}
      title={plotModel?.data?.plotName || 'pdp plot'}
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
  );
};

export default PdpPlot;
