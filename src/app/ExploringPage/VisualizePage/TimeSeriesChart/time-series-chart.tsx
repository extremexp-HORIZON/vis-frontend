import { useEffect, useMemo, useState } from 'react';
import {
  Typography,
  MenuItem,
  Select,
  FormControl,
  Box,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
} from '@mui/icons-material';
import type { IDataset } from '../../../../shared/models/exploring/dataset.model';
import {
  type RootState,
  useAppDispatch,
  useAppSelector,
} from '../../../../store/store';
import {
  setFrequency,
  setMeasureCol,
  triggerTimeSeriesUpdate,
} from '../../../../store/slices/exploring/timeSeriesSlice';
import { TimeSeriesVisualizer } from './time-series-visualizer';
import Loader from '../../../../shared/components/loader';

export interface IChartTSProps {
  dataset: IDataset;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const TimeSeriesChart = (props: IChartTSProps) => {
  const { dataset, isFullscreen = false, onToggleFullscreen } = props;
  const dispatch = useAppDispatch();
  const { data, frequency, measureCol, loading } = useAppSelector(
    (state: RootState) => state.timeSeries,
  );
  const {
    loading: { executeQuery: loadingExecuteQuery },
  } = useAppSelector((state: RootState) => state.dataset);
  const [frequencyData, setFrequencyData] = useState('15m');

  // State for viewport dimensions
  const [viewportDimensions, setViewportDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Update viewport dimensions on resize with throttling
  useEffect(() => {
    // Only track viewport changes when in fullscreen mode
    if (!isFullscreen) return;

    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      // Throttle resize events to prevent excessive re-renders
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setViewportDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 100); // 100ms throttle
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isFullscreen]);

  const handleTimeInterval = (value: string) => {
    let freq = 900;

    setFrequencyData(value);
    switch (value) {
      case '15m':
        freq = 900;
        break;
      case '30m':
        freq = 1800;
        break;
      case '1h':
        freq = 3600;
        break;
      case '6h':
        freq = 21600;
        break;
    }
    dispatch(setFrequency(freq));
    dispatch(triggerTimeSeriesUpdate());
  };

  useEffect(() => {
    const getTimeIntervalFromFrequency = () => {
      switch (frequency) {
        case 900:
          return '15m';
        case 1800:
          return '30m';
        case 3600:
          return '1h';
        case 21600:
          return '6h';
        default:
          return '15m';
      }
    };

    setFrequencyData(getTimeIntervalFromFrequency());
  }, [frequency]);

  // Calculate viewport-based dimensions with memoization
  const chartDimensions = useMemo(() => {
    if (isFullscreen) {
      return {
        minWidth: Math.floor(viewportDimensions.width * 0.6), // 60vw
        minHeight: Math.floor(viewportDimensions.height * 0.4), // 40vh
        maxHeight: Math.floor(viewportDimensions.height * 0.6), // 60vh
      };
    }

    return {
      minWidth: 100,
      minHeight: 100,
      maxHeight: 300,
    };
  }, [isFullscreen, viewportDimensions.width, viewportDimensions.height]);

  return (
    data &&
    data.length > 0 && (
      <Box
        sx={{
          mt: 1,
          border: 1,
          borderColor: 'grey.300',
          boxShadow: 2,
          borderRadius: 2,
          p: 3,
          bgcolor: 'white',
          ...(isFullscreen && {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 999,
            borderRadius: 0,
            height: '80vh',
            width: '80vw',
            display: 'flex',
            flexDirection: 'column',
          }),
        }}
      >
        {loading || loadingExecuteQuery ? (
          <Loader />
        ) : (
          <>
            <Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                {onToggleFullscreen && (
                  <Tooltip
                    title={
                      isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'
                    }
                    placement="top"
                  >
                    <IconButton color="default" onClick={onToggleFullscreen}>
                      {isFullscreen ? (
                        <FullscreenExitIcon />
                      ) : (
                        <FullscreenIcon />
                      )}
                    </IconButton>
                  </Tooltip>
                )}
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="body2">Time series data for</Typography>
                  <FormControl size="small" variant="standard">
                    <Select
                      labelId="measure-select-label"
                      value={measureCol || ''}
                      onChange={e => {
                        dispatch(setMeasureCol(e.target.value));
                        dispatch(triggerTimeSeriesUpdate());
                      }}
                    >
                      {dataset.measure0 && (
                        <MenuItem value={dataset.measure0}>
                          {dataset.measure0}
                        </MenuItem>
                      )}
                      {dataset.measure1 && (
                        <MenuItem value={dataset.measure1}>
                          {dataset.measure1}
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <Box
                display="flex"
                justifyContent="flex-end"
                alignItems="center"
                my={1}
                gap={2}
              >
                <Typography variant="body2">Freq.</Typography>
                <FormControl size="small" variant="standard">
                  <Select
                    labelId="frequency-select-label"
                    value={frequencyData}
                    onChange={e => handleTimeInterval(e.target.value)}
                  >
                    <MenuItem value="15m">15m</MenuItem>
                    <MenuItem value="30m">30m</MenuItem>
                    <MenuItem value="1h">1h</MenuItem>
                    <MenuItem value="6h">6h</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <TimeSeriesVisualizer
              data={data}
              measureCol={measureCol}
              minWidth={chartDimensions.minWidth}
              minHeight={chartDimensions.minHeight}
              maxHeight={chartDimensions.maxHeight}
              isFullscreen={isFullscreen}
            />
          </>
        )}
      </Box>
    )
  );
};
