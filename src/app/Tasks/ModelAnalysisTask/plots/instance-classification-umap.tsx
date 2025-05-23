
import type { Dispatch, SetStateAction } from 'react';
import { useEffect } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select, Switch, Typography, useMediaQuery, useTheme } from '@mui/material';
import ResponsiveCardVegaLite from '../../../../shared/components/responsive-card-vegalite';
import Loader from '../../../../shared/components/loader';
import type { RootState } from '../../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import { fetchUmap } from '../../../../store/slices/dataExplorationSlice';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import type { TestInstance } from '../../../../shared/models/tasks/model-analysis.model';
import type { Item, ScenegraphEvent, View } from 'vega';

interface ControlPanelProps {
  xAxisOption: string
  yAxisOption: string
  setXAxisOption: (val: string) => void
  setYAxisOption: (val: string) => void
  showMisclassifiedOnly: boolean
  options: string[]
  plotData: {
      data: TestInstance[] | null
      loading: boolean
      error: string | null
    } | null
  useUmap: boolean
  setUseUmap: Dispatch<SetStateAction<boolean>>
}

const ControlPanel = ({
  xAxisOption,
  yAxisOption,
  setXAxisOption,
  setYAxisOption,
  options,
  plotData,
  useUmap,
  setUseUmap
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
        <FormControl fullWidth disabled>
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
        <FormControl fullWidth disabled>
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
            value={xAxisOption}
            onChange={handleAxisSelection('y')}
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
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 500,

          }}
        >
          UMAP
        </Typography>

        <Switch
          checked={useUmap}
          onChange={(e) => setUseUmap(e.target.checked)}
          color="primary"
        />
      </Box>
    </>
  );
};

interface Umapi {
  point: { id: string; data: TestInstance } | null
  showMisclassifiedOnly: boolean
  setPoint: Dispatch<SetStateAction<{ id: string; data: TestInstance } | null>>
  hashRow: (row: TestInstance) => string
  useUmap: boolean
  setuseUmap: Dispatch<SetStateAction<boolean>>
}

const InstanceClassificationUmap = (props: Umapi) => {
  const theme = useTheme();
  const { setPoint, showMisclassifiedOnly, hashRow, useUmap, setuseUmap } = props;
  const tab = useAppSelector((state: RootState) => state.workflowPage.tab);
  const raw = tab?.workflowTasks.modelAnalysis?.modelInstances.data;
  const parsedData = typeof raw === 'string' ? JSON.parse(raw) : raw;
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('xl'));

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (raw) {
      // Ensure payload is proper 2D array of numbers
      const umapPayload = parsedData.map((row: { [s: string]: unknown } | ArrayLike<unknown>) =>
        Object.values(row).map(val => parseFloat(val as string)),
      );

      dispatch(
        fetchUmap({
          data: umapPayload.slice(0, 2000), // Limit to first 1000 rows
          metadata: {
            workflowId: tab?.workflowId,
            query: 'umap',
          },
        }),
      );
    }
  }, [raw, dispatch]);
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

  const umapResult = tab?.workflowTasks.dataExploration?.umap?.data ?? [];
  const combinedPlotData = umapResult.map((point: number[], index: number) => {
    const original = parsedData[index];
    const actual = original?.actual ?? '?';
    const predicted = original?.predicted ?? '?';

    return {
      x: point[0],
      y: point[1],
      actual,
      predicted,
      index,
    };
  });

  const handleNewView = (view: View) => {
    view.addEventListener('click', (event: ScenegraphEvent, item: Item | null | undefined) => {
      if (item && item.datum?.isMisclassified) {
        const clickedIndex = item.datum.index;
        const originalRow = parsedData[clickedIndex]; // This is the row you want

        const id = hashRow(originalRow);
        const { actual, predicted, ...rest } = originalRow;

        setPoint({
          id,
          data: {
            ...rest,
            'label': actual,
            predicted,
          // index: clickedIndex,
          },
        });
      } else {
        setPoint(null);
      }
    });
  };

  const info = (
    <Loader/>
  );
  const shouldShowInfoMessage = tab?.workflowTasks.dataExploration?.umap.loading && !tab?.workflowTasks.dataExploration?.umap.data;

  return (
    <ResponsiveCardVegaLite
      spec={{
        width: 'container',
        height: 'container',
        autosize: { type: 'fit', contains: 'padding', resize: true },
        data: {
          values: getVegaData(combinedPlotData ?? []),
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
          x: { field: 'x', type: 'quantitative', axis: { title: null } },
          y: { field: 'y', type: 'quantitative', axis: { title: null } },

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

          ]
        },
      }}
      title={'Instance Classification Umap'}
      actions={false}
      onNewView={handleNewView}
      infoMessage={info}
      showInfoMessage={shouldShowInfoMessage}
      aspectRatio={isSmallScreen ? 2.8 : 1.8}
      maxHeight={480}
      isStatic={true}
      controlPanel={
        <ControlPanel
          xAxisOption={''}
          yAxisOption={''}
          setXAxisOption={() => {}}
          setYAxisOption={() => {}}
          showMisclassifiedOnly={showMisclassifiedOnly}
          options={[]}
          plotData={null} useUmap={useUmap} setUseUmap={setuseUmap}
        />
      }

    />
  );
};

export default InstanceClassificationUmap;
