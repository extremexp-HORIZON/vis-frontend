import type React from 'react';
import { ButtonGroup, Button, Tooltip } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import MapIcon from '@mui/icons-material/Map';
import TableChartIcon from "@mui/icons-material/TableChartSharp"


interface ChartButtonGroupProps {
  chartType: 'datatable' | 'line' | 'bar' | 'scatter' | 'map';
  setChartType: (chartType: 'datatable' |'line' | 'bar' | 'scatter' | 'map') => void;
}

const ChartButtonGroup: React.FC<ChartButtonGroupProps> = ({ chartType, setChartType }) => {
  return (
    <ButtonGroup variant="contained" aria-label="Chart button group" >
      <Tooltip title="Table">
      <Button
        variant={chartType === 'datatable' ? 'contained' : 'outlined'}
        onClick={() => setChartType('datatable')}
      >
        <TableChartIcon />
      </Button>
      </Tooltip>
      <Tooltip title="Line">
      <Button
        variant={chartType === 'line' ? 'contained' : 'outlined'}
        onClick={() => setChartType('line')}
      >
        <ShowChartIcon />
      </Button>
      </Tooltip>
      <Tooltip title="Bar">
      <Button
        variant={chartType === 'bar' ? 'contained' : 'outlined'}
        onClick={() => setChartType('bar')}
      >
        <BarChartIcon />
      </Button>
      </Tooltip>
      <Tooltip title="Scatter">
      <Button
        variant={chartType === 'scatter' ? 'contained' : 'outlined'}
       
        onClick={() => setChartType('scatter')}
      >
        <ScatterPlotIcon />
      </Button>
      </Tooltip>
      <Tooltip title="Map">
      <Button
        variant={chartType === 'map' ? 'contained' : 'outlined'}
        onClick={() => setChartType('map')}
      >
        <MapIcon />
      </Button>
      </Tooltip>
    </ButtonGroup>
  );
};

export default ChartButtonGroup;
