import type React from 'react';
import { useEffect, useRef, useMemo, useCallback } from 'react';
import type { View } from 'vega';
import type { RootState } from '../../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import {
  Grid,
  Container,
  Box,
  useTheme,
} from '@mui/material';
import ResponsiveCardVegaLite from '../../../../shared/components/responsive-card-vegalite';
import InfoMessage from '../../../../shared/components/InfoMessage';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { fetchWorkflowMetrics, setComparativeVisibleMetrics, setHoveredWorkflow } from '../../../../store/slices/monitorPageSlice';
import Loader from '../../../../shared/components/loader';
import ResponsiveCardTable from '../../../../shared/components/responsive-card-table';
import { createWorkflowTooltipHandler, paletteFromTheme } from './workflow-info-tooltip';

interface BaseMetric {
  id: string
  name: string
  value: number
  [key: string]: string | number | boolean | null | undefined
}

const ComparisonMetricsCharts: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { workflowsTable, selectedWorkflowsMetrics } = useAppSelector(
    (state: RootState) => state.monitorPage,
  );
  const { workflows } = useAppSelector(
    (state: RootState) => state.progressPage,
  );
  const loadingByMetric = useAppSelector(
    (state: RootState) => state.monitorPage.selectedWorkflowsMetrics.loadingByMetric
  );

  const experimentId = useAppSelector(
    (state: RootState) => state.progressPage.experiment.data?.id || '',
  );
  const comparativeVisibleMetrics = useAppSelector((state: RootState) => state.monitorPage.comparativeVisibleMetrics);
  const previousSelectedRef = useRef<string[]>([]);
  const hasFetchedOnInit = useRef(false);
  const lastHoverRef = useRef<string | null>(null);

  const isMosaic = useAppSelector(
    (state: RootState) => state.monitorPage.isMosaic,
  );

  const { hoveredWorkflowId } = workflowsTable;
  const previousVisibleRef = useRef<string[]>([]);

  // --- Cross-chart hover highlight, decoupled from React re-renders ----------
  // The highlight lives in a static Vega `hoveredId` signal baked into every
  // spec, so changing the hovered workflow never alters spec *content* — Vega
  // never re-embeds/redraws the whole chart. We push the value into each live
  // chart view imperatively, and still mirror it to Redux so the workflow table
  // stays in sync (cross-highlight between table and charts).
  const viewsRef = useRef<Map<string, View>>(new Map());
  const hoveredRef = useRef<string>('');

  const registerView = useCallback((metricName: string, view: View) => {
    viewsRef.current.set(metricName, view);
    try {
      view.signal('hoveredId', hoveredRef.current);
      void view.runAsync();
    } catch { /* view not ready / disposed */ }
  }, []);

  const handleHoverSignal = useCallback(
    (_name: string, value: unknown) => {
      const v = value as { id?: string | string[] } | null | undefined;
      const raw = v && v.id
        ? (Array.isArray(v.id) ? v.id[0] : v.id) ?? null
        : null;

      if (raw !== lastHoverRef.current) {
        lastHoverRef.current = raw;
        dispatch(setHoveredWorkflow(raw));
      }
    },
    [dispatch],
  );

  const signalListeners = useMemo(() => ({ hover: handleHoverSignal }), [handleHoverSignal]);

  // Reliable clear: Vega's mark `mouseout` can be missed on fast bar-to-bar
  // movement (and we no longer re-embed to reset it), leaving the highlight
  // stuck. A DOM mouseleave on the chart cell always fires, so clear there.
  const clearHover = useCallback(() => {
    if (lastHoverRef.current !== null) {
      lastHoverRef.current = null;
      dispatch(setHoveredWorkflow(null));
    }
  }, [dispatch]);

  useEffect(() => {
    const id = hoveredWorkflowId === null ? '' : String(hoveredWorkflowId);

    hoveredRef.current = id;
    viewsRef.current.forEach((view) => {
      try {
        view.signal('hoveredId', id);
        void view.runAsync();
      } catch { /* view disposed */ }
    });
  }, [hoveredWorkflowId]);

  const getCommonMetrics = (workflowIds: string[]) => {
    if (!workflowIds.length) return [];

    const allMetrics = workflowIds.map(id =>
      workflows.data.find(wf => wf.id === id)?.metrics?.map(m => m.name) || []
    );

    return allMetrics.reduce((acc, curr) => acc.filter(m => curr.includes(m)));
  };

  // when we fetch workflows we need to clear the previous metrics and fetch new in case they are changed
  useEffect(() => {
    hasFetchedOnInit.current = false;
  }, [workflows.data]);

  useEffect(() => {
    hasFetchedOnInit.current = false;
  }, [workflowsTable.groupBy]);

  // fetch first five common selected workflows metrics
  useEffect(() => {
    if (workflowsTable.initialized && experimentId && !hasFetchedOnInit.current) {
      const isGrouped = workflowsTable.groupBy.length > 0;

      const initialMetrics = (isGrouped
        ? workflowsTable.uniqueMetrics
        : getCommonMetrics(workflowsTable.selectedWorkflows)
      )
        .filter(m => m !== 'rating')
        .slice(0, 5);

      if (initialMetrics.length === 0) return;

      dispatch(setComparativeVisibleMetrics(initialMetrics));

      if (!isGrouped && workflowsTable.selectedWorkflows.length > 0) {
        workflowsTable.selectedWorkflows.forEach(workflowId => {
          dispatch(fetchWorkflowMetrics({ experimentId, workflowId, metricNames: initialMetrics }));
        });

        previousSelectedRef.current = workflowsTable.selectedWorkflows;
      }

      hasFetchedOnInit.current = true;
    }
  }, [workflows.data, workflowsTable.initialized, workflowsTable.selectedWorkflows]);

  // fetch only new selected workflows
  useEffect(() => {
    if (!workflowsTable.initialized || !experimentId || !hasFetchedOnInit.current) return;

    const previousSelected = previousSelectedRef.current;
    const currentSelected = workflowsTable.selectedWorkflows;

    const added = currentSelected.filter(id => !previousSelected.includes(id));

    previousSelectedRef.current = currentSelected;

    added.forEach(workflowId => {
      const availableMetricNames =
        workflows.data.find(wf => wf.id === workflowId)?.metrics?.map(m => m.name) || [];

      const comparativeMetrics = comparativeVisibleMetrics
        .filter(m => m !== 'rating')
        .filter(m => availableMetricNames.includes(m));

      const existingWorkflows = selectedWorkflowsMetrics.data?.[workflowId] || [];
      const existingNames = new Set(existingWorkflows.map(m => m.name));

      const missingMetrics = comparativeMetrics.filter(m => !existingNames.has(m));

      if (missingMetrics.length) {
        dispatch(fetchWorkflowMetrics({ experimentId, workflowId, metricNames: missingMetrics }));
      }
    });
  }, [workflowsTable.selectedWorkflows, workflowsTable.initialized]);

  // fetch only new selected metrics
  useEffect(() => {
    if (!experimentId || !workflowsTable.initialized) return;

    const prev = previousVisibleRef.current;
    const curr = comparativeVisibleMetrics;

    const added = curr.filter(m => !prev.includes(m));

    if (added.length > 0) {
      workflowsTable.selectedWorkflows.forEach(workflowId => {
        const metricNames = workflows.data
          .find(wf => wf.id === workflowId)
          ?.metrics?.map(m => m.name)
          .filter(m => added.includes(m));

        if (metricNames?.length) {
          dispatch(fetchWorkflowMetrics({ experimentId, workflowId, metricNames }));
        }
      });
    }

    previousVisibleRef.current = curr;
  }, [comparativeVisibleMetrics]);

  const normalizeTimestamp = (timestamp: number | undefined): string | undefined => {
    if (timestamp === null || timestamp === undefined) return undefined;
    const date = new Date(timestamp);

    return isNaN(date.getTime()) ? undefined : date.toISOString();
  };

  const isMetricPending = (metricName: string) => {
    return workflowsTable.selectedWorkflows.some((wid) => {
      const m = loadingByMetric?.[wid];

      return m ? !!m[metricName] : false;
    });
  };

  const groupedMetrics: Record<string, BaseMetric[]> = {};

  if (workflowsTable.groupBy.length > 0) {
    workflowsTable.uniqueMetrics
      .filter(metric => metric !== 'rating')
      .filter(metric => comparativeVisibleMetrics.includes(metric))
      .forEach(metricName => {
        groupedMetrics[metricName] = [];

        workflowsTable.aggregatedRows
          .filter(row => workflowsTable.selectedWorkflows.includes(row.id))
          .forEach(row => {
            const value = row[metricName];

            if (typeof value === 'number' && !isNaN(value)) {
              const enriched: BaseMetric = {
                id: row.id,
                name: metricName,
                value,
              };

              workflowsTable.groupBy.forEach(groupKey => {
                enriched[groupKey] = row[groupKey];
              });

              groupedMetrics[metricName].push(enriched);
            }
          });
      });

  } else {
    const selectedWorkflowIds = workflowsTable.selectedWorkflows;

    selectedWorkflowIds.forEach(workflowId => {
      const metrics = selectedWorkflowsMetrics?.data?.[workflowId] || [];
      const row = workflowsTable.filteredRows.find(r => r.id === workflowId);

      metrics.filter(({ name }) => name !== 'rating' && comparativeVisibleMetrics.includes(name))
        .forEach(({ name, seriesMetric }) => {
          if (name === 'rating') return;

          seriesMetric.forEach(metric => {
            if (typeof metric.value !== 'number' || isNaN(metric.value)) return;

            const enriched: BaseMetric = {
              id: workflowId,
              name,
              value: metric.value,
              step: metric.step,
              timestamp: normalizeTimestamp(metric.timestamp),
            };

            workflowsTable.groupBy.forEach(groupKey => {
              enriched[groupKey] = row?.[groupKey];
            });

            if (!groupedMetrics[name]) {
              groupedMetrics[name] = [];
            }

            groupedMetrics[name].push(enriched);
          });
        });
    });
  }

  const metricNames = comparativeVisibleMetrics.filter((m) => groupedMetrics[m]);

  const renderCharts = metricNames.map((metricName) => {
    const metricSeries = groupedMetrics[metricName];

    if (isMetricPending(metricName)) {
      return (
        <Grid
          size={{ xs: isMosaic ? 6 : 12 }}
          key={metricName}
          sx={{ textAlign: 'left' }}
          onMouseLeave={clearHover}
        >
          <ResponsiveCardTable
            title={metricName}
            minHeight={300}
            showSettings={false}
            // Reserve the gear's footprint while loading so it doesn't pop in and
            // shove the fullscreen button when the chart swaps in.
            headerActions={<Box aria-hidden sx={{ width: 30, height: 30 }} />}
          >
            <Loader />
          </ResponsiveCardTable>
        </Grid>
      );
    }
    const isGrouped = workflowsTable.groupBy.length > 0;

    // Determine if line chart is needed: any workflow with multiple values for this metric
    const isLineChart = (() => {
      if (isGrouped) return false;

      const workflowCounts = new Map<string, number>();

      metricSeries.forEach(m => {
        workflowCounts.set(m.id, (workflowCounts.get(m.id) ?? 0) + 1);
      });

      return Array.from(workflowCounts.values()).some(count => count > 1);
    })();

    const hasStep = isLineChart && metricSeries.every(m => m.step !== undefined && m.step !== null);
    const hasTimestamp = metricSeries.some(m => m.timestamp !== undefined && m.timestamp !== null);

    const xField = isLineChart
      ? hasStep
        ? 'step'
        : hasTimestamp
          ? 'timestamp'
          : 'id'
      : 'id';

    const xType = xField === 'timestamp' ? 'temporal' : 'ordinal';

    const xTitle = (() => {
      if (!isLineChart) return isGrouped ? workflowsTable.groupBy.join(', ') : 'Workflow';
      if (xField === 'timestamp') return 'Timestamp';
      if (xField === 'step') return isGrouped ? workflowsTable.groupBy.join(', ') : 'Step';

      return 'Workflow';
    })();

    // Set up color scale
    const workflowColorScale = workflowsTable.selectedWorkflows.map(id => ({
      id,
      color: workflowsTable.workflowColors[id] || '#000000',
    }));

    const numericValues = metricSeries
      .map(d => d.value)
      .filter((v): v is number => typeof v === 'number' && !Number.isNaN(v));

    const yMin = Math.min(...numericValues);
    const yMax = Math.max(...numericValues);

    const equalPadding = 0.05;

    const yScale =
    isLineChart
      ? {
        zero: false,
        nice: false,
        domain: [yMin - equalPadding, yMax + equalPadding],
      }
      : {
        domain: [0, yMax * 1.05],
      };

    const mark = isLineChart
      ? {
        type: 'line',
        tooltip: true,
        point: {
          size: 20,
        },
      }
      : { type: 'bar', tooltip: true };

    // Cap the bar width so a single (or few) selected workflow doesn't render a
    // giant bar. Band-scale padding is width-independent, so padding a lone bar
    // makes it match the width it would have when ~2 bars are present.
    const barCount = new Set(metricSeries.map(d => String(d[xField]))).size;
    const barPaddingOuter = Math.max(0.05, (2.1 - barCount) / 2);

    // Vega-Lite spec
    const chartSpec = {
      params: [
        {
          name: 'hover',
          select: { type: 'point', fields: ['id'], on: 'mouseover', clear: 'mouseout' },
        },
        // Highlight target, updated imperatively (see registerView / hover effect)
        // so hovering never changes the spec content and never re-embeds Vega.
        { name: 'hoveredId', value: '' },
      ],
      mark,
      encoding: {
        x: {
          field: xField,
          type: xType,
          ...(isLineChart ? {} : { scale: { paddingInner: 0.1, paddingOuter: barPaddingOuter } }),
          axis: {
            title: xTitle,
            ...(xType === 'temporal' ? { format: '%b %d %H:%M' } : { labels: false }),
          },
        },
        y: {
          field: 'value',
          type: 'quantitative',
          axis: { title: metricName },
          scale: yScale,
        },
        color: {
          field: 'id',
          type: 'nominal',
          scale: {
            domain: workflowColorScale.map(w => w.id),
            range: workflowColorScale.map(w => w.color),
          },
          legend: null,
        },
        // Static highlight driven by the `hoveredId` signal: dim non-hovered
        // marks; when nothing is hovered (signal === '') everything is full
        // opacity. Stroke outline only for bars — for lines the colour *is* the
        // stroke, so overriding it would hide the line.
        opacity: {
          condition: { test: "hoveredId === '' || datum.id === hoveredId", value: 1 },
          value: 0.35,
        },
        ...(isLineChart ? {} : {
          strokeWidth: {
            condition: { test: "hoveredId !== '' && datum.id === hoveredId", value: 3 },
            value: 0,
          },
          stroke: {
            condition: { test: "hoveredId !== '' && datum.id === hoveredId", value: '#000' },
            value: 'transparent',
          },
        }),
        tooltip: [
          ...(isGrouped ? [] : [{ field: 'id', type: 'nominal', title: 'Workflow' }]),
          ...workflowsTable.groupBy.map(field => ({
            field,
            type: 'nominal',
            title: field
          })),
          ...(isLineChart && xField !== 'id'
            ? [{ field: xField, type: xType, title: xTitle }]
            : []),
          {
            field: 'value',
            type: 'quantitative',
            title: isGrouped ? 'AVG Value' : 'Value',
          },
        ]
      },
      data: { values: metricSeries },
    };
    const tooltipHandler = !isGrouped ? createWorkflowTooltipHandler({
      metricName,
      metricSeries,
      isLineChart,
      xField: xField,
      workflowsData: workflows.data,
      experimentId,
      palette: paletteFromTheme(theme),
      colorMapping: workflowsTable.workflowColors
    })
      : undefined;

    return (
      <Grid
        size={{ xs: isMosaic ? 6 : 12 }}
        key={metricName}
        sx={{ textAlign: 'left' }}
        onMouseLeave={clearHover}
      >
        <ResponsiveCardVegaLite
          spec={chartSpec}
          actions={false}
          isStatic={false}
          title={metricName}
          sx={{ width: '100%', maxWidth: '100%' }}
          showSettings={true}
          tooltip={tooltipHandler}
          enableSorting={!isLineChart}
          signalListeners={signalListeners}
          onNewView={(view) => registerView(metricName, view)}
        />
      </Grid>
    );
  });

  if (workflowsTable.selectedWorkflows.length === 0) {
    return (
      <InfoMessage
        message="Select Workflows to display comparisons over metrics."
        type="info"
        icon={<AssessmentIcon sx={{ fontSize: 40, color: 'info.main' }} />}
        fullHeight
      />
    );
  }

  if (comparativeVisibleMetrics.length === 0) {
    return (
      <InfoMessage
        message="Select metrics to display."
        type="info"
        icon={<AssessmentIcon sx={{ fontSize: 40, color: 'info.main' }} />}
        fullHeight
      />
    );
  }

  return (
    <Container maxWidth={false} sx={{ padding: 2 }} >

      <Grid
        container
        spacing={2}
        sx={{ width: '100%', margin: '0 auto', flexWrap: 'wrap' }}
      >
        {renderCharts}
      </Grid>
    </Container>
  );
};

export default ComparisonMetricsCharts;
