import { useEffect } from 'react';
import type { RootState } from '../../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import { explainabilityQueryDefault } from '../../../../shared/models/tasks/explainability.model';
import type { IPlotModel } from '../../../../shared/models/plotmodel.model';
import theme from '../../../../mui-theme';
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
import { fetchModelAnalysisExplainabilityPlot, setSelectedFeature, setSelectedFeatures2D } from '../../../../store/slices/explainabilitySlice';

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
  console.log(tab?.workflowTasks.modelAnalysis?.['2dpdp'].data?.hyperparameterList)
  const plotModel = tab?.workflowTasks.modelAnalysis?.['2dpdp'];
  const { experimentId } = useParams();

  const feature1 = plotModel?.selectedFeature1 || '';
  const feature2 = plotModel?.selectedFeature2 || '';


  useEffect(() => {
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

const getVegaliteData = (plmodel: IPlotModel | null) => {
  if (!plmodel) return [];

  const xVals = plmodel.xAxis.axisValues;
  const yVals = plmodel.yAxis.axisValues;
  const zMatrix = plmodel.zAxis.axisValues.map(row => JSON.parse(row));

  const xName = plmodel.xAxis.axisName;
  const yName = plmodel.yAxis.axisName;
  const zName = plmodel.zAxis.axisName || 'value';

  const data: { [key: string]: string | number }[] = [];

  for (let xIdx = 0; xIdx < xVals.length; xIdx++) {
    for (let yIdx = 0; yIdx < yVals.length; yIdx++) {
      data.push({
        [xName]: xVals[xIdx],
        [yName]: yVals[yIdx],
        [zName]: zMatrix[xIdx][yIdx],
      });
    }
  }

  return data;
};

  const spec = {
    width: 'container',
    height: 'container',
    autosize: { type: 'fit', contains: 'padding', resize: true },
    data: {
      values: getVegaliteData(plotModel?.data || null),
    },
    mark: {
      type: 'rect',
      tooltip: { content: 'data' },
    },
    encoding: {
      x: {
        field: plotModel?.data?.xAxis.axisName || 'x',
        type: 'ordinal',
      },
      y: {
        field: plotModel?.data?.yAxis.axisName || 'y',
        type: 'ordinal',
      },
      color: {
        field: plotModel?.data?.zAxis.axisName || 'value',
        type: 'quantitative',
      },
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

  const shouldShowLoading = !!plotModel?.loading;
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
