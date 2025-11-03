import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import { useParams } from 'react-router-dom';
import ResponsiveCardVegaLite from '../../../../shared/components/responsive-card-vegalite';
import { fetchModelAnalysisExplainabilityPlot, fetchModelAnalysisFeatureImportancePlot } from '../../../../store/slices/explainabilitySlice';
import InfoMessage from '../../../../shared/components/InfoMessage';
import Loader from '../../../../shared/components/loader';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import type { RootState } from '../../../../store/store';
import { explainabilityQueryDefault } from '../../../../shared/models/tasks/explainability.model';
import { IPlotModel } from '../../../../shared/models/plotmodel.model';

interface IFeatureImportancePlotProps {
  explanation_type?: string
}

type FeatureImportanceResponse = {
  featureImportances: { featureName: string; importanceScore?: number }[];
};

const FeatureImportancePlot = (props: IFeatureImportancePlotProps) => {
  const { explanation_type }  = props;
  const { experimentId } = useParams();
  const dispatch = useAppDispatch();
  const { tab, isTabInitialized } = useAppSelector((state: RootState) => state.workflowPage);
  const plotModel = tab?.workflowTasks.modelAnalysis?.featureImportance;
  const rawData = tab?.workflowTasks.modelAnalysis?.featureImportance?.data as unknown as FeatureImportanceResponse | IPlotModel | null;

  useEffect(() => {
    if (tab && experimentId && isTabInitialized) {
      if(explanation_type === 'experimentExplanation') {
        dispatch(
          fetchModelAnalysisExplainabilityPlot({
            query: {
              ...explainabilityQueryDefault,
              explanation_type,
              explanation_method:'feature_importance'
            },
            metadata: {
              workflowId: tab?.workflowId || '',
              queryCase: 'featureImportance',
              experimentId: experimentId || '',
            }
          })
        )
      }
      else {
        dispatch(
          fetchModelAnalysisFeatureImportancePlot({
            query: {},
            metadata: {
              workflowId: tab.workflowId,
              experimentId,

            },
          })
        );
      }
    }
  }, [isTabInitialized]);

  const hasFeatureImportances = (x: any):x is FeatureImportanceResponse  =>
    x && Array.isArray(x.featureImportances);

  const hasTableContents = (x: any): x is IPlotModel =>
    x && x.tableContents && x.tableContents.Feature && x.tableContents.Importance;

  const getVegaliteData = () => {
    if (!rawData) return [];

    // Case 1: workflow feature importance shape
    if (hasFeatureImportances(rawData)) {
      const missingImportance: string[] = [];
      const filtered = rawData.featureImportances.filter(d => {
        if (typeof d.importanceScore !== 'number') {
          missingImportance.push(d.featureName);
          return false;
        }
        return true;
      });

      return filtered.map(d => ({
        Feature: d.featureName,
        Importance: d.importanceScore as number,
      }));
    }

    // Case 2: experimentExplanation shape
    if (hasTableContents(rawData)) {
      const features = rawData.tableContents!.Feature!.values || [];
      const importances = rawData.tableContents!.Importance!.values || [];

      const out = [];
      const len = Math.min(features.length, importances.length);
      for (let i = 0; i < len; i++) {
        const f = features[i];
        const vRaw = importances[i];
        const v =
          typeof vRaw === 'number'
            ? vRaw
            : Number.parseFloat(String(vRaw).trim());

        if (Number.isFinite(v) && typeof f === 'string' && f.length > 0) {
          out.push({ Feature: f, Importance: v as number });
        }
      }
      return out.sort((a, b) => b.Importance - a.Importance);
    }
    return [];
  };

  const spec = {
    width: 'container',
    autosize: { type: 'fit', contains: 'padding', resize: true },
    data: { values: getVegaliteData() },
    mark: 'bar',
    encoding: {
      y: {
        field: 'Feature',
        type: 'ordinal',
        sort: { field: 'Importance', order: 'descending' },
      },
      x: {
        field: 'Importance',
        type: 'quantitative',
        title: 'Importance Score',
      },
      color: {
        condition: {
          test: 'datum.Importance >= 0',
          value: '#4caf50',
        },
        value: '#f44336',
      },
      tooltip: [
        { field: 'Feature', type: 'nominal', title: 'Feature' },
        { field: 'Importance', type: 'quantitative', title: 'Importance Score', format: '.4f' }
      ]
    },
  };

  const loading = <Loader />;
  const error = (
    <InfoMessage
      message="Error fetching feature importance plot."
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
      title={plotModel?.data?.plotName || 'Feature Importance'}
      maxHeight={400}
      showInfoMessage={shouldShowLoading || shouldShowError}
      infoMessage={shouldShowLoading ? loading : shouldShowError ? error : <></>}
      isStatic={false}
      details={plotModel?.data?.plotDescr || null}
    />
  );
};

export default FeatureImportancePlot;
