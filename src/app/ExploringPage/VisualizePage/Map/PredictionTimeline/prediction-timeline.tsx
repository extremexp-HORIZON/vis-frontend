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
} from '@mui/material';
import {
  type RootState,
  useAppDispatch,
  useAppSelector,
} from '../../../../../store/store';
import {
  setSelectedTimeIndex,
  setSelectedHeight,
} from '../../../../../store/slices/exploring/predictionSlice';

export const PredictionTimeline = () => {
  const dispatch = useAppDispatch();
  const {
    results,
    timestamps,
    intervals,
    selectedTimeIndex,
    selectedHeight,
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

  // Calculate available time slots based on intervals
  const timeSlots = useMemo(() => {
    const allZoneIds = Object.keys(results);

    if (allZoneIds.length === 0) return [];

    // For now, use the first zone's data (can be extended for multi-zone)
    const firstZoneId = allZoneIds[0];
    const baseTimestamp = timestamps[firstZoneId];
    const intervalCount = intervals[firstZoneId] || 0;

    if (!baseTimestamp) return [];

    const slots: string[] = [];

    for (let i = 0; i < intervalCount; i++) {
      const timestamp = new Date(
        new Date(baseTimestamp).getTime() + i * 10 * 60 * 1000,
      ).toISOString();

      slots.push(timestamp);
    }

    return slots;
  }, [results, timestamps, intervals]);

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

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);

    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Generate marks for the slider
  const generateMarks = () => {
    if (timeSlots.length === 0) return [];

    // Create marks for all intervals
    const marks = timeSlots.map((_, index) => ({
      value: index,
      label:
        index === 0 || index === timeSlots.length - 1
          ? formatTimestamp(timeSlots[index])
          : '', // Empty label for intermediate marks
    }));

    return marks;
  };

  // Don't render if not in prediction display mode or no data
  if (
    !predictionDisplay ||
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
          <Typography variant="caption" textAlign="center" sx={{ fontWeight: 'bold' }}>
            Time
            <Typography
              variant="body2"
              color="primary"
              sx={{ fontWeight: 'bold' }}
            >
              {formatTimestamp(timeSlots[selectedTimeIndex])}
            </Typography>
          </Typography>
        </Box>

        {timeSlots.length > 1 && <ThemeProvider theme={sliderTheme}>
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
        </ThemeProvider>}

        {/* Time Counter */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <Typography variant="caption">
            {selectedTimeIndex + 1} / {timeSlots.length}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};
