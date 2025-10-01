import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  MenuItem,
  Select,
  FormControl,
  Box,
} from '@mui/material';
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
import { Forecasting } from '../Forecasting/forecasting';
import Loader from '../../../../shared/components/loader';

export interface IChartTSProps {
  dataset: IDataset;
}

export const TimeSeriesChart = ({ dataset }: IChartTSProps) => {
  const dispatch = useAppDispatch();
  const { data, frequency, measureCol, loading } = useAppSelector(
    (state: RootState) => state.timeSeries,
  );
  const { loading: { executeQuery: loadingExecuteQuery } } = useAppSelector(
    (state: RootState) => state.dataset,
  );
  const [frequencyData, setFrequencyData] = useState('15m');

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

  return data && data.length > 0 && (
    <Card sx={{ p: 2, mt: 1 }}>
      {loading || loadingExecuteQuery ? (
        <Loader />
      ) : (
        <>
          <CardContent sx={{ pb: 1 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
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
              <Forecasting dataset={dataset} />
            </Box>

            <Box
              display="flex"
              justifyContent="flex-end"
              alignItems="center"
              mt={2}
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
          </CardContent>

          <TimeSeriesVisualizer data={data} measureCol={measureCol} />
        </>
      )}
    </Card>
  );
};
