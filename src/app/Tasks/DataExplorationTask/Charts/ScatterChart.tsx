import { Paper, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { VegaLite } from 'react-vega';
import { VisualColumn } from '../../../../shared/models/dataexploration.model';
import { cloneDeep } from 'lodash';

interface ScatterChartProps {
  viewMode: 'overlay' | 'stacked';
  data: any[];
  xAxis: VisualColumn | null;
  yAxis: VisualColumn[];
  colorBy: string;
  setColorBy: (colorBy: string) => void;
  columns: VisualColumn[];
}

const getColumnType = (columnType: string) => {
  switch (columnType) {
    case 'DOUBLE':
    case 'FLOAT':
    case 'INTEGER':
      return 'quantitative';
    case 'LOCAL_DATE_TIME':
      return 'temporal';
    case 'STRING':
    default:
      return 'nominal';
  }
};

const ScatterChart = ({ viewMode, data, xAxis, yAxis, colorBy, setColorBy, columns }: ScatterChartProps) => {
  const [chartSpecs, setChartSpecs] = useState<any[]>([]);
  const [dataCopy, setDataCopy] = useState<any[]>([]);

  useEffect(() => {
    if (xAxis && yAxis.length > 0) {
      const yAxisFields = yAxis.map(axis => axis.name);
      const dataCopy = cloneDeep(data);
      setDataCopy(dataCopy);

      // Build the Vega-Lite specifications
      if (viewMode === 'overlay') {
        const spec = {
          mark: 'point',
          autosize: { type: "fit", contains: "padding", resize: true },
          width: "container",
          height: 850,
          selection: {
            paintbrush: {
              type: 'multi',
              on: 'mouseover',
            //   nearest: true
            }
          },
          encoding: {
            x: {
              field: xAxis.name,
              type: getColumnType(xAxis.type),
              axis: { title: `${xAxis.name}` }
            },
            y: {
              field: 'value',
              type: getColumnType(yAxis[0].type),
              axis: { title: 'Values' }
            },
            color: {
              condition: {
                selection: 'paintbrush',
                field: colorBy && colorBy !== "None" ? colorBy : 'variable',
                type: getColumnType(columns.find(column => column.name === colorBy)?.type || 'nominal'),
                title: colorBy!=="None" ? colorBy: "Variables"
              },
              value: 'grey' // Default color for unselected points
            },
            size: { value: 75 }, // Size of points
            // tooltip: [
            //   { field: xAxis.name, type: getColumnType(xAxis.type), title: `${xAxis.name}` },
            //   { field: 'value', type: getColumnType(yAxis[0].type), title: 'Values' },
            //   { field: colorBy || 'variable', title: colorBy || 'Variable' }
            // ]
            tooltip: [
              // Add additional fields to the tooltip
              // { field: xAxis.name, type: getColumnType(xAxis.type), title: `${xAxis.name}` }, // X-axis field
              // { field: yAxis.name, type: getColumnType(yAxis.type), title: `${yAxis.name}` }, // Y-axis field
              // { field: colorBy || 'variable', title: colorBy || 'Variable' }, // Color/Grouping field
              // { field: 'value', type: getColumnType(yAxis[0].type), title: 'Value' }, // Display value
              // Add any other relevant fields
              { field: 'additional_field', title: 'Extra Info' } // Example of adding more details
            ]
          },
          transform: [
            {
              fold: yAxisFields,
              as: ['variable', 'value']
            }
          ],
          data: { name: 'table' },
        };
        setChartSpecs([spec]);
      } else {
        const specs = yAxis.map(axis => ({
          mark: 'point',
          autosize: { type: "fit", contains: "padding", resize: true },
          width: "container",
          selection: {
            paintbrush: {
              type: 'multi',
              on: 'mouseover',
            //   nearest: true
            }
          },
          height: 850/yAxis.length,
          encoding: {
            x: {
              field: xAxis.name,
              type: getColumnType(xAxis.type),
              axis: { title: `${xAxis.name}` }
            },
            y: {
              field: axis.name,
              type: getColumnType(axis.type),
              axis: { title: `${axis.name}` }
            },
            color: {
              condition: {
                selection: 'paintbrush',
                field: colorBy && colorBy !== "None" ? colorBy : 'variable',
                type: getColumnType(columns.find(column => column.name === colorBy)?.type || 'nominal'),
                title: colorBy!=="None" ? colorBy: "variable"
              },
              value: 'grey'
            },
            size: { value: 75 },
            // tooltip: [
            //   { field: xAxis.name, type: getColumnType(xAxis.type), title: `${xAxis.name}` },
            //   { field: axis.name, type: getColumnType(axis.type), title: `${axis.name}` },
            //   { field: colorBy || 'variable', title: colorBy || 'Variable' }
            // ]
             tooltip: [
              // Add additional fields to the tooltip
              // { field: xAxis.name, type: getColumnType(xAxis.type), title: `${xAxis.name}` }, // X-axis field
              // { field: axis.name, type: getColumnType(axis.type), title: `${axis.name}` }, // Y-axis field
              // { field: colorBy || 'variable', title: colorBy || 'Variable' }, // Color/Grouping field
              // { field: 'value', type: getColumnType(axis.type), title: 'Value' }, // Display value
              // Add any other relevant fields
              { field: 'additional_field', title: 'Extra Info' } // Example of adding more details
            ]
          },
          data: { name: 'table' }
        }));
        setChartSpecs(specs);
      }
    }
  }, [xAxis, yAxis, viewMode, data, columns, colorBy]);

  return chartSpecs.length > 0 ? (
    <Paper
      className="Category-Item"
      elevation={2}
      sx={{
        borderRadius: 4,
        width: "inherit",
        display: "flex",
        flexDirection: "column",
        rowGap: 0,
        minWidth: "300px",
        height: "100%",
        overflow: 'auto',
        overscrollBehavior: 'contain',
        scrollBehavior: 'smooth',
      }}>
      {chartSpecs.map((spec, index) => (
        <VegaLite key={index} spec={spec} data={{ table: dataCopy }} />
      ))}
    </Paper>
  ) : (
    <Typography align="center" fontWeight="bold">Select x-Axis and y-Axis to display the chart.</Typography>
  );
};

export default ScatterChart;
