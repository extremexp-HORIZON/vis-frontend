import { useEffect } from 'react';
import type { RootState } from '../../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import { explainabilityQueryDefault } from '../../../../shared/models/tasks/explainability.model';
import type { IPlotModel } from '../../../../shared/models/plotmodel.model';
import theme from '../../../../mui-theme';
import ResponsiveCardVegaLite from '../../../../shared/components/responsive-card-vegalite';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import InfoMessage from '../../../../shared/components/InfoMessage';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import { useParams } from 'react-router-dom';
import Loader from '../../../../shared/components/loader';
import { fetchModelAnalysisExplainabilityPlot, setSelectedFeature } from '../../../../store/slices/explainabilitySlice';

interface AlePlotProps {
  explanation_type: string
}

const AlePlot = (props: AlePlotProps) => {
  const { explanation_type } = props;
  const { tab, isTabInitialized } = useAppSelector(
    (state: RootState) => state.workflowPage,
  );
  const dispatch = useAppDispatch();
  const featureOrHyperparameterList = explanation_type === 'hyperparameterExplanation'
    ? tab?.workflowTasks.modelAnalysis?.pdp.data?.hyperparameterList || null
    : tab?.workflowTasks.modelAnalysis?.pdp.data?.featureList || null;

  const plotModel = tab?.workflowTasks.modelAnalysis?.ale;
  const { experimentId } = useParams();

  useEffect(() => {
    if (tab && experimentId) {
      dispatch(
        fetchModelAnalysisExplainabilityPlot({
          query: {
            ...explainabilityQueryDefault,
            explanation_type: explanation_type,
            explanation_method: 'ale',
          },
          metadata: {
            workflowId: tab.workflowId,
            queryCase: 'ale',
            experimentId: experimentId,
          },
        }),
      );
    }
  }, [isTabInitialized]);

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
        tab?.workflowTasks.modelAnalysis?.ale?.data || null,
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
          tab?.workflowTasks.modelAnalysis?.ale?.data?.xAxis.axisName ||
          'xAxis default',
        type:
          tab?.workflowTasks.modelAnalysis?.ale?.data?.xAxis.axisType ===
          'numerical'
            ? 'quantitative'
            : 'ordinal',
        // aggregate: "mean"
      },
      y: {
        field:
          tab?.workflowTasks.modelAnalysis?.ale?.data?.yAxis.axisName ||
          'yAxis default',
        title: 'Average Predicted Effect',

        type:
          tab?.workflowTasks.modelAnalysis?.ale?.data?.xAxis.axisType ===
          'numerical'
            ? 'quantitative'
            : 'ordinal',
      },
    },
  };

  const handleFeatureSelection =
    (plmodel: IPlotModel | null) => (e: { target: { value: string } }) => {
      dispatch(
        fetchModelAnalysisExplainabilityPlot({
          query: {
            ...explainabilityQueryDefault,
            explanation_type: plmodel?.explainabilityType || '',
            explanation_method: plmodel?.explanationMethod || '',
            feature1: e.target.value || '',
            feature2: plmodel?.features.feature2 || '',
          },
          metadata: {
            workflowId: tab?.workflowId || '',
            queryCase: plmodel?.explanationMethod,
            experimentId: experimentId || '',
          },
        }),
      );
      dispatch(setSelectedFeature({ plotType: 'ale', feature: e.target.value }));
    };

  const controlPanel = featureOrHyperparameterList && featureOrHyperparameterList.length > 0 && (
    <FormControl fullWidth>
      <InputLabel id="feature-select-label">
        {explanation_type === 'hyperparameterExplanation' ? 'Hyperparameter' : 'Feature'}
      </InputLabel>
      <Select
        labelId="feature-select-label"
        value={plotModel?.selectedFeature || ''}
        label={explanation_type === 'hyperparameterExplanation' ? 'Hyperparameter' : 'Feature'}
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
        {featureOrHyperparameterList && featureOrHyperparameterList.map(feature => (
          <MenuItem
            key={`${plotModel?.data?.plotName}-${feature}`}
            value={feature}
          >
            {feature}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  const loading = (
    <Loader />
  );

  const error = (
    <InfoMessage
      message="Error fetching ale plot."
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
      title={plotModel?.data?.plotName || 'ale plot'}
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

export default AlePlot;
