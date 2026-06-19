import { Box, Typography, Tooltip, useTheme, alpha } from '@mui/material';
import type { ISpan, SpanType } from './mock-data';
import { CHART_NEUTRAL } from '../../../mui-theme';

const SPAN_COLORS: Record<SpanType, string> = {
  CHAIN:     CHART_NEUTRAL,
  RETRIEVAL: '#0ea5e9',
  EMBEDDING: '#8b5cf6',
  LLM:       '#10b981',
  TOOL:      '#f59e0b',
};

interface Props {
  spans: ISpan[];
  totalDurationMs: number;
}

const TraceWaterfall = ({ spans, totalDurationMs }: Props) => {
  const theme = useTheme();
  const labelW = 200;
  const rowH = 28;
  const padding = 12;
  const max = totalDurationMs || 1;

  const ordered = [...spans].sort((a, b) => a.startMs - b.startMs);

  return (
    <Box sx={{ width: '100%', overflow: 'auto' }}>
      <Box sx={{ position: 'relative', minWidth: 600 }}>
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
                fontSize: '0.65rem',
                color: 'text.secondary',
                fontFamily: '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace',
                textAlign: i === 0 ? 'left' : 'right',
                pr: i === 5 ? 0.5 : 0,
              }}
            >
              {Math.round((max / 5) * i)}ms
            </Box>
          ))}
        </Box>

        {ordered.map(span => {
          const left = (span.startMs / max) * 100;
          const width = Math.max(0.6, ((span.endMs - span.startMs) / max) * 100);
          const indent = span.parentId ? 12 : 0;
          const color = SPAN_COLORS[span.type];

          return (
            <Box
              key={span.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                height: rowH,
                '&:hover': { bgcolor: theme.palette.action.hover },
                borderRadius: 0.5,
              }}
            >
              <Box
                sx={{
                  width: labelW,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  pl: `${indent}px`,
                  pr: 1,
                  flexShrink: 0,
                  minWidth: 0,
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: color,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace',
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={span.name}
                >
                  {span.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.6rem',
                    ml: 'auto',
                    flexShrink: 0,
                  }}
                >
                  {span.type}
                </Typography>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  position: 'relative',
                  height: rowH,
                  pr: `${padding}px`,
                }}
              >
                <Tooltip
                  arrow
                  title={
                    <Box sx={{ p: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
                        {span.name}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block' }}>
                        {Math.round(span.endMs - span.startMs)}ms ({Math.round(span.startMs)}→{Math.round(span.endMs)})
                      </Typography>
                      {Object.entries(span.attributes).map(([k, v]) => (
                        <Typography key={k} variant="caption" sx={{ display: 'block', opacity: 0.85 }}>
                          {k}: <strong>{String(v)}</strong>
                        </Typography>
                      ))}
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
                      bgcolor: span.status === 'ERROR' ? theme.palette.error.main : color,
                      opacity: span.parentId ? 0.85 : 0.55,
                      border: `1px solid ${alpha(color, 0.6)}`,
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                      '&:hover': {
                        transform: 'scaleY(1.15)',
                        boxShadow: `0 0 0 2px ${alpha(color, 0.3)}`,
                      },
                    }}
                  />
                </Tooltip>
              </Box>
              <Typography
                variant="caption"
                sx={{
                  width: 64,
                  textAlign: 'right',
                  fontFamily: '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace',
                  color: 'text.secondary',
                  flexShrink: 0,
                  pr: 1,
                }}
              >
                {Math.round(span.endMs - span.startMs)}ms
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default TraceWaterfall;
