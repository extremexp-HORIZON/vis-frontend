import { Handler } from 'vega-tooltip';
import type { IRun } from '../../../../shared/models/experiment/run.model';

type SeriesPoint = {
  id: string;
  value: number;
  step?: number | string;
  timestamp?: string;
  [k: string]: any;
};

export function createTooltipHandler(opts: {
  metricName: string;
  metricSeries: SeriesPoint[];
  isLineChart: boolean;
  xField: 'id' | 'step' | 'timestamp';
  workflowsData: IRun[];
  experimentId: string;
  colorMapping?: Record<string, string>;
}) {
  const { metricName, metricSeries, isLineChart, xField, workflowsData, experimentId, colorMapping = {} } = opts;

  const toSeriesPointLike = (v: Record<string, any>): SeriesPoint => ({
    id: v.id ?? v.Workflow ?? v.workflow ?? v.wf ?? '',
    value: v.value ?? v.Value ?? v.val ?? v.metric ?? undefined,
    step: v.step ?? v.Step,
    timestamp: v.timestamp ?? v.Timestamp,
    ...v,
  });

  return new Handler({
    sanitize: (v: any) => String(v),
    formatTooltip: (value: Record<string, any>, sanitize) => {
      const raw = toSeriesPointLike(value);

      const rows: SeriesPoint[] = !isLineChart
        ? metricSeries.filter(d => d.id === raw.id)
        : metricSeries.filter(d => d[xField] === raw[xField]);

      const paramNameSet = new Set<string>();

      rows.forEach(row => {
        const params = workflowsData.filter(workflow => workflow.id === raw.id)[0]?.params ?? [];

        params.forEach(p => paramNameSet.add(p.name));
      });
      const paramNames = Array.from(paramNameSet).sort();

      const header = isLineChart
        && `<div><strong>${xField === 'step' ? 'Step' : 'Timestamp'}:</strong> ${sanitize(raw[xField])}</div>`;

      const headerCells = [
        '<th style="text-align:left; padding:4px;">Workflow</th>',
        '<th style="text-align:right; padding:4px;">Value</th>',
        ...paramNames.map(param => `<th style="text-align:left; padding:4px;">${sanitize(param)}</th>`),
      ].join('');

      const body = rows
        .map(row => {
          const run = workflowsData.filter(workflow => workflow.id === row.id)[0];
          const params = run?.params ?? [];

          const pmap = new Map<string, string>(params.map(p => [p.name, p.value]));

          const paramTds = paramNames
            .map(n => `<td style="padding:4px; vertical-align:top;">${sanitize(pmap.get(n) ?? '')}</td>`)
            .join('');

          const valueCell = row.value != null ? sanitize(Number(row.value).toFixed(4)) : '-';
          const color = colorMapping[row.id];

          return `
            <tr>
              <td style="white-space:nowrap; vertical-align:top; padding:4px;">
                <span style="display:inline-block;width:12px;height:12px;background-color:${sanitize(color)};border-radius:2px;margin-right:6px;"></span>
                  <a href="/${sanitize(experimentId)}/workflow?workflowId=${encodeURIComponent(row.id)}">
                    ${sanitize(row.id)}
                  </a>
              </td>
              <td style="text-align:right; vertical-align:top; padding:4px;">
                ${valueCell}
              </td>
              ${paramTds}
            </tr>
          `;
        })
        .join('');

      return `
        <div style="white-space: normal;">
          ${header ? header : ''}
          <div><strong>Metric:</strong> ${sanitize(metricName)}</div>
          <table style="border-collapse:collapse; margin-top:6px; font-size:12px;">
            <thead>
              <tr>${headerCells}</tr>
            </thead>
            <tbody>
              ${body}
            </tbody>
          </table>
        </div>
      `;
    }
  }).call;
}
