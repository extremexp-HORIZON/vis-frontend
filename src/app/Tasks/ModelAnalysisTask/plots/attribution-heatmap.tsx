import { useEffect, useMemo, useState } from 'react';
import { Box, Grid, FormControl, InputLabel, MenuItem, Select, Typography, Slider, createTheme } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import type { RootState } from '../../../../store/store';
import { useParams } from 'react-router-dom';

import { explainabilityQueryDefault } from '../../../../shared/models/tasks/explainability.model';
import type { IPlotModel, ITableContents } from '../../../../shared/models/plotmodel.model';
import { fetchModelAnalysisExplainabilityPlot, setSelectedFeature, setSelectedInstance, setSelectedTime } from '../../../../store/slices/explainabilitySlice';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import { ThemeProvider } from '@emotion/react';

import HeatMapLeaflet from '../../../../shared/components/HeatMapLeaflet';
import ResponsiveCardTable from '../../../../shared/components/responsive-card-table';
import Loader from '../../../../shared/components/loader';
import InfoMessage from '../../../../shared/components/InfoMessage';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';

type HeatPoint = { x: number; y: number; time: string | number; value: number };

const numeric = (v: unknown): number => (typeof v === 'number' ? v : Number(v));

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
  typography: {
    fontFamily: 'Arial',
    h6: { fontWeight: 600 },
  },
});

const featureCandidates = (pl: IPlotModel | null) =>
  pl?.featuresTableColumns?.filter(c => !['x', 'y', 'time'].includes(c)) ??
  pl?.attributionsTableColumns?.filter(c => !['x', 'y', 'time'].includes(c)) ??
  [];

const distinctTimes = (table?: ITableContents) => {
  if (!table?.time?.values) return [];
  const uniq = Array.from(new Set(table.time.values.map(v => String(v))));
  const allNumeric = uniq.every(u => !Number.isNaN(Number(u)));

  return uniq.sort((a, b) => (allNumeric ? Number(a) - Number(b) : a.localeCompare(b)));
};

const makeHeatmapValues = (
  table: ITableContents | undefined,
  feature: string,
  timeValue?: string | number
): HeatPoint[] => {
  if (!table || !table['x'] || !table['y'] || !table['time'] || !table[feature]) return [];
  const xs = table['x'].values;
  const ys = table['y'].values;
  const ts = table['time'].values;
  const vs = table[feature].values;
  const N = Math.min(xs.length, ys.length, ts.length, vs.length);
  const out: HeatPoint[] = [];

  for (let i = 0; i < N; i++) {
    const t = ts[i] as string | number;

    if (timeValue != null && String(t) !== String(timeValue)) continue;
    const x = numeric(xs[i]);
    const y = numeric(ys[i]);
    const v = numeric(vs[i]);

    if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(v)) out.push({ x, y, time: t, value: v });
  }

  return out;
};

const AttributionHeatmaps: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tab, isTabInitialized } = useAppSelector((s: RootState) => s.workflowPage);
  const { experimentId } = useParams();

  const plotSlice = tab?.workflowTasks.modelAnalysis?.segmentation;
  const selectedFeature = plotSlice?.selectedFeature ?? '';
  const selectedTime = plotSlice?.selectedTime ?? '';
  const selectedInstance = plotSlice?.selectedInstance ?? '';

  useEffect(() => {
    if (!tab || !experimentId || !isTabInitialized) return;
    dispatch(
      fetchModelAnalysisExplainabilityPlot({
        query: {
          ...explainabilityQueryDefault,
          explanation_type: 'featureExplanation',
          explanation_method: 'segmentation',
        },
        metadata: {
          workflowId: tab.workflowId,
          queryCase: 'segmentation',
          experimentId,
        },
      })
    );
  }, [isTabInitialized]);

  const plotModel: IPlotModel | null = plotSlice?.data ?? null;

  const handleFeatureChange = (val: string) => {
    dispatch(setSelectedFeature({ plotType: 'segmentation', feature: val }));
  };

  const handleTimeChange = (val: string) => {
    dispatch(setSelectedTime({ plotType: 'segmentation', time: val }));
  };

  const handleInstanceChange = (val: string) => {
    dispatch(setSelectedInstance({plotType: 'segmentation', instance: val}));
    dispatch(
      fetchModelAnalysisExplainabilityPlot({
        query: {
          ...explainabilityQueryDefault,
          explanation_type: 'featureExplanation',
          explanation_method: 'segmentation',
          instance_index: Number(val)
        },
        metadata: {
          workflowId: tab?.workflowId || '',
          queryCase: 'segmentation',
          experimentId: experimentId || '',
        },
      })
    );
  };

  const featureOptions = useMemo(() => featureCandidates(plotModel), [plotModel]);
  const timeOptions = useMemo(() => distinctTimes(plotModel?.featuresTable), [plotModel]);
  const instanceOptions = useMemo(() => plotModel?.availableIndices ?? [], [plotModel]);
  const [radius, setRadius] = useState<number>(18);

  // map points (lat=y, lon=x)
  const featurePts = useMemo(
    () => makeHeatmapValues(plotModel?.featuresTable, selectedFeature, selectedTime)
      .map(p => ({ lat: p.y, lon: p.x, value: p.value })),
    [plotModel, selectedFeature, selectedTime]
  );
  const attribPts = useMemo(
    () => makeHeatmapValues(plotModel?.attributionsTable, selectedFeature, selectedTime)
      .map(p => ({ lat: p.y, lon: p.x, value: p.value })),
    [plotModel, selectedFeature, selectedTime]
  );

  const controlPanel = (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
      <FormControl fullWidth>
        <InputLabel id='instace-select-label'>Instance</InputLabel>
        <Select
          labelId="instace-select-label"
          label='Instance'
          value={selectedInstance}
          onChange={e => handleInstanceChange(e.target.value)}
          MenuProps={{ PaperProps: { style: { maxHeight: 300, maxWidth: 320 } } }}
          disabled={!!plotSlice?.loading}
        >
          {instanceOptions.map(instance =>(<MenuItem key={`instance-${instance}`} value={instance}>{String(instance)}</MenuItem>))}
        </Select>
      </FormControl>
      <FormControl fullWidth >
        <InputLabel id="feature-select-label">Feature</InputLabel>
        <Select
          labelId="feature-select-label"
          label="Feature"
          value={selectedFeature || ''}
          onChange={e => handleFeatureChange(e.target.value)}
          MenuProps={{ PaperProps: { style: { maxHeight: 300, maxWidth: 320 } } }}
          disabled={!featureOptions.length || !!plotSlice?.loading}
        >
          {featureOptions.map(f => (<MenuItem key={`feature-${f}`} value={f}>{f}</MenuItem>))}
        </Select>
      </FormControl>

      <FormControl fullWidth disabled={!timeOptions.length || !!plotSlice?.loading}>
        <InputLabel id="time-select-label">Time</InputLabel>
        <Select
          labelId="time-select-label"
          label="Time"
          value={selectedTime ?? ''}
          onChange={e => handleTimeChange(e.target.value)}
          displayEmpty
          MenuProps={{ PaperProps: { style: { maxHeight: 300, maxWidth: 320 } } }}
        >
          {timeOptions.length === 0
            ? <MenuItem value=""><em>No time</em></MenuItem>
            : timeOptions.map(t => <MenuItem key={`time-${t}`} value={t}>{t}</MenuItem>)
          }
        </Select>
      </FormControl>
      <FormControl fullWidth disabled={!timeOptions.length || !!plotSlice?.loading}>
        <ThemeProvider theme={theme}>
          <Box display="flex" alignItems="center" gap={1}>
            <TrackChangesIcon fontSize="small" />
            <Typography gutterBottom>Radius</Typography>
          </Box>
          <Slider
            value={radius}
            onChange={(e, newValue) =>
              setRadius(newValue as number)
            }
            valueLabelDisplay="auto"
            min={10}
            step={1}
            max={50}
            disabled={!timeOptions.length || !!plotSlice?.loading}
          />
        </ThemeProvider>
      </FormControl>
    </Box>
  );

  const loading = (
    <Loader />
  );

  const error = (
    <InfoMessage
      message="Error fetching plot."
      type="info"
      icon={
        <ReportProblemRoundedIcon sx={{ fontSize: 40, color: 'info.main' }} />
      }
      fullHeight
    />
  );

  const featureHeatmap = (
    <HeatMapLeaflet
      points={featurePts}
      legendLabel={selectedFeature}
      radius={radius}
      blur={15}
      maxZoom={18}
      decimals={5}
      minIntensity={0.35}
      gamma={0.5}
    />
  );

  const attributionHeatmap = (
    <HeatMapLeaflet
      points={attribPts}
      legendLabel={selectedFeature}
      radius={radius}
      blur={15}
      maxZoom={18}
      decimals={5}
      minIntensity={0.35}
      gamma={0.5}
    />
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <ResponsiveCardTable
            title="Feature"
            details={plotModel?.plotDescr || null}
            controlPanel={controlPanel}
            showDownloadButton
            showFullScreenButton
            minHeight={400}
            noPadding
          >
            {plotSlice?.loading ?
              loading :
              plotSlice?.error || !plotSlice?.data ?
                error :
                featureHeatmap
            }
          </ResponsiveCardTable>
        </Grid>
        <Grid item xs={12} md={6}>
          <ResponsiveCardTable
            title="Attribution"
            details={plotModel?.plotDescr || null}
            controlPanel={!plotSlice?.loading && !plotSlice?.error && plotSlice?.data && controlPanel}
            showDownloadButton
            showFullScreenButton
            minHeight={400}
            noPadding
          >
            {plotSlice?.loading ?
              loading :
              plotSlice?.error || !plotSlice?.data ?
                error :
                attributionHeatmap
            }
          </ResponsiveCardTable>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AttributionHeatmaps;
