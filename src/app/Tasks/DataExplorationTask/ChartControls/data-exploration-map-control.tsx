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
  Switch,
} from '@mui/material';
import { setControls } from '../../../../store/slices/workflowPageSlice';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import type{ SelectChangeEvent } from '@mui/material';

const MapControls = () => {
  const dispatch = useAppDispatch();
  const { tab } = useAppSelector(state => state.workflowPage);

  const selectedColumns =
    tab?.workflowTasks?.dataExploration?.metaData.data?.originalColumns || [];

  const stringColumns = selectedColumns.filter(col => col.type === 'STRING');
  const doubleColumns = selectedColumns.filter(col => col.type === 'DOUBLE');

  const lat = tab?.workflowTasks?.dataExploration?.controlPanel.lat || '';
  const lon = tab?.workflowTasks?.dataExploration?.controlPanel.lon || '';
  const colorByMap =
    tab?.workflowTasks?.dataExploration?.controlPanel.colorByMap || 'None';
  const segmentBy =
    tab?.workflowTasks?.dataExploration?.controlPanel.segmentBy || [];
  // const timestampField =
  //   tab?.workflowTasks?.dataExploration?.controlPanel.timestampField || '';
  const useHeatmap =
    tab?.workflowTasks?.dataExploration?.controlPanel.heatmap || false;
  const handleChange = (key: string, value: string | string[] | boolean) => {
    dispatch(setControls({ [key]: value }));
  };

  const handleSegmentByChange = (e: SelectChangeEvent<string[]>) => {
    const value = e.target.value;

    handleChange('segmentBy', value as string);

    // if (value.length > 0 && colorByMap !== 'None') {
    //   handleChange('colorByMap', 'None');
    // }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box display="flex" gap={2}>
        {/* Latitude Selector */}
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

        {/* Longitude Selector */}
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
      </Box>

      <Box display="flex" gap={2}>
        {/* Color By Selector */}
        <FormControl  fullWidth>
          <InputLabel>Color By</InputLabel>
          <Select
            value={colorByMap}
            onChange={e => handleChange('colorByMap', e.target.value)}
            input={<OutlinedInput label="Color By" />}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 250,
                  maxWidth: 300,
                },
              },
            }}
          >
            {selectedColumns.map(col => (
              <MenuItem key={col.name} value={col.name}>
                {col.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Segment By Selector */}
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
          >
            {stringColumns.map(col => (
              <MenuItem key={col.name} value={col.name}>
                <Checkbox checked={segmentBy.includes(col.name)} />
                <ListItemText primary={col.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <FormControlLabel
        control={
          <Switch
            checked={useHeatmap}
            onChange={e => handleChange('heatmap', e.target.checked)}
          />
        }
        label="Heatmap"
      />
    </Box>
  );
};

export default MapControls;
