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
} from '@mui/material';
import InfoMessage from '../../../../shared/components/InfoMessage';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import { useParams } from 'react-router-dom';
import Loader from '../../../../shared/components/loader';
import { clear2DPDPPlot, fetchModelAnalysisExplainabilityPlot, setSelectedFeatures2D } from '../../../../store/slices/explainabilitySlice';

interface IContourplot {
  explanation_type: string
}

const Contourplot = (props: IContourplot) => {
  const { explanation_type } = props;
  const { tab, isTabInitialized } = useAppSelector(
    (state: RootState) => state.workflowPage,
  );
  const dispatch = useAppDispatch();
  const featureOrHyperparameterList = explanation_type === 'hyperparameterExplanation'
    ? tab?.workflowTasks.modelAnalysis?.['2dpdp'].data?.hyperparameterList || null
    : tab?.workflowTasks.modelAnalysis?.['2dpdp'].data?.featureList || null;
  const plotModel = tab?.workflowTasks.modelAnalysis?.['2dpdp'];
  const { experimentId } = useParams();

  const feature1 = plotModel?.selectedFeature1 || '';
  const feature2 = plotModel?.selectedFeature2 || '';

  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {

    dispatch(clear2DPDPPlot());

    if (isTabInitialized && tab && experimentId) {
      dispatch(
        fetchModelAnalysisExplainabilityPlot({
          query: {
            ...explainabilityQueryDefault,
            explanation_type: explanation_type,
            explanation_method: '2dpdp',
          },
          metadata: {
            workflowId: tab.workflowId,
            experimentId,
            queryCase: '2dpdp',
          },
        }),
      );
    }

    setHasInitialized(true);

  }, [isTabInitialized]);

  const handleFeatureChange = (index: number) => (e: { target: { value: string } }) => {
    const newFeature = e.target.value;

    const updatedFeature1 = index === 1 ? newFeature : feature1;
    const updatedFeature2 = index === 2 ? newFeature : feature2;

    dispatch(
      setSelectedFeatures2D({
        feature1: updatedFeature1,
        feature2: updatedFeature2,
      })
    );

    dispatch(
      fetchModelAnalysisExplainabilityPlot({
        query: {
          ...explainabilityQueryDefault,
          explanation_type: 'featureExplanation',
          explanation_method: '2dpdp',
          feature1: updatedFeature1,
          feature2: updatedFeature2,
        },
        metadata: {
          workflowId: tab?.workflowId || '',
          experimentId: experimentId || '',
          queryCase: '2dpdp',
        },
      }),
    );
  };

  // helper: bin edges for a sorted array of numeric centers
  const computeBinEdges = (vals: number[]) => {
    if (vals.length === 0) return [];
    if (vals.length === 1) {
      // single value: give it a 1-width bin around it
      const v = vals[0];
      return [v - 0.5, v + 0.5];
    }
    const edges: number[] = new Array(vals.length + 1);
    // interior edges = midpoints
    for (let i = 0; i < vals.length - 1; i++) {
      edges[i + 1] = (vals[i] + vals[i + 1]) / 2;
    }
    // extrapolate first/last edges
    const firstGap = vals[1] - vals[0];
    const lastGap = vals[vals.length - 1] - vals[vals.length - 2];
    edges[0] = vals[0] - firstGap / 2;
    edges[vals.length] = vals[vals.length - 1] + lastGap / 2;
    return edges;
  };

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

  // numeric versions (if applicable)
  const xValsNum = xIsNumeric ? xValsRaw.map(Number) : [];
  const yValsNum = yIsNumeric ? yValsRaw.map(Number) : [];
  const xEdges = xIsNumeric ? computeBinEdges(xValsNum) : [];
  const yEdges = yIsNumeric ? computeBinEdges(yValsNum) : [];

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
    },
    encoding: {
      ...(xIsNumeric
        ? {
            x: { field: 'x0', type: 'quantitative', axis: { title: xField } },
            x2: { field: 'x1' },
          }
        : {
            x: {
              field: xField,
              type: 'ordinal',
              sort: { field: xField, order: 'ascending' },
              axis: { title: xField }
            },
          }),
      ...(yIsNumeric
        ? {
            y: { field: 'y0', type: 'quantitative', axis: { title: yField } },
            y2: { field: 'y1' },
          }
        : {
            y: {
              field: yField,
              type: 'ordinal',
              sort: { field: yField, order: 'ascending' },
              axis: { title: yField }
            },
          }),
      color: {
        field: zField,
        type: 'quantitative',
      },
      tooltip: [
        { field: xField, title: xField },
        { field: yField, title: yField },
        { field: zField, title: zField },
      ],
    },
    config: {
      axis: { grid: true },
    },
  };

  const controlPanel = featureOrHyperparameterList && featureOrHyperparameterList.length > 0 && (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
      {[1, 2].map(i => {
        const selected = i === 1 ? feature1 : feature2;
        const other = i === 1 ? feature2 : feature1;

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
                  style: {
                    maxHeight: 250,
                    maxWidth: 300,
                  },
                },
              }}
            >
              {featureOrHyperparameterList && featureOrHyperparameterList
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
    </Box>
  );

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
    />
  );
};

export default Contourplot;
