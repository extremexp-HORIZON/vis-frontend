import { useEffect, useMemo } from 'react';
import {
  Box,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Paper,
  ThemeProvider,
  createTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
} from '@mui/material';
import {
  type RootState,
  useAppDispatch,
  useAppSelector,
} from '../../../../../store/store';
import {
  setSelectedTimeIndex,
  setSelectedHeight,
  setSelectedZoneId,
} from '../../../../../store/slices/exploring/predictionSlice';

export const PredictionTimeline = () => {
  const dispatch = useAppDispatch();
  const {
    results,
    selectedTimeIndex,
    selectedHeight,
    selectedZoneId,
    predictionDisplay,
  } = useAppSelector((state: RootState) => state.prediction);

  // Create a custom theme for the slider to avoid gradient color issues
  const sliderTheme = createTheme({
    palette: {
      primary: {
        main: '#6BBC8C',
      },
      secondary: {
        main: '#6BBC8C',
      },
    },
  });

  // Calculate available heights from all prediction results
  const availableHeights = useMemo(() => {
    const allResults = Object.values(results).flat();
    const heights = new Set(allResults.map(r => r.height));

    return Array.from(heights).sort((a, b) => a - b);
  }, [results]);

  // Calculate available time slots based on selected zone's prediction data
  const timeSlots = useMemo(() => {
    if (!selectedZoneId || !results[selectedZoneId]) return [];

    const zoneResults = results[selectedZoneId];

    if (zoneResults.length === 0) return [];

    // Extract unique timestamps from the selected zone's prediction data
    const uniqueTimestamps = [
      ...new Set(zoneResults.map(result => result.timestamp)),
    ];

    // Sort timestamps chronologically
    const sortedTimestamps = uniqueTimestamps.sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime(),
    );

    return sortedTimestamps;
  }, [results, selectedZoneId]);

  // Get available zones
  const availableZones = useMemo(() => {
    return Object.keys(results).map(zoneId => ({
      id: zoneId,
      name: `Zone ${zoneId.slice(-8)}`, // Show last 8 characters of zone ID
    }));
  }, [results]);

  // Initialize selected zone when data becomes available
  useEffect(() => {
    if (availableZones.length > 0 && !selectedZoneId) {
      dispatch(setSelectedZoneId(availableZones[0].id));
    }
  }, [availableZones, selectedZoneId, dispatch]);

  // Initialize selected height when data becomes available
  useEffect(() => {
    if (availableHeights.length > 0 && selectedHeight === null) {
      dispatch(setSelectedHeight(availableHeights[0]));
    }
  }, [availableHeights, selectedHeight, dispatch]);

  // Handle time slider change
  const handleTimeChange = (_event: Event, newValue: number | number[]) => {
    dispatch(setSelectedTimeIndex(newValue as number));
  };

  // Handle height selection change
  const handleHeightChange = (
    _event: React.MouseEvent<HTMLElement>,
    newHeight: number | null,
  ) => {
    if (newHeight !== null) {
      dispatch(setSelectedHeight(newHeight));
    }
  };

  // Handle zone selection change
  const handleZoneChange = (event: SelectChangeEvent<string>) => {
    const newZoneId = event.target.value;

    dispatch(setSelectedZoneId(newZoneId));
    // Reset time index when changing zones
    dispatch(setSelectedTimeIndex(0));
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: string, hourOnly: boolean = false) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);

    if (hourOnly) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    }

    return date.toLocaleTimeString([], {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Generate marks for the slider
  const generateMarks = () => {
    if (timeSlots.length === 0) return [];

    // Create marks for all intervals
    const marks = timeSlots.map((_, index) => ({
      value: index,
      label:
        index === 0 || index === timeSlots.length - 1
          ? formatTimestamp(timeSlots[index], true)
          : '', // Empty label for intermediate marks
    }));

    return marks;
  };

  // Don't render if not in prediction display mode or no data
  if (
    !predictionDisplay ||
    availableZones.length === 0 ||
    timeSlots.length === 0 ||
    availableHeights.length === 0
  ) {
    return null;
  }

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderRadius: 2,
        paddingX: 5,
        paddingY: 1,
        minWidth: 600,
        maxWidth: 800,
      }}
    >
      {/* Zone Selector */}
      {availableZones.length > 1 && <Box sx={{ mb: 2 }}>
        <Typography
          variant="caption"
          textAlign="center"
          sx={{ fontWeight: 'bold', mb: 0.5, display: 'block' }}
        >
          Zone
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel>Select Zone</InputLabel>
          <Select
            value={selectedZoneId || ''}
            onChange={handleZoneChange}
            label="Select Zone"
          >
            {availableZones.map(zone => (
              <MenuItem key={zone.id} value={zone.id}>
                {zone.id}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>}

      {/* Height Selector */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="caption"
          textAlign="center"
          sx={{ fontWeight: 'bold', mb: 0.5, display: 'block' }}
        >
          Height (meters)
        </Typography>
        <ToggleButtonGroup
          value={selectedHeight}
          exclusive
          onChange={handleHeightChange}
          size="small"
          fullWidth
        >
          {availableHeights.map(height => (
            <ToggleButton key={height} value={height}>
              {height}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {/* Timeline Scrubber */}
      <Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            mb: 1,
          }}
        >
          <Typography
            variant="caption"
            textAlign="center"
            sx={{ fontWeight: 'bold' }}
          >
            Timestamp
            <Typography
              variant="body2"
              color="primary"
              sx={{ fontWeight: 'bold' }}
            >
              {formatTimestamp(timeSlots[selectedTimeIndex])}
            </Typography>
          </Typography>
        </Box>

        {timeSlots.length > 1 && (
          <ThemeProvider theme={sliderTheme}>
            <Slider
              value={selectedTimeIndex}
              min={0}
              max={Math.max(0, timeSlots.length - 1)}
              step={1}
              marks={generateMarks()}
              onChange={handleTimeChange}
              valueLabelDisplay="auto"
              valueLabelFormat={value => formatTimestamp(timeSlots[value])}
              color="primary"
              sx={{ mb: 1 }}
            />
          </ThemeProvider>
        )}

        {/* Time Counter and Zone Info */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption">
            {selectedTimeIndex + 1} / {timeSlots.length}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {availableZones.length} zone{availableZones.length !== 1 ? 's' : ''}{' '}
            available
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};
