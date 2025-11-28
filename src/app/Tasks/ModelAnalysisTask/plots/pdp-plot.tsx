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
import { useExperimentExplainabilityTooltip } from '../../../ProgressPage/MonitoringPage/useExperimentExplainabilityTooltip';

interface PdpPlotProps {
  explanation_type: string
}

const canArrayBeNumeric = (values: unknown[]): boolean =>
  values.length > 0 &&
  values.every((v) => {
    if (v === null || v === undefined) return false;
    const s = String(v).trim();
    if (!s) return false;
    return !Number.isNaN(Number(s));
  });

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

  const tooltipHandler = useExperimentExplainabilityTooltip(
    plotModel?.data?.xAxis.axisName || 'xAxis default',
    'Average Predicted Value',
    plotModel?.data?.xAxis.axisType,
    pendingFeature
  );

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
    if (!plmodel) {
      return { data: [] as Array<Record<string, string | number | null>>, xIsNumeric: false, yIsNumeric: false };
    }

    const xVals = plmodel.xAxis.axisValues;
    const yVals = plmodel.yAxis.axisValues;

    const xIsNumeric = canArrayBeNumeric(xVals);
    const yIsNumeric = canArrayBeNumeric(yVals);

    const data: Array<Record<string, string | number | null>> = xVals.map((xVal, idx) => {
      const yVal = yVals[idx];

      return {
        [plmodel.xAxis.axisName]: xIsNumeric ? Number(xVal) : xVal,
        [plmodel.yAxis.axisName]: yIsNumeric ? Number(yVal) : yVal,
      };
    });

    return { data, xIsNumeric, yIsNumeric };
  };

  const plmodelData = tab?.workflowTasks.modelAnalysis?.pdp?.data || null;
  const { data: vegaData, xIsNumeric, yIsNumeric } = getVegaliteData(plmodelData);

  const xField = plmodelData?.xAxis.axisName || 'xAxis default';
  const yField = plmodelData?.yAxis.axisName || 'yAxis default';

  const hasCategoricalBars = !xIsNumeric && yIsNumeric;

  const spec = hasCategoricalBars
    ? {
        width: 'container',
        autosize: { type: 'fit', contains: 'padding', resize: true },
        data: {
          values: vegaData,
        },
        layer: [
          // Zero reference line at y = 0
          {
            mark: {
              type: 'rule',
              color: '#777',
              strokeWidth: 1,
            },
            encoding: {
              y: { datum: 0 },
            },
          },
          // Vertical bars
          {
            mark: {
              type: 'bar',
            },
            encoding: {
              x: {
                field: xField,
                type: 'ordinal',
                title: xField,
              },
              y: {
                field: yField,
                title: 'Average Predicted Value',
                type: 'quantitative',
                axis: { format: '.4f' },
                scale: { zero: true },
              },
              color: {
                value: theme.palette.primary.main,
              },
              tooltip: [
                {
                  field: xField,
                  type: 'ordinal',
                  title: 'Feature Value',
                },
                {
                  field: yField,
                  type: 'quantitative',
                  title: 'Average Prediction',
                  format: '.4f',
                },
              ],
            },
          },
        ],
      }
    : {
        width: 'container',
        autosize: { type: 'fit', contains: 'padding', resize: true },
        data: {
          values: vegaData,
        },
        mark: xIsNumeric
          ? {
              type: 'line',
              point: { size: 20, color: theme.palette.primary.main },
            }
          : {
              type: 'bar',
            },
        encoding: {
          x: {
            field: xField,
            type: xIsNumeric ? 'quantitative' : 'ordinal',
          },
          y: {
            field: yField,
            title: 'Average Predicted Value',
            type: yIsNumeric ? 'quantitative' : 'ordinal',
            ...(yIsNumeric
              ? {
                  axis: { format: '.4f' },
                }
              : {}),
          },
          tooltip: [
            {
              field: xField,
              type: xIsNumeric ? 'quantitative' : 'ordinal',
              title: 'Feature Value',
            },
            {
              field: yField,
              type: yIsNumeric ? 'quantitative' : 'ordinal',
              title: 'Average Predicted Value',
              ...(yIsNumeric ? { format: '.4f' } : {}),
            },
          ],
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
      tooltip={explanation_type === 'experimentExplanation' ? tooltipHandler : undefined}
    />
  );
};

export default PdpPlot;
