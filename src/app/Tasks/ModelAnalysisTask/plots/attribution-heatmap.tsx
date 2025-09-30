// GeoHeatmaps.tsx
import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import type { RootState } from '../../../../store/store';
import { useParams } from 'react-router-dom';
import {
  Box, Grid, FormControl, InputLabel, MenuItem, Select, Typography,
} from '@mui/material';
import ResponsiveCardVegaLite from '../../../../shared/components/responsive-card-vegalite';
import InfoMessage from '../../../../shared/components/InfoMessage';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import Loader from '../../../../shared/components/loader';
import { explainabilityQueryDefault } from '../../../../shared/models/tasks/explainability.model';
import type { IPlotModel, ITableContents } from '../../../../shared/models/plotmodel.model';
import { fetchModelAnalysisExplainabilityPlot } from '../../../../store/slices/explainabilitySlice';
import rawFixture from '../../../../shared/data/segmentation.json'

type HeatPoint = { x: number; y: number; time: string | number; value: number };

// ====== MODE TOGGLES ======
const USE_FIXTURE = true;   // loads EXACT content from segmentation.json
const USE_API = false;      // when ready, set true and uncomment the effect/handlers
// ==========================

// ---- helpers: adapters & transforms ----
const numeric = (v: unknown): number => (typeof v === 'number' ? v : Number(v));

/** Map snake_case JSON (your file) -> IPlotModel (camelCase) */
function adaptFixtureToPlotModel(json: any): IPlotModel {
  // shallow field mapping
  const pm: IPlotModel = {
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
  return pm;
}

const featureCandidates = (pl: IPlotModel | null) =>
  pl?.features_table_columns?.filter(c => !['x','y','time'].includes(c)) ?? [];

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

// grid step estimation for nice square-ish tiles
const median = (arr:number[]) => {
  const s = [...arr].sort((a,b)=>a-b); const n = s.length;
  return n ? (n%2 ? s[(n-1)/2] : (s[n/2-1]+s[n/2])/2) : 0;
};
const gridSteps = (values: {x:number;y:number}[]) => {
  const xs = Array.from(new Set(values.map(d=>d.x))).sort((a,b)=>a-b);
  const ys = Array.from(new Set(values.map(d=>d.y))).sort((a,b)=>a-b);
  const dx = median(xs.slice(1).map((v,i)=>v - xs[i])) || 0.001;
  const dy = median(ys.slice(1).map((v,i)=>v - ys[i])) || 0.001;
  return { dx, dy };
};

const extent = (arr: number[]) =>
  [Math.min(...arr), Math.max(...arr)] as [number, number];

const niceTicks = (min: number, max: number, count = 6) => {
  const step = (max - min) / Math.max(1, count - 1);
  return Array.from({ length: count }, (_, i) => min + i * step);
};

// 4 decimals looks great for your coordinate span:
const AXIS_FORMAT = ".4f";

const buildSpec = (
  values: { x:number; y:number; time:any; value:number }[],
  label: string,
  domain?: [number, number]
) => {
  if (!values.length) return { data: { values }, mark: "rect" } as any;

  // bin size (keeps your heatmap grid)
  const { dx, dy } = gridSteps(values);

  // compute “nice” ticks from actual extents (NOT every bin edge)
  const xs = values.map(d => d.x);
  const ys = values.map(d => d.y);
  const [minX, maxX] = extent(xs);
  const [minY, maxY] = extent(ys);
  const xTicks = niceTicks(minX, maxX, 6);
  const yTicks = niceTicks(minY, maxY, 6);

  const labelExpr = `format(datum.value, '${AXIS_FORMAT}')`;

  return {
    data: { values },
    mark: { type: 'rect', tooltip: true, stroke: null },
    encoding: {
      x: {
        field: 'x',
        type: 'quantitative',
        bin: { step: dx },
        title: 'Longitude',
        scale: { nice: true, zero: false },
        axis: {
          values: xTicks,
          format: AXIS_FORMAT,
          labelExpr,
          labelOverlap: 'greedy',
          labelBound: true,
          labelFlush: true,
          labelPadding: 4,
          tickCount: xTicks.length,   // keep Vega from adding more ticks
          tickSize: 3,
          grid: true,
          gridOpacity: 0.08,
          domain: false
        },
      },
      y: {
        field: 'y',
        type: 'quantitative',
        bin: { step: dy },
        title: 'Latitude',
        scale: { nice: true, zero: false },
        axis: {
          values: yTicks,
          format: AXIS_FORMAT,
          labelExpr,
          labelOverlap: 'greedy',
          labelBound: true,
          labelFlush: true,
          labelPadding: 4,
          tickCount: yTicks.length,
          tickSize: 3,
          grid: true,
          gridOpacity: 0.08,
          domain: false
        },
      },
      color: {
        field: 'value',
        type: 'quantitative',
        aggregate: 'mean',            // keep mean because we’re binning
        title: label,
        ...(domain ? { scale: { domain } } : {}), // classic palette
      },
      tooltip: [
        { field: 'x', type: 'quantitative', bin: true, title: 'Lon (bin)' },
        { field: 'y', type: 'quantitative', bin: true, title: 'Lat (bin)' },
        { aggregate: 'mean', field: 'value', type: 'quantitative', title: 'Mean' },
      ],
    },
    view: { stroke: null },
    config: {
      axis: {
        labelFontSize: 10,
        titleFontSize: 11,
        tickColor: '#9ca3af',  // subtle
        gridColor: '#9ca3af',
      },
      legend: { orient: 'right', gradientLength: 120 },
    },
  };
};

const AttributionHeatmaps: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tab, isTabInitialized } = useAppSelector((s: RootState) => s.workflowPage);
  const { experimentId } = useParams();

  // slice reference kept for easy API switch
  const plotSlice = tab?.workflowTasks.modelAnalysis?.segmentation;
  // uncomment for api also must make the initialization
  //   const selectedFeature = plotSlice?.selectedFeature ?? '';
  //   const selectedTime = plotSlice?.selectedTime ?? '';

  // ---- FIXTURE LOAD (exact content) ----
  const [fixtureModel] = useState<IPlotModel | null>(
    adaptFixtureToPlotModel(rawFixture as any)
  );
  const fixtureError = null;


  // ---- API FETCH (commented until you flip to API) ----
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
  //     }),
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

  // values
  const featuresHeatValues = useMemo(
    () => makeHeatmapValues(plotModel?.features_table, selectedFeature, selectedTime),
    [plotModel, selectedFeature, selectedTime]
  );
  const attributionsHeatValues = useMemo(
    () => makeHeatmapValues(plotModel?.attributions_table, selectedFeature, selectedTime),
    [plotModel, selectedFeature, selectedTime]
  );

  const domainMinMax = (vals: number[]) =>
  vals.length ? [Math.min(...vals), Math.max(...vals)] as [number, number] : undefined;

  const featuresDomain = useMemo(
  () => domainMinMax(featuresHeatValues.map(d => d.value)),
  [featuresHeatValues]
);
const attributionsDomain = useMemo(
  () => domainMinMax(attributionsHeatValues.map(d => d.value)),
  [attributionsHeatValues]
);


const specFeatures = buildSpec(
  featuresHeatValues,
  selectedFeature || 'value',
  featuresDomain
);

const specAttributions = buildSpec(
  attributionsHeatValues,
  selectedFeature || 'value',
  attributionsDomain
);

  // control panel
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
            ? <MenuItem value=""><em>No time dimension</em></MenuItem>
            : timeOptions.map(t => <MenuItem key={`time-${t}`} value={t}>{t}</MenuItem>)
          }
        </Select>
      </FormControl>
    </Box>
  );

  // messages
  const loading = <Loader />;
  const error = (
    <InfoMessage
      message={fixtureError ? `Fixture load failed: ${fixtureError}` : 'Error fetching segmentation heatmaps.'}
      type="info"
      icon={<ReportProblemRoundedIcon sx={{ fontSize: 40, color: 'info.main' }} />}
      fullHeight
    />
  );

  const shouldShowLoading = (USE_API && !!plotSlice?.loading) || (USE_FIXTURE && !fixtureModel && !fixtureError);
  const shouldShowError = (USE_API && !!plotSlice?.error) || (USE_FIXTURE && !!fixtureError);

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <ResponsiveCardVegaLite
            spec={specFeatures}
            title='Feature'
            details={plotModel?.plotDescr || null}
            aspectRatio={1}
            maxHeight={400}
            controlPanel={controlPanel}
            actions={false}
            showInfoMessage={shouldShowLoading || shouldShowError}
            infoMessage={shouldShowLoading ? loading : shouldShowError ? error : <></>}
            isStatic={false}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <ResponsiveCardVegaLite
            spec={specAttributions}
            title='Attribution'
            details={plotModel?.plotDescr || null}
            aspectRatio={1}
            maxHeight={400}
            controlPanel={controlPanel}
            actions={false}
            showInfoMessage={shouldShowLoading || shouldShowError}
            infoMessage={shouldShowLoading ? loading : shouldShowError ? error : <></>}
            isStatic={false}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AttributionHeatmaps;
