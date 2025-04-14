import { Box, Paper, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { VegaLite } from 'react-vega';
import { VisualColumn } from '../../../../shared/models/dataexploration.model';
import { cloneDeep } from 'lodash';
import ResponsiveVegaLite from '../../../../shared/components/responsive-vegalite';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import ResponsiveCardVegaLite from '../../../../shared/components/responsive-card-vegalite';



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
interface ControlPanel {
  chartType: string;
  selectedColumns: VisualColumn[];
  xAxis: VisualColumn;
  xAxisScatter: VisualColumn;
  yAxis: VisualColumn[];
  yAxisScatter: VisualColumn[];
  viewMode: string;
  colorBy: string; // add this property
}

const ScatterChart = () => {
  const [chartSpecs, setChartSpecs] = useState<any[]>([]);
  const [dataCopy, setDataCopy] = useState<any[]>([]);

  const dispatch = useAppDispatch();
  const { tab } = useAppSelector(state => state.workflowPage);
  const { xAxisScatter, yAxisScatter, viewMode, colorBy } = tab?.workflowTasks.dataExploration?.controlPanel as ControlPanel;  

  const data = tab?.workflowTasks.dataExploration?.chart.data?.data;

  useEffect(() => {
    if (xAxisScatter && yAxisScatter && yAxisScatter.length > 0) {
      const yAxisFields = yAxisScatter.map(axis => axis.name);
      const dataCopy = cloneDeep(data);
      setDataCopy(dataCopy);

      // Build the Vega-Lite specifications
      if (viewMode === 'overlay') {
        const spec = {
          mark: 'point',
          autosize: { type: "fit", contains: "padding", resize: true },
          width:1000,
          height: 800,
          selection: {
            paintbrush: {
              type: 'multi',
              on: 'mouseover',
            //   nearest: true
            }
          },
          encoding: {
            x: {
              field: xAxisScatter.name,
              type: getColumnType(xAxisScatter.type),
              axis: { title: `${xAxisScatter.name}` }
            },
            y: {
              field: 'value',
              type: getColumnType(yAxisScatter[0].type),
              axis: { title: 'Values' }
            },
            color: {
              condition: {
                selection: 'paintbrush',
                field: colorBy && colorBy !== "None" ? colorBy : 'variable',
                // type: getColumnType(tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns.find(column => column.name === colorBy)?.type || 'nominal'),
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
        const specs = yAxisScatter.map(axis => ({
          mark: 'point',
          autosize: { type: "fit", contains: "padding", resize: true },
          width: 1000,
          selection: {
            paintbrush: {
              type: 'multi',
              on: 'mouseover',
            //   nearest: true
            }
          },
          height: 800/yAxisScatter.length,
          encoding: {
            x: {
              field: xAxisScatter.name,
              type: getColumnType(xAxisScatter.type),
              axis: { title: `${xAxisScatter.name}` }
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
                type: getColumnType(tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns.find(column => column.name === colorBy)?.type || 'nominal'),
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
  }, [xAxisScatter, yAxisScatter, viewMode, data, , colorBy]);

  return chartSpecs.length > 0 ? (
    <>
      {chartSpecs.map((spec, index) => (
        <ResponsiveCardVegaLite 
        key={index} 
        spec={spec} 
        data={{ table: dataCopy }}     
        height={viewMode === "overlay" ? 800 : 800 / yAxisScatter.length}
        maxHeight={viewMode === "overlay" ? 800 : 800 / yAxisScatter.length} />
      ))}
    </>
  ) : (
    <Box sx={{ display: "flex", height: "20rem", justifyContent: "center", alignItems: "center" }}>
    <Typography align="center" fontWeight="bold">Select x-Axis and y-Axis to display the chart.</Typography>
    </Box>
  );
};

export default ScatterChart;
