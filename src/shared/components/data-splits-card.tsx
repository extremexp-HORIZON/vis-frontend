import * as React from 'react';
import { Box, Typography } from '@mui/material';

type SplitKey = string;

const DEFAULT_SPLIT_ORDER: SplitKey[] = ['train', 'validation', 'test'];

const SPLIT_META: Record<SplitKey, { label: string; color: string }> = {
  train: { label: 'Training', color: '#3b82f6' },
  validation: { label: 'Validation', color: '#a855f7' },
  test: { label: 'Test', color: '#16a34a' },
};

function normalizeKey(key: string) {
  return key.trim().toLowerCase();
}

function pct(n: number, total: number) {
  if (!total) return 0;
  return (n / total) * 100;
}

function formatPct(p: number) {
  return `${Math.round(p)}%`;
}

export interface DataSplitsCardContentProps {
  dataSplitSizes: Record<string, number>;
}

export function DataSplitsCardContent({ dataSplitSizes }: DataSplitsCardContentProps) {
  const entries = React.useMemo(() => {
    const raw = Object.entries(dataSplitSizes || {})
      .filter(([, v]) => typeof v === 'number' && !Number.isNaN(v))
      .map(([k, v]) => ({ key: normalizeKey(k), rawKey: k, size: v }));

    raw.sort((a, b) => {
      const ai = DEFAULT_SPLIT_ORDER.indexOf(a.key);
      const bi = DEFAULT_SPLIT_ORDER.indexOf(b.key);
      const aRank = ai === -1 ? 999 : ai;
      const bRank = bi === -1 ? 999 : bi;
      if (aRank !== bRank) return aRank - bRank;
      return a.key.localeCompare(b.key);
    });

    return raw;
  }, [dataSplitSizes]);

  const total = entries.reduce((sum, e) => sum + (e.size || 0), 0);

  const enriched = entries.map((e) => {
    const meta = SPLIT_META[e.key] ?? {
      label: e.rawKey.charAt(0).toUpperCase() + e.rawKey.slice(1),
      color: '#64748b',
    };
    const percent = pct(e.size, total);
    return { ...e, ...meta, percent };
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography sx={{ color: '#64748b', fontWeight: 600, fontSize: 13 }}>
        Total: {total.toLocaleString()} samples
      </Typography>

      <Box
        sx={{
          height: 30,
          width: '100%',
          borderRadius: 5,
          overflow: 'hidden',
          display: 'flex',
          backgroundColor: '#e2e8f0',
        }}
      >
        {enriched.map((s, idx) => (
          <Box
            key={`${s.key}-${idx}`}
            sx={{
              width: `${s.percent}%`,
              minWidth: s.size > 0 ? 10 : 0,
              backgroundColor: s.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {idx !== 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 2,
                  backgroundColor: '#ffffff',
                }}
              />
            )}

            <Typography
              sx={{
                color: '#fff',
                fontWeight: 800,
                fontSize: 13,
                px: 0.5,
                whiteSpace: 'nowrap',
              }}
            >
              {formatPct(s.percent)}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 1,
        }}
      >
        {enriched.map((s, idx) => (
          <Box
            key={`tile-${s.key}-${idx}`}
            sx={{
              backgroundColor: '#f8fafc',
              borderRadius: 5,
              px: 1,
              py: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: 2,
                  backgroundColor: s.color,
                }}
              />
              <Typography sx={{ fontWeight: 600 }}>
                {s.label}
              </Typography>
            </Box>

            <Typography sx={{ fontWeight: 600}}>
              {s.size.toLocaleString()}
            </Typography>

            <Typography sx={{ fontWeight: 600, color: '#64748b', fontSize: 13 }}>
              {formatPct(s.percent)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
