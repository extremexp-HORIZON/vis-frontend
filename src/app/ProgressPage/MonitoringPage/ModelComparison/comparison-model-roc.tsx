import { Grid } from '@mui/material';
import type { RootState } from '../../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import Loader from '../../../../shared/components/loader';
import ResponsiveCardTable from '../../../../shared/components/responsive-card-table';
import InfoMessage from '../../../../shared/components/InfoMessage';
import ResponsiveCardVegaLite from '../../../../shared/components/responsive-card-vegalite';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import { fetchComparativeRocCurve } from '../../../../store/slices/monitorPageSlice';
import { useEffect } from 'react';

const ComparisonModelRoc = ({ isMosaic }: {isMosaic: boolean}) => {
  const { workflowsTable, comparativeModelRocCurve } = useAppSelector(
    (state: RootState) => state.monitorPage,
  );
  const experimentId = useAppSelector(
    (state: RootState) => state.progressPage.experiment.data?.id || '',
  );
  const dispatch = useAppDispatch();
  const selectedWorkflowIds = workflowsTable.selectedWorkflows;

  useEffect(() => {
    if (!experimentId) return;
    selectedWorkflowIds.forEach((runId) => {
      dispatch(fetchComparativeRocCurve({ experimentId, runId }));
    });
  }, [selectedWorkflowIds, experimentId]);

  const renderCharts = selectedWorkflowIds.map((runId) => {
    const rocState = comparativeModelRocCurve[runId];

    // Handle loading and error states
    if (!rocState || rocState.loading) {
      return (
        <Grid item xs={isMosaic ? 6 : 12} key={runId}>
          <ResponsiveCardTable title={runId} minHeight={400} showSettings={false}>
            <Loader />
          </ResponsiveCardTable>
        </Grid>
      );
    }

    if (rocState.error) {
      return (
        <Grid item xs={isMosaic ? 6 : 12} key={runId}>
          <ResponsiveCardTable title={runId} minHeight={400} showSettings={false}>
            <InfoMessage
              message={rocState.error}
              type="info"
              icon={
                <ReportProblemRoundedIcon sx={{ fontSize: 40, color: 'info.main' }} />
              }
              fullHeight
            />
          </ResponsiveCardTable>
        </Grid>
      );
    }

    const dataRaw = rocState.data;

    if (!dataRaw || !dataRaw.fpr || !dataRaw.tpr) {
      return (
        <Grid item xs={isMosaic ? 6 : 12} key={runId}>
          <ResponsiveCardTable title={runId} minHeight={400} showSettings={false}>
            <InfoMessage
              message={'No roc curve data available'}
              type="info"
              fullHeight
            />
          </ResponsiveCardTable>
        </Grid>
      );
    }

    const { fpr, tpr, thresholds, auc } = dataRaw;
    const aucValue = auc?.toFixed(3) || '';
    const rocData = fpr.map((f: number, i: number) => ({
      fpr: f,
      tpr: tpr[i],
      threshold: thresholds?.[i] ?? -1,
    }));

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

    return (
      <Grid
        item
        xs={isMosaic ? 6 : 12}
        key={runId}
        sx={{ textAlign: 'left', width: '100%' }}
      >
        <ResponsiveCardVegaLite
          spec={rocSpec}
          actions={false}
          isStatic={false}
          showSettings={false}

          title={runId}
          sx={{ width: '100%', maxWidth: '100%' }}
        />
      </Grid>
    );
  });

  return renderCharts;
};

export default ComparisonModelRoc;
