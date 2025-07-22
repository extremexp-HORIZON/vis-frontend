import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import { useParams } from 'react-router-dom';
import ResponsiveCardVegaLite from '../../../../shared/components/responsive-card-vegalite';
import { fetchModelAnalysisFeatureImportancePlot } from '../../../../store/slices/explainabilitySlice';
import InfoMessage from '../../../../shared/components/InfoMessage';
import Loader from '../../../../shared/components/loader';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import type { RootState } from '../../../../store/store';

const FeatureImportancePlot = () => {
  const { experimentId } = useParams();
  const dispatch = useAppDispatch();
  const { tab, isTabInitialized } = useAppSelector((state: RootState) => state.workflowPage);
  const plotModel = tab?.workflowTasks.modelAnalysis?.featureImportance;
  const rawData = tab?.workflowTasks.modelAnalysis?.featureImportance?.data as unknown as {
    featureImportances: { featureName: string; importanceScore: number }[];
  } | null;

  useEffect(() => {
    if (tab && experimentId && isTabInitialized) {
      dispatch(
        fetchModelAnalysisFeatureImportancePlot({
          query: {
            model: ['/opt/data/xtreme/mlflow/mlartifacts/359083425157694092/00c8701a7615473f9b199477657bfcf2/artifacts/explainability/model.pkl'],
            data: {
              X_train: '/opt/data/xtreme/mlflow/mlartifacts/359083425157694092/00c8701a7615473f9b199477657bfcf2/artifacts/explainability/X_train.csv',
              Y_train: '/opt/data/xtreme/mlflow/mlartifacts/359083425157694092/00c8701a7615473f9b199477657bfcf2/artifacts/explainability/Y_train.csv',
              X_test: '/opt/data/xtreme/mlflow/mlartifacts/359083425157694092/00c8701a7615473f9b199477657bfcf2/artifacts/explainability/X_test.csv',
              Y_test: '/opt/data/xtreme/mlflow/mlartifacts/359083425157694092/00c8701a7615473f9b199477657bfcf2/artifacts/explainability/Y_test.csv'
            }
          },
          metadata: {
            workflowId: tab.workflowId,
            experimentId,
          },
        })
      );
    }
  }, [isTabInitialized]);

  const getVegaliteData = () => {
    if (!rawData?.featureImportances) return [];

    return rawData.featureImportances.map(d => ({
      Feature: d.featureName,
      Importance: d.importanceScore,
    }));
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
