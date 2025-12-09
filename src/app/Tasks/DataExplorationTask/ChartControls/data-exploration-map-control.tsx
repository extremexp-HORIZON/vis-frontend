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
import type { SelectChangeEvent } from '@mui/material';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { ThemeProvider } from '@emotion/react';
import PaletteIcon from '@mui/icons-material/Palette';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SearchableSelect from '../../../../shared/components/searchable-select';
import SearchableMultiSelect from '../../../../shared/components/searchable-select-multiple';

const MapControls = () => {
  const dispatch = useAppDispatch();
  const { tab } = useAppSelector(state => state.workflowPage);

  const selectedColumns =
    tab?.workflowTasks?.dataExploration?.metaData.data?.originalColumns || [];

  const stringColumns = selectedColumns.filter(col => col.type === 'STRING');
  const doubleColumns = selectedColumns.filter(col => col.type === 'DOUBLE');

  const lat = tab?.workflowTasks?.dataExploration?.controlPanel.lat;
  const lon = tab?.workflowTasks?.dataExploration?.controlPanel.lon;
  const colorByMap =
    tab?.workflowTasks?.dataExploration?.controlPanel.colorByMap || 'None';
  const segmentBy =
    tab?.workflowTasks?.dataExploration?.controlPanel.segmentBy || [];
  // const timestampField =
  //   tab?.workflowTasks?.dataExploration?.controlPanel.timestampField || '';
  // const useHeatmap =
  //   tab?.workflowTasks?.dataExploration?.controlPanel.heatmap || false;
  const handleChange = (
    key: string,
    value: string | string[] | boolean | number,
  ) => {
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

  const handleSegmentByChange = (value: string[]) => {
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
          <TravelExploreIcon fontSize="small" />{' '}
          {/* Replace or conditionally render icons if needed */}
          <span style={{ fontSize: 14, fontWeight: 600 }}>{'Map Type'}</span>
        </Box>
        <RadioGroup
          row
          aria-labelledby="type-label"
          name="maptpe"
          value={mapType}
          onChange={e => handleChange('mapType', e.target.value)}
        >
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
          <FormControl fullWidth>
            <SearchableSelect
              labelId="color-by-label"
              inputLabel={
                <Box display="flex" alignItems="center" gap={1}>
                  <PaletteIcon fontSize="small" />
                  Color
                </Box>
              }
              label="Color-----"
              value={colorByMap}
              options={[
                'None',
                ...selectedColumns
                  .filter(
                    col =>
                      col.name !== lat &&
                      col.name !== lon &&
                      !timestampField?.includes(col.name),
                  )
                  .map(col => col.name),
              ]}
              onChange={value => {
                handleChange('colorByMap', value);
              }}
              menuMaxHeight={150}
              menuWidth={150}
            />
          </FormControl>
        )}

        {mapType === 'heatmap' && (
          <>
            <FormControl sx={{ width: '50%' }}>
              <SearchableSelect
                labelId="weight-by-label"
                inputLabel="Weight By"
                label="Weight By"
                value={
                  tab?.workflowTasks?.dataExploration?.controlPanel.weightBy || ''
                }
                options={[
                  'None',
                  ...doubleColumns
                    .filter(col => col.name !== lat && col.name !== lon)
                    .map(col => col.name),
                ]}
                onChange={(value) => {
                  handleChange('weightBy', value);

                  // If colorByMap is set to something other than 'None', reset segmentBy
                }}
                menuMaxHeight={150}
                menuWidth={150}
              />
            </FormControl>
            <FormControl sx={{ width: '40%' }}>
              <ThemeProvider theme={theme}>
                <Box display="flex" alignItems="center" gap={1}>
                  <TrackChangesIcon fontSize="small" />
                  <Typography gutterBottom>Radius</Typography>
                </Box>
                <Slider
                  value={
                    tab?.workflowTasks?.dataExploration?.controlPanel.radius
                  }
                  onChange={(e, newValue) =>
                    handleChange('radius', newValue as number)
                  }
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
              <SearchableMultiSelect
                labelId="segment-by-label"
                inputLabel={
                  <Box display="flex" alignItems="center" gap={1}>
                    <PaletteIcon fontSize="small" />
                    Segment
                  </Box>
                }
                label="Segment By"
                value={segmentBy}
                options={
                  stringColumns
                    .filter(
                      col =>
                        col.name !== lat &&
                        col.name !== lon &&
                        !timestampField?.includes(col.name),
                    )
                    .map(col => col.name) || []
                }
                onChange={handleSegmentByChange}
                menuMaxHeight={150}
                menuWidth={200}
              />
            </FormControl>
            <FormControl
              fullWidth
              required
              error={!tab?.workflowTasks.dataExploration?.controlPanel.orderBy}

              // disabled={timestampField === null || timestampField === ''}
            >
              <InputLabel
                id="order-by"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                <AccessTimeIcon fontSize="small" />
                <span>Order</span>
              </InputLabel>
              <Select
                value={
                  tab?.workflowTasks.dataExploration?.controlPanel.orderBy || ''
                }
                onChange={e =>
                  handleChange('orderBy', e.target.value as string)
                }
                input={<OutlinedInput label="Order-----" />}
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
          </>
        )}
      </Box>
    </Box>
  );
};

export default MapControls;
