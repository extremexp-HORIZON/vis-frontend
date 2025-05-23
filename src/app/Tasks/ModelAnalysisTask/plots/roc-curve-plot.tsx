import { useParams } from 'react-router-dom';
import type { RootState } from '../../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import { useEffect, useState } from 'react';
import InfoMessage from '../../../../shared/components/InfoMessage';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import ResponsiveCardVegaLite from '../../../../shared/components/responsive-card-vegalite';
import { fetchRocCurve } from '../../../../store/slices/modelAnalysisSlice';
import Loader from '../../../../shared/components/loader';

const RocCurvePlot = () => {
  const dispatch = useAppDispatch();
  const { experimentId } = useParams();
  const { tab, isTabInitialized } = useAppSelector((state: RootState) => state.workflowPage);
  const rocState = tab?.workflowTasks.modelAnalysis?.modelRocCurve;
  const aucValue = rocState?.data?.auc?.toFixed(3) || '';

  const [rocData, setRocData] = useState<
    { fpr: number; tpr: number; threshold: number }[]
  >([]);

  useEffect(() => {
    if (tab) {
      dispatch(fetchRocCurve({ experimentId: experimentId || '', runId: tab.workflowId || '' }));
    }
  }, [isTabInitialized]);

  useEffect(() => {
    if (rocState?.data?.fpr && rocState?.data?.tpr) {
      const { fpr, tpr, thresholds } = rocState.data;
      const data = fpr.map((f: number, i: number) => ({
        fpr: f,
        tpr: tpr[i],
        threshold: thresholds?.[i] ?? -1,
      }));

      setRocData(data);
    }
  }, [rocState?.data]);

  const rocSpec = {
    description: 'ROC Curve with Dynamic AUC Label',
    data: { values: rocData },
    layer: [
      // ROC Curve Line
      {
        mark: { type: 'line', point: true },
        encoding: {
          x: {
            field: 'fpr',
            type: 'quantitative',
            title: 'False Positive Rate (FPR)',
            scale: { domain: [0, 1] }
          },
          y: {
            field: 'tpr',
            type: 'quantitative',
            title: 'True Positive Rate (TPR)',
            scale: { domain: [0, 1] }
          },
          tooltip: [
            { field: 'fpr', type: 'quantitative', title: 'FPR' },
            { field: 'tpr', type: 'quantitative', title: 'TPR' },
            { field: 'threshold', type: 'quantitative', title: 'Threshold' }
          ]
        }
      },

      // Diagonal Reference Line
      {
        mark: { type: 'line', strokeDash: [4, 4], color: '#888' },
        data: { values: [{ fpr: 0, tpr: 0 }, { fpr: 1, tpr: 1 }] },
        encoding: {
          x: { field: 'fpr', type: 'quantitative' },
          y: { field: 'tpr', type: 'quantitative' }
        }
      },

      // Dynamically Positioned AUC Label
      ...(aucValue ? [
        {
          data: { values: rocData },
          transform: [
            {
              aggregate: [
                { op: 'max', field: 'fpr', as: 'maxFpr' },
                { op: 'min', field: 'tpr', as: 'minTpr' }
              ]
            }
          ],
          mark: {
            type: 'text',
            align: 'right',
            baseline: 'bottom',
            fontSize: 14,
            fontWeight: 'bold',
            fill: '#2c3e50',
            dx: -10,
            dy: -10
          },
          encoding: {
            x: { field: 'maxFpr', type: 'quantitative' },
            y: { field: 'minTpr', type: 'quantitative' },
            text: { value: `AUC: ${aucValue}` }
          }
        }
      ] : [])
    ],
    config: {
      view: { stroke: 'transparent' },
      axis: {
        labelFont: 'Arial',
        titleFont: 'Arial',
        labelFontSize: 12,
        titleFontSize: 14
      }
    }
  };

  const loading = (
    <Loader/>
  );

  const error = (
    <InfoMessage
      message="Error fetching ROC curve."
      type="info"
      icon={<ReportProblemRoundedIcon sx={{ fontSize: 40, color: 'info.main' }} />}
      fullHeight
    />
  );

  const shouldShowLoading = !!rocState?.loading;
  const shouldShowError = !!rocState?.error;

  return (
    <ResponsiveCardVegaLite
      spec={rocSpec}
      title="ROC Curve"
      actions={false}
      aspectRatio={2}
      minHeight={250}
      maxHeight={400}
      showInfoMessage={shouldShowLoading || shouldShowError}
      infoMessage={shouldShowLoading ? loading : shouldShowError ? error : <></>}
      isStatic={false}
    />
  );
};

export default RocCurvePlot;
