import { Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { VegaLite } from 'react-vega';

interface Column {
  name: string;
  type: 'STRING' | 'DOUBLE'; // Assuming the column type can be either STRING or DOUBLE
}

interface LineChartProps {
  viewMode: 'overlay' | 'stacked';
  data: any[];
  xAxis: Column | null;
  yAxis: Column[]; // Accept array of columns for Y-Axis
  groupFunction: string;
}

const getColumnType = (columnType: string) => {
  switch (columnType) {
    case 'DOUBLE':
    case 'FLOAT':
      return 'quantitative'; // Numbers -> quantitative
    case 'STRING':
    default:
      return 'nominal'; // Text -> nominal or ordinal
  }
};

const LineChart = ({ viewMode, data, xAxis, yAxis, groupFunction }: LineChartProps) => {
  const [chartSpec, setChartSpec] = useState<any>(null);

  useEffect(() => {
    if (xAxis && yAxis.length > 0) {
      const yAxisFields = yAxis.map(axis => axis.name); // Get the names of the Y-axis fields

      // Build the Vega-Lite specification
      const spec = {
        mark: viewMode === 'overlay' ? 'line' : { type: 'line', stacked: true },
        encoding: {
          x: { 
            field: xAxis.name, 
            type: getColumnType(xAxis.type), // Dynamically determine xAxis type
            axis: { title: `${xAxis.name}` } // Title for X-axis
          },
          y: { 
            field: 'value', // Use the value field after folding
            type: getColumnType(yAxis[0].type), // Assume the first yAxis type is representative
            axis: { title: 'Values' } // Common title for Y-axis
          },
          color: { field: 'variable', type: 'nominal' }, // Color based on the variable
        },
        transform: [
          {
            fold: yAxisFields, // Fold Y-axis fields to render multiple lines
            as: ['variable', 'value'] // Rename folded fields to 'variable' and 'value'
          }
        ],
        data: { name: 'table' }, // Data for Vega-Lite
      };
      setChartSpec(spec); // Update chart spec when axes or viewMode change
    }
  }, [xAxis, yAxis, viewMode, groupFunction]); // Watch for changes in these dependencies

  return chartSpec && xAxis && yAxis.length > 0 ? (
    <VegaLite spec={chartSpec} data={{ table: data }} />
  ) : (
    <Typography>Select X-Axis and Y-Axis to display the chart.</Typography>
  );
};

export default LineChart;