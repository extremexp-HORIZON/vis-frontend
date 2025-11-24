import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Box,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Slider,
  Checkbox,
  FormControlLabel,
  IconButton,
  createTheme,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import type { RootState } from '../../../../store/store';
import { useParams } from 'react-router-dom';

import { explainabilityQueryDefault } from '../../../../shared/models/tasks/explainability.model';
import type { IPlotModel, ITableContents } from '../../../../shared/models/plotmodel.model';
import {
  fetchModelAnalysisExplainabilityPlot,
  setSelectedFeature,
  setSelectedInstance,
  setSelectedTime,
} from '../../../../store/slices/explainabilitySlice';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
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

  const [showAttribution, setShowAttribution] = useState<boolean>(false);
  const [showAttributionMap, setShowAttributionMap] = useState<boolean>(false);
  const [radius, setRadius] = useState<number>(18);

  const [isPlaying, setIsPlaying] = useState(false);
  const [timeIndex, setTimeIndex] = useState(0);

  const [mapView, setMapView] = useState<{ center: [number, number]; zoom: number } | null>(null);

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

  const handleTimeChange = useCallback(
    (val: string) => {
      dispatch(setSelectedTime({ plotType: 'segmentation', time: val }));
    },
    []
  );

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

  useEffect(() => {
    if (!showAttribution) {
      setShowAttributionMap(false);
    }
  }, [showAttribution]);

  useEffect(() => {
    if (!timeOptions.length) {
      setTimeIndex(0);
      return;
    }
    const idx = selectedTime ? timeOptions.indexOf(selectedTime) : 0;
    setTimeIndex(idx === -1 ? 0 : idx);
  }, [timeOptions, selectedTime]);

  useEffect(() => {
    if (!isPlaying || !timeOptions.length) return;

    const id = setInterval(() => {
      setTimeIndex(prev => {
        const next = (prev + 1) % timeOptions.length;
        const tVal = timeOptions[next];
        if (tVal != null) handleTimeChange(tVal);
        return next;
      });
    }, 3000);

    return () => clearInterval(id);
  }, [isPlaying, timeOptions]);

  useEffect(() => {
    if (!showAttributionMap) return;
    setMapView(null);
  }, [selectedFeature, selectedInstance, selectedTime]);

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
  useEffect(() => {
    if (showAttribution && attribPts.length === 0) {
      setShowAttribution(false);
    }
  }, [showAttribution, attribPts.length]);

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

      <FormControl fullWidth>
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
            onChange={(_, newValue) => setRadius(newValue as number)}
            valueLabelDisplay="auto"
            min={10}
            step={1}
            max={50}
            disabled={!timeOptions.length || !!plotSlice?.loading}
          />
        </ThemeProvider>
      </FormControl>
      <FormControlLabel
        control={
          <Checkbox
            checked={showAttribution}
            onChange={e => setShowAttribution(e.target.checked)}
            disabled={!attribPts.length || !!plotSlice?.loading}
          />
        }
        label="Attribution"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={showAttributionMap}
            onChange={e => setShowAttributionMap(e.target.checked)}
            disabled={!showAttribution || !attribPts.length || !!plotSlice?.loading}
          />
        }
        label="Split Map"
      />
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

  const singleMapContent = (
    <HeatMapLeaflet
      points={featurePts}
      legendLabel={selectedFeature}
      radius={radius}
      blur={15}
      maxZoom={18}
      decimals={5}
      minIntensity={0.35}
      gamma={0.5}
      attributionPoints={showAttribution ? attribPts : []}
    />
  );

  const splitMapsContent = (
    <Grid container spacing={1} sx={{ p: 1 }}>
      <Grid item xs={12} md={6}>
        <Box sx={{ width: '100%', height: '100%' }}>
          <HeatMapLeaflet
            points={featurePts}
            legendLabel={selectedFeature || 'Feature'}
            radius={radius}
            blur={15}
            maxZoom={18}
            decimals={5}
            minIntensity={0.35}
            gamma={0.5}
            syncedView={mapView || undefined}
            onViewChange={view =>
              setMapView(prev =>
                !prev ||
                prev.zoom !== view.zoom ||
                prev.center[0] !== view.center[0] ||
                prev.center[1] !== view.center[1]
                  ? view
                  : prev
              )
            }
          />
        </Box>
      </Grid>
      <Grid item xs={12} md={6}>
        <Box sx={{ width: '100%', height: '100%' }}>
          <HeatMapLeaflet
            points={attribPts}
            legendLabel={selectedFeature ? `${selectedFeature} attribution` : 'Attribution'}
            radius={radius}
            blur={15}
            maxZoom={18}
            decimals={5}
            minIntensity={0.35}
            gamma={0.5}
            syncedView={mapView || undefined}
            onViewChange={view =>
              setMapView(prev =>
                !prev ||
                prev.zoom !== view.zoom ||
                prev.center[0] !== view.center[0] ||
                prev.center[1] !== view.center[1]
                  ? view
                  : prev
              )
            }
          />
        </Box>
      </Grid>
    </Grid>
  );

  const mapContent = showAttribution && showAttributionMap ? splitMapsContent : singleMapContent;

  const timelineBar =
    timeOptions.length > 0 && !plotSlice?.loading ? (
      <Box
        sx={{
          borderTop: theme => `1px solid ${theme.palette.divider}`,
          px: 1,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
        }}>
          <Typography variant="body2">
            Time
          </Typography>
          <IconButton
            size="small"
            onClick={() => setIsPlaying(p => !p)}
            disabled={!!plotSlice?.loading || !timeOptions.length}
          >
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
        </Box>
        <ThemeProvider theme={theme}>
          <Box sx={{ flex: 1 }}>
            <Slider
              min={0}
              max={timeOptions.length - 1}
              step={1}
              value={timeIndex}
              onChange={(_, newValue) => {
                const idx = newValue as number;
                setIsPlaying(false);
                setTimeIndex(idx);
                const tVal = timeOptions[idx];
                if (tVal != null) handleTimeChange(tVal);
              }}
              marks={
                timeOptions.length <= 10
                  ? timeOptions.map((_, idx) => ({
                      value: idx,
                    }))
                  : undefined
              }
              valueLabelDisplay="off"
              disabled={!!plotSlice?.loading || !timeOptions.length}
            />
          </Box>
        </ThemeProvider>
      </Box>
    ) : null;

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <ResponsiveCardTable
            title="Feature / Attribution"
            details={plotModel?.plotDescr || null}
            controlPanel={controlPanel}
            showDownloadButton
            showFullScreenButton
            minHeight={400}
            noPadding
          >
            <>
              {plotSlice?.loading
                ? loading
                : plotSlice?.error || !plotSlice?.data
                ? error
                : mapContent}
              {timelineBar}
            </>
          </ResponsiveCardTable>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AttributionHeatmaps;
