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
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import { setControls } from '../../../../store/slices/workflowPageSlice';

import ShowChartIcon from '@mui/icons-material/ShowChart';
import type{ SelectChangeEvent } from '@mui/material';

const LineChartControlPanel = () => {
  const dispatch = useAppDispatch();
  const tab = useAppSelector(state => state.workflowPage.tab);
  const controlPanel = tab?.workflowTasks.dataExploration?.controlPanel;
  const columns =
    tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns || [];

  const xAxis = controlPanel?.xAxis;
  const yAxis = controlPanel?.yAxis || [];
  const viewMode = useAppSelector(
    state =>
      state.workflowPage.tab?.workflowTasks.dataExploration?.controlPanel
        ?.viewMode,
  );

  // Auto-clean yAxis if columns no longer exist
  useEffect(() => {
    const validYAxis = yAxis.filter(yCol =>
      columns.find(col => col.name === yCol.name),
    );

    if (validYAxis.length !== yAxis.length) {
      dispatch(setControls({ yAxis: validYAxis }));
    }
  }, [columns, yAxis]);

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
      .filter(Boolean);

    dispatch(setControls({ yAxis: selectedCols }));
  };

  useEffect(() => {
    const validYAxis = yAxis.filter(yCol =>
      columns.find(col => col.name === yCol.name),
    );

    if (validYAxis.length !== yAxis.length) {
      dispatch(setControls({ yAxis: validYAxis }));
    }

    // Ensure selectedColumns includes xAxis and yAxis
    const currentSelected = controlPanel?.selectedColumns || [];
    const requiredCols = [xAxis, ...validYAxis];

    const missingCols = requiredCols.filter(
      reqCol => !currentSelected.find(sel => sel.name === reqCol?.name)
    );

    if (missingCols.length > 0) {
      const updatedSelected = [
        ...currentSelected,
        ...missingCols.filter(Boolean), // Avoid null/undefined
      ];
      const cleanedSelected = updatedSelected.filter(col => col?.name && col.type);

      dispatch(setControls({ selectedColumns: cleanedSelected }));
    }
  }, [columns, yAxis, xAxis]);

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
          <FormControl fullWidth>
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
          <FormControl fullWidth>
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
              renderValue={selected => selected.join(', ')}
              MenuProps={{
                PaperProps: { style: { maxHeight: 224, width: 250 } },
              }}
            >
              {columns.map(col => (
                <MenuItem key={col.name} value={col.name}>
                  <Checkbox
                    checked={yAxis.some(yCol => yCol.name === col.name)}
                  />
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
            width: '100%'
          }}
        >

          <ButtonGroup
            variant="contained"
            aria-label="view mode"
            sx={{ height: '36px' }}
            fullWidth
          >
            <Button
              color={viewMode === 'overlay' ? 'primary' : 'inherit'}
              onClick={() => dispatch(setControls({ viewMode: 'overlay' }))}
            >
             Overlay
            </Button>
            <Button
              color={viewMode === 'stacked' ? 'primary' : 'inherit'}
              onClick={() => dispatch(setControls({ viewMode: 'stacked' }))}
            //  disabled={yAxis.length < 2}
            >
             Stacked
            </Button>
          </ButtonGroup>
        </Box>
      </Box>

    )
  );
};

export default LineChartControlPanel;
