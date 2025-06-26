import { Grid } from '@mui/material';
import type { RootState } from '../../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import Loader from '../../../../shared/components/loader';
import ResponsiveCardTable from '../../../../shared/components/responsive-card-table';
import InfoMessage from '../../../../shared/components/InfoMessage';
import ResponsiveCardVegaLite from '../../../../shared/components/responsive-card-vegalite';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import { useEffect } from 'react';
import { fetchComparativeConfusionMatrix } from '../../../../store/slices/monitorPageSlice';

const ComparisonModelConfusion = ({ isMosaic }: {isMosaic: boolean}) => {
  const { workflowsTable, comparativeModelConfusionMatrix } = useAppSelector(
    (state: RootState) => state.monitorPage,
  );
  const experimentId = useAppSelector(
    (state: RootState) => state.progressPage.experiment.data?.id || '',
  );
  const dispatch = useAppDispatch();
  const selectedWorkflowIds = workflowsTable.selectedWorkflows;

  // Dispatch fetchComparativeConfusionMatrix for each selected workflow (runId)
  useEffect(() => {
    if (!experimentId) return;
    selectedWorkflowIds.forEach((runId) => {
      dispatch(fetchComparativeConfusionMatrix({ experimentId, runId }));
    });
  }, [selectedWorkflowIds, experimentId]);

  // Transform matrix data to Vega-Lite format
  const transformConfusionMatrix = (labels: string[], matrix: number[][]) => {
    const data: { actual: string; predicted: string; value: number }[] = [];

    for (let actualIdx = 0; actualIdx < matrix.length; actualIdx++) {
      for (let predictedIdx = 0; predictedIdx < matrix[actualIdx].length; predictedIdx++) {
        data.push({
          actual: labels[actualIdx],
          predicted: labels[predictedIdx],
          value: matrix[actualIdx][predictedIdx],
        });
      }
    }

    return data;
  };

  const renderCharts = selectedWorkflowIds.map((runId) => {
    const matrixState = comparativeModelConfusionMatrix[runId];

    // Handle loading and error states
    if (!matrixState || matrixState.loading) {
      return (
        <Grid item xs={isMosaic ? 6 : 12} key={runId}>
          <ResponsiveCardTable title={runId} minHeight={400} showSettings={false}>
            <Loader />
          </ResponsiveCardTable>
        </Grid>
      );
    }

    if (matrixState.error) {
      return (
        <Grid item xs={isMosaic ? 6 : 12} key={runId}>
          <ResponsiveCardTable title={runId} minHeight={400} showSettings={false}>
            <InfoMessage
              message={matrixState.error}
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

    const dataRaw = matrixState.data;

    if (!dataRaw || !dataRaw.labels || !dataRaw.matrix) {
      return (
        <Grid item xs={isMosaic ? 6 : 12} key={runId}>
          <ResponsiveCardTable title={runId} minHeight={400} showSettings={false}>
            <InfoMessage
              message={'No confusion matrix data available'}
              type="info"
              fullHeight
            />
          </ResponsiveCardTable>
        </Grid>
      );
    }

    const confusionMatrixData = transformConfusionMatrix(dataRaw.labels, dataRaw.matrix);
    const maxValue = Math.max(...confusionMatrixData.map(d => d.value));
    const dataWithMax = confusionMatrixData.map(d => ({ ...d, __max__: maxValue }));

    const confusionMatrixSpec = {
      data: { values: dataWithMax },
      encoding: {
        x: { field: 'predicted', type: 'ordinal', axis: { title: 'Predicted Label', labelAngle: 0 } },
        y: { field: 'actual', type: 'ordinal', axis: { title: 'Actual Label' } },
        color: {
          field: 'value',
          type: 'quantitative',
          scale: { range: ['#ffffe0', '#08306b'] },
          legend: { title: 'Count' },
        },
      },
      layer: [
        { mark: { type: 'rect', tooltip: true } },
        {
          mark: {
            type: 'text',
            align: 'center',
            baseline: 'middle',
            fontSize: 12,
            fontWeight: 'bold',
          },
          encoding: {
            text: { field: 'value', type: 'quantitative' },
            color: {
              condition: { test: 'datum.value > 0.4 * datum.__max__', value: 'white' },
              value: 'black',
            },
          },
        },
      ],
    };

    return (
      <Grid
        item
        xs={isMosaic ? 6 : 12}
        key={runId}
        sx={{ textAlign: 'left', width: '100%' }}
      >
        <ResponsiveCardVegaLite
          spec={confusionMatrixSpec}
          actions={false}
          isStatic={false}
          title={runId}
          sx={{ width: '100%', maxWidth: '100%' }}
          showSettings={false}
        />
      </Grid>
    );
  });

  return renderCharts;
};

export default ComparisonModelConfusion;
