import {  Box, Grid } from '@mui/material';
import type { RootState } from '../../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import Loader from '../../../../shared/components/loader';
import ResponsiveCardTable from '../../../../shared/components/responsive-card-table';
import InfoMessage from '../../../../shared/components/InfoMessage';
import ResponsiveCardVegaLite from '../../../../shared/components/responsive-card-vegalite';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import { useEffect } from 'react';
import { fetchComparativeModelInstances, setComparativeModelInstanceControlPanel } from '../../../../store/slices/monitorPageSlice';
import type { TestInstance } from '../../../../shared/models/tasks/model-analysis.model';

const ComparisonModelInstance = ({
  isMosaic,
  showMisclassifiedOnly,

}: {
  isMosaic: boolean,
  showMisclassifiedOnly: boolean,

}) => {
  const { workflowsTable, comparativeModelInstance, comparativeModelInstanceControlPanel } = useAppSelector(
    (state: RootState) => state.monitorPage,
  );
  const selectedWorkflowIds = workflowsTable.selectedWorkflows;

  const experimentId = useAppSelector(
    (state: RootState) => state.progressPage.experiment.data?.id || '',

  );
  const { xAxisOption, yAxisOption } = comparativeModelInstanceControlPanel;

  const dispatch = useAppDispatch();

  // TODO: fix palette colors
  const chartPalette = ['#1f77b4', '#2ca02c', '#ff7f0e', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];

  let classColorMap: Record<string, string> = {};
  const instance = Object.values(comparativeModelInstance).find(d => d?.data?.length)?.data;

  if (!showMisclassifiedOnly && instance?.length) {
    const predictedValues = Array.from(new Set(instance.map(d => d.predicted))).slice(0, chartPalette.length);

    classColorMap = predictedValues.reduce((acc, val, idx) => {
      acc[String(val)] = chartPalette[idx % chartPalette.length];

      return acc;
    }, {} as Record<string, string>);
  }

  useEffect(() => {
    const instanceStates = Object.values(comparativeModelInstance);
    const dataAvailable = instanceStates.find(d => d?.data?.length);

    if (dataAvailable?.data) {
      const firstItem = dataAvailable.data[0];

      const keys = Object.keys(firstItem);

      dispatch(setComparativeModelInstanceControlPanel({
        options: keys,
        xAxisOption: xAxisOption || keys[0],
        yAxisOption: yAxisOption || keys[1] || keys[0],
      }));
    }
  }, [comparativeModelInstance]);

  const inferFieldType = (data: TestInstance[], field: string): 'quantitative' | 'nominal' => {
    const sample = data.find(d => d[field] !== undefined)?.[field];

    if (typeof sample === 'number') return 'quantitative';

    return 'nominal';
  };

  const SharedLegend = ({ entries }: { entries: { label: string; color: string }[] }) => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
      {entries.map((entry, idx) => (
        <div key={idx}>
          <span
            style={{
              backgroundColor: entry.color,
              width: 12,
              height: 12,
              display: 'inline-block',
              marginRight: 4,
              borderRadius: '50%'
            }}
          />
          {entry.label}
        </div>
      ))}
    </div>
  );

  useEffect(() => {
    if (!experimentId) return;
    selectedWorkflowIds.forEach((runId) => {
      dispatch(fetchComparativeModelInstances({ experimentId, runId }));
    });
  }, [selectedWorkflowIds, experimentId]);

  const renderCharts = selectedWorkflowIds.map((runId) => {
    const instanceState = comparativeModelInstance[runId];

    // Handle loading and error states
    if (!instanceState || instanceState.loading) {
      return (
        <Grid item xs={isMosaic ? 6 : 12} key={runId}>
          <ResponsiveCardTable title={runId} minHeight={400} showSettings={false}>
            <Loader />
          </ResponsiveCardTable>
        </Grid>
      );
    }

    if (instanceState.error) {
      return (
        <Grid item xs={isMosaic ? 6 : 12} key={runId}>
          <ResponsiveCardTable title={runId} minHeight={400} showSettings={false}>
            <InfoMessage
              message={instanceState.error}
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

    const dataRaw = instanceState.data;

    if (!dataRaw) {
      return (
        <Grid item xs={isMosaic ? 6 : 12} key={runId}>
          <ResponsiveCardTable title={runId} minHeight={400} showSettings={false}>
            <InfoMessage
              message={'No instance data available'}
              type="info"
              fullHeight
            />
          </ResponsiveCardTable>
        </Grid>
      );
    }
    const hashRow = (row: TestInstance): string => {
      const stringified = JSON.stringify(row, Object.keys(row).sort());
      let hash = 0;

      for (let i = 0; i < stringified.length; i++) {
        const char = stringified.charCodeAt(i);

        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
      }

      return `row-${Math.abs(hash)}`;
    };
    const getVegaData = (data: TestInstance[]) => {
      return data.map((originalRow: TestInstance) => {
        const id = hashRow(originalRow);
        const isMisclassified = originalRow.actual !== originalRow.predicted;

        return {
          ...originalRow,
          isMisclassified,
          id,
        };
      });
    };
    const confusionMatrixSpec = {
      width: 'container',
      height: 'container',
      autosize: { type: 'fit', contains: 'padding', resize: true },
      data: {
        values: getVegaData(instanceState.data as TestInstance[]),
      },
      params: [
        {
          name: 'pts',
          select: { type: 'point', toggle: false },
          bind: 'legend',
        },
        {
          name: 'highlight',
          select: { type: 'point', on: 'click', clear: 'clickoff',    fields: ['isMisclassified'],
          },
          value: { isMisclassified: true }

        },
        {
          name: 'panZoom',
          select: 'interval',
          bind: 'scales',
        },
      ],
      mark: {
        type: 'point',
        filled: true,
        size: 100,
      },

      encoding: {
        x: {
          field: xAxisOption,
          type: inferFieldType(instanceState.data ?? [], xAxisOption),
        },
        y: {
          field: yAxisOption,
          type: inferFieldType(instanceState.data ?? [], yAxisOption),
        },

        color: showMisclassifiedOnly
          ? {
            field: 'isMisclassified',
            type: 'nominal',
            scale: {
              domain: [false, true],
              range: ['#cccccc', '#ff0000'],
            },
            // legend: {
            //   title: 'Misclassified',
            //   labelExpr: 'datum.label === \'true\' ? \'Misclassified\' : \'Correct\'',
            // },
            legend: null
          }
          : {
            field: 'predicted',
            type: 'nominal',
            scale: {
              domain: Object.keys(classColorMap),
              range: Object.values(classColorMap),
            },
            // legend: {
            //   title: 'Predicted Class',
            // },
            legend: null
          },
        opacity: showMisclassifiedOnly
          ? {
            field: 'isMisclassified',
            type: 'nominal',
            scale: {
              domain: [false, true],
              range: [0.45, 1.0],
            },
          }
          : {
            value: 0.8,
          },
        size: showMisclassifiedOnly ? {
          field: 'isMisclassified',
          type: 'nominal',
          scale: {
            domain: [false, true],
            range: [60, 200],
            legend: false
          },
        } :
          {
            value: 100,
          },
        tooltip: [
          { field: 'actual', type: 'nominal', title: 'Actual' },
          { field: 'predicted', type: 'nominal', title: 'Predicted' },
          { field: xAxisOption, type: inferFieldType(instanceState.data ?? [], xAxisOption), title: xAxisOption },
          { field: yAxisOption, type: inferFieldType(instanceState.data ?? [], yAxisOption), title: yAxisOption },
        ]
      },
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

  let legendEntries: { label: string; color: string }[] = [];

  if (showMisclassifiedOnly) {
    legendEntries = [
      { label: 'Misclassified', color: '#ff0000' },
      { label: 'Correct', color: '#cccccc' },
    ];
  } else {
    legendEntries = Object.entries(classColorMap).map(([label, color]) => ({
      label,
      color,
    }));
  }

  return(
    <Box display='flex' flexDirection='column' gap={2} width='100%'>
      <Box display='flex' justifyContent='flex-end'>
        <SharedLegend entries={legendEntries} />
      </Box>
      <Grid container spacing={2}>
        {renderCharts}
      </Grid>
    </Box>
  );

};

export default ComparisonModelInstance;
