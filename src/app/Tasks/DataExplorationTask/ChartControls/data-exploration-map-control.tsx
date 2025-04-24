import { Box, FormControl, InputLabel, Select, OutlinedInput, MenuItem, Checkbox, ListItemText } from "@mui/material";
import { setControls } from "../../../../store/slices/workflowPageSlice";
import { useAppDispatch, useAppSelector } from "../../../../store/store";

const MapControls = () => {
  const dispatch = useAppDispatch();
  const { tab } = useAppSelector(state => state.workflowPage);

  const selectedColumns = tab?.workflowTasks?.dataExploration?.controlPanel.selectedColumns || [];

  const stringColumns = selectedColumns.filter(col => col.type === 'STRING');
  const doubleColumns = selectedColumns.filter(col => col.type === 'DOUBLE');

  const lat = tab?.workflowTasks?.dataExploration?.controlPanel.lat || '';
  const lon = tab?.workflowTasks?.dataExploration?.controlPanel.lon || '';
  const colorByMap = tab?.workflowTasks?.dataExploration?.controlPanel.colorByMap || 'None';
  const segmentBy = tab?.workflowTasks?.dataExploration?.controlPanel.segmentBy || [];

  const handleChange = (key: string, value: any) => {
    dispatch(setControls({ [key]: value }));
  };

  const handleSegmentByChange = (e: any) => {
    const value = e.target.value;
    handleChange('segmentBy', value);

    if (value.length > 0 && colorByMap !== 'None') {
      handleChange('colorByMap', 'None');
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" gap={2}>


      {/* Latitude Selector */}
      <FormControl fullWidth>
        <InputLabel>Latitude</InputLabel>
        <Select
          value={lat}
          onChange={(e) => handleChange('lat', e.target.value)}
          input={<OutlinedInput label="Latitude" />}
        >
          {doubleColumns.map(col => (
            <MenuItem key={col.name} value={col.name}>{col.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Longitude Selector */}
      <FormControl fullWidth>
        <InputLabel>Longitude</InputLabel>
        <Select
          value={lon}
          onChange={(e) => handleChange('lon', e.target.value)}
          input={<OutlinedInput label="Longitude" />}
        >
          {doubleColumns.map(col => (
            <MenuItem key={col.name} value={col.name}>{col.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      </Box>

      <Box display="flex" gap={2}>


      {/* Color By Selector */}
      <FormControl disabled={segmentBy.length > 0} fullWidth>
        <InputLabel>Color By</InputLabel>
        <Select
          value={segmentBy.length > 0 ? 'None' : colorByMap}
          onChange={(e) => handleChange('colorByMap', e.target.value)}
          input={<OutlinedInput label="Color By" />}
        >
          <MenuItem value="None">None</MenuItem>
          {stringColumns.map(col => (
            <MenuItem key={col.name} value={col.name}>{col.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Segment By Selector */}
      <FormControl fullWidth>
        <InputLabel>Segment By</InputLabel>
        <Select
          multiple
          value={segmentBy}
          onChange={handleSegmentByChange}
          input={<OutlinedInput label="Segment By" />}
          renderValue={(selected) => (selected as string[]).join(', ')}
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

    </Box>
  );
};

export default MapControls;