import { useEffect, useMemo } from 'react';
import { Box } from '@mui/material';
import InfoMessage from '../../../../../shared/components/InfoMessage';
import AssessmentIcon from '@mui/icons-material/Assessment';
import Loader from '../../../../../shared/components/loader';
import { useAppDispatch, useAppSelector } from '../../../../../store/store';
import type { RootState } from '../../../../../store/store';
import { fetchComparisonData } from '../../../../../store/slices/monitorPageSlice';
import type { IAggregation } from '../../../../../shared/models/dataexploration.model';
import type { IDataAsset } from '../../../../../shared/models/experiment/data-asset.model';
import type { VisualizationSpec } from 'react-vega';
import { VegaLite } from 'react-vega';
import { Handler } from 'vega-tooltip';

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

  // Create color mapping for tooltip
  const colorMapping = useMemo(() => {
    const { domain, range } = colorScale(workflowIds);
    return Object.fromEntries(domain.map((id, index) => [id, range[index]]));
  }, [workflowIds, colorScale]);

  const tooltipHandler = new Handler({
    sanitize: (v: any) => String(v),
    formatTooltip: (value: Record<string, any>, sanitize) => {
      const bin = value[columnName] ?? value['binLabel'];
      const wfRaw = value['Workflows'] ?? value['tooltipAll'] ?? '';
      
      // Parse workflow counts from the tooltip data
      const wfLines = String(wfRaw)
        .split('<br>')
        .map(line => {
          const [workflowId, count] = line.split(': ');
          const color = colorMapping[workflowId] || '#999';
          return `<div style="display: flex; align-items: center; margin: 2px 0;">
            <span style="display: inline-block; width: 12px; height: 12px; background-color: ${color}; margin-right: 6px; border-radius: 2px;"></span>
            <span>${sanitize(workflowId)}: ${sanitize(count || '0')}</span>
          </div>`;
        })
        .join('');
      
      const wfTitle = workflowIds.length === 1 ? 'Workflow' : 'Workflows';
      
      return `
        <div style="white-space: normal; max-width: 600px;">
          <div><strong>${sanitize(columnName)}:</strong> ${sanitize(bin ?? '')}</div>
          <div><strong>${wfTitle}</strong></div>
          ${wfLines}
        </div>
      `;
    }
  }).call;

  useEffect(() => {
    assets.forEach(({ workflowId, dataAsset }) => {
      const hist = slices[workflowId];
      const source = dataAsset?.source || '';

      if (!source) return;

      const meta = metas[workflowId];
      const metaReady = Boolean(meta?.data) && !meta?.loading && !meta?.error;

      if (!metaReady) return;

      const alreadyHasData =
        Array.isArray(hist?.data?.data) && hist!.data!.data.length > 0;

      if (hist?.loading || alreadyHasData) return;

      dispatch(
        fetchComparisonData({
          query: {
            dataSource: {
              source,
              format: dataAsset?.format || '',
              sourceType: dataAsset?.sourceType || '',
              fileName: dataAsset?.name || '',
              runId: workflowId || ''
            },
            groupBy: [columnName],
            aggregations: [agg],
            filters: [],
            columns: [columnName],
            // limit: 1,
          },
          metadata: {
            workflowId,
            queryCase: 'barChart',
            assetName,
            columnName,
          },
        })
      );
    });
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
      let min = Infinity, max = -Infinity;

      Object.values(rawByWorkflow).forEach(arr => {
        arr.forEach(d => {
          const v = d[columnName], c = d[countField];

          if (typeof v === 'number' && typeof c === 'number') {
            if (v < min) min = v;
            if (v > max) max = v;
          }
        });
      });

      if (isFinite(min) && isFinite(max)) {
        const N = 10;
        const range = max - min;
        let bins: { start: number; end: number }[];

        if (range === 0) {
          bins = [{ start: min, end: min }];
        } else {
          const size = range / N;
          const start0 = Math.floor(min / size) * size;

          bins = Array.from({ length: N }, (_, i) => {
            const s = start0 + i * size;

            return { start: s, end: s + size };
          });
        }

        const size = bins.length > 1 ? bins[0].end - bins[0].start : 0;
        const label = (s: number, e: number) => (s === e ? `${s.toFixed(2)}` : `${s.toFixed(2)} – ${e.toFixed(2)}`);

        workflowIds.forEach(wid => {
          const arr = rawByWorkflow[wid] || [];
          const counts = bins.map(b => ({ ...b, count: 0 }));

          arr.forEach(d => {
            const v = d[columnName], c = d[countField];

            if (typeof v !== 'number' || typeof c !== 'number') return;
            if (bins.length === 1) {
              counts[0].count += c;
            } else {
              const idx = Math.max(0, Math.min(Math.floor((v - bins[0].start) / size), bins.length - 1));

              counts[idx].count += c;
            }
          });
          counts.forEach(b => {
            out.push({
              binLabel: label(b.start, b.end),
              xStart: b.start,
              count: b.count,
              workflowId: wid
            });
          });
        });
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

  const spec: VisualizationSpec = useMemo(() => {
    const ids = workflowIds;
    const { domain, range } = colorScale(ids);

    const layers = ids.map(wid => ({
      mark: { type: 'bar', opacity: 0.45, size: 15 },
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
      width: 150,
      height: 180,
      data: { values: rows },
      encoding: {
        x: {
          field: 'binLabel',
          type: 'ordinal',
          title: null,
          sort: isNumeric ? { field: 'xStart', op: 'min' } : 'ascending',
          axis: { labels: false, ticks: false, domain: false }
        },
        y: { field: 'count', type: 'quantitative', title: 'Count' },
        tooltip: [
          { field: 'binLabel', type: 'nominal', title: columnName },
          { field: 'tooltipAll', type: 'nominal', title: 'Workflows' }
        ]
      },
      layer: layers
    } as VisualizationSpec;
  }, [rows, isNumeric, workflowIds, colorScale, columnName]);

  return (
    loading ? (
      <Loader />
    ) : showInfo ? (
      <InfoMessage
        message={!hasData ? 'No data available.' : 'Error fetching the data.'}
        type="info"
        icon={<AssessmentIcon sx={{ fontSize: 40, color: 'info.main' }} />}
        fullHeight
      />
    ) : (
      <Box
        sx={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <VegaLite spec={spec} actions={false} tooltip={tooltipHandler} />
      </Box>
    )
  );
};

export default OverlayHistogram;