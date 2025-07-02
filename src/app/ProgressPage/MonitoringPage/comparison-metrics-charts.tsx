import type React from 'react';
import { useEffect, useRef } from 'react';
import type { RootState } from '../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import {
  Grid,
  Container,
} from '@mui/material';
import ResponsiveCardVegaLite from '../../../shared/components/responsive-card-vegalite';
import InfoMessage from '../../../shared/components/InfoMessage';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { fetchWorkflowMetrics } from '../../../store/slices/monitorPageSlice';

interface BaseMetric {
  id: string
  name: string
  value: number
  [key: string]: string | number | boolean | null | undefined
}

const ComparisonMetricsCharts: React.FC = () => {
  const dispatch = useAppDispatch();
  const { workflowsTable, selectedWorkflowsMetrics } = useAppSelector(
    (state: RootState) => state.monitorPage,
  );
  const { workflows } = useAppSelector(
    (state: RootState) => state.progressPage,
  );
  const experimentId = useAppSelector(
    (state: RootState) => state.progressPage.experiment.data?.id || '',
  );
  const previousSelectedRef = useRef<string[]>([]);
  const hasFetchedOnInit = useRef(false);

  const isMosaic = useAppSelector(
    (state: RootState) => state.monitorPage.isMosaic,
  );

  const { hoveredWorkflowId } = workflowsTable;

  // when we fetch workflows we need to clear the previous metrics and fetch new in case they are changed
  useEffect(() => {
    hasFetchedOnInit.current = false;
  }, [workflows.data]);

  // fetch all selected workflows metrics
  useEffect(() => {
    if (workflowsTable.initialized && experimentId && !hasFetchedOnInit.current) {
      workflowsTable.selectedWorkflows.forEach(workflowId => {
        const metricNames = workflows.data.find(wf => wf.id === workflowId)?.metrics?.map(m => m.name);

        if (metricNames?.length) {
          dispatch(fetchWorkflowMetrics({ experimentId, workflowId, metricNames }));
        }
      });

      hasFetchedOnInit.current = true;
      previousSelectedRef.current = workflowsTable.selectedWorkflows;
    }
  }, [workflows.data, workflowsTable.initialized]);

  // fetch only new selected
  useEffect(() => {
    if (!workflowsTable.initialized || !experimentId || !hasFetchedOnInit.current) return;

    const previousSelected = previousSelectedRef.current;
    const currentSelected = workflowsTable.selectedWorkflows;

    const added = currentSelected.filter(id => !previousSelected.includes(id));

    previousSelectedRef.current = currentSelected;

    added.forEach(workflowId => {
      if (workflowId in selectedWorkflowsMetrics.data) return;

      const metricNames = workflows.data.find(wf => wf.id === workflowId)?.metrics?.map(m => m.name);

      if (metricNames?.length) {
        dispatch(fetchWorkflowMetrics({ experimentId, workflowId, metricNames }));
      }
    });
  }, [workflowsTable.selectedWorkflows, workflowsTable.initialized]);

  const normalizeTimestamp = (timestamp: number | undefined): string | undefined => {
    if (timestamp == null) return undefined;
    const date = new Date(timestamp);

    return isNaN(date.getTime()) ? undefined : date.toISOString();
  };

  const groupedMetrics: Record<string, BaseMetric[]> = {};

  if (workflowsTable.groupBy.length > 0) {
    workflowsTable.uniqueMetrics
      .filter(metric => metric !== 'rating')
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

      metrics.forEach(({ name, seriesMetric }) => {
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

  const renderCharts = Object.entries(groupedMetrics).map(([metricName, metricSeries]) => {
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
      if (!isLineChart) return isGrouped ? 'Workflow Group' : 'Workflow';
      if (xField === 'timestamp') return 'Timestamp';
      if (xField === 'step') return isGrouped ? 'Group Step' : 'Step';

      return 'Workflow';
    })();

    // Set up color scale
    const workflowColorScale = workflowsTable.selectedWorkflows.map(id => ({
      id,
      color: workflowsTable.workflowColors[id] || '#000000',
    }));

    const mark = isLineChart
      ? {
        type: 'line',
        tooltip: true,
        point: {
          size: 20,
        },
      }
      : 'bar';

    // Vega-Lite spec
    const chartSpec = {
      mark,
      encoding: {
        x: {
          field: xField,
          type: xType,
          axis: {
            title: xTitle,
            ...(xType === 'temporal' ? { format: '%b %d %H:%M' } : { labels: false }),
          },
        },
        y: {
          field: 'value',
          type: 'quantitative',
          axis: { title: metricName },
          scale: {
            domain: [
              0,
              Math.max(...metricSeries.map(d => d.value)) * 1.05,
            ],
          },
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
        opacity: hoveredWorkflowId ? {
          condition: { test: `datum.id === '${hoveredWorkflowId}'`, value: 1 },
          value: 0.5,
        } : undefined,

        strokeWidth: hoveredWorkflowId ? {
          condition: { test: `datum.id === '${hoveredWorkflowId}'`, value: 3 },
          value: 1,
        } : undefined,
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

    return (
      <Grid
        item
        xs={isMosaic ? 6 : 12}
        key={metricName}
        sx={{ textAlign: 'left', width: '100%' }}
      >
        <ResponsiveCardVegaLite
          spec={chartSpec}
          actions={false}
          isStatic={false}
          title={metricName}
          sx={{ width: '100%', maxWidth: '100%' }}
          showSettings={false}
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
