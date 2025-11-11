import { Handler } from 'vega-tooltip';
import type { IRun } from '../../../shared/models/experiment/run.model';
import type { RootState } from '../../../store/store';

interface ExperimentExplainabilityTooltipProps {
  workflowIds: string[];
  runs: IRun[];
  workflowColors: Record<string, string>;
  xAxisName?: string;
  yAxisName?: string;
  axisType?: string;
  selectedFeature?: string;
  selectedFeature2?: string;
  experimentId?: string;
}

export const createExperimentExplainabilityTooltipHandler = ({
  workflowIds,
  runs,
  workflowColors,
  xAxisName = 'xAxis default',
  yAxisName = 'yAxis default',
  axisType = 'numerical',
  selectedFeature,
  selectedFeature2,
  experimentId
}: ExperimentExplainabilityTooltipProps) => {
  const runById = new Map<string, IRun>();
  runs.forEach(r => runById.set(r.id, r));

  const allParamNames = Array.from(
    new Set(
      workflowIds.flatMap(wid => 
        runById.get(wid)?.params?.map(p => p.name) || []
      )
    )
  ).sort();

  const allMetricNames = Array.from(
    new Set(
      workflowIds.flatMap(wid => 
        runById.get(wid)?.metrics?.map(m => m.name) || []
      )
    )
  ).sort();

  const handler = new Handler({
    sanitize: (v: any) => {
      if (v == null) return '';
      if (typeof v === 'number') return v.toFixed(4);
      return String(v);
    },
    formatTooltip: (value: Record<string, any>, sanitize) => {
      let xValue = '';
      let yValue = '';
      let zValue = '';

      if (value[xAxisName]) {
        xValue = value[xAxisName];
      } else if (value.x !== undefined) {
        xValue = value.x;
      } else if (value.feature1 !== undefined) {
        xValue = value.feature1;
      } else {
        const keys = Object.keys(value).filter(key => 
          key !== yAxisName &&
          key !== 'y' && 
          key !== 'value' &&
          key !== 'Average Predicted Value' &&
          key !== 'z'
        );
        if (keys.length > 0) {
          xValue = value[keys[0]];
        }
      }

      if (value[yAxisName]) {
        yValue = value[yAxisName];
      } else if (value.y !== undefined) {
        yValue = value.y;
      } else if (value.feature2 !== undefined) {
        yValue = value.feature2;
      } else {
        const keys = Object.keys(value).filter(key => 
          key !== xAxisName &&
          key !== 'x' && 
          key !== 'value' &&
          key !== 'Average Predicted Value' &&
          key !== 'z' &&
          key !== xValue
        );
        if (keys.length > 0) {
          yValue = value[keys[0]];
        }
      }

      if (value.z !== undefined) {
        zValue = value.z;
      } else if (value.value !== undefined) {
        zValue = value.value;
      } else if (value['Average Predicted Value'] !== undefined) {
        zValue = value['Average Predicted Value'];
      }

      if (!xValue && !yValue) {
        const availableData = Object.entries(value)
          .map(([key, val]) => `<div><strong>${sanitize(key)}:</strong> ${sanitize(val)}</div>`)
          .join('');
        
        return `
          <div style="max-width: 400px;">
            <div style="margin-bottom: 8px; font-weight: bold;">Available Data:</div>
            ${availableData}
          </div>
        `;
      }

      const filteredWorkflowIds = (selectedFeature && selectedFeature2) 
        ? workflowIds.filter(wid => {
            const run = runById.get(wid);
            if (!run) return false;
            
            const param1 = run.params?.find(p => p.name === selectedFeature);
            const param2 = run.params?.find(p => p.name === selectedFeature2);
            
            if (!param1 || !param2) return false;
            
            const param1Value = String(param1.value);
            const param2Value = String(param2.value);
            const hoveredXValue = String(xValue);
            const hoveredYValue = String(yValue);
            
            return param1Value === hoveredXValue && param2Value === hoveredYValue;
          })
        : selectedFeature 
          ? workflowIds.filter(wid => {
              const run = runById.get(wid);
              if (!run) return false;
              
              const param = run.params?.find(p => p.name === selectedFeature);
              if (!param) return false;
              
              const paramValue = String(param.value);
              const hoveredValue = String(xValue);
              
              return paramValue === hoveredValue;
            })
          : workflowIds;
      const compareKey = `compare-${Date.now()}`;

      const compareLink = experimentId 
        ? `/${experimentId}/monitoring?tab=1&compareId=${compareKey}`
        : '#';

      const header = `
        <div style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #e0e0e0;">
          ${selectedFeature ? `<div><strong>${sanitize(selectedFeature)}:</strong> ${sanitize(xValue)}</div>` : ''}
          ${selectedFeature2 ? `<div><strong>${sanitize(selectedFeature2)}:</strong> ${sanitize(yValue)}</div>` : ''}
          ${zValue ? `<div><strong>Average Prediction:</strong> ${sanitize(zValue)}</div>` : ''}
        </div>
      `;

      const headerCells = [
        '<th style="text-align:left; padding:4px 8px;">Workflow</th>',
        ...allParamNames.map(
          n => `<th style="text-align:left; padding:4px 8px;">${sanitize(n)}</th>`
        ),
        ...allMetricNames.map(
          n => `<th style="text-align:right; padding:4px 8px;">${sanitize(n)}</th>`
        ),
      ].join('');

      const body = filteredWorkflowIds.map(wid => {
        const color = workflowColors[wid] || '#3f51b5';
        
        const params = runById.get(wid)?.params ?? [];
        const paramMap = new Map(params.map(p => [p.name, p.value]));
        
        const metrics = runById.get(wid)?.metrics ?? [];
        const metricMap = new Map(metrics.map(m => [m.name, m.value]));

        const paramCells = allParamNames
          .map(name => {
            const paramValue = paramMap.get(name);
            const isSelectedFeature = name === selectedFeature || name === selectedFeature2;
            const style = isSelectedFeature ? 'font-weight: bold; background-color: #f0f0f0;' : '';
            return `<td style="padding:4px 8px; vertical-align:top; ${style}">${sanitize(paramValue ?? '')}</td>`;
          })
          .join('');

        const metricCells = allMetricNames
          .map(name => {
            const metricValue = metricMap.get(name);
            return `<td style="text-align:right; padding:4px 8px; vertical-align:top;">${
              typeof metricValue === 'number' ? metricValue.toFixed(4) : sanitize(metricValue ?? '')
            }</td>`;
          })
          .join('');

        return `
          <tr>
            <td style="white-space:nowrap; vertical-align:top; padding:4px 8px;">
              <span style="display:inline-block;width:12px;height:12px;background-color:${sanitize(color)};border-radius:2px;margin-right:6px;"></span>
              ${sanitize(wid)}
            </td>
            ${paramCells}
            ${metricCells}
          </tr>
        `;
      }).join('');

      if (filteredWorkflowIds.length === 0) {
        let filterMessage = '';
        if (selectedFeature && selectedFeature2) {
          filterMessage = `No workflows found with ${selectedFeature} = ${sanitize(xValue)} and ${selectedFeature2} = ${sanitize(yValue)}`;
        } else if (selectedFeature) {
          filterMessage = `No workflows found with ${selectedFeature} = ${sanitize(xValue)}`;
        } else {
          filterMessage = 'No workflows found';
        }
        
        return `
          <div style="max-width: 600px; white-space: normal;">
            ${header}
            <div style="color: #666; font-style: italic; margin-top: 8px;">
              ${filterMessage}
            </div>
          </div>
        `;
      }

      let titleText = '';
      if (selectedFeature && selectedFeature2) {
        titleText = `Workflows with ${selectedFeature} = ${sanitize(xValue)} and ${selectedFeature2} = ${sanitize(yValue)} (${filteredWorkflowIds.length} of ${workflowIds.length}):`;
      } else if (selectedFeature) {
        titleText = `Workflows with ${selectedFeature} = ${sanitize(xValue)} (${filteredWorkflowIds.length} of ${workflowIds.length}):`;
      } else {
        titleText = `All Workflows (${workflowIds.length}):`;
      }

    const compareButton = filteredWorkflowIds.length > 0 ? `
      <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e0e0e0; text-align: center;">
        <a 
          href="${compareLink}"
          target="_blank"
          rel="noopener noreferrer"
          style="
            display: inline-block;
            background-color: #1976d2;
            color: white;
            padding: 6px 12px;
            border-radius: 4px;
            text-decoration: none;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
          "
          onclick='
            (function(event) {
              event.preventDefault(); // ensure we save before navigating
              const DEFAULT_TTL = 10 * 60 * 1000; // 10 minutes
              function setCache(key, data, ttl = DEFAULT_TTL) {
                const payload = { data: data, expires: Date.now() + ttl };
                localStorage.setItem(key, JSON.stringify(payload));
              }
              const compareData = ${JSON.stringify({ workflowIds: filteredWorkflowIds })};
              setCache("${compareKey}", compareData);
    
              // open after saving
              window.open("${compareLink}", "_blank", "noopener,noreferrer");
            })(event);
          '
        >
          Compare ${filteredWorkflowIds.length} Workflow${filteredWorkflowIds.length > 1 ? 's' : ''}
        </a>
      </div>
    ` : '';

return `
  <div style="max-width: 800px; max-height: 400px; white-space: normal; display:flex; flex-direction:column;">
    ${header}

    <div style="font-size: 12px; margin-top: 8px;">
      <strong>${titleText}</strong>
    </div>

    <!-- Scroll area ONLY for the table -->
    <div style="margin-top:6px; flex:1 1 auto; overflow:auto; border:1px solid #e0e0e0; border-radius:4px;">
      <table style="border-collapse:collapse; font-size:11px; width:max-content; min-width:100%;">
        <thead>
          <tr style="border-bottom: 1px solid #e0e0e0;">${headerCells}</tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>

    ${filteredWorkflowIds.length > 0 ? `
      <!-- Footer OUTSIDE the scroller, won’t move horizontally -->
      <div style="flex:0 0 auto; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e0e0e0; text-align: center;">
        <a 
          href="${compareLink}"
          target="_blank"
          rel="noopener noreferrer"
          style="
            display: inline-block;
            background-color: #1976d2;
            color: white;
            padding: 6px 12px;
            border-radius: 4px;
            text-decoration: none;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
          "
          onclick='
            (function(event) {
              event.preventDefault(); // ensure we save before navigating
              const DEFAULT_TTL = 10 * 60 * 1000; // 10 minutes
              function setCache(key, data, ttl = DEFAULT_TTL) {
                const payload = { data: data, expires: Date.now() + ttl };
                localStorage.setItem(key, JSON.stringify(payload));
              }
              const compareData = ${JSON.stringify({ workflowIds: filteredWorkflowIds })};
              setCache("${compareKey}", compareData);
              window.open("${compareLink}", "_blank", "noopener,noreferrer");
            })(event);
          '
        >
          Compare ${filteredWorkflowIds.length} Workflow${filteredWorkflowIds.length > 1 ? 's' : ''}
        </a>
      </div>
    ` : ''}
  </div>
`;
    }
  });

  return handler.call;
};