import type React from 'react';
import { useEffect, useState } from 'react';
import type { RootState } from '../../store/store';
import { useAppDispatch, useAppSelector } from '../../store/store';
import {
  Grid,
  Container,
  ButtonGroup,
  Button,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import ResponsiveCardVegaLite from '../../shared/components/responsive-card-vegalite';
import InfoMessage from '../../shared/components/InfoMessage';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { fetchComparativeConfusionMatrix } from '../../store/slices/monitorPageSlice';
import ResponsiveCardTable from '../../shared/components/responsive-card-table';
import Loader from '../../shared/components/loader';

const ComparisonModelsCharts: React.FC = () => {
  const dispatch = useAppDispatch();
  const { workflowsTable, comparativeModelConfusionMatrix } = useAppSelector(
    (state: RootState) => state.monitorPage,
  );
  const experimentId = useAppSelector(
    (state: RootState) => state.progressPage.experiment.data?.id || '',
  );
  const [isMosaic, setIsMosaic] = useState(true);

  const selectedWorkflowIds = workflowsTable.selectedWorkflows;

  const [selectedOption, setSelectedOption] = useState('confusionMatrix');

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
          <ResponsiveCardTable title={runId} minHeight={400}>
            <Loader />
          </ResponsiveCardTable>
        </Grid>
      );
    }

    if (matrixState.error) {
      return (
        <Grid item xs={isMosaic ? 6 : 12} key={runId}>
          <ResponsiveCardTable title={runId} minHeight={400}>
            <InfoMessage
              message={matrixState.error}
              type="error"
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
          <ResponsiveCardTable title={runId} minHeight={400}>
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
        />
      </Grid>
    );
  });

  if (selectedWorkflowIds.length === 0) {
    return (
      <InfoMessage
        message="Select Workflows to display comparisons over models."
        type="info"
        icon={<AssessmentIcon sx={{ fontSize: 40, color: 'info.main' }} />}
        fullHeight
      />
    );
  }

  return (
    <Container maxWidth={false} sx={{ padding: 2 }}>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ marginBottom: 2 }}>

        {/* Left-aligned Button Group */}
        <Grid item>
          <RadioGroup
            row
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            aria-label="view type"
            name="view-type-radio"
          >
            <FormControlLabel value="confusionMatrix" control={<Radio />} label="Confusion Matrix" />
            {/* <FormControlLabel value="scatterPlot" control={<Radio />} label="Scatter Plot" /> */}
          </RadioGroup>
        </Grid>
        <Grid item>
          <ButtonGroup variant="contained" aria-label="view mode" sx={{ height: '25px' }}>
            <Button
              variant={isMosaic ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => setIsMosaic(true)}
            >
            Mosaic
            </Button>
            <Button
              variant={!isMosaic ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => setIsMosaic(false)}
            >
            Stacked
            </Button>
          </ButtonGroup>
        </Grid>

      </Grid>

      <Grid container spacing={2} sx={{ width: '100%', margin: '0 auto', flexWrap: 'wrap' }}>
        {selectedOption === 'confusionMatrix' ? renderCharts : null}
      </Grid>
    </Container>
  );
};

export default ComparisonModelsCharts;
