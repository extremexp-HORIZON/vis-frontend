import { useState } from 'react';
import { VegaLite } from 'react-vega';
import { VisualizationSpec } from 'vega-embed';

import { Paper, Box, Typography, Button, ButtonGroup, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText } from '@mui/material';
type Metric = {
  name: string;
  value: number;
  avgDiff: number;
};


const LineChart = () => {
  
  const [selectedMetrics, setSelectedMetrics] = useState(['Accuracy']);
  const [viewMode, setViewMode] = useState('overlay');
  const data = [
    { time: 1, Accuracy: 0.6, Precision: 0.42, Recall: 0.12 },
    { time: 2, Accuracy: 0.65, Precision: 0.45, Recall: 0.15 },
    { time: 3, Accuracy: 0.7, Precision: 0.5, Recall: 0.18 },
    { time: 4, Accuracy: 0.75, Precision: 0.55, Recall: 0.2 },
    { time: 5, Accuracy: 0.8, Precision: 0.6, Recall: 0.25 },
    { time: 6, Accuracy: 0.82, Precision: 0.65, Recall: 0.3 },
    { time: 7, Accuracy: 0.85, Precision: 0.7, Recall: 0.35 },
    { time: 8, Accuracy: 0.88, Precision: 0.75, Recall: 0.4 },
    { time: 9, Accuracy: 0.9, Precision: 0.8, Recall: 0.45 },
    { time: 10, Accuracy: 0.92, Precision: 0.82, Recall: 0.5 },
    { time: 11, Accuracy: 0.94, Precision: 0.85, Recall: 0.55 },
    { time: 12, Accuracy: 0.96, Precision: 0.88, Recall: 0.6 },
    { time: 13, Accuracy: 0.97, Precision: 0.9, Recall: 0.65 },
    { time: 14, Accuracy: 0.98, Precision: 0.92, Recall: 0.7 },
    { time: 15, Accuracy: 0.99, Precision: 0.95, Recall: 0.75 }
  ];


  const handleMetricChange = (event:any) => {
    setSelectedMetrics(event.target.value);
  };

  const handleViewModeChange = (mode:any) => {
    setViewMode(mode);
  };

  const metrics = ['Accuracy', 'Precision', 'Recall'];

  const plotWidth = 1500;
  const plotHeight = 400;

  const overlaySpec = {
    width: plotWidth,
    height: plotHeight,
    data: { values: data },
    transform: [
      {
        fold: selectedMetrics,
        as: ['metric', 'value']
      }
    ],
    mark: 'line',
    encoding: {
      x: { field: 'time', type: 'quantitative' },
      y: { field: 'value', type: 'quantitative' },
      color: { field: 'metric', type: 'nominal' }
    }
  } as VisualizationSpec;

  const stackSpec = {
    width: plotWidth / selectedMetrics.length,
    height: plotHeight,
    data: { values: data },
    transform: [
      {
        fold: selectedMetrics,
        as: ['metric', 'value']
      }
    ],
    facet: {
      column: { field: 'metric', type: 'nominal' }
    },
    spec: {
      mark: 'line',
      encoding: {
        x: { field: 'time', type: 'quantitative' },
        y: { field: 'value', type: 'quantitative' }
      }
    },
    config: {
      facet: { spacing: 10 }
    }
  } as VisualizationSpec;

  return (
    <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #ccc', width: '100%', mt: 3 }}>
      <Box sx={{ bgcolor: '#f0f0f0', display: 'flex', alignItems: 'center', height: '3.5rem', px: 2, justifyContent: 'space-between' }}>
        <Typography variant="h6">Time Series Metrics</Typography>
      </Box>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <FormControl sx={{ m: 1, minWidth: 200 }}>
            <InputLabel id="metric-select-label">Metrics</InputLabel>
            <Select
              labelId="metric-select-label"
              multiple
              value={selectedMetrics}
              onChange={handleMetricChange}
              renderValue={(selected) => (selected as string[]).join(', ')}
              size="small"
            >
              {metrics.map((metric) => (
                <MenuItem key={metric} value={metric}>
                  <Checkbox checked={selectedMetrics.indexOf(metric) > -1} />
                  <ListItemText primary={metric} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <ButtonGroup variant="contained">
            <Button 
              onClick={() => handleViewModeChange('overlay')} 
              color={viewMode === 'overlay' ? 'primary' : 'inherit'}
              size="small"
            >
              Overlay
            </Button>
            <Button 
              onClick={() => handleViewModeChange('stack')} 
              color={viewMode === 'stack' ? 'primary' : 'inherit'}
              size="small"
            >
              Stack
            </Button>
          </ButtonGroup>
        </Box>
        <VegaLite spec={viewMode === 'overlay' ? overlaySpec : stackSpec}  />
      </Box>
    </Paper>
  );
};

export default LineChart;
