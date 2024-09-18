import React, { useEffect, useMemo,  useState } from 'react';
import { Box, MenuItem, Paper, Select, tabClasses, Tooltip, Typography } from '@mui/material';
import { VegaLite, VisualizationSpec } from 'react-vega';
import ChartControls from './ChartControls';
import { transform } from 'lodash';


interface Column {
  field: string;
  headerName: string;
  width: number;
  type: string;
}
interface DataExplorationChartProps {
  data: any[];
  columns: Column[];
  datetimeColumn: string;
}

const Testing: React.FC<DataExplorationChartProps> = ({ data, columns, datetimeColumn, }) => {
 
  const [mode, setMode] = useState<'overlay' | 'stack'>('overlay');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area' | 'heatmap'>('line');
  const [showStatistics, setShowStatistics] = useState(false);
  const [zoomable, setZoomable] = useState<'yes' | 'no'>('yes'); // State for zoomable toggle
  const [showRollingAverage, setShowRollingAverage] = useState(false); // State for rolling average
  const [rollingAverageWindow, setRollingAverageWindow] = useState(7); // Rolling average window size
  const [xAxis, setXAxis] = useState(columns[columns.length - 1].field);
  const [yAxis, setYAxis] = useState([columns[0].field]);
  const [aggFunction, setAggFunction] = useState<'None' | 'Min' | 'Max' | 'Mean'|'Sum'>('None');
  const [colorBy, setColorBy] = useState('None');


  

  const getVegaLiteType = (type: string) => {
    if (type === 'LOCAL_DATE_TIME') return 'temporal';
    if (type === 'DOUBLE' || type === 'INTEGER') 
      return 'quantitative';
    return 'nominal'; // default to nominal if type is not recognized
  };

  const xAxisType = useMemo(() => 
    getVegaLiteType(columns.find(column => column.field === xAxis)?.type || 'nominal'),
  [xAxis, columns]);

  useEffect(() => {
    if (xAxisType === 'nominal') {
      setChartType('bar');
    }else if (xAxisType === 'temporal') {
      setChartType('line');
    }
  }, [xAxisType]);

  const spec = useMemo(() => {
    const xAxisType = getVegaLiteType(columns.find(column => column.field === xAxis)?.type || 'nominal');
    const yAxisType = getVegaLiteType(columns.find(column => column.field === yAxis[0])?.type || 'quantitative');
    const baseTransform = [
      {
        fold: yAxis,
        as: ["variable", "value"]
      }
    ];

    const applyAggregation = chartType !== 'heatmap' && aggFunction !== 'None';
    const aggregationTransform = applyAggregation ? [
      {
        aggregate: [{
          op: aggFunction.toLowerCase(), // 'min', 'max', 'avg'
          field: "value",
          as: "aggregated_value"
        }],
        groupby: [xAxis,"variable"]
      }
    ] : [];
    const finalTransform = [...baseTransform, ...aggregationTransform];


  
    const commonSpec = {
      width: "container",
      autosize: { type: "fit", contains: "padding", resize: true },
      data: { values: data },
      transform: finalTransform,
      layer: [
        {
          mark: chartType === 'line' ? { type: "line" } :
            chartType === 'bar' ? { type: "bar" } :
              chartType === 'area' ? { type: "area" } :
                { type: "point", tooltip: true },
                encoding: chartType === 'bar' ? {
                  y: { field: xAxis, type: xAxisType },
                  x: { field:applyAggregation ? "aggregated_value" : "value", type: yAxisType, title: "Value", stack: mode === 'stack' ? 'zero' : null },
                  color: colorBy && colorBy !== "None" && chartType === 'heatmap' ? { field: colorBy, type: getVegaLiteType(columns.find(column => column.field === colorBy)?.type || 'nominal'), title: colorBy } : { field: "variable", type: "nominal", title: "Variable" },
                  tooltip: [
                    { field: "variable", type: "nominal" },
                    { field: xAxis, type: "nominal" },

                    { field: aggFunction !== 'None' ? "aggregated_value" : "value", type: "quantitative" }
                  ]
                }:{
                  x: { field: xAxis, type: xAxisType },
                  y: { field:applyAggregation ? "aggregated_value" : "value", type: yAxisType, title: "Value", stack: mode === 'stack' ? 'zero' : null },
                  color: colorBy && colorBy !== "None" && chartType === 'heatmap' ? { field: colorBy, type: getVegaLiteType(columns.find(column => column.field === colorBy)?.type || 'nominal'), title: colorBy } : { field: "variable", type: "nominal", title: "Variable" },
                  tooltip: [
                    { field: "variable", type: "nominal" },
                    { field: xAxis, type: "nominal" },

                    { field: aggFunction !== 'None' ? "aggregated_value" : "value", type: "quantitative" }
                  ]
                },
          selection: zoomable === 'yes' ? {
            grid_x: {
              type: "interval",
              bind: "scales",
              zoom: "wheel",
              encodings: ["x"]
            },
          } : undefined
        },
      ]
    };

    if (mode === 'overlay') {
      return {
        ...commonSpec,
        height: 400,
      };
    } else if (mode === 'stack') {
      const stackedCharts = yAxis.map((variable,index) => ({
        ...commonSpec,
        height: 400,
        transform: [
          ...commonSpec.transform,
          { filter: `datum.variable === '${variable}'` }

        ],
        encoding: {
          ...commonSpec.layer[0].encoding,
          y: { ...commonSpec.layer[0].encoding.y, title: variable }
        }
      }));

      return {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        vconcat: stackedCharts,
        width: "container",
        height: 400
      };
    }
  }, [data, chartType, mode, yAxis, xAxis,zoomable,aggFunction,colorBy]);


  const handleRollingAverageToggle = () => {
    setShowRollingAverage(!showRollingAverage);
  };

  const handleRollingAverageWindowChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRollingAverageWindow(Number(event.target.value));
  };


  return (
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
      }}>
        <ChartControls 
        setMode={setMode}
        mode={mode}
        setChartType={setChartType}
        setShowStatistics={setShowStatistics}
        chartType={chartType}
        showStatistics={showStatistics}
        handleRollingAverageWindowChange={handleRollingAverageWindowChange}
        handleRollingAverageToggle={handleRollingAverageToggle}
        showRollingAverage={showRollingAverage}
        rollingAverageWindow={rollingAverageWindow}
        availableColumns={columns}
        xAxis={xAxis}
        setXAxis={setXAxis}
        yAxis={yAxis}
        setYAxis={setYAxis} aggFunction={aggFunction} setAggFunction={setAggFunction}
        colorBy={colorBy} 
        setColorBy={setColorBy}              
        />
            
        <Box sx={{ width: "99%", px: 1 }}>
          <VegaLite
            spec={spec as VisualizationSpec}
            style={{ width: "99%" }} />
          
        </Box>
      
    </Paper>
  );
};

export default Testing;