import React, { useMemo,  useState } from 'react';
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
  selectedColumns: string[],
}

const Testing: React.FC<DataExplorationChartProps> = ({ data, columns, datetimeColumn }) => {
  const selectableColumns = columns.filter(column => column.field !== datetimeColumn);
  console.log('colsdialge',selectableColumns);
  const [mode, setMode] = useState<'overlay' | 'stack'>('overlay');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area' | 'heatmap'>('line');
  const [showStatistics, setShowStatistics] = useState(false);
  const [zoomable, setZoomable] = useState<'yes' | 'no'>('yes'); // State for zoomable toggle
  const [showRollingAverage, setShowRollingAverage] = useState(false); // State for rolling average
  const [rollingAverageWindow, setRollingAverageWindow] = useState(7); // Rolling average window size
  const [xAxis, setXAxis] = useState(columns[0].field);
  const [yAxis, setYAxis] = useState([columns[1].field]);
  const [aggFunction, setAggFunction] = useState<'None' | 'Min' | 'Max' | 'Mean'|'Sum'>('None');


 

  const filteredData = data.filter(item => {
    const itemDate = new Date(item[datetimeColumn]);
    return (!startDate || itemDate >= startDate) && (!endDate || itemDate <= endDate);
  });

  const getVegaLiteType = (type: string) => {
    if (type === 'LOCAL_DATE_TIME') return 'temporal';
    if (type === 'DOUBLE' || type === 'INTEGER') 
      return 'quantitative';
    return 'nominal'; // default to nominal if type is not recognized
  };
  const spec = useMemo(() => {
    const xAxisType = getVegaLiteType(columns.find(column => column.field === xAxis)?.type || 'nominal');
    const yAxisType = getVegaLiteType(columns.find(column => column.field === yAxis[0])?.type || 'quantitative');
    const baseTransform = [
      {
        fold: yAxis,
        as: ["variable", "value"]
      }
    ];

    

    // const finalTransform = [...baseTransform,];
    const aggregationTransform = aggFunction !== 'None' ? [
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
      data: { values: filteredData },
      transform: finalTransform,
      layer: [
        {
          mark: chartType === 'line' ? { type: "line" } :
            chartType === 'bar' ? { type: "bar" } :
              chartType === 'area' ? { type: "area" } :
                { type: "point", tooltip: true },
                encoding: {
                  x: { field: xAxis, type: xAxisType },
                  y: { field: aggFunction !== 'None' ? "aggregated_value" : "value", type: yAxisType, title: "Value", stack: mode === 'stack' ? 'zero' : null },
                  color: { field: "variable", type: "nominal", title: "Variable" },
                  tooltip: [
                    { field: "variable", type: "nominal" },
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
        // height: 200,
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
        vconcat: stackedCharts
      };
    }
  }, [filteredData, chartType, datetimeColumn, mode, yAxis, xAxis,zoomable,]);


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
         category={''} setCategory={function (category: string): void {
          throw new Error('Function not implemented.');
        } }  
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
