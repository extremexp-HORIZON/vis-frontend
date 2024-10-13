import React, { useState, useEffect } from 'react';
import { Box, ButtonGroup, Button, Paper } from '@mui/material';
import LineChart from '../Charts/LineChart';
import ChartButtonGroup from '../ChartControls/ChartButtonGroup'; 
import LineChartControlPanel from '../Charts/LineChartControlPanel';
import BarChartControlPanel from '../Charts/BarChartControlPanel';
import { fetchDataExploration } from '../../../../store/slices/dataExplorationSlice';
import { useAppDispatch } from '../../../../store/store';
import { IFilter } from '../../../../shared/models/dataexploration.model';
import  BarChart  from '../Charts/BarChart';




const GraphContainer = ({
  dataexp,
  filters,
  chartType,
  setChartType,
  xAxis,
  setXAxis,
  yAxis,
  setYAxis,
  viewMode,
  setViewMode,
  groupFunction,
  setGroupFunction
}: {
  dataexp: any[];
  filters: IFilter[];
  chartType: 'line' | 'bar' | 'scatter';
  setChartType: React.Dispatch<React.SetStateAction<'line' | 'bar' | 'scatter'>>;
  xAxis: string;
  setXAxis: React.Dispatch<React.SetStateAction<string>>;
  yAxis: string[];
  setYAxis: React.Dispatch<React.SetStateAction<string[]>>;
  viewMode: 'overlay' | 'stacked';
  setViewMode: React.Dispatch<React.SetStateAction<'overlay' | 'stacked'>>;
  groupFunction: string;
  setGroupFunction: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const dispatch = useAppDispatch(); // Initialize the dispatch


  const [barGroupBy, setBarGroupBy] = useState<string[]>([]); // State for bar chart grouping
  const [barAggregation, setBarAggregation] = useState<any>({}); // State for bar chart aggregation
  const [barChartData, setBarChartData] = useState<any[]>([]); // Separate state for bar chart data

  useEffect(() => {
    console.log('Current chart type:', chartType); // Debugging the chartType
  }, [chartType,barChartData]);

  // Fetch Bar Chart Data and ensure chartType doesn't reset
  const handleFetchBarChartData = () => {
    const payload = {
      datasetId: 'file:///Users/admin/Desktop/airports.csv',
      limit: 10000,
      offset: 0,
      filters: filters,
      groupBy: barGroupBy,
      aggregation: barAggregation,
    };

    console.log('Fetch Bar Chart Data Payload:', payload);
    console.log('filters', filters);

    // Ensure that the chartType is 'bar' BEFORE dispatch
    setChartType('bar');

    // Fetch bar chart data without resetting the chart type
    dispatch(fetchDataExploration(payload)).then((response) => {
      if (response.payload) {
        const parsedData = JSON.parse(response.payload.data);
        setBarChartData(parsedData); // Update bar chart data
      }
    });

    // Ensure the chartType doesn't reset here
  };
  const lineChartData = JSON.parse(dataexp?.data || '[]');
    const columns=dataexp.columns
  console.log("bar",barChartData)

  
  return (
    <Paper>
    <Box sx={{ padding: '1rem', position: 'relative' }}>
      {/* Container for Chart Buttons and View Mode Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1rem' }}>
        {/* Chart Selection Buttons */}
        <ChartButtonGroup chartType={chartType} setChartType={setChartType} />

        {/* Spacing between the buttons */}
        <Box sx={{ width: '1rem' }} />

        {/* View Mode Toggle (Overlay/Stacked) */}
        <ButtonGroup variant="contained" aria-label="view mode" >
          <Button onClick={() => setViewMode('overlay')} disabled={viewMode === 'overlay'}>
            Overlay View
          </Button>
          <Button onClick={() => setViewMode('stacked')} disabled={viewMode === 'stacked'}>
            Stacked View
          </Button>
        </ButtonGroup>
      </Box>
      {chartType === 'line' && (
          <LineChartControlPanel
            columns={columns}
            xAxis={xAxis}
            setXAxis={setXAxis}
            yAxis={yAxis}
            setYAxis={setYAxis}
            groupFunction={groupFunction}
            setGroupFunction={setGroupFunction}
          />
        )}
        {chartType === 'bar' && (
         <BarChartControlPanel 
         originalColumns={dataexp.originalColumns} 
         barGroupBy={barGroupBy}
         setBarGroupBy={setBarGroupBy}
         barAggregation={barAggregation}
         setBarAggregation={setBarAggregation}
         onFetchBarChartData={handleFetchBarChartData} 
       />
        )}
        {chartType === 'scatter' && (
         <p>
          Scatter Plot Controls

         </p>
        )}


      {/* Conditionally Render Chart Based on Selected Type */}
      <Box sx={{ marginTop: '2rem' }}>
        {chartType === 'line' && <LineChart viewMode={viewMode} data={lineChartData} xAxis={xAxis} yAxis={yAxis} groupFunction={''} />}
        {chartType === 'bar' && (<BarChart/>)}
        {chartType === 'scatter' && <p>Scatter Plot</p>}
      </Box>
    </Box>
    </Paper>
   
  );
};

export default GraphContainer;
