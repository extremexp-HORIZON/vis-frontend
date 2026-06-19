import type React from 'react';
import { useMemo, useState } from 'react';
import {
  Box,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Stack,
  Typography,
  Tooltip,
  useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import type { RootState } from '../../../store/store';
import { useAppSelector } from '../../../store/store';
import type { ClusterInsight, PcaSpacePoint } from '../../../shared/models/experiment.highlights.model';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InfoMessage from '../../../shared/components/InfoMessage';
import ResponsiveCardVegaLite from '../../../shared/components/responsive-card-vegalite';
import { cardSurfaceSx } from '../../../shared/styles/card-surface';

const Sparkline = ({ values, color }: { values: number[]; color: string }) => {
  const w = 54;
  const h = 16;

  if (!values.length) return <Box sx={{ width: w, height: h }} />;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1 || 1)) * w;
    const y = h - ((v - min) / range) * h;

    return `${x},${y}`;
  });

  return (
    <svg width={w} height={h}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        points={pts.join(' ')}
      />
    </svg>
  );
};

const  MetricTile = ({
  name,
  value,
}: {
  name: string;
  value: number;
}) => {
  const theme = useTheme();
  const positive = value >= 0;

  return (
    <Box sx={[cardSurfaceSx(), { px: 2, py: 1.25 }]}>
      <Typography variant="caption" color="text.secondary">
        {name}
      </Typography>
      <Typography
        variant="h6"
        sx={{
          mt: 0.5,
          fontWeight: 700,
          color: positive
            ? theme.palette.success.main
            : theme.palette.error.main,
        }}
      >
        {Number.isFinite(value) ? value.toFixed(2) : String(value)}
      </Typography>
    </Box>
  );
};

const ClusterCard = ({
  cluster,
  clusterKey,
  index,
}: {
  cluster: ClusterInsight;
  clusterKey: string;
  index: number;
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(index === 0);

  const accentColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];

  const name = clusterKey;

  const accent = accentColors[index % accentColors.length];

  const nWorkflows = cluster?.metadata?.nWorkflows ?? 0;
  const pct = cluster?.metadata?.percentageOfTotal ?? 0;

  const rule = cluster?.decisionTreeRules?.[0]?.rule ?? '';

  const f1 = cluster?.modelEvaluation?.f1Score;
  const bal = cluster?.modelEvaluation?.balancedAccuracy;

  const metricTiles = useMemo(() => {
    const stats = cluster?.featureSelection?.featureStatistics ?? {};
    const items = Object.entries(stats).map(([k, v]: [string, { zScore?: number; clusterMean?: number }]) => ({
      key: k,
      z: Math.abs(Number(v?.zScore ?? 0)),
      mean: Number(v?.clusterMean ?? 0),
    }));

    items.sort((a, b) => b.z - a.z);

    return items.slice(0, 10);
  }, [cluster]);

  const sparkValues = metricTiles.map(m => m.mean);
  const clusterName = `Cluster ${name}`;

  return (
    <Box sx={cardSurfaceSx()}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 1.5,
          borderLeft: `4px solid ${accent}`,
          gap: 1.5,
        }}
      >
        <IconButton
          size="small"
          onClick={() => setOpen(v => !v)}
          sx={{
            transform: open ? 'rotate(360deg)' : 'rotate(270deg)',
            transition: 'transform 160ms ease',
          }}
        >
          <ExpandMoreIcon fontSize="small" />
        </IconButton>

        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {clusterName} ({nWorkflows})
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            // maxWidth: 350,
          }}
        >
          {rule || '—'}
        </Typography>

        <Sparkline values={sparkValues} color={accent} />

        <Typography variant="caption">
          F1: <strong>{typeof f1 === 'number' ? `${Math.round(f1 * 100)}%` : '—'}</strong>
        </Typography>

        <Typography variant="caption" color="text.secondary">
          bal: <strong>{typeof bal === 'number' ? `${Math.round(bal * 100)}%` : '—'}</strong>
        </Typography>

        <Tooltip title={cluster?.modelEvaluation?.qualityInterpretation?.split(' - ')[1] || 'No quality interpretation available'}>
          <Chip
            label={cluster?.modelEvaluation?.qualityInterpretation?.split(' - ')[0] || 'No Quality'}
            size="small"
            color={
              cluster?.modelEvaluation?.qualityInterpretation?.includes('Excellent')
                ? 'success'
                : cluster?.modelEvaluation?.qualityInterpretation?.includes('Medium')
                  ? 'warning'
                  : cluster?.modelEvaluation?.qualityInterpretation?.includes('Poor')
                    ? 'error'
                    : 'default'
            }
          />
        </Tooltip>

        <Box sx={{ flex: 1 }} />

        <Tooltip title="Analyze Pattern">
          <Box
            component="button"
            onClick={() => {}}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: theme.palette.primary.main,
              fontSize: 12,
            }}
          >
            Analyze Pattern <OpenInNewIcon sx={{ fontSize: 16 }} />
          </Box>
        </Tooltip>
      </Box>

      {/* Expanded */}
      <Collapse in={open}>
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Workflows in cluster: {nWorkflows} runs • {pct}% of total
          </Typography>

          <Divider sx={{ my: 1.5 }} />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 1.25,
            }}
          >
            {metricTiles.map(m => (
              <MetricTile key={m.key} name={m.key} value={m.mean} />
            ))}
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};

const HighlightsGroupsCards: React.FC = () => {
  const { experimentHighlights } = useAppSelector(
    (state: RootState) => state.experimentHighlights
  );
  const { data } = experimentHighlights;
  const theme = useTheme();

  const pcaSpace: PcaSpacePoint[] = useMemo(
    () => (data?.pcaSpace ?? []) as PcaSpacePoint[],
    [data]
  );

  const clusters = useMemo(() => {
    if (!data?.clusterInsights) return [];

    return Object.entries(data.clusterInsights).map(
      ([clusterKey, cluster]) => ({
        clusterKey,
        cluster,
      })
    );

  }, [data]);

  if (!data) return (
    <InfoMessage
      message={'No insights available for this experiment.'}
      type="info"
      icon={<AssessmentIcon sx={{ fontSize: 40, color: 'info.main' }} />}
      fullHeight
    />

  );

  return (
    <Box sx={{ p: 2 }}>
      {pcaSpace.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{ mb: 1.5, letterSpacing: 0.6 }}
          >

          </Typography>
          <ResponsiveCardVegaLite
            title="CLUSTER DISTRIBUTION"
            actions={false}
            spec={{
              description: 'PCA projection of workflows colored by cluster',
              mark: { type: 'point', tooltip: true },
              // Clone each datum so Vega can annotate rows without
              // mutating frozen/proxied Redux objects.
              data: { values: pcaSpace.map(p => ({ ...p })) },
              encoding: {
                x: {
                  field: 'PC_1',
                  type: 'quantitative',
                  title: 'PC 1',
                },
                y: {
                  field: 'PC_2',
                  type: 'quantitative',
                  title: 'PC 2',
                },
                color: {
                  field: 'cluster',
                  type: 'nominal',
                  title: 'Cluster',
                  scale: {
                    // Align cluster colors with the group cards
                    domain: [0, 1, 2, 3],
                    range: [
                      theme.palette.primary.main,
                      theme.palette.secondary.main,
                      theme.palette.success.main,
                      theme.palette.warning.main,
                    ],
                  },
                  legend: { title: 'Cluster' },
                },
                tooltip: [
                  {
                    field: 'workflowId',
                    type: 'nominal',
                    title: 'Workflow ID',
                  },
                  { field: 'cluster', type: 'nominal', title: 'Cluster' },
                  { field: 'PC_1', type: 'quantitative', title: 'PC 1' },
                  { field: 'PC_2', type: 'quantitative', title: 'PC 2' },
                ],
              },
            }}
          />
        </Box>
      )}
      <Typography variant="subtitle2" sx={{ mb: 2, letterSpacing: 0.6 }}>
        EXPERIMENT GROUPS
      </Typography>

      <Stack spacing={2}>
        {clusters.map((cluster, idx) => (
          <ClusterCard
            key={cluster.clusterKey}
            cluster={cluster.cluster}
            clusterKey={cluster.clusterKey}
            index={idx}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default HighlightsGroupsCards;
