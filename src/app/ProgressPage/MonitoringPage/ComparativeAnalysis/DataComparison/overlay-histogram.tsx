import { useEffect, useMemo } from 'react';
import InfoMessage from '../../../../../shared/components/InfoMessage';
import AssessmentIcon from '@mui/icons-material/Assessment';
import Loader from '../../../../../shared/components/loader';
import { useAppDispatch, useAppSelector } from '../../../../../store/store';
import type { RootState } from '../../../../../store/store';
import { fetchComparisonData } from '../../../../../store/slices/monitorPageSlice';
import type { IAggregation } from '../../../../../shared/models/dataexploration.model';
import type { IDataAsset } from '../../../../../shared/models/experiment/data-asset.model';
import { Handler } from 'vega-tooltip';
import ResponsiveCardVegaLite from '../../../../../shared/components/responsive-card-vegalite';
import type { IRun } from '../../../../../shared/models/experiment/run.model';

export interface OverlayHistogramProps {
  assetName: string;
  columnName: string;
  assets: Array<{ workflowId: string; dataAsset: IDataAsset }>;
  colorScale: (ids: string[]) => { domain: string[]; range: string[] };
}

type Row = {
  binLabel: string;
  xStart?: number;
  count: number;
  workflowId: string;
  tooltipAll?: string;
};

function weightedQuantile(sorted: { value: number; count: number }[], q: number): number {
  const total = sorted.reduce((s, d) => s + d.count, 0);

  if (total <= 0) return sorted[0]?.value ?? 0;
  const target = q * total;
  let acc = 0;

  for (let i = 0; i < sorted.length; i++) {
    acc += sorted[i].count;
    if (acc >= target) return sorted[i].value;
  }

  return sorted[sorted.length - 1].value;
}

function hybridEdgesFromPooled(
  pooled: { value: number; count: number }[],
  bins: number,
  alpha: number
): number[] {
  if (pooled.length === 0) return [];
  const values = [...pooled]
    .filter(d => Number.isFinite(d.value) && Number.isFinite(d.count) && d.count > 0)
    .sort((a, b) => a.value - b.value);

  const min = values[0].value;
  const max = values[values.length - 1].value;

  if (min === max) return [min, max];

  const B = Math.max(1, bins);

  // Equal-width edges
  const widthEdges = Array.from({ length: B + 1 }, (_, i) => min + (i * (max - min)) / B);

  // Equal-frequency edges (weighted quantiles)
  const freqEdges = Array.from({ length: B + 1 }, (_, i) => {
    if (i === 0) return min;
    if (i === B) return max;

    return weightedQuantile(values, i / B);
  });

  // Interpolate
  const interp = widthEdges.map((w, i) => (1 - alpha) * w + alpha * freqEdges[i]);

  // --- Deduplicate with a tolerance tied to label precision (2 decimals) ---
  const decimals = 2;
  const unit = Math.pow(10, -decimals);        // ~0.01 in data units
  const tol = Math.max((max - min) * 1e-9, unit / 2); // be generous vs rounding

  const edges: number[] = [];

  for (let i = 0; i < interp.length; i++) {
    const x = i === 0 ? min : (i === interp.length - 1 ? max : interp[i]);

    if (edges.length === 0 || Math.abs(x - edges[edges.length - 1]) > tol) {
      edges.push(x);
    }
  }

  // Ensure at least two edges; otherwise force one bin over [min,max]
  if (edges.length < 2) return [min, max];

  // Guarantee exact min/max at ends
  edges[0] = min;
  edges[edges.length - 1] = max;

  return edges;
}

function formatRangeLabel(s: number, e: number) {
  return s === e ? `${s.toFixed(2)}` : `${s.toFixed(2)} – ${e.toFixed(2)}`;
}

const OverlayHistogram = ({
  assetName,
  columnName,
  assets,
  colorScale,
}: OverlayHistogramProps) => {
  const dispatch = useAppDispatch();
  const workflowIds = useMemo(() => assets.map(a => a.workflowId), [assets]);

  const slices = useAppSelector((state: RootState) =>
    Object.fromEntries(
      assets.map(({ workflowId }) => [
        workflowId,
        state.monitorPage.comparativeDataExploration
          .dataAssetsHistograms?.[assetName]?.[workflowId]?.[columnName]?.histogram
      ])
    )
  );

  const metas = useAppSelector((state: RootState) =>
    Object.fromEntries(
      assets.map(({ workflowId }) => [
        workflowId,
        state.monitorPage.comparativeDataExploration
          .dataAssetsMetaData?.[assetName]?.[workflowId]?.meta
      ])
    )
  );

  const agg: IAggregation = { column: columnName, function: 'COUNT' };

  const runs = useAppSelector((state: RootState) => state.progressPage.workflows.data);

  const { runById, allParamNames } = useMemo(() => {
    const map = new Map<string, IRun>();

    runs.forEach(r => map.set(r.id, r));

    const names = new Set<string>();

    workflowIds.forEach(wid => {
      const ps = map.get(wid)?.params ?? [];

      ps.forEach(p => names.add(p.name));
    });

    return { runById: map, allParamNames: Array.from(names).sort() };
  }, [runs, workflowIds]);

  // Create color mapping for tooltip
  const colorMapping = useMemo(() => {
    const { domain, range } = colorScale(workflowIds);

    return Object.fromEntries(domain.map((id, index) => [id, range[index]]));
  }, [workflowIds, colorScale]);

  const tooltipHandler = new Handler({
    sanitize: (v: any) => String(v),
    formatTooltip: (value: Record<string, any>, sanitize) => {
      const bin = value[columnName] ?? value['binLabel'];

      const rowsInBin = rows.filter(r => r.binLabel === bin);
      const countByWf = new Map<string, number>();

      rowsInBin.forEach(r => countByWf.set(r.workflowId, r.count));

      const headerCells = [
        '<th style="text-align:left; padding:4px;">Workflow</th>',
        '<th style="text-align:right; padding:4px;">Count</th>',
        ...allParamNames.map(
          n => `<th style="text-align:left; padding:4px;">${sanitize(n)}</th>`
        ),
      ].join('');

      const body = workflowIds.map(wid => {
        const color = colorMapping[wid] || '#999';
        const cnt = countByWf.get(wid) ?? 0;

        const params = runById.get(wid)?.params ?? [];
        const pmap = new Map<string, string>(params.map(p => [p.name, p.value]));

        const paramTds = allParamNames
          .map(n => `<td style="padding:4px; vertical-align:top;">${sanitize(pmap.get(n) ?? '')}</td>`)
          .join('');

        return `
          <tr>
            <td style="white-space:nowrap; vertical-align:top; padding:4px;">
              <span style="display:inline-block;width:12px;height:12px;background-color:${sanitize(color)};border-radius:2px;margin-right:6px;"></span>
              ${sanitize(wid)}
            </td>
            <td style="text-align:right; vertical-align:top; padding:4px;">
              ${sanitize(cnt)}
            </td>
            ${paramTds}
          </tr>
        `;
      }).join('');

      return `
        <div style="white-space: normal;">
          <div><strong>${sanitize(columnName)}:</strong> ${sanitize(bin ?? '')}</div>
          <table style="border-collapse:collapse; margin-top:6px; font-size:12px;">
            <thead><tr>${headerCells}</tr></thead>
            <tbody>${body}</tbody>
          </table>
        </div>
      `;
    }
  }).call;

  useEffect(() => {
    const pendingFetches = assets
      .filter(({ workflowId, dataAsset }) => {
        const hist = slices[workflowId];
        const source = dataAsset?.source;
        const meta = metas[workflowId];
        const metaReady = Boolean(meta?.data) && !meta?.loading && !meta?.error;
        const alreadyHasData = Array.isArray(hist?.data?.data) && hist!.data!.data.length > 0;

        return source && metaReady && !hist?.loading && !alreadyHasData;
      })
      .map(({ workflowId, dataAsset }) => ({
        workflowId,
        query: {
          dataSource: {
            source: dataAsset.source,
            format: dataAsset?.format || '',
            sourceType: dataAsset?.sourceType || '',
            fileName: dataAsset?.name || '',
            runId: workflowId || ''
          },
          groupBy: [columnName],
          aggregations: [agg],
          filters: [],
          columns: [columnName],
        }
      }));

    if (pendingFetches.length > 0) {
    // Dispatch all fetches at once
      Promise.all(
        pendingFetches.map(({ workflowId, query }) =>
          dispatch(fetchComparisonData({
            query,
            metadata: {
              workflowId,
              queryCase: 'barChart',
              assetName,
              columnName,
            },
          }))
        )
      );
    }
  }, [assetName, columnName, assets, metas, slices]);
  const norm = (s: string) => (s || '').replace(/-/g, '_');

  const {
    rows,
    isNumeric,
    anyLoading,
    anyError,
    hasData,
  } = useMemo(() => {
    const normalized = norm(columnName);
    const countField = `count_${normalized}`;

    const rawByWorkflow: Record<string, any[]> = {};

    workflowIds.forEach(wid => {
      rawByWorkflow[wid] = Array.isArray(slices[wid]?.data?.data)
        ? slices[wid]!.data!.data
        : [];
    });

    const anyLoading = workflowIds.some(
      wid => Boolean(slices[wid]?.loading) || Boolean(metas[wid]?.loading)
    );

    const anyError = workflowIds.some(
      wid => Boolean(slices[wid]?.error)
    );

    const isNumeric = Object.values(rawByWorkflow).some(arr =>
      arr.some(d => typeof d[columnName] === 'number')
    );

    let out: Row[] = [];

    if (!isNumeric) {
      workflowIds.forEach(wid => {
        (rawByWorkflow[wid] || []).forEach(d => {
          const label = d[columnName];
          const cnt = d[countField];

          if (typeof label !== 'undefined' && typeof cnt === 'number') {
            out.push({ binLabel: String(label), count: cnt, workflowId: wid });
          }
        });
      });
    } else {
      // Pool weighted values from all workflows
      const pooled: { value: number; count: number }[] = [];

      workflowIds.forEach(wid => {
        (rawByWorkflow[wid] || []).forEach(d => {
          const v = d[columnName], c = d[countField];

          if (typeof v === 'number' && typeof c === 'number' && Number.isFinite(v) && Number.isFinite(c)) {
            pooled.push({ value: v, count: c });
          }
        });
      });

      if (pooled.length > 0) {
        let min = Infinity, max = -Infinity;

        for (const { value } of pooled) {
          if (value < min) min = value;
          if (value > max) max = value;
        }
        if (isFinite(min) && isFinite(max)) {
          const N = 10;       // number of bins
          const alpha = 0.9;  // 0..1 blend (tune if desired)

          const edges = (min === max)
            ? [min, max]
            : hybridEdgesFromPooled(pooled, N, alpha);

          const bins = Array.from({ length: Math.max(1, edges.length - 1) }, (_, i) => ({
            start: edges[i],
            end: edges[i + 1],
            label: formatRangeLabel(edges[i], edges[i + 1]),
          }));

          // Count each workflow into the shared bins
          workflowIds.forEach(wid => {
            const arr = rawByWorkflow[wid] || [];
            const counts = bins.map(b => ({ ...b, count: 0 }));

            arr.forEach(d => {
              const v = d[columnName], c = d[countField];

              if (typeof v !== 'number' || typeof c !== 'number') return;

              if (bins.length === 1) {
                counts[0].count += c;

                return;
              }

              // Initial index guess
              let idx = Math.floor(((v - edges[0]) / (edges[edges.length - 1] - edges[0])) * (bins.length));

              if (idx < 0) idx = 0;
              if (idx >= bins.length) idx = bins.length - 1;

              // Clamp with guards for numerical errors
              while (idx > 0 && v < bins[idx].start) idx--;
              while (idx < bins.length - 1 && v >= bins[idx].end) idx++;

              counts[idx].count += c;
            });

            counts.forEach(b => {
              out.push({
                binLabel: b.label,
                xStart: b.start,
                count: b.count,
                workflowId: wid,
              });
            });
          });
        }
      }
    }

    const perBin: Record<string, Record<string, number>> = {};

    out.forEach(r => {
      if (!perBin[r.binLabel]) perBin[r.binLabel] = {};
      perBin[r.binLabel][r.workflowId] = (perBin[r.binLabel][r.workflowId] || 0) + (r.count || 0);
    });

    const binTooltip: Record<string, string> = {};

    Object.entries(perBin).forEach(([label, wfCounts]) => {
      const lines = workflowIds.map(wid => `${wid}: ${wfCounts[wid] ?? 0}`);

      binTooltip[label] = lines.join('<br>');
    });

    out = out.map(r => ({ ...r, tooltipAll: binTooltip[r.binLabel] }));

    const hasData = out.length > 0;

    return { rows: out, isNumeric, anyLoading, anyError, hasData };
  }, [assets, slices, metas, columnName, workflowIds]);

  const loading = anyLoading;
  const showInfo = (!loading && (!hasData || anyError));

  const spec = useMemo(() => {
    const ids = workflowIds;
    const { domain, range } = colorScale(ids);

    const layers = ids.map(wid => ({
      mark: { type: 'bar', opacity: 0.45 },
      transform: [{ filter: { field: 'workflowId', equal: wid } }],
      encoding: {
        color: {
          field: 'workflowId',
          type: 'nominal',
          scale: { domain, range },
          legend: null // Remove the legend
        }
      }
    }));

    return {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      description: `Overlay distribution of ${columnName} across per-workflow datasets`,
      data: { values: rows },
      encoding: {
        x: {
          field: 'binLabel',
          type: 'ordinal',
          title: null,
          sort: isNumeric ? { field: 'xStart', op: 'min' } : 'ascending',
          axis: { labels: false, ticks: false, domain: false },
          scale: { paddingInner: 0, paddingOuter: 0 }
        },
        y: { field: 'count', type: 'quantitative', title: 'Count' },
        tooltip: [
          { field: 'binLabel', type: 'nominal', title: columnName },
          { field: 'tooltipAll', type: 'nominal', title: 'Workflows' }
        ]
      },
      layer: layers
    };
  }, [rows, isNumeric, workflowIds, colorScale, columnName]);

  const loader = <Loader />;

  const errorMessage =
    <InfoMessage
      message={!hasData ? 'No data available.' : 'Error fetching the data.'}
      type="info"
      icon={<AssessmentIcon sx={{ fontSize: 40, color: 'info.main' }} />}
      fullHeight
    />;

  return (
    <ResponsiveCardVegaLite
      spec={spec}
      actions={false}
      isStatic={false}
      title={`${assetName} — ${columnName}`}
      sx={{ width: '100%', maxWidth: '100%' }}
      showInfoMessage={loading || showInfo}
      infoMessage={loading ? loader : showInfo ? errorMessage : <></>}
      showSettings={false}
      tooltip={tooltipHandler}
    />
  );
};

export default OverlayHistogram;
