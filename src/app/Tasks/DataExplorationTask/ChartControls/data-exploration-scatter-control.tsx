import { useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  OutlinedInput,
  Checkbox,
  Button,
  ButtonGroup,
  Switch,
  Typography,
  Tooltip,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import { setControls } from '../../../../store/slices/workflowPageSlice';
import PaletteIcon from '@mui/icons-material/Palette';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import type { SelectChangeEvent } from '@mui/material';

const ScatterChartControlPanel = () => {
  const dispatch = useAppDispatch();
  const tab = useAppSelector(state => state.workflowPage.tab);
  const controlPanel = tab?.workflowTasks.dataExploration?.controlPanel;
  const columns =
    tab?.workflowTasks.dataExploration?.metaData?.data?.originalColumns || [];

  const xAxis = controlPanel?.xAxis;
  const yAxis = controlPanel?.yAxis || [];
  const colorBy = controlPanel?.colorBy;
  const viewMode = useAppSelector(
    state =>
      state.workflowPage.tab?.workflowTasks.dataExploration?.controlPanel
        ?.viewMode,
  );

  const yAxisCount = yAxis.length;

  useEffect(() => {
    if (yAxisCount >= 3 && viewMode !== 'stacked') {
      dispatch(setControls({ viewMode: 'stacked' }));
    }
  }, [yAxisCount, viewMode, dispatch]);

  useEffect(() => {
    const validYAxis = yAxis.filter(yCol =>
      columns.find(col => col.name === yCol.name),
    );

    if (validYAxis.length !== yAxis.length) {
      dispatch(setControls({ yAxis: validYAxis }));
    }
  }, [columns, yAxis, dispatch]);

  const handleXAxisChange = (event: { target: { value: string } }) => {
    const selected = columns.find(col => col.name === event.target.value);

    if (selected) {
      dispatch(setControls({ xAxis: selected }));
    }
  };

  const handleYAxisChange = (event: SelectChangeEvent<string[]>) => {
    const selectedNames = event.target.value as string[];
    const selectedCols = selectedNames
      .map((name: string) => columns.find(col => col.name === name))
      .filter(Boolean) as typeof columns;

    dispatch(setControls({ yAxis: selectedCols }));
  };

  const handleColorByChange = (event: SelectChangeEvent<string>) => {
    const selected = columns.find(col => col.name === (event.target.value as string));

    if (selected) {
      dispatch(setControls({ colorBy: selected }));
    }
  };

  // Keep selectedColumns in sync with x/y/color
  useEffect(() => {
    const validYAxis = yAxis.filter(yCol =>
      columns.find(col => col.name === yCol.name),
    );

    if (validYAxis.length !== yAxis.length) {
      dispatch(setControls({ yAxis: validYAxis }));
    }

    const currentSelected = controlPanel?.selectedColumns || [];
    const requiredCols = [xAxis, ...validYAxis, colorBy].filter(Boolean) as any[];

    const missingCols = requiredCols.filter(
      reqCol => !currentSelected.find(sel => sel.name === reqCol?.name)
    );

    if (missingCols.length > 0) {
      const updatedSelected = [
        ...currentSelected,
        ...missingCols.filter(Boolean),
      ];
      const cleanedSelected = updatedSelected.filter((col: any) => col?.name && col.type);

      dispatch(setControls({ selectedColumns: cleanedSelected }));
    }
  }, [columns, yAxis, xAxis, colorBy, controlPanel?.selectedColumns, dispatch]);

  const isDisabled =
    Array.isArray(tab?.workflowTasks.dataExploration?.scatterChart.data?.data) &&
    !tab?.workflowTasks.dataExploration?.scatterChart.data?.data.length;

  const tooltipTitle = isDisabled ? 'Select columns and color' : '';
  const overlayDisabledByCount = yAxisCount >= 3;

  return (
    columns.length > 0 && (
      <Box>
        <Box
          sx={{
            display: 'flex',
            gap: '1rem',
            flexDirection: 'row',
          }}
        >
          {/* X-Axis Selector */}
          <FormControl fullWidth disabled={tab?.workflowTasks.dataExploration?.controlPanel.umap}>
            <InputLabel id="x-axis-select-label">
              <Box display="flex" alignItems="center" gap={1}>
                <ShowChartIcon fontSize="small" />
                X-Axis
              </Box>
            </InputLabel>
            <Select
              labelId="x-axis-select-label"
              value={xAxis?.name || ''}
              onChange={handleXAxisChange}
              label="X-Axis-----"
              MenuProps={{
                PaperProps: { style: { maxHeight: 224, width: 250 } },
              }}
            >
              {columns.map(col => (
                <MenuItem key={col.name} value={col.name}>
                  {col.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Y-Axis Multi-Selector */}
          <FormControl fullWidth disabled={tab?.workflowTasks.dataExploration?.controlPanel.umap}>
            <InputLabel id="y-axis-multi-select-label">
              <Box display="flex" alignItems="center" gap={1}>
                <ShowChartIcon fontSize="small" />
                Y-Axis
              </Box>
            </InputLabel>
            <Select
              labelId="y-axis-multi-select-label"
              multiple
              value={yAxis.map(col => col.name)}
              onChange={handleYAxisChange}
              input={<OutlinedInput label="Y-Axis-----" />}
              renderValue={selected => (selected as string[]).join(', ')}
              MenuProps={{
                PaperProps: { style: { maxHeight: 224, width: 250 } },
              }}
            >
              {columns.map(col => (
                <MenuItem key={col.name} value={col.name}>
                  <Checkbox checked={yAxis.some(yCol => yCol.name === col.name)} />
                  {col.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: '1rem',
            flexDirection: 'row',
            mt: 2,
          }}
        >
          <FormControl fullWidth disabled={tab?.workflowTasks.dataExploration?.controlPanel.umap}>
            <InputLabel id="color-by-select-label">
              <Box display="flex" alignItems="center" gap={1}>
                <PaletteIcon fontSize="small" />
                Color By
              </Box>
            </InputLabel>
            <Select
              labelId="color-by-select-label"
              value={colorBy?.name || ''}
              onChange={handleColorByChange}
              label="Color By-----"
              MenuProps={{
                PaperProps: { style: { maxHeight: 224, width: 250 } },
              }}
            >
              {columns.map(col => (
                <MenuItem key={col.name} value={col.name}>
                  {col.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box
          sx={{
            mt: 2,
            display: 'flex',
            gap: '1rem',
            flexDirection: 'row',
            width: '100%',
          }}
        >
          <ButtonGroup
            variant="contained"
            aria-label="view mode"
            sx={{ height: '36px' }}
            fullWidth
            disabled={tab?.workflowTasks.dataExploration?.controlPanel.umap}
          >
            <Button
              color={viewMode === 'overlay' ? 'primary' : 'inherit'}
              onClick={() => dispatch(setControls({ viewMode: 'overlay' }))}
              disabled={overlayDisabledByCount}
            >
              Overlay
            </Button>
            <Button
              color={viewMode === 'stacked' ? 'primary' : 'inherit'}
              onClick={() => dispatch(setControls({ viewMode: 'stacked' }))}
            >
              Stacked
            </Button>
          </ButtonGroup>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 500,
                color: tab?.workflowTasks.dataExploration?.controlPanel.umap
                  ? 'primary.main'
                  : 'text.secondary'
              }}
            >
              UMAP
            </Typography>
            <Tooltip title={tooltipTitle} disableHoverListener={!isDisabled}>
              <span>
                <Switch
                  disabled={isDisabled}
                  checked={tab?.workflowTasks.dataExploration?.controlPanel.umap}
                  onChange={() =>
                    dispatch(
                      setControls({
                        umap: !tab?.workflowTasks.dataExploration?.controlPanel.umap,
                      }),
                    )
                  }
                  color="primary"
                  name="umap"
                  inputProps={{ 'aria-label': 'UMAP toggle switch' }}
                />
              </span>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    )
  );
};

export default ScatterChartControlPanel;
