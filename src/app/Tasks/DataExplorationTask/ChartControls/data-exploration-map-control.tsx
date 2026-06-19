import {
  Box,
  FormControl,
  Slider,
  Typography,
} from '@mui/material';
import { setControls } from '../../../../store/slices/workflowPageSlice';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import PaletteIcon from '@mui/icons-material/Palette';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SearchableSelect from '../../../../shared/components/searchable-select';
import SearchableMultiSelect from '../../../../shared/components/searchable-select-multiple';
import SegmentedToggle from '../../../../shared/components/segmented-toggle';
import ControlSection from '../../../../shared/components/control-section';

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

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <ControlSection label="Map Type" icon={<TravelExploreIcon fontSize="small" />}>
        <SegmentedToggle
          aria-label="map type"
          value={mapType ?? ''}
          onChange={(v) => handleChange('mapType', v)}
          options={options}
        />
      </ControlSection>
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
            <FormControl fullWidth>
              <SearchableSelect
                labelId="order-by"
                inputLabel={
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <AccessTimeIcon fontSize="small" />
                    <span>Order</span>
                  </Box>
                }
                label="Order By"
                required
                error={!tab?.workflowTasks.dataExploration?.controlPanel.orderBy}
                value={
                  tab?.workflowTasks.dataExploration?.controlPanel.orderBy || ''
                }
                options={timestampField ?? []}
                onChange={(value) => handleChange('orderBy', value)}
                menuMaxHeight={150}
                menuWidth={150}
              />
            </FormControl>
          </>
        )}
      </Box>
    </Box>
  );
};

export default MapControls;
