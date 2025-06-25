import { Box, FormControl, Grid, InputLabel, MenuItem, Select, Switch, Typography } from '@mui/material';
import type { RootState } from '../../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import Loader from '../../../../shared/components/loader';
import ResponsiveCardTable from '../../../../shared/components/responsive-card-table';
import InfoMessage from '../../../../shared/components/InfoMessage';
import ResponsiveCardVegaLite from '../../../../shared/components/responsive-card-vegalite';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import { useEffect, useState } from 'react';
import { fetchComparativeModelInstances } from '../../../../store/slices/monitorPageSlice';
import type { TestInstance } from '../../../../shared/models/tasks/model-analysis.model';
import ShowChartIcon from '@mui/icons-material/ShowChart';

interface ControlPanelProps {
  xAxisOption: string
  yAxisOption: string
  setXAxisOption: (val: string) => void
  setYAxisOption: (val: string) => void
  options: string[]
  plotData: {
    data: TestInstance[] | null
    loading: boolean
    error: string | null
  } | null
  
}

const ControlPanel = ({
  xAxisOption,
  yAxisOption,
  setXAxisOption,
  setYAxisOption,
  options,
  plotData,
  
}: ControlPanelProps) => {
  const handleAxisSelection =
    (axis: 'x' | 'y') => (e: { target: { value: string } }) => {
      if (axis === 'x') setXAxisOption(e.target.value);
      else setYAxisOption(e.target.value);
    };

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, px: 1.5 }}>
        {/* X-Axis Selector */}
        <FormControl fullWidth>
          <InputLabel id="x-axis-select-label">
            <Box display="flex" alignItems="center" gap={1}>
              <ShowChartIcon fontSize="small" />
                X-Axis
            </Box>
          </InputLabel>
          <Select
            labelId="x-axis-select-label"
            label="X-Axis-----"
            disabled={plotData?.loading || !plotData?.data}
            value={xAxisOption}
            onChange={handleAxisSelection('x')}
            MenuProps={{
              PaperProps: { style: { maxHeight: 224, width: 250 } },
            }}
          >
            {options
              .filter(option => option !== yAxisOption)
              .map((feature, idx) => (
                <MenuItem key={`xAxis-${feature}-${idx}`} value={feature}>
                  {feature}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel id="y-axis-select-label">
            <Box display="flex" alignItems="center" gap={1}>
              <ShowChartIcon fontSize="small" />
                Y-Axis
            </Box>
          </InputLabel>
          <Select
            labelId="y-axis-select-label"
            label="Y-Axis-----"
            disabled={plotData?.loading || !plotData?.data}
            value={yAxisOption}
            onChange={handleAxisSelection('y')}
            MenuProps={{
              PaperProps: { style: { maxHeight: 224, width: 250 } },
            }}
          >
            {options
              .filter(option => option !== xAxisOption)
              .map((feature, idx) => (
                <MenuItem key={`yAxis-${feature}-${idx}`} value={feature}>
                  {feature}
                </MenuItem>
              ))}

            {options.filter(option => option !== xAxisOption).length === 0 && (
              <MenuItem disabled value="">
                No available options
              </MenuItem>
            )}
          </Select>
        </FormControl>
      </Box>

    </>
  );
};
const ComparisonModelInstance = ({ isMosaic, showMisclassifiedOnly }: {isMosaic: boolean, showMisclassifiedOnly: boolean}) => {
  const { workflowsTable, comparativeModelInstance } = useAppSelector(
    (state: RootState) => state.monitorPage,
  );
  const selectedWorkflowIds = workflowsTable.selectedWorkflows;

  const experimentId = useAppSelector(
    (state: RootState) => state.progressPage.experiment.data?.id || '',
  );
  const dispatch = useAppDispatch();

  const [options, setOptions] = useState<string[]>([]);
    const [xAxisOption, setXAxisOption] = useState<string>('');
    const [yAxisOption, setYAxisOption] = useState<string>('');
    useEffect(() => {
  const instanceStates = Object.values(comparativeModelInstance);
  const dataAvailable = instanceStates.find(d => d?.data?.length);
  if (dataAvailable?.data) {
    const firstItem = dataAvailable.data[0];
    setOptions(Object.keys(firstItem));
    // Optional: Set default X/Y
    if (!xAxisOption) setXAxisOption(Object.keys(firstItem)[0]);
    if (!yAxisOption) setYAxisOption(Object.keys(firstItem)[1] || '');
  }
}, [comparativeModelInstance]);

    const inferFieldType = (data: TestInstance[], field: string): 'quantitative' | 'nominal' => {
        const sample = data.find(d => d[field] !== undefined)?.[field];
    
        if (typeof sample === 'number') return 'quantitative';
    
        return 'nominal';
      };
   
    
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
          <ResponsiveCardTable title={runId} minHeight={400}>
            <Loader />
          </ResponsiveCardTable>
        </Grid>
      );
    }

    if (instanceState.error) {
      return (
        <Grid item xs={isMosaic ? 6 : 12} key={runId}>
          <ResponsiveCardTable title={runId} minHeight={400}>
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

    console.log('dataRaw', dataRaw);

    if (!dataRaw) {
      return (
        <Grid item xs={isMosaic ? 6 : 12} key={runId}>
          <ResponsiveCardTable title={runId} minHeight={400}>
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
            legend: {
              title: 'Misclassified',
              labelExpr: 'datum.label === \'true\' ? \'Misclassified\' : \'Correct\'',
            },
          }
          : {
            field: 'predicted',
            type: 'nominal',
            scale: {
              range: ['#1f77b4', '#2ca02c'],
            },
            legend: {
              title: 'Predicted Class',
            },
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
          { field: xAxisOption, type: inferFieldType(instanceState.data ?? [], xAxisOption) , title: xAxisOption },
          { field: yAxisOption, type: inferFieldType(instanceState.data ?? [], yAxisOption) , title: yAxisOption },
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
          controlPanel={<ControlPanel
    xAxisOption={xAxisOption}
    yAxisOption={yAxisOption}
    setXAxisOption={setXAxisOption}
    setYAxisOption={setYAxisOption}
    options={options}
    plotData={{
      data: instanceState.data,
      loading: instanceState.loading,
      error: instanceState.error,
    }}
  />}
        />
      </Grid>
    );
  });

  return renderCharts;
};

export default ComparisonModelInstance;
