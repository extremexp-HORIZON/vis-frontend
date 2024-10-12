import React, { useState, useEffect } from 'react';
import { Box, ButtonGroup, Button, Paper } from '@mui/material';
import LineChart from './LineChart';
import ChartButtonGroup from '../ChartControls/ChartButtonGroup'; 
import LineChartControlPanel from './LineChartControlPanel';




const GraphContainer = ({ dataexp}: { dataexp: any[]; }) => {
  const [viewMode, setViewMode] = useState<'overlay' | 'stacked'>('overlay');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'scatter'>('line');
  const [xAxis, setXAxis] = useState<string>('');
  const [yAxis, setYAxis] = useState<string[]>([]);
  const [groupFunction, setGroupFunction] = useState<string>('sum');
  const data = JSON.parse(dataexp.data)
  const columns=dataexp.columns
  console.log(columns)

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
         <p>Bar Chart Controls</p>
        )}
        {chartType === 'scatter' && (
         <p>
          Scatter Plot Controls

         </p>
        )}


      {/* Conditionally Render Chart Based on Selected Type */}
      <Box sx={{ marginTop: '2rem' }}>
        {chartType === 'line' && <LineChart viewMode={viewMode} data={data} xAxis={xAxis} yAxis={yAxis} groupFunction={''} />}
        {chartType === 'bar' && <p>Bar Chart</p>}
        {chartType === 'scatter' && <p>Scatter Plot</p>}
      </Box>
    </Box>
    </Paper>
   
  );
};

export default GraphContainer;
