import React, { useEffect, useMemo,  useRef,  useState } from 'react';
import { Box, MenuItem, Paper, Select, tabClasses, Tooltip, Typography } from '@mui/material';
import { VegaLite, VisualizationSpec } from 'react-vega';
import ChartControls from './ChartControls/ChartControls';
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
  const chartRef = useRef(null); // Ref to reference the chart container
  const chartElement = chartRef.current as unknown as HTMLElement;
  const selectableColumns = columns.filter(column => column.field !== datetimeColumn);



  const getVegaLiteType = (type: string) => {
    if (type === 'LOCAL_DATE_TIME') return 'temporal';
    if (type === 'DOUBLE' || type === 'INTEGER') 
      return 'quantitative';
    return 'nominal'; // default to nominal if type is not recognized
  };

  const xAxisType = useMemo(() => 
    getVegaLiteType(columns.find(column => column.field === xAxis)?.type || 'nominal'),
  [xAxis, columns]);

  ////not used for now 

  const handleRollingAverageToggle = () => {
    setShowRollingAverage(!showRollingAverage);
  };
  ////not used for now 

  const handleRollingAverageWindowChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRollingAverageWindow(Number(event.target.value));
  };


  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey) {
        // If zooming (holding ctrl/meta/shift key), prevent default scroll behavior
        event.preventDefault();
      }
    };
    if (chartElement) {
      chartElement.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (chartElement) {
        chartElement.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  useEffect(() => {
    if (xAxisType === 'nominal') {
      setChartType('bar');
    }else if (xAxisType === 'temporal') {
      setChartType('line');
    }
  }, [xAxisType]);
  
  const spec = useMemo(() => {
    const getSingleChartSpec = (yAxisField: string) => {
    const yAxisType = getVegaLiteType(columns.find(column => column.field === yAxisField)?.type || 'quantitative');
    const baseTransform = [
      {
        fold: [yAxisField],
        as: ["variable", "value"]
      }
    ];
    const applyAggregation = chartType !== 'heatmap' && aggFunction !== 'None';
    const aggregationTransform = applyAggregation ? [
      {
        aggregate: [{
          op: aggFunction.toLowerCase(),
          field: "value",
          as: "aggregated_value"
        }],
        groupby: [xAxis, "variable"]
        }
      ] : [];
    const finalTransform = [...baseTransform, ...aggregationTransform];
    return {
      data: { values: data },
      transform: finalTransform,
      mark: chartType === 'line' ? { type: "line"} :
      chartType === 'bar' ? { type: "bar" } :
      chartType === 'area' ? { type: "area" } :
      { type: "point", tooltip: true },
      encoding: chartType === 'bar' ? {
        y: { field: xAxis, type: xAxisType },
        x: { field: applyAggregation ? "aggregated_value" : "value", type: yAxisType, title: "Value", stack: mode === 'stack' ? 'zero' : null },
        color: colorBy && colorBy !== "None" && chartType === 'heatmap' ? { field: colorBy, type: getVegaLiteType(columns.find(column => column.field === colorBy)?.type || 'nominal'), title: colorBy } : { field: "variable", type: "nominal", title: "Variable" },
        tooltip: [
          { field: "variable", type: "nominal" },
          { field: xAxis, type: "nominal" },
          { field: aggFunction !== 'None' ? "aggregated_value" : "value", type: "quantitative" }
          ]
        }:
        {
          x: { field: xAxis, type: xAxisType },
          y: { field: applyAggregation ? "aggregated_value" : "value", type: yAxisType, title: yAxisField },
          color: colorBy && colorBy !== "None" && chartType === 'heatmap' ? { field: colorBy, type: getVegaLiteType(columns.find(column => column.field === colorBy)?.type || 'nominal'), title: colorBy } : { field: "variable", type: "nominal", title: "Variable" },
          tooltip: [
            { field: "variable", type: "nominal" },
            { field: xAxis, type: xAxisType },
            { field: applyAggregation ? "aggregated_value" : "value", type: yAxisType }
          ]
        },
        selection: zoomable === 'yes' ? {
          grid_x: {
            type: "interval",
            bind: "scales",
            zoom: "wheel",
            encodings: ["x"],
          },
        } : undefined,
        autosize: { type: "fit", contains: "padding", resize: true },
      };
    };
  
    if (mode === 'stack') {
      console.log('mpainw stack')
      // Check if colorBy is not 'None' and chartType is 'heatmap'
      if (colorBy !== 'None' && chartType === 'heatmap') {
        console.log('mpainw stack heatmap')
        return yAxis.map(yAxisField => ({
          ...getSingleChartSpec(yAxisField),
          autosize: { type: "fit", contains: "padding", resize: true },
          width: "container",
          height: 500,
        }));
      } else {
        console.log('mpainw stack not heatmap')
        return yAxis.map(yAxisField => ({
          ...getSingleChartSpec(yAxisField),
          autosize: { type: "fit", contains: "padding", resize: true },
          width: "container",
          height: 500,
        }));
      }
    }  
    // if (mode === 'overlay') {
    //   console.log('mpainw overlay')
    //   const layeredSpec = yAxis.map(yAxisField => ({
       
        
    //     mark: chartType === 'line' ? { type: "line" } :
    //     chartType === 'bar' ? {
    //       type: "bar" } :
    //       chartType === 'area' ? { type: "area" } :
    //       { type: "point", tooltip: true },
    //       encoding: chartType === 'bar' ? {
    //         y: { field: xAxis, type: xAxisType, title: xAxis },
    //         x: {
    //           field: aggFunction !== 'None' ? "aggregated_value" : "value",
    //           type: getVegaLiteType(columns.find(column => column.field === yAxisField)?.type || 'quantitative'),
    //           title: "Value"
    //         },
    //         color: colorBy && colorBy !== "None" && chartType === 'heatmap' ? { field: colorBy, type: getVegaLiteType(columns.find(column => column.field === colorBy)?.type || 'nominal'), title: colorBy } : { field: "variable", type: "nominal", title: "Variable" },
    //         tooltip: [
    //           { field: "variable", type: "nominal" },
    //           { field: xAxis, type: xAxisType },
    //           { field: aggFunction !== 'None' ? "aggregated_value" : "value", type: "quantitative" }
    //         ],
    //       } :
    //       {
    //         x: { field: xAxis, type: xAxisType },
    //         y: {
    //           field: aggFunction !== 'None' ? "aggregated_value" : "value",
    //           type: getVegaLiteType(columns.find(column => column.field === yAxisField)?.type || 'quantitative'),
    //           title: "Value"
    //         },
    //         color: colorBy && colorBy !== "None" && chartType === 'heatmap' ? { field: colorBy, type: getVegaLiteType(columns.find(column => column.field === colorBy)?.type || 'nominal'), title: colorBy } : { field: "variable", type: "nominal", title: "Variable" },
    //         tooltip: [
    //           { field: "variable", type: "nominal" },
    //           { field: xAxis, type: xAxisType },
    //           { field: aggFunction !== 'None' ? "aggregated_value" : "value", type: "quantitative" }
    //         ],
            
    //       },
          
    //       transform: [
            
    //         {
    //           fold: [yAxisField],
    //           as: ["variable", "value"]
    //         },
    //         ...(aggFunction !== 'None'
    //           ? [
    //             {
    //               aggregate: [
    //                 {
    //                   op: aggFunction.toLowerCase(),
    //                   field: "value",
    //                   as: "aggregated_value"
    //                 }
    //               ],
    //               groupby: [xAxis, "variable"]
    //             }
    //           ]
    //           : []),
    //         ],
    //   }));
    //   return {
    //     width: 1000,
    //     description: "to return.",

    //     height: 500,
    //     // autosize: { type: "fit", contains: "padding", resize: true },
    //     data: { values: data },
    //     layer: layeredSpec,

    //     // selection: zoomable === 'yes' ? {
    //     //   grid_x: {
    //     //     type: "interval",
    //     //     bind: "scales",
    //     //     zoom: "wheel",
    //     //     encodings: ["x"],
    //     //   },
    //     // } : undefined,
       
        
       
    //   };
    // }
  },[data, chartType, mode, yAxis, xAxis, zoomable, aggFunction, colorBy]);

  const specoverlay = useMemo(() => {
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
////~~~~~~~~~~~~~
    const commonSpec = {
      width: "1000",
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
                  y: { field:applyAggregation ? "aggregated_value" : "value", type: yAxisType, title: "", stack: mode === 'stack' ? 'zero' : null },
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
        ...(chartType === 'line' ? [{
          mark: { type: "point", filled: true },
          encoding: {
            x: { field: xAxis, type: xAxisType },
            y: { field: applyAggregation ? "aggregated_value" : "value", type: yAxisType },
            color: { field: "variable", type: "nominal" },
            tooltip: [
              { field: "variable", type: "nominal" },
              { field: xAxis, type: xAxisType },
              { field: applyAggregation ? "aggregated_value" : "value", type: yAxisType }
            ]
          }
        }] : [])
      ]
    };

    if (mode === 'overlay') {
      return {
        ...commonSpec,
        height: 500,
      };
    } 
    
  }, [data, chartType, mode, yAxis, xAxis,zoomable,aggFunction,colorBy]);




  console.log('spec',spec)
  
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
        overflow: 'auto', // Allow scrolling if content is larger than container
        overscrollBehavior: 'contain', // Prevent the bounce effect at the edges
        scrollBehavior: 'smooth', // Enable smooth scrolling (optional)
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
      <Box ref={chartRef} sx={{ width: "99%", px: 1 }}>
        {Array.isArray(spec) ? (
          
          spec.map((s, index) => (
          <Box key={index} sx={{ mb: 4 }}>
            <VegaLite
            spec={s as VisualizationSpec}
            style={{ width: "99%" }} />
          </Box>
        ))
        ) : (
        <VegaLite
        spec={specoverlay as VisualizationSpec}
        style={{ width: "99%" }} />
        )
        }
      </Box>
    </Paper>
  );
};
export default Testing;