import {
  Box,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  MenuItem,
  Checkbox,
  ListItemText,
  FormControlLabel,
  Radio,
  RadioGroup,
  Slider,
  Typography,
  createTheme,
} from '@mui/material';
import { setControls } from '../../../../store/slices/workflowPageSlice';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import type{ SelectChangeEvent } from '@mui/material';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { ThemeProvider } from '@emotion/react';
const MapControls = () => {
  const dispatch = useAppDispatch();
  const { tab } = useAppSelector(state => state.workflowPage);

  const selectedColumns =
    tab?.workflowTasks?.dataExploration?.metaData.data?.originalColumns || [];

  const stringColumns = selectedColumns.filter(col => col.type === 'STRING');
  const doubleColumns = selectedColumns.filter(col => col.type === 'DOUBLE');

  const lat = tab?.workflowTasks?.dataExploration?.controlPanel.lat ;
  const lon = tab?.workflowTasks?.dataExploration?.controlPanel.lon ;
  const colorByMap =
    tab?.workflowTasks?.dataExploration?.controlPanel.colorByMap || 'None';
  const segmentBy =
    tab?.workflowTasks?.dataExploration?.controlPanel.segmentBy || [];
  // const timestampField =
  //   tab?.workflowTasks?.dataExploration?.controlPanel.timestampField || '';
  // const useHeatmap =
  //   tab?.workflowTasks?.dataExploration?.controlPanel.heatmap || false;
  const handleChange = (key: string, value: string | string[] | boolean | number) => {
    dispatch(setControls({ [key]: value }));
  };
  const timestampField =
    tab?.workflowTasks?.dataExploration?.controlPanel.timestampField || null;

  const mapType = tab?.workflowTasks?.dataExploration?.controlPanel.mapType;

  const options = [
    { value: 'point', label: 'Point Map' },
    { value: 'heatmap', label: 'Heatmap' },
    { value: 'trajectory', label: 'Trajectory' },
  ];

  const handleSegmentByChange = (e: SelectChangeEvent<string[]>) => {
    const value = e.target.value as string[];

    handleChange('segmentBy', value);
  };

  const theme = createTheme({
    palette: {
      primary: { main: '#1976d2' },
      secondary: { main: '#dc004e' },
    },
    typography: {
      fontFamily: 'Arial',
      h6: { fontWeight: 600 },
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <FormControl size="small">
        <Box display="flex" alignItems="center" gap={0.5}>
          <TravelExploreIcon fontSize="small" /> {/* Replace or conditionally render icons if needed */}
          <span style={{ fontSize: 14, fontWeight: 600 }}>{'Map Type'}</span>
        </Box>
        <RadioGroup row aria-labelledby="type-label" name="maptpe" value={mapType} onChange={e => handleChange('mapType', e.target.value)}>
          {options.map(({ value, label }) => (
            <FormControlLabel
              key={value}
              value={value}
              control={<Radio size="small" />}
              label={<span style={{ fontSize: 12 }}>{label}</span>}
            />
          ))}
        </RadioGroup>
      </FormControl>
      {/* <Box display="flex" gap={2}>
        <FormControl fullWidth>
          <InputLabel>Latitude</InputLabel>
          <Select
            value={lat}
            onChange={e => handleChange('lat', e.target.value)}
            input={<OutlinedInput label="Latitude" />}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 250,
                  maxWidth: 300,
                },
              },
            }}
          >
            {doubleColumns.map(col => (
              <MenuItem key={col.name} value={col.name}>
                {col.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Longitude</InputLabel>
          <Select
            value={lon}
            onChange={e => handleChange('lon', e.target.value)}
            input={<OutlinedInput label="Longitude" />}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 250,
                  maxWidth: 300,
                },
              },
            }}
          >
            {doubleColumns.map(col => (
              <MenuItem key={col.name} value={col.name}>
                {col.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box> */}

      <Box display="flex" gap={2}>
        {/* Color By Selector */}
        {mapType === 'point' && (
          <FormControl  fullWidth>
            <InputLabel>Color By</InputLabel>
            <Select
              value={colorByMap}
              onChange={e => {
                const value = e.target.value;

                handleChange('colorByMap', value);

              }}
              input={<OutlinedInput label="Color By" />}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 150,
                    maxWidth: 150,
                  },
                },
              }}
            >
              <MenuItem value="None">None</MenuItem>
              {selectedColumns
                .filter(
                  col =>
                    col.name !== lat &&
            col.name !== lon &&
          !timestampField?.includes(col.name)
                )
                .map(col => (
                  <MenuItem key={col.name} value={col.name}>
                    {col.name}
                  </MenuItem>
                ))}
            </Select>

          </FormControl>

        )}

        {mapType === 'heatmap' && (
          <>
            <FormControl  fullWidth>
              <InputLabel>Weight By</InputLabel>
              <Select
                value={tab?.workflowTasks?.dataExploration?.controlPanel.weightBy || ''}
                onChange={e => {
                  const value = e.target.value;

                  handleChange('weightBy', value);

                  // If colorByMap is set to something other than 'None', reset segmentBy

                }}
                input={<OutlinedInput label="Weight By" />}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 150,
                      maxWidth: 150,
                    },
                  },
                }}
              >
                <MenuItem value="None">None</MenuItem>
                {doubleColumns.filter(
                  col =>
                    col.name !== lat &&
            col.name !== lon).map(col => (
                  <MenuItem key={col.name} value={col.name}>
                    {col.name}
                  </MenuItem>
                ))}
              </Select>

            </FormControl>
            <FormControl fullWidth>

              <ThemeProvider theme={theme}>

                <Typography gutterBottom>Radius</Typography>
                <Slider
                  value={tab?.workflowTasks?.dataExploration?.controlPanel.radius }
                  onChange={(e, newValue) => handleChange('radius', newValue as number)}
                  valueLabelDisplay="auto"

                  min={10}
                  step={1}
                  max={50}
                />
              </ThemeProvider>
            </FormControl>
          </>

        )}

        {/* Segment By Selector */}
        {mapType === 'trajectory' && (
          <>
            <FormControl
              fullWidth
              // disabled={timestampField === null || timestampField === ''}
            >
              <InputLabel>Segment By</InputLabel>
              <Select
                // disabled={true}
                multiple
                value={segmentBy}
                onChange={handleSegmentByChange}
                input={<OutlinedInput label="Segment By" />}
                renderValue={selected => (selected as string[]).join(', ')}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 150,
                      maxWidth: 200,
                    },
                  },
                }}
              >
                {stringColumns.filter(col => col.name !== lat && col.name !== lon &&
          !timestampField?.includes(col.name)).map(col => (
                  <MenuItem key={col.name} value={col.name}>
                    <Checkbox checked={segmentBy.includes(col.name)} />
                    <ListItemText primary={col.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl
              fullWidth
              required
              error={!tab?.workflowTasks.dataExploration?.controlPanel.orderBy}

              // disabled={timestampField === null || timestampField === ''}
            >
              <InputLabel>Order By</InputLabel>
              <Select
                value={tab?.workflowTasks.dataExploration?.controlPanel.orderBy || ''}
                onChange={e => handleChange('orderBy', e.target.value as string)}
                input={<OutlinedInput label="Order By" />}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 150,
                      maxWidth: 150,
                    },
                  },
                }}
              >
                {timestampField?.map(col => (
                  <MenuItem key={col} value={col}>
                    {col}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>) }

      </Box>

    </Box>
  );
};

export default MapControls;
