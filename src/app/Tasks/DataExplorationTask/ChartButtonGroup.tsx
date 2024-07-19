import type React from 'react';
import { ButtonGroup, Button } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';

interface ChartButtonGroupProps {
  chartType: 'line' | 'bar' | 'area' | 'heatmap';
  setChartType: (chartType: 'line' | 'bar' | 'area' | 'heatmap') => void;
}

const ChartButtonGroup: React.FC<ChartButtonGroupProps> = ({ chartType, setChartType }) => {
  return (
    <ButtonGroup variant="contained" aria-label="Chart button group" size="small">
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
        variant={chartType === 'heatmap' ? 'contained' : 'outlined'}
        onClick={() => setChartType('heatmap')}
      >
        <ScatterPlotIcon />
      </Button>
    </ButtonGroup>
  );
};

export default ChartButtonGroup;
