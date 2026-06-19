import ResponsiveCardVegaLite from '../../../../shared/components/responsive-card-vegalite';
import { cardSurfaceSx } from '../../../../shared/styles/card-surface';
import type { RootState } from '../../../../store/store';
import { useAppSelector } from '../../../../store/store';
import type { IMetric } from '../../../../shared/models/experiment/metric.model';
import { Box, Card, CardContent, Divider, Paper, Slider, Typography } from '@mui/material';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { green, red } from '@mui/material/colors';
import { useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { setCache } from '../../../../shared/utils/localStorageCache';
import { useLocation } from 'react-router-dom';
import { alpha } from '@mui/material/styles';

interface GroupMetrics {
  value: number;
  id: string | null;
  metricName: string;
  step: number | undefined;
  timestamp: string;
  task: string | undefined;
}

export const MetricLineChart = ({ metrics }: {metrics: GroupMetrics[]}) => {
  const { workflows } = useAppSelector((state: RootState) => state.progressPage);
  const { workflowsTable } = useAppSelector((state: RootState) => state.monitorPage);
  // const theme = useTheme();
  // const isSmallScreen = useMediaQuery(theme.breakpoints.down('xl'));
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const workflowId = queryParams.get('workflowId'); // Get the workflowId from the query
  const filteredWorkflows = workflows.data.filter(workflow => workflow.id === workflowId);

  const workflowColorMap = workflowsTable.workflowColors;
  const workflowColorScale = filteredWorkflows.map(wf => ({
    id: wf.id,
    color: workflowColorMap[wf.id] || '#000000', // Default to black if not found
  }));
  const isSingleStep = new Set(metrics.map(d => d.step ?? d.timestamp)).size === 1;

  const values = metrics.map(d => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;

  const lastVal =
    typeof metrics.at(-1)?.value === 'number'
      ? metrics.at(-1)!.value
      : undefined;

  const pctVsMean =
    typeof lastVal === 'number' && mean !== 0
      ? ((lastVal - mean) / Math.abs(mean)) * 100
      : undefined;
  const round2 = (v: number) => Math.round(v * 100) / 100;
  const format2 = (v: number | undefined) =>
    typeof v === 'number' && Number.isFinite(v) ? round2(v).toString() : '—';

  const pctText =
    typeof pctVsMean === 'number'
      ? `${pctVsMean >= 0 ? '+' : ''}${round2(pctVsMean)}%`
      : '—';

  const pctColor =
    typeof pctVsMean === 'number'
      ? (pctVsMean >= 0 ? green[700] : red[700])
      : 'text.secondary';

  const renderDiffIcon = () => {
    if (typeof pctVsMean !== 'number' || pctVsMean === 0) return null;

    return pctVsMean > 0 ? (
      <ArrowDropUpIcon sx={{ color: green[600], mb: 0.2 }} fontSize="small" />
    ) : (
      <ArrowDropDownIcon sx={{ color: red[600], mb: 0.2 }} fontSize="small" />
    );
  };

  const isStepMode = metrics.some(m => m.step !== null && m.step !== undefined);
  const showSeriesCards = metrics.length > 1 && !isSingleStep;

  // If all values equal, pad based on magnitude (or 1 if zero)
  const base = range === 0 ? Math.max(Math.abs(maxVal), 1) : range;
  const pad = base * 0.05;

  const domain: [number, number] = [minVal - pad, maxVal + pad];

  const chartSpec = {
    mark: isSingleStep ? 'point'
      : {
        type: 'line',
        tooltip: true,
        point: {
          size: 20
        }
      },
    encoding: {
      x: {
        field: isStepMode ? 'step' : 'timestamp', // Use the 'step' field for the x-axis (time or step sequence)
        type: 'ordinal',
        axis: {
          labels: isStepMode,
          labelAngle: 0,
          labelOverlap: 'greedy',
          title: isStepMode ? 'Step' : 'Timestamp',
        },
      },
      y: {
        field: 'value', // Use the 'value' field for the y-axis (metric values like CPU Load)
        type: 'quantitative',
        axis: { title: metrics[0].metricName }, // Title the y-axis based on the metric name
        scale: { domain },
      },
      color: {
        field: 'id',
        type: 'nominal',
        scale: {
          domain: workflowColorScale.map(w => w.id), // Workflow IDs
          range: workflowColorScale.map(w => w.color), // Corresponding Colors
        },
        legend: null,
      },
      tooltip: [
        { field: metrics[0].step === null ? 'timestamp' : 'step', type: 'nominal' },
        { field: 'value', type: 'quantitative' },
      ],
    },
    data: { values: metrics },
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 1, minHeight: 0 }}>
      {showSeriesCards && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', flexShrink: 0 }}>
          {/* Card 1: Current + % vs mean */}
          <Card
            elevation={0}
            sx={[cardSurfaceSx(), { flex: 1, minWidth: 200 }]}
          >
            <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                Current ({isStepMode ? 'last step' : 'latest'})
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                  {format2(lastVal)}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                  {renderDiffIcon()}
                  <Typography variant="caption" sx={{ fontWeight: 700, color: pctColor }}>
                    {pctText}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    vs mean
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Card 2: Range */}
          <Card
            elevation={0}
            sx={[cardSurfaceSx(), { flex: 1, minWidth: 200 }]}
          >
            <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                Range
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                  {format2(minVal)} – {format2(maxVal)}
                </Typography>

                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  span {format2(maxVal - minVal)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
      <Box sx={{ width: '100%', flexGrow: 1, minHeight: 0 }}>
        <ResponsiveCardVegaLite
          spec={chartSpec}
          actions={false}
          title={metrics[0].task ? `${metrics[0].task}／${metrics[0].metricName}` : metrics[0].metricName}
          maxHeight={2000}
          aspectRatio={2.5}
          isStatic={true}
        />
      </Box>
    </Box>
  );
};

export const WorkflowMetricChart = () => {
  const { tab } = useAppSelector(state => state.workflowPage);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const workflowId = queryParams.get('workflowId'); // Get the workflowId from the query

  const groupedMetrics: Record<string, GroupMetrics[]> | undefined = tab?.workflowSeriesMetrics.data.reduce(
    (acc: Record<string, GroupMetrics[]>, entry) => {
      entry.seriesMetric.forEach((m: IMetric) => {
        if (!acc[m.name]) acc[m.name] = [];
        acc[m.name].push({
          value: m.value,
          id: workflowId,
          metricName: m.name,
          step: m.step,
          timestamp: new Date(m.timestamp).toLocaleString(),
          task: m.task
        });
      });

      return acc;
    },
    {}
  );

  const metrics = tab?.dataTaskTable.selectedItem?.data?.metric?.name ?
    groupedMetrics?.[tab?.dataTaskTable.selectedItem?.data?.metric?.name] || [] : [];

  return (
    (metrics?.length ?? 0) > 1 ?
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          rowGap: 1,
          height: '100%',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <MetricLineChart metrics={metrics} />
      </Box>
      :
      <MetricCards />
  );
};

export const MetricCards = () => {
  const { tab } = useAppSelector(state => state.workflowPage);
  const { workflows } = useAppSelector((state: RootState) => state.progressPage);
  const { experimentId } = useParams();

  const metricData = tab?.dataTaskTable.selectedItem?.data;
  const currentWorkflowId = tab?.workflowId;

  const roundTo5 = (v: number) => Number(v.toFixed(5));
  const format5 = (v: number | undefined | null) =>
    typeof v === 'number' && Number.isFinite(v) ? v.toFixed(5) : '—';

  const filteredWorkflows = workflows?.data?.flatMap(w =>
    w.metrics?.filter(metric => metric.name === metricData?.metric?.name)
      .map(metric => ({
        parent: w,
        rawValue: metric.value,
        value: roundTo5(metric.value),
      })) ?? []
  ) ?? [];

  const currentValue = typeof metricData?.metric?.value === 'number' ? roundTo5(metricData.metric.value) : undefined;
  const avgValue = typeof metricData?.metric?.avgValue === 'number' ? roundTo5(metricData.metric.avgValue) : undefined;
  const avgDiff = typeof metricData?.metric?.avgDiff === 'number' && Number.isFinite(metricData.metric.avgDiff)
    ? metricData.metric.avgDiff
    : undefined;

  const timestampText = useMemo(() => {
    const ts = metricData?.metric?.timestamp;

    if (typeof ts !== 'number') return '—';
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return '—';
    }
  }, [metricData?.metric?.timestamp]);

  const minValue = filteredWorkflows.length ? Math.min(...filteredWorkflows.map(w => w.value)) : undefined;
  const maxValue = filteredWorkflows.length ? Math.max(...filteredWorkflows.map(w => w.value)) : undefined;

  const minWorkflows = typeof minValue === 'number'
    ? filteredWorkflows.filter(w => w.value === minValue).map(w => w.parent)
    : [];
  const maxWorkflows = typeof maxValue === 'number'
    ? filteredWorkflows.filter(w => w.value === maxValue).map(w => w.parent)
    : [];

  const compareIdMin = useMemo(() => `compare-min-${Date.now()}`, []);
  const compareIdMax = useMemo(() => `compare-max-${Date.now() + 1}`, []);

  const handleClickMin = () => {
    if (minWorkflows.length > 1) {
      const workflowIds = minWorkflows.map(w => w.id);

      setCache(compareIdMin, { workflowIds }, 5 * 60 * 1000);
    }
  };

  const handleClickMax = () => {
    if (maxWorkflows.length > 1) {
      const workflowIds = maxWorkflows.map(w => w.id);

      setCache(compareIdMax, { workflowIds }, 5 * 60 * 1000);
    }
  };

  const renderDiffIcon = () => {
    if (typeof avgDiff !== 'number') return null;
    if (avgDiff === 0) return null;

    return avgDiff > 0 ? (
      <ArrowDropUpIcon sx={{ color: green[600], mb: 0.2 }} fontSize="small" />
    ) : (
      <ArrowDropDownIcon sx={{ color: red[600], mb: 0.2 }} fontSize="small" />
    );
  };

  const diffColor = typeof avgDiff === 'number' ? (avgDiff >= 0 ? green[700] : red[700]) : 'text.secondary';

  const percentile = useMemo(() => {
    if (typeof metricData?.metric?.value !== 'number') return undefined;
    const values = filteredWorkflows.map(w => w.rawValue).filter(v => typeof v === 'number' && Number.isFinite(v));

    if (values.length <= 1) return undefined;

    // Assumption: higher metric value is better.
    const below = values.filter(v => metricData?.metric?.value && v < metricData.metric.value).length;
    const totalOthers = values.length - 1;

    if (totalOthers <= 0) return undefined;

    return Math.round((below / totalOthers) * 100);
  }, [currentValue, filteredWorkflows]);

  const topPercent = typeof percentile === 'number' ? Math.max(0, 100 - percentile) : undefined;

  const histogram = useMemo(() => {
    const values = filteredWorkflows.map(w => w.rawValue).filter(v => typeof v === 'number' && Number.isFinite(v));

    if (!values.length || typeof currentValue !== 'number') return [] as Array<{ label: string; count: number; isYou: boolean }>;

    const min = Math.min(...values);
    const max = Math.max(...values);
    const binCount = 7;

    if (min === max) {
      return [{ label: `${roundTo5(min).toFixed(2)}–${roundTo5(max).toFixed(2)}`, count: values.length, isYou: true }];
    }

    const width = (max - min) / binCount;
    const bins = Array.from({ length: binCount }, (_, i) => {
      const start = min + i * width;
      const end = i === binCount - 1 ? max : min + (i + 1) * width;
      const label = `${start.toFixed(2)}–${end.toFixed(2)}`;

      return { start, end, label, count: 0, isYou: false };
    });

    for (const v of values) {
      const idx = Math.min(binCount - 1, Math.floor((v - min) / width));

      bins[idx].count += 1;
    }

    const youIdx = Math.min(binCount - 1, Math.max(0, Math.floor((currentValue - min) / width)));

    bins[youIdx].isYou = true;

    return bins.map(b => ({ label: b.label, count: b.count, isYou: b.isYou }));
  }, [currentValue, filteredWorkflows]);

  const distributionSpec = useMemo(() => {
    if (!histogram.length) return null;

    return {
      layer: [
        {
          mark: { type: 'bar', cornerRadiusTopLeft: 4, cornerRadiusTopRight: 4 },
          encoding: {
            x: {
              field: 'label',
              type: 'ordinal',
              axis: { title: null, labelAngle: 315, labelPadding: 6 },
              sort: null,
            },
            y: { field: 'count', type: 'quantitative', axis: { title: 'Workflows' } },
            color: {
              condition: { test: 'datum.isYou === true', value: '#1463ff' },
              value: '#d9d9d9',
            },
            tooltip: [
              { field: 'label', type: 'nominal', title: 'Range' },
              { field: 'count', type: 'quantitative', title: 'Workflows' },
            ],
          },
        },
        {
          transform: [{ filter: 'datum.isYou === true' }],
          mark: { type: 'text', dy: -10, fontWeight: 700, fill: '#1463ff' },
          encoding: {
            x: { field: 'label', type: 'ordinal' },
            y: { field: 'count', type: 'quantitative' },
          },
        },
      ],
      data: { values: histogram },
    };
  }, [histogram]);

  const isOnlyThisWorkflowMin =
    minWorkflows.length === 1 && minWorkflows[0].id === currentWorkflowId;

  const isOnlyThisWorkflowMax =
    maxWorkflows.length === 1 && maxWorkflows[0].id === currentWorkflowId;

  const getMinHref = () =>
    minWorkflows.length === 1
      ? `/${experimentId}/workflow?workflowId=${minWorkflows[0].id}`
      : `/${experimentId}/monitoring?tab=1&compareId=${compareIdMin}`;

  const getMaxHref = () =>
    maxWorkflows.length === 1
      ? `/${experimentId}/workflow?workflowId=${maxWorkflows[0].id}`
      : `/${experimentId}/monitoring?tab=1&compareId=${compareIdMax}`;

  const getMinText = () =>
    minWorkflows.length === 1 ? 'View workflow' : `View ${minWorkflows.length} workflows`;

  const getMaxText = () =>
    maxWorkflows.length === 1 ? 'View workflow' : `View ${maxWorkflows.length} workflows`;

  const sliderMin = typeof minValue === 'number' ? minValue : (typeof metricData?.metric?.minValue === 'number' ? metricData.metric.minValue : 0);
  const sliderMax = typeof maxValue === 'number' ? maxValue : (typeof metricData?.metric?.maxValue === 'number' ? metricData.metric.maxValue : 1);

  const MetricStatCard = ({ title, value, helper }: { title: string; value: React.ReactNode; helper?: React.ReactNode }) => (
    <Card elevation={0} sx={[cardSurfaceSx(), { flex: 1, minWidth: 260 }]}>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: -0.5 }}>
            {value}
          </Typography>
          {helper}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography variant="overline" color="text.secondary">
            Single Value Metric
          </Typography>
          {/* <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {metricData?.metric?.name ?? 'Metric'}
          </Typography> */}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {timestampText}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <MetricStatCard
          title="Current Value"
          value={format5(currentValue)}
          helper={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: diffColor }}>
              {renderDiffIcon()}
              <Typography variant="body2" sx={{ fontWeight: 600, color: diffColor }}>
                {typeof avgDiff === 'number'
                  ? `${avgDiff > 0 ? '+' : ''}${avgDiff.toFixed(2)}%`
                  : '—'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                vs avg
              </Typography>
            </Box>
          }
        />

        <MetricStatCard
          title="Percentile Ranking"
          value={
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '999px',
                bgcolor: theme => alpha(theme.palette.success.main, 0.1),
                color: 'success.dark',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                fontWeight: 800,
              }}
            >
              {typeof percentile === 'number' ? percentile : '—'}
            </Box>
          }
          helper={
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {typeof topPercent === 'number' ? `Top ${topPercent}%` : '—'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {typeof percentile === 'number'
                  ? `Outperforms ${percentile}% of workflows`
                  : 'Not enough data'}
              </Typography>
            </Box>
          }
        />
      </Box>

      {distributionSpec && (
        <div>
          <ResponsiveCardVegaLite
            spec={distributionSpec}
            actions={false}
            title="Distribution Across All Workflows"
            maxHeight={320}
            isStatic={false}
          />
        </div>
      )}

      <Paper elevation={0} sx={[cardSurfaceSx(), { p: 2 }]}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          Comparison Across All Workflows
        </Typography>
        <Box sx={{ position: 'relative', px: 1, py: 2 }}>
            {(() => {
              const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

              const isSingleValue =
                typeof sliderMin === 'number' &&
                typeof sliderMax === 'number' &&
                Number.isFinite(sliderMin) &&
                Number.isFinite(sliderMax) &&
                sliderMin === sliderMax;

              // Use a "fake" range for single-value case so Slider behaves predictably
              const min = isSingleValue ? 0 : sliderMin;
              const max = isSingleValue ? 1 : sliderMax;

              const youValue =
                typeof currentValue === 'number'
                  ? (isSingleValue ? 0.5 : clamp(currentValue, sliderMin, sliderMax))
                  : min;

              const avgValueClamped =
                typeof avgValue === 'number'
                  ? (isSingleValue ? 0.5 : clamp(avgValue, sliderMin, sliderMax))
                  : undefined;

              // Marker positions (match the slider range)
              const safeRange = max - min || 1;
              const youPct = ((youValue - min) / safeRange) * 100;
              const avgPct =
                typeof avgValueClamped === 'number' ? ((avgValueClamped - min) / safeRange) * 100 : undefined;

              return (
                <>
                  <Slider
                    value={youValue}
                    min={min}
                    max={max}
                    track="normal"
                    disabled
                    sx={{
                      '&.Mui-disabled': { opacity: 1 },

                      '& .MuiSlider-rail': {
                        height: 10,
                        borderRadius: 999,
                        backgroundColor: theme => theme.palette.customSurface.barTrack,
                        opacity: 1,
                      },
                      '& .MuiSlider-track': {
                        height: 10,
                        borderRadius: 999,
                        backgroundColor: theme => theme.palette.primary.main,
                        opacity: 0.9,
                        border: 'none',
                      },
                      '& .MuiSlider-thumb': { display: 'none' },
                    }}
                  />

                  {/* Average marker */}
                  {typeof avgPct === 'number' && (
                    <>
                      <Box
                        sx={{
                          position: 'absolute',
                          left: `calc(${Math.max(0, Math.min(100, avgPct))}%)`,
                          top: 16,
                          width: 2,
                          height: 26,
                          bgcolor: 'text.primary',
                          opacity: 0.35,
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          position: 'absolute',
                          left: `calc(${Math.max(0, Math.min(100, avgPct))}%)`,
                          top: 36,
                          transform: 'translateX(-50%)',
                          color: 'text.secondary',
                        }}
                      >
                        Avg
                      </Typography>
                    </>
                  )}

                  {/* "You" marker */}
                  {typeof currentValue === 'number' && (
                    <>
                      <Box
                        sx={{
                          position: 'absolute',
                          left: `calc(${Math.max(0, Math.min(100, youPct))}%)`,
                          top: 16,
                          width: 2,
                          height: 26,
                          bgcolor: 'primary.main',
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          left: `calc(${Math.max(0, Math.min(100, youPct))}%)`,
                          top: 26,
                          width: 10,
                          height: 10,
                          borderRadius: 999,
                          bgcolor: 'primary.main',
                          transform: 'translateX(-50%)',
                        }}
                      />
                    </>
                  )}
                </>
              );
            })()}
          </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Card elevation={0} sx={[cardSurfaceSx(), { flex: 1, minWidth: 240 }]}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary">Minimum</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5 }}>{format5(minValue)}</Typography>
              {!isOnlyThisWorkflowMin && minWorkflows.length > 0 && (
                <Box
                  component="a"
                  href={getMinHref()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleClickMin}
                  sx={{ color: 'primary.main', textDecoration: 'underline', display: 'inline-block', mt: 0.5 }}
                >
                  {getMinText()}
                </Box>
              )}
            </CardContent>
          </Card>

          <Card elevation={0} sx={[cardSurfaceSx(), { flex: 1, minWidth: 240, bgcolor: theme => alpha(theme.palette.primary.main, 0.08) }]}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary">Average</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5, color: 'primary.main' }}>{format5(avgValue)}</Typography>
              <Typography variant="caption" color="text.secondary">Baseline</Typography>
            </CardContent>
          </Card>

          <Card elevation={0} sx={[cardSurfaceSx(), { flex: 1, minWidth: 240 }]}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary">Maximum</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5 }}>{format5(maxValue)}</Typography>
              {!isOnlyThisWorkflowMax && maxWorkflows.length > 0 && (
                <Box
                  component="a"
                  href={getMaxHref()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleClickMax}
                  sx={{ color: 'primary.main', textDecoration: 'underline', display: 'inline-block', mt: 0.5 }}
                >
                  {getMaxText()}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Paper>
    </Box>
  );
};
