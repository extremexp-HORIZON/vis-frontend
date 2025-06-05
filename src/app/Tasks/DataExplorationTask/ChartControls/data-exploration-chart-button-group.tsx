import type React from 'react';
import { ButtonGroup, Button, Tooltip } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import MapIcon from '@mui/icons-material/Map';
import TableChartIcon from '@mui/icons-material/TableChartSharp';
import GridOnIcon from '@mui/icons-material/GridOn';
import { setControls } from '../../../../store/slices/workflowPageSlice';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import type { VisualColumn } from '../../../../shared/models/dataexploration.model';

const ChartButtonGroup: React.FC = () => {

  const dispatch = useAppDispatch();
  const { tab } = useAppSelector(state => state.workflowPage);
  const chartType = tab?.workflowTasks.dataExploration?.controlPanel.chartType;
  const columns = tab?.workflowTasks?.dataExploration?.metaData?.data?.originalColumns;
  const stringColumnsCount = columns?.filter((col: VisualColumn) => col?.type === 'STRING').length || 0;
  const disableHeatmap = stringColumnsCount < 2;

  return (
    <ButtonGroup
      size="small"
      aria-label="Small button group"
      variant="outlined"
      sx={{
        marginLeft: 'auto',
        height: 30, // Adjust this value to your desired height
        '& .MuiButton-root': {
          minHeight: 30,
          padding: '2px 2px',
          marginTop: 0.5,
        },
      }}
    >      <Tooltip title="Table">
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
      <Tooltip title="Heatmap">
        <Button
          variant={chartType === 'heatmap' ? 'contained' : 'outlined'}
          onClick={() => dispatch(setControls({ chartType: 'heatmap' }))}
          disabled={disableHeatmap}
        >
          <GridOnIcon />
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
          disabled={tab?.workflowTasks.dataExploration?.metaData.data?.hasLatLonColumns === false}
        >
          <MapIcon />
        </Button>
      </Tooltip>
    </ButtonGroup>
  );
};

export default ChartButtonGroup;
