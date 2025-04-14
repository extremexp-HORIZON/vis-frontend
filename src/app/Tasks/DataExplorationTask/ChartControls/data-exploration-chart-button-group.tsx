import type React from 'react';
import { ButtonGroup, Button, Tooltip } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import MapIcon from '@mui/icons-material/Map';
import TableChartIcon from "@mui/icons-material/TableChartSharp"
import { setControls } from '../../../../store/slices/workflowPageSlice';
import { useAppDispatch, useAppSelector } from '../../../../store/store';




const ChartButtonGroup: React.FC= () => {

  const dispatch = useAppDispatch()
  const {tab}= useAppSelector(state => state.workflowPage)
  const chartType= tab?.workflowTasks.dataExploration?.controlPanel.chartType

  return (
    <ButtonGroup variant="outlined" aria-label="Chart button group" fullWidth>
      <Tooltip title="Table">
      <Button
        variant={chartType === 'datatable' ? 'contained' : 'outlined'}
        onClick={() => dispatch(setControls({ chartType: 'datatable' }))}
      >
        <TableChartIcon />
      </Button>
      </Tooltip>
      <Tooltip title="Line">
      <Button
        variant={chartType === 'line' ? 'contained' : 'outlined'}
        onClick={() => dispatch(setControls({ chartType: 'line' }))}
      >
        <ShowChartIcon />
      </Button>
      </Tooltip>
      <Tooltip title="Bar">
      <Button
        variant={chartType === 'bar' ? 'contained' : 'outlined'}
        onClick={() => dispatch(setControls({ chartType: 'bar' }))}
      >
        <BarChartIcon />
      </Button>
      </Tooltip>
      <Tooltip title="Scatter">
      <Button
        variant={chartType === 'scatter' ? 'contained' : 'outlined'}
       
        onClick={() => dispatch(setControls({ chartType: 'scatter' }))}
      >
        <ScatterPlotIcon />
      </Button>
      </Tooltip>
      <Tooltip title="Map">
      <Button
        variant={chartType === 'map' ? 'contained' : 'outlined'}
        onClick={() => dispatch(setControls({ chartType: 'map' }))}
      >
        <MapIcon />
      </Button>
      </Tooltip>
    </ButtonGroup>
  );
};

export default ChartButtonGroup;
