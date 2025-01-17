import type React from 'react';
import { ButtonGroup, Button } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import MapIcon from '@mui/icons-material/Map';

interface ChartButtonGroupProps {
  chartType: 'line' | 'bar' | 'scatter' | 'map';
  setChartType: (chartType: 'line' | 'bar' | 'scatter' | 'map') => void;
}

const ChartButtonGroup: React.FC<ChartButtonGroupProps> = ({ chartType, setChartType }) => {
  return (
    <ButtonGroup variant="contained" aria-label="Chart button group" >
      <Button
        variant={chartType === 'line' ? 'contained' : 'outlined'}
        onClick={() => setChartType('line')}
      >
        <ShowChartIcon />
      </Button>
      <Button
        variant={chartType === 'bar' ? 'contained' : 'outlined'}
        onClick={() => setChartType('bar')}
      >
        <BarChartIcon />
      </Button>
      <Button
        variant={chartType === 'scatter' ? 'contained' : 'outlined'}
        disabled
        onClick={() => setChartType('scatter')}
      >
        <ScatterPlotIcon />
      </Button>
      <Button
        variant={chartType === 'map' ? 'contained' : 'outlined'}
        onClick={() => setChartType('map')}
      >
        <MapIcon />
      </Button>
    </ButtonGroup>
  );
};

export default ChartButtonGroup;
