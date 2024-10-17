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
  setGroupFunction,
  barGroupBy,
  setBarGroupBy,
  barAggregation,
  setBarAggregation
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
  barGroupBy: string[];
  setBarGroupBy: React.Dispatch<React.SetStateAction<string[]>>;
  barAggregation: any;
  setBarAggregation: React.Dispatch<React.SetStateAction<any>>;
}) => {
  const dispatch = useAppDispatch(); // Initialize the dispatch



  // const [barGroupBy, setBarGroupBy] = useState<string[]>([]); // State for bar chart grouping
  // const [barAggregation, setBarAggregation] = useState<any>({}); // State for bar chart aggregation




  // Fetch Bar Chart Data and ensure chartType doesn't reset
  const handleFetchBarChartData = () => {
    console.log('Fetching Bar Chart Data...');
    const payload = {
      datasetId: 'file://opt/data/airports.csv',
      limit: 1000,
      offset: 0,
      filters: filters,
      groupBy: barGroupBy,
      aggregation: barAggregation,
    };

    console.log('Fetch Bar Chart Data Payload:', payload);

    // Ensure that the chartType is 'bar' BEFORE dispatch
    // setChartType('bar');

    // Fetch bar chart data without resetting the chart type
    dispatch(fetchDataExploration(payload)).then((response) => {
      console.log('Bar Chart Data:', response);
     
    });

    // Ensure the chartType doesn't reset here
  };
  const lineChartData = JSON.parse(dataexp?.data || '[]');
  const columns=dataexp.columns


  
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
        {chartType === 'bar' && (<BarChart dataExploration={dataexp} viewMode={viewMode}/>)}
        {chartType === 'scatter' && <p>Scatter Plot</p>}
      </Box>
    </Box>
    </Paper>
   
  );
};

export default GraphContainer;
