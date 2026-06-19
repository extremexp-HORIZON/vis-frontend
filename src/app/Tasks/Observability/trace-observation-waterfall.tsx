import { Box, Stack, Typography, Tooltip, useTheme, alpha } from '@mui/material';
import type { Observation } from '../../../shared/models/observability/observation';
import { CHART_NEUTRAL } from '../../../mui-theme';

const MONO = '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace';

export const TYPE_COLORS: Record<string, string> = {
  GENERATION: '#10b981',
  SPAN: CHART_NEUTRAL,
  EVENT: '#f59e0b',
  RETRIEVAL: '#0ea5e9',
  RETRIEVER: '#0ea5e9',
  EMBEDDING: '#8b5cf6',
  TOOL: '#f59e0b',
  AGENT: '#ec4899',
  CHAIN: CHART_NEUTRAL,
};

export const colorForType = (type: string) => TYPE_COLORS[(type ?? '').toUpperCase()] ?? CHART_NEUTRAL;

const formatMs = (ms: number) =>
  ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${Math.round(ms)}ms`;

interface Props {
  observations: Observation[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

const ObservationWaterfall = ({ observations, selectedId, onSelect }: Props) => {
  const theme = useTheme();
  const labelW = 184;
  const rowH = 28;
  const padding = 12;

  const parsed = observations
    .map(o => {
      const start = Date.parse(o.startTime);
      const end = Date.parse(o.endTime);

      return { o, start, end: Number.isNaN(end) ? start : end };
    })
    .filter(p => !Number.isNaN(p.start));

  if (parsed.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        No observations recorded for this trace.
      </Typography>
    );
  }

  const t0 = Math.min(...parsed.map(p => p.start));
  const t1 = Math.max(...parsed.map(p => p.end));
  const max = Math.max(1, t1 - t0);

  const ordered = [...parsed].sort((a, b) => a.start - b.start);
  const presentTypes = Array.from(new Set(ordered.map(({ o }) => (o.type ?? '').toUpperCase()))).filter(Boolean);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Type legend */}
      <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', rowGap: 0.5, mb: 1 }}>
        {presentTypes.map(tp => (
          <Stack key={tp} direction="row" spacing={0.5} alignItems="center">
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: colorForType(tp) }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem', fontFamily: MONO }}>
              {tp}
            </Typography>
          </Stack>
        ))}
      </Stack>

      <Box sx={{ width: '100%', overflow: 'auto' }}>
        <Box sx={{ position: 'relative', minWidth: 560 }}>
          {/* Time axis */}
          <Box
            sx={{
              display: 'flex',
              ml: `${labelW}px`,
              pr: `${padding}px`,
              borderBottom: `1px dashed ${theme.palette.divider}`,
              mb: 0.5,
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <Box
                key={i}
                sx={{
                  flex: 1,
                  fontSize: '0.62rem',
                  color: 'text.secondary',
                  fontFamily: MONO,
                  textAlign: i === 0 ? 'left' : 'right',
                  pr: i === 5 ? 0.5 : 0,
                }}
              >
                {formatMs((max / 5) * i)}
              </Box>
            ))}
          </Box>

          {ordered.map(({ o, start, end }) => {
            const left = ((start - t0) / max) * 100;
            const width = Math.max(0.6, ((end - start) / max) * 100);
            const indent = o.parentObservationId ? 12 : 0;
            const color = colorForType(o.type);
            const isError = (o.level ?? '').toUpperCase() === 'ERROR';
            const durationMs = Math.round(end - start);
            const model = o.model ?? (o.input as { model?: string })?.model;
            const isSelected = selectedId === o.id;
            const clickable = Boolean(onSelect);

            return (
              <Box
                key={o.id}
                onClick={clickable ? () => onSelect?.(o.id) : undefined}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  height: rowH,
                  borderRadius: 0.75,
                  cursor: clickable ? 'pointer' : 'default',
                  bgcolor: isSelected ? alpha(color, 0.1) : 'transparent',
                  boxShadow: isSelected ? `inset 2px 0 0 ${color}` : 'none',
                  '&:hover': { bgcolor: isSelected ? alpha(color, 0.14) : theme.palette.action.hover },
                }}
              >
                <Box
                  sx={{
                    width: labelW,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    pl: `${indent + 4}px`,
                    pr: 1,
                    flexShrink: 0,
                    minWidth: 0,
                  }}
                >
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: MONO,
                      fontWeight: isSelected ? 700 : 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={o.name}
                  >
                    {o.name}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, position: 'relative', height: rowH, pr: `${padding}px` }}>
                  <Tooltip
                    arrow
                    title={
                      <Box sx={{ p: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
                          {o.name}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          {formatMs(durationMs)} · {o.type}
                        </Typography>
                        {model && (
                          <Typography variant="caption" sx={{ display: 'block', opacity: 0.85 }}>
                            model: <strong>{model}</strong>
                          </Typography>
                        )}
                        {o.statusMessage && (
                          <Typography variant="caption" sx={{ display: 'block', opacity: 0.85 }}>
                            {o.statusMessage}
                          </Typography>
                        )}
                      </Box>
                    }
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: (rowH - 14) / 2,
                        left: `${left}%`,
                        width: `${width}%`,
                        height: 14,
                        borderRadius: 0.75,
                        bgcolor: isError ? theme.palette.error.main : color,
                        opacity: isSelected ? 1 : o.parentObservationId ? 0.85 : 0.55,
                        border: `1px solid ${alpha(color, 0.6)}`,
                        boxShadow: isSelected ? `0 0 0 2px ${alpha(color, 0.35)}` : 'none',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease',
                      }}
                    />
                  </Tooltip>
                </Box>

                <Typography
                  variant="caption"
                  sx={{
                    width: 60,
                    textAlign: 'right',
                    fontFamily: MONO,
                    color: 'text.secondary',
                    flexShrink: 0,
                    pr: 1,
                  }}
                >
                  {formatMs(durationMs)}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default ObservationWaterfall;
