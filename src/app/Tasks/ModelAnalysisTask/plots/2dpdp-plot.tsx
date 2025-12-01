import { useEffect, useState } from 'react';
import type { RootState } from '../../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import { explainabilityQueryDefault } from '../../../../shared/models/tasks/explainability.model';
import type { IPlotModel } from '../../../../shared/models/plotmodel.model';
import ResponsiveCardVegaLite from '../../../../shared/components/responsive-card-vegalite';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
} from '@mui/material';
import InfoMessage from '../../../../shared/components/InfoMessage';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import { useParams } from 'react-router-dom';
import Loader from '../../../../shared/components/loader';
import { clear2DPDPPlot, fetchModelAnalysisExplainabilityPlot, setSelectedFeatures2D } from '../../../../store/slices/explainabilitySlice';
import { useExperimentExplainabilityTooltip } from '../../../ProgressPage/MonitoringPage/useExperimentExplainabilityTooltip';

interface IContourplot {
  explanation_type: string
}

const Contourplot = (props: IContourplot) => {
  const { explanation_type } = props;
  const { tab, isTabInitialized } = useAppSelector(
    (state: RootState) => state.workflowPage,
  );
  const dispatch = useAppDispatch();
  const featureOrHyperparameterList = explanation_type === 'hyperparameterExplanation' || explanation_type === 'experimentExplanation'
    ? tab?.workflowTasks.modelAnalysis?.['2dpdp'].data?.hyperparameterList || null
    : tab?.workflowTasks.modelAnalysis?.['2dpdp'].data?.featureList || null;
  const plotModel = tab?.workflowTasks.modelAnalysis?.['2dpdp'];
  const { experimentId } = useParams();
  const defaultTargetMetric = tab?.workflowMetrics?.data?.[0]?.name || '';
  const feature1 = plotModel?.selectedFeature1 || '';
  const feature2 = plotModel?.selectedFeature2 || '';
  const targetMetric = plotModel?.targetMetric || defaultTargetMetric;
  const [pendingFeature1, setPendingFeature1] = useState(feature1);
  const [pendingFeature2, setPendingFeature2] = useState(feature2);
  const [pendingTargetMetric, setPendingTargetMetric] = useState(defaultTargetMetric);

  const [hasInitialized, setHasInitialized] = useState(false);

  const tooltipHandler = useExperimentExplainabilityTooltip(
    plotModel?.data?.xAxis.axisName || 'x',
    plotModel?.data?.yAxis.axisName || 'y',
    plotModel?.data?.xAxis.axisType,
    feature2,
    feature1
  );

  useEffect(() => {

    dispatch(clear2DPDPPlot());

    if (isTabInitialized && tab && experimentId) {
      dispatch(
        fetchModelAnalysisExplainabilityPlot({
          query: {
            ...explainabilityQueryDefault,
            explanation_type: explanation_type,
            explanation_method: '2dpdp',
            ...(explanation_type === 'hyperparameterExplanation' || explanation_type === 'experimentExplanation'
              ? { target_metric: defaultTargetMetric }
              : {}),
          },
          metadata: {
            workflowId: tab?.workflowId || '',
            experimentId: experimentId || '',
            queryCase: '2dpdp',
          },
        }),
      );
    }

    setHasInitialized(true);
  }, [isTabInitialized]);

  useEffect(() => {
    setPendingFeature1(feature1);
    setPendingFeature2(feature2);
    setPendingTargetMetric(targetMetric);
  }, [feature1, feature2, targetMetric]);

  const handleFeatureChange = (index: number) => (e: { target: { value: string } }) => {
    const newValue = e.target.value;

    if (index === 1) setPendingFeature1(newValue);
    else setPendingFeature2(newValue);
  };

  const handleApply = () => {
    dispatch(
      setSelectedFeatures2D({
        feature1: pendingFeature1,
        feature2: pendingFeature2,
        targetMetric: pendingTargetMetric,
      })
    );

    dispatch(
      fetchModelAnalysisExplainabilityPlot({
        query: {
          ...explainabilityQueryDefault,
          explanation_type: explanation_type,
          explanation_method: '2dpdp',
          feature1: pendingFeature1,
          feature2: pendingFeature2,
          ...(explanation_type === 'hyperparameterExplanation' || explanation_type === 'experimentExplanation'
            ? { target_metric: pendingTargetMetric }
            : {}),
        },
        metadata: {
          workflowId: tab?.workflowId || '',
          experimentId: experimentId || '',
          queryCase: '2dpdp',
        },
      }),
    );
  };

  const computeBinEdgesWithMinWidth = (vals: number[], minWidth: number) => {
    if (vals.length === 0) return [];
    if (vals.length === 1) return [vals[0] - minWidth / 2, vals[0] + minWidth / 2];

    const v = [...vals].sort((a, b) => a - b);

    // Start from midpoint edges
    const edges: number[] = new Array(v.length + 1);

    for (let i = 0; i < v.length - 1; i++) edges[i + 1] = (v[i] + v[i + 1]) / 2;

    const firstGap = v[1] - v[0];
    const lastGap = v[v.length - 1] - v[v.length - 2];

    edges[0] = v[0] - firstGap / 2;
    edges[v.length] = v[v.length - 1] + lastGap / 2;

    for (let i = 0; i < v.length; i++) {
      const left = edges[i];
      const right = edges[i + 1];
      const width = right - left;

      if (width < minWidth) {
        const deficit = (minWidth - width) / 2;

        edges[i] = left - deficit;
        edges[i + 1] = right + deficit;
      }
    }
    for (let i = 1; i < edges.length; i++) {
      if (edges[i] < edges[i - 1]) edges[i] = edges[i - 1];
    }

    return edges;
  };

  const MIN_BIN_WIDTH = 0.5;

  const isNumericArray = (arr: (string | number)[]): boolean => {
    return arr.length > 0 && arr.every(val => !isNaN(Number(val)));
  };

  const xField = plotModel?.data?.xAxis.axisName || 'x';
  const yField = plotModel?.data?.yAxis.axisName || 'y';
  const zField = plotModel?.data?.zAxis.axisName || 'value';

  const xValsRaw = plotModel?.data?.xAxis.axisValues ?? [];
  const yValsRaw = plotModel?.data?.yAxis.axisValues ?? [];

  const xIsNumeric = isNumericArray(xValsRaw);
  const yIsNumeric = isNumericArray(yValsRaw);

  const xValsNum = xIsNumeric ? xValsRaw.map(Number) : [];
  const yValsNum = yIsNumeric ? yValsRaw.map(Number) : [];
  const xEdges = xIsNumeric ? computeBinEdgesWithMinWidth(xValsNum, MIN_BIN_WIDTH)  : [];
  const yEdges = yIsNumeric ? computeBinEdgesWithMinWidth(yValsNum, MIN_BIN_WIDTH)  : [];

  const xDomain = xIsNumeric && xEdges.length >= 2 ? [xEdges[0], xEdges[xEdges.length - 1]] : undefined;
  const yDomain = yIsNumeric && yEdges.length >= 2 ? [yEdges[0], yEdges[yEdges.length - 1]] : undefined;

  const getVegaliteData = (plmodel: IPlotModel | null) => {
    if (!plmodel) return [];

    const xVals = plmodel.xAxis.axisValues;
    const yVals = plmodel.yAxis.axisValues;
    const zMatrix = plmodel.zAxis.axisValues.map(row => JSON.parse(row));

    const xName = plmodel.xAxis.axisName;
    const yName = plmodel.yAxis.axisName;
    const zName = plmodel.zAxis.axisName || 'value';

    const data: Record<string, string | number>[] = [];

    for (let xIdx = 0; xIdx < xVals.length; xIdx++) {
      for (let yIdx = 0; yIdx < yVals.length; yIdx++) {
        const zVal =
          explanation_type === 'featureExplanation'
            ? zMatrix[xIdx][yIdx]
            : zMatrix[yIdx][xIdx];

        const row: Record<string, string | number> = {
          [xName]: xVals[xIdx],
          [yName]: yVals[yIdx],
          [zName]: zVal,
        };

        // If numeric, include bin edges for quantitative rects
        if (xIsNumeric) {
          row['x0'] = xEdges[xIdx];
          row['x1'] = xEdges[xIdx + 1];
        }
        if (yIsNumeric) {
          row['y0'] = yEdges[yIdx];
          row['y1'] = yEdges[yIdx + 1];
        }

        data.push(row);
      }
    }

    return data;
  };

  const spec = {
    width: 'container',
    height: 'container',
    autosize: { type: 'fit', contains: 'padding', resize: true },
    data: {
      values: hasInitialized ? getVegaliteData(plotModel?.data || null) : [],
    },
    mark: {
      type: 'rect',
      tooltip: { content: 'data' },
    },
    encoding: {
      ...(xIsNumeric
        ? {
          x: { field: 'x0', type: 'quantitative', axis: { title: xField }, scale: { domain: xDomain, nice: false, zero: false } },
          x2: { field: 'x1' },
        }
        : {
          x: {
            field: xField,
            type: 'ordinal',
            sort: { field: xField, order: 'ascending' },
            axis: { title: xField },
            scale: { paddingInner: 0, paddingOuter: 0 },
          },
        }),
      ...(yIsNumeric
        ? {
          y: { field: 'y0', type: 'quantitative', axis: { title: yField }, scale: { domain: yDomain, nice: false, zero: false } },
          y2: { field: 'y1' },
        }
        : {
          y: {
            field: yField,
            type: 'ordinal',
            sort: { field: yField, order: 'ascending' },
            axis: { title: yField },
            scale: { paddingInner: 0, paddingOuter: 0 },
          },
        }),
      color: {
        field: zField,
        type: 'quantitative',
        legend: { format: '.4f' }
      },
      tooltip: [
        { field: xField, title: xField },
        { field: yField, title: yField },
        { field: zField, title: zField, type: 'quantitative', format: '.4f' },
      ],
    },
    config: {
      axis: { grid: true },
    },
  };

  const loading = <Loader />;
  const error = (
    <InfoMessage
      message="Error fetching 2D PDP plot."
      type="info"
      icon={<ReportProblemRoundedIcon sx={{ fontSize: 40, color: 'info.main' }} />}
      fullHeight
    />
  );

  const shouldShowLoading = !!plotModel?.loading || !hasInitialized;
  const shouldShowError = !!plotModel?.error;

  const controlPanel = featureOrHyperparameterList && featureOrHyperparameterList.length > 0 && (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {[1, 2].map(i => {
          const selected = i === 1 ? pendingFeature1 : pendingFeature2;
          const other = i === 1 ? pendingFeature2 : pendingFeature1;

          return (
            <FormControl fullWidth key={i}>
              <InputLabel id={`feature${i}-label`}>{explanation_type === 'hyperparameterExplanation' ? `Hyperparameter ${i}` : `Feature ${i}`}</InputLabel>
              <Select
                labelId={`feature${i}-label`}
                value={selected}
                label={explanation_type === 'hyperparameterExplanation' ? `Hyperparameter ${i}` : `Feature ${i}`}
                onChange={handleFeatureChange(i)}
                disabled={plotModel?.loading || !plotModel?.data}
                MenuProps={{
                  PaperProps: {
                    style: { maxHeight: 250, maxWidth: 300 },
                  },
                }}
              >
                {featureOrHyperparameterList
                  .filter(f => f !== other)
                  .map(f => (
                    <MenuItem key={f} value={f}>
                      {f}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          );
        })}
        { (explanation_type === 'hyperparameterExplanation' || explanation_type === 'experimentExplanation') && (
          <FormControl fullWidth>
            <InputLabel id={'target-metric-label'}>Target Metric</InputLabel>
            <Select
              labelId='target-metric-label'
              value={pendingTargetMetric}
              label='Target Metric'
              onChange={(e: { target: { value: string } }) => setPendingTargetMetric(e.target.value)}
              disabled={plotModel?.loading || !plotModel?.data}
              MenuProps={{
                PaperProps: {
                  style: { maxHeight: 250, maxWidth: 300 },
                },
              }}
            >
              {tab?.workflowMetrics?.data?.map(metric =>
                <MenuItem key={metric.name} value={metric.name}>
                  {metric.name}
                </MenuItem>
              )}
            </Select>
          </FormControl>
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          onClick={handleApply}
          disabled={
            plotModel?.loading ||
            !plotModel?.data ||
            !pendingFeature1 ||
            !pendingFeature2 ||
            ((explanation_type === 'hyperparameterExplanation' || explanation_type === 'experimentExplanation') && !pendingTargetMetric) ||
            (pendingFeature1 === feature1 && pendingFeature2 === feature2 && pendingTargetMetric === targetMetric)
          }
        >
          Apply Selections
        </Button>
      </Box>
    </Box>
  );

  return (
    <ResponsiveCardVegaLite
      spec={spec}
      actions={false}
      title={plotModel?.data?.plotName || '2D Partial Dependence Plot'}
      aspectRatio={1.5}
      maxHeight={400}
      controlPanel={controlPanel}
      showInfoMessage={shouldShowLoading || shouldShowError}
      infoMessage={shouldShowLoading ? loading : shouldShowError ? error : <></>}
      isStatic={false}
      details={plotModel?.data?.plotDescr || null}
      tooltip={explanation_type === 'experimentExplanation' ? tooltipHandler : undefined}
    />
  );
};

export default Contourplot;
