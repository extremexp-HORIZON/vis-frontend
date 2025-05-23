import ResponsiveCardVegaLite from '../../../shared/components/responsive-card-vegalite';
import type { RootState } from '../../../store/store';
import { useAppSelector } from '../../../store/store';
import type { IMetric } from '../../../shared/models/experiment/metric.model';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import green from '@mui/material/colors/green';
import red from '@mui/material/colors/red';
import { useParams } from 'react-router-dom';
import { DetailsCard, DetailsCardItem } from '../../../shared/components/details-card';
import { useMemo } from 'react';
import { setCache } from '../../../shared/utils/localStorageCache';
import { useLocation } from 'react-router-dom';

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
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('xl'));
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
        field: metrics[0].step === null ? 'timestamp' : 'step', // Use the 'step' field for the x-axis (time or step sequence)
        type: 'ordinal',
        axis: { labels: false, title: metrics[0].step === null ? 'Timestamp' : 'Step' }, // Hide x-axis labels
      },
      y: {
        field: 'value', // Use the 'value' field for the y-axis (metric values like CPU Load)
        type: 'quantitative',
        axis: { title: metrics[0].metricName }, // Title the y-axis based on the metric name
        scale: {
          domain: [
            0, // Min value is 0 (or any other value you'd like)
            metrics.reduce(
              (max, d) => Math.max(max, d.value),
              -Infinity
            ) * 1.05, // Max value with 5% padding
          ],
        },
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
    <Box sx={{ height: '99%' }}>
      <ResponsiveCardVegaLite
        spec={chartSpec}
        actions={false}
        title={metrics[0].task ? `${metrics[0].task}／${metrics[0].metricName}` : metrics[0].metricName}
        aspectRatio={isSmallScreen ? 4 : 2}
        maxHeight={500}
      />
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
          overflow: 'auto', // enables scrolling when table minHeight is applied in the overview page
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

  const filteredWorkflows = workflows?.data?.flatMap(w =>
    w.metrics?.filter(metric => metric.name === metricData?.metric?.name)
      .map(metric => ({
        parent: w,
        rawValue: metric.value,
        value: roundTo5(metric.value),
      })) ?? []
  ) ?? [];

  const minValue = Math.min(...filteredWorkflows.map(w => w.value));
  const maxValue = Math.max(...filteredWorkflows.map(w => w.value));

  const minWorkflows = filteredWorkflows.filter(w => w.value === minValue).map(w => w.parent);
  const maxWorkflows = filteredWorkflows.filter(w => w.value === maxValue).map(w => w.parent);

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
    if (!metricData?.metric?.avgDiff) return null;

    return metricData.metric.avgDiff > 0 ? (
      <ArrowDropUpIcon sx={{ color: green[500], mb: 1 }} />
    ) : (
      <ArrowDropDownIcon sx={{ color: red[500], mb: 1 }} />
    );
  };

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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, width: '100%' }}>
      <DetailsCard title="Metric Details">
        <DetailsCardItem label="Metric" value={metricData?.metric?.name} />
        <DetailsCardItem label="Value" value={metricData?.metric?.value?.toFixed(5)} />
        {metricData?.metric?.task && <DetailsCardItem label="Logged in Task" value={metricData.metric?.task} />}
        <DetailsCardItem
          label="Timestamp"
          value={typeof metricData?.metric?.timestamp === 'number'
            ? new Date(metricData.metric?.timestamp).toLocaleString()
            : undefined}
        />
      </DetailsCard>

      <DetailsCard title="Comparison Across All Workflows">
        <DetailsCardItem
          label="Average"
          value={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body1">
                {metricData?.metric?.avgValue?.toFixed(5)} — Difference: {Number.isFinite(metricData?.metric?.avgDiff) ? metricData?.metric?.avgDiff.toFixed(2) : '0.00'}%
              </Typography>
              {renderDiffIcon()}
            </Box>
          }
        />

        <DetailsCardItem
          label="Minimum"
          value={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body1" sx={{ mr: 1 }}>
                {minValue.toFixed(5)}
              </Typography>
              {!isOnlyThisWorkflowMin && (
                <>
                  {' — '}
                  <Box
                    component="a"
                    href={getMinHref()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleClickMin}
                    sx={{ color: 'primary.main', textDecoration: 'underline', ml: 1 }}
                  >
                    {getMinText()}
                  </Box>
                </>
              )}
            </Box>
          }
        />

        <DetailsCardItem
          label="Maximum"
          value={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body1" sx={{ mr: 1 }}>
                {maxValue.toFixed(5)}
              </Typography>
              {!isOnlyThisWorkflowMax && (
                <>
                  {' — '}
                  <Box
                    component="a"
                    href={getMaxHref()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleClickMax}
                    sx={{ color: 'primary.main', textDecoration: 'underline', ml: 1 }}
                  >
                    {getMaxText()}
                  </Box>
                </>
              )}
            </Box>
          }
        />
      </DetailsCard>
    </Box>
  );
};
