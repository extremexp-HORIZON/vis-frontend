import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Grid, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import type { RootState } from '../../../../store/store';
import { useParams } from 'react-router-dom';

import rawFixture from '../../../../shared/data/segmentation.json';
import { explainabilityQueryDefault } from '../../../../shared/models/tasks/explainability.model';
import type { IPlotModel, ITableContents } from '../../../../shared/models/plotmodel.model';
import { fetchModelAnalysisExplainabilityPlot } from '../../../../store/slices/explainabilitySlice';

import HeatMapLeaflet from '../../../../shared/components/HeatMapLeaflet';
import ResponsiveCardTable from '../../../../shared/components/responsive-card-table';

type HeatPoint = { x: number; y: number; time: string | number; value: number };

const USE_FIXTURE = true;
const USE_API = false;

const numeric = (v: unknown): number => (typeof v === 'number' ? v : Number(v));

function adaptFixtureToPlotModel(json: any): IPlotModel {
  return {
    explainabilityType: json.explainability_type,
    explanationMethod: json.explanation_method,
    explainabilityModel: json.explainability_model,
    plotName: json.plot_name,
    plotDescr: json.plot_descr,
    plotType: json.plot_type,
    features: json.features,
    featureList: json.feature_list ?? [],
    hyperparameterList: json.hyperparameter_list ?? [],
    xAxis: json.xAxis,
    yAxis: json.yAxis,
    zAxis: json.zAxis,
    tableContents: json.table_contents ?? {},
    TotalCost: json.TotalCost ?? 0,
    TotalEffectiveness: json.TotalEffectiveness ?? 0,
    actions: json.actions ?? {},
    affectedClusters: json.affected_clusters ?? {},
    effCostActions: json.eff_cost_actions ?? {},
    features_table: json.features_table,
    attributions_table: json.attributions_table,
    features_table_columns: json.features_table_columns ?? [],
    attributions_table_columns: json.attributions_table_columns ?? [],
  };
}

const featureCandidates = (pl: IPlotModel | null) =>
  pl?.features_table_columns?.filter(c => !['x', 'y', 'time'].includes(c)) ?? [];

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
  // uncomment for api also must make the initialization
  //   const selectedFeature = plotSlice?.selectedFeature ?? '';
  //   const selectedTime = plotSlice?.selectedTime ?? '';

  // Fixture (mock)
  const [fixtureModel] = useState<IPlotModel | null>(
    adaptFixtureToPlotModel(rawFixture as any)
  );

  // API fetch (uncomment when ready)
  // useEffect(() => {
  //   if (!USE_API) return;
  //   if (!tab || !experimentId || !isTabInitialized) return;
  //   dispatch(
  //     fetchModelAnalysisExplainabilityPlot({
  //       query: {
  //         ...explainabilityQueryDefault,
  //         explanation_type: 'featureExplanation',
  //         explanation_method: 'segmentation',
  //       },
  //       metadata: {
  //         workflowId: tab.workflowId,
  //         queryCase: 'segmentation',
  //         experimentId,
  //       },
  //     })
  //   );
  // }, [dispatch, tab, experimentId, isTabInitialized]);

  const plotModel: IPlotModel | null =
    USE_FIXTURE ? fixtureModel : (plotSlice?.data ?? null);

  //handlers for redux instead of state
  // const handleFeatureChange = (val: string) => {
  //   setSelectedFeature(val);
  //   dispatch(setSelectedFeature({ plotType: 'segmentation', feature: val }));
  // };

  // const handleTimeChange = (val: string) => {
  //   setSelectedTime(val);
  //   dispatch(setSelectedTime({ plotType: 'segmentation', time: val }));
  // };


  // selections for now state
  const featureOptions = useMemo(() => featureCandidates(plotModel), [plotModel]);
  const [selectedFeature, setSelectedFeature] = useState<string>(featureOptions[0] || '');
  useEffect(() => {
    if (featureOptions.length && !selectedFeature) setSelectedFeature(featureOptions[0]);
  }, [featureOptions, selectedFeature]);

  const timeOptions = useMemo(() => distinctTimes(plotModel?.features_table), [plotModel]);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    timeOptions.length ? timeOptions[0] : undefined
  );
  useEffect(() => {
    if (timeOptions.length && (!selectedTime || !timeOptions.includes(String(selectedTime)))) {
      setSelectedTime(timeOptions[0]);
    }
  }, [timeOptions, selectedTime]);

  // map points (lat=y, lon=x)
  const featurePts = useMemo(
    () => makeHeatmapValues(plotModel?.features_table, selectedFeature, selectedTime)
      .map(p => ({ lat: p.y, lon: p.x, value: p.value })),
    [plotModel, selectedFeature, selectedTime]
  );
  const attribPts = useMemo(
    () => makeHeatmapValues(plotModel?.attributions_table, selectedFeature, selectedTime)
      .map(p => ({ lat: p.y, lon: p.x, value: p.value })),
    [plotModel, selectedFeature, selectedTime]
  );

  const controlPanel = (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
      <FormControl fullWidth>
        <InputLabel id="feature-select-label">Feature</InputLabel>
        <Select
          labelId="feature-select-label"
          label="Feature"
          value={selectedFeature || ''}
          onChange={e => setSelectedFeature(e.target.value)}
          MenuProps={{ PaperProps: { style: { maxHeight: 300, maxWidth: 320 } } }}
          disabled={!featureOptions.length || (!!plotSlice?.loading && USE_API)}
        >
          {featureOptions.map(f => (<MenuItem key={`feature-${f}`} value={f}>{f}</MenuItem>))}
        </Select>
      </FormControl>

      <FormControl fullWidth disabled={!timeOptions.length || (!!plotSlice?.loading && USE_API)}>
        <InputLabel id="time-select-label">Time</InputLabel>
        <Select
          labelId="time-select-label"
          label="Time"
          value={selectedTime ?? ''}
          onChange={e => setSelectedTime(e.target.value)}
          displayEmpty
          MenuProps={{ PaperProps: { style: { maxHeight: 300, maxWidth: 320 } } }}
        >
          {timeOptions.length === 0
            ? <MenuItem value=""><em>No time</em></MenuItem>
            : timeOptions.map(t => <MenuItem key={`time-${t}`} value={t}>{t}</MenuItem>)
          }
        </Select>
      </FormControl>
    </Box>
  );

  // download helpers: find <canvas> inside card and export bug on download only points are visible
  // const leftCardRef = useRef<HTMLDivElement | null>(null);
  // const rightCardRef = useRef<HTMLDivElement | null>(null);

  // const downloadCanvasPNG = (root: HTMLDivElement | null, filename: string) => {
  //   if (!root) return;
  //   const canvas = root.querySelector('canvas');
  //   if (!canvas) return;
  //   const link = document.createElement('a');
  //   link.download = `${filename}_${new Date().toISOString().slice(0,10)}.png`;
  //   link.href = canvas.toDataURL('image/png');
  //   document.body.appendChild(link);
  //   link.click();
  //   link.remove();
  // };

  // const onDownloadLeft = () => downloadCanvasPNG(leftCardRef.current, 'feature_heatmap');
  // const onDownloadRight = () => downloadCanvasPNG(rightCardRef.current, 'attribution_heatmap');

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={2}>
        {/* Feature (controlPanel passed here) */}
        <Grid item xs={12} md={6}>
          {/* <div ref={leftCardRef}> */}
            <ResponsiveCardTable
              title="Feature"
              details={plotModel?.plotDescr || null}
              controlPanel={controlPanel}
              // onDownload={onDownloadLeft}
              showDownloadButton
              showFullScreenButton
              minHeight={400}
              noPadding
            >
              <HeatMapLeaflet
                points={featurePts}
                legendLabel={selectedFeature}
                radius={18}
                blur={15}
                maxZoom={18}
                decimals={5}
                minIntensity={0.35}
                gamma={0.5}
              />
            </ResponsiveCardTable>
          {/* </div> */}
        </Grid>

        {/* Attribution (no duplicate control panel) */}
        <Grid item xs={12} md={6}>
          {/* <div ref={rightCardRef}> */}
            <ResponsiveCardTable
              title="Attribution"
              details={plotModel?.plotDescr || null}
              // onDownload={onDownloadRight}
              controlPanel={controlPanel}
              showDownloadButton
              showFullScreenButton
              minHeight={400}
              noPadding
            >
              <HeatMapLeaflet
                points={attribPts}
                legendLabel={selectedFeature}
                radius={18}
                blur={15}
                maxZoom={18}
                decimals={5}
                minIntensity={0.35}
                gamma={0.5}
              />
            </ResponsiveCardTable>
          {/* </div> */}
        </Grid>
      </Grid>
    </Box>
  );
};

export default AttributionHeatmaps;
