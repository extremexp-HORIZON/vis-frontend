import type { ViewListener } from 'react-vega';
import { Vega } from 'react-vega';
import { scheme } from 'vega';
import vegaTooltip from 'vega-tooltip';
import type { Axis, Item, Scale } from 'vega-typings/types';
import type { View } from 'vega';
import { useEffect, useState, useRef } from 'react';
import type { ParallelDataItem } from '../../../../shared/types/parallel.types';

interface ParallelCoordinateVegaProps {
  parallelData: ParallelDataItem[]
  progressParallel: { selected: string }
  foldArray: React.MutableRefObject<string[]>
  selectedWorkflows: string[]
  processedData: (ParallelDataItem & { selected: boolean })[]
}

function setValuesIfSelectedAndDefault(
  filteredOutValue: number,
  defaultValue: number,
) {
  return [
    {
      test: 'anySelected && parent.selected === false',
      value: filteredOutValue,
    },
    {
      value: defaultValue,
    },
  ];
}

const ParallelCoordinateVega = ({
  parallelData,
  progressParallel,
  foldArray,
  selectedWorkflows,
  processedData
}: ParallelCoordinateVegaProps) => {
  const [chartHeight, setChartHeight] = useState(window.innerHeight * 0.27);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [chartWidth, setChartWidth] = useState(0);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;

        setChartWidth(width);
        setChartHeight(Math.max(window.innerHeight * 0.27, 100));
      }
    });

    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  const handleNewView: ViewListener = (view: View) => {
    if (!view) return;
    let lastMouseEvent: MouseEvent | null = null;

    const tooltipHandler = vegaTooltip(view, {
      formatTooltip: (datum: Record<string, string | number | boolean>) => {
        const table = document.createElement('table');

        Object.entries(datum).forEach(([key, value]) => {
          const row = table.insertRow();
          const keyCell = row.insertCell();
          const valueCell = row.insertCell();

          keyCell.innerHTML = key;
          valueCell.innerHTML = ` <strong>${value}</strong>`;
        });

        return table.outerHTML;
      },
    });

    const canvas = document.querySelector('canvas');

    canvas?.addEventListener('mousemove', (e: MouseEvent) => {
      lastMouseEvent = e;
    });

    view.addSignalListener('hover', (name, value) => {
      if (value && lastMouseEvent) {
        tooltipHandler.call(view, lastMouseEvent, {} as Item, value);
      } else {
        tooltipHandler.call(view, new MouseEvent('mousemove'), {} as Item, null);
      }
    });

    window.addEventListener('scroll', () => {
      tooltipHandler.call(view, new MouseEvent('mousemove'), {} as Item, null);
    });
  };

  const columnNames = [...foldArray.current, progressParallel.selected];

  // generate scales:
  const numericValues = processedData
    .map(d => d[progressParallel.selected])
    .filter((v): v is number => typeof v === 'number' && !isNaN(v));

  let selectedLastColumnMin = Math.min(...numericValues);
  let selectedLastColumnMax = Math.max(...numericValues);

  // fallback to avoid breaking Vega when data is empty
  const isValidDomain = numericValues.length > 0;

  if (isValidDomain && selectedLastColumnMin === selectedLastColumnMax) {
    const padding = selectedLastColumnMin === 0 ? 1 : Math.abs(selectedLastColumnMin * 0.5);

    selectedLastColumnMin -= padding;
    selectedLastColumnMax += padding;
  }

  const generatedScales: Scale[] = [
    {
      name: 'ord',
      type: 'point',
      range: 'width',
      round: true,
      domain: { data: 'columnNames', field: 'data' },
    },
    {
      name: progressParallel.selected,
      type: 'linear',
      range: 'height',
      domain: {
        data: 'mydata',
        field: progressParallel.selected,
      },
      ...(isValidDomain && {
        domainMin: selectedLastColumnMin,
        domainMax: selectedLastColumnMax,
      }),
    },
  ];

  if (isValidDomain) {
    generatedScales.push({
      name: 'selectedLastColumnColorScale',
      type: 'linear',
      domain: {
        data: 'mydata',
        field: progressParallel.selected,
      },
      domainMin: selectedLastColumnMin,
      domainMax: selectedLastColumnMax,
      range: [
        scheme('category20')[2],
        scheme('category20')[5],
        scheme('category20')[1],
        scheme('category20')[0],
      ],
    });
  }

  for (const columnName of foldArray.current) {
    generatedScales.push({
      name: columnName,
      type: 'point',
      range: 'height',
      domain: { data: 'mydata', field: columnName },
      padding: 0.3,
    });
  }

  const generatedAxes: Axis[] = [];

  for (const columnName of columnNames) {
    generatedAxes.push({
      orient: 'left',
      scale: columnName,
      // only show the last column, other columns are shown as draggable objects
      title: columnName === progressParallel.selected ? columnName : '',
      offset: { scale: 'ord', value: columnName, mult: -1 },
    });
  }
  const numericFilteredData = processedData.filter((row: ParallelDataItem & { selected: boolean }) => {
    const key = progressParallel.selected;
    const val = Number(row[key]);

    return !isNaN(val);
  });

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <Vega
        actions={false}
        onNewView={handleNewView}
        style={{ width: '100%' }}
        spec={{
          height: chartHeight,
          width: chartWidth,
          padding: { top: 15, left: 2, right: 2, bottom: 2 },
          autosize: { type: 'fit', contains: 'padding' }, // Ensure the chart adjusts to container size
          config: {
            axisY: {
              titleY: -12,
              titleX: 10,
              titleAngle: 0,
              titleFontWeight: 'lighter',
              zindex: 3,
            },
          },
          data: [
            {
              name: 'mydata',
              values: numericFilteredData,
            },
            {
              name: 'columnNames',
              values: columnNames,
            },
            {
              name: 'gradientData',
              transform: [
                {
                  type: 'sequence',
                  start: selectedLastColumnMin,
                  stop: selectedLastColumnMax,
                  step: (selectedLastColumnMax - selectedLastColumnMin) / 256,
                },
              ],
            },
          ],
          signals: [
            {
              name: 'anySelected',
              value: selectedWorkflows.length > 0,
            },
            {
              name: 'hover',
              value: null,
              on: [
                {
                  events: '@oneDataLine:mouseover',
                  update:
                  '!anySelected || group().datum.selected ? group().datum : null',
                },
                { events: '@oneDataLine:mouseout', update: 'null' },
              ],
            },
          // {
          //   name: "width",
          //   init: "containerSize()[0]",
          //   on: [{ events: "window:resize", update: "containerSize()[0]" }],
          // },
          ],

          scales: generatedScales,
          axes: generatedAxes,
          marks: [
            {
              name: 'dataLines',
              type: 'group',
              role: 'frame',
              interactive: true,
              from: { data: 'mydata' },
              marks: [
                {
                  name: 'oneDataLine',
                  type: 'line',
                  from: { data: 'columnNames' },
                  encode: {
                    enter: {
                      x: { scale: 'ord', field: 'data' },
                      y: {
                        scale: { datum: 'data' },
                        field: { parent: { datum: 'data' } },
                      },
                      stroke: {
                        scale: 'selectedLastColumnColorScale',
                        field: { parent: progressParallel.selected },
                      },
                      interpolate: { value: 'natural' },
                    },
                    update: {
                      strokeWidth: { value: 2 },
                      zindex: setValuesIfSelectedAndDefault(2, 1),
                      strokeOpacity: setValuesIfSelectedAndDefault(0.1, 0.9),
                      stroke: [
                        {
                          test: 'anySelected && parent.selected === false', // if any line is selected and this line is not selected then grey it out
                          value: 'grey',
                        },
                        {
                          scale: 'selectedLastColumnColorScale',
                          field: { parent: progressParallel.selected },
                        },
                      ],
                    },
                    hover: {
                      strokeWidth: setValuesIfSelectedAndDefault(2, 5),
                      cursor: { value: 'pointer' },
                      strokeOpacity: setValuesIfSelectedAndDefault(0.1, 1),
                      zindex: setValuesIfSelectedAndDefault(1, 2),
                    },
                  },
                },
              ],
            },
            {
              name: 'colourRect',
              type: 'rect',
              from: { data: 'gradientData' },
              encode: {
                enter: {
                  x: { signal: 'width' },
                  y: {
                    scale: progressParallel.selected,
                    field: 'data',
                    offset: -3,
                  },
                  width: { value: 30 },
                  height: { value: 3 },
                  fill: {
                    scale: 'selectedLastColumnColorScale',
                    field: 'data',
                  },
                },
              },
            },
          ],
        }}
      />
    </div>
  );
};

export default ParallelCoordinateVega;
