import { useState } from 'react';
import MultiRangeSlider, { type ChangeResult } from 'multi-range-slider-react';
import {
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  type SelectChangeEvent,
  Tooltip,
  Typography,
  Box,
} from '@mui/material';
import { setForecastingForm } from '../../../../../store/slices/exploring/forecastingSlice';
import {
  setFrequency,
  triggerTimeSeriesUpdate,
} from '../../../../../store/slices/exploring/timeSeriesSlice';
import type {
  RootState } from '../../../../../store/store';
import {
  useAppDispatch,
  useAppSelector,
} from '../../../../../store/store';

export const ForecastingDataPrep = () => {
  const dispatch = useAppDispatch();
  const { forecastingForm } = useAppSelector(
    (state: RootState) => state.forecasting,
  );
  const [predefinedSplit, setPredefinedSplit] = useState('balanced');

  const handleDataSplit = (vals: ChangeResult) => {
    const minValue = vals.minValue;
    const maxValue = vals.maxValue;

    dispatch(
      setForecastingForm({
        ...forecastingForm,
        dataSplit: [minValue, maxValue - minValue, 100 - maxValue],
      }),
    );
  };

  const handleTimeInterval = (value: string) => {
    let frequency = 900;

    switch (value) {
      case '15m':
        frequency = 900;
        break;
      case '30m':
        frequency = 1800;
        break;
      case '1h':
        frequency = 3600;
        break;
      case '6h':
        frequency = 21600;
        break;
    }
    dispatch(setFrequency(frequency));
    dispatch(triggerTimeSeriesUpdate());
    dispatch(setForecastingForm({ ...forecastingForm, time_interval: value }));
  };

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setPredefinedSplit(value);

    let minValue, maxValue;

    switch (value) {
      case 'balanced':
        minValue = 60;
        maxValue = 80;
        break;
      case 'aggressive':
        minValue = 80;
        maxValue = 90;
        break;
      case 'conservative':
        minValue = 50;
        maxValue = 75;
        break;
      default:
        minValue = 60;
        maxValue = 80;
    }

    dispatch(
      setForecastingForm({
        ...forecastingForm,
        dataSplit: [minValue, maxValue - minValue, 100 - maxValue],
      }),
    );
  };

  const tooltipContent = {
    balanced:
      'Balanced split: Allocates equal proportions for training, validation, and test sets.',
    aggressive:
      'Aggressive split: Reserves the majority of data for training and small portions for validation and test sets.',
    conservative:
      'Conservative split: Takes a cautious approach by allocating relatively large portions for validation and test sets.',
  };

  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mr: 'auto' }}>
            Time Interval
          </Typography>
          <FormControl size="small">
            <InputLabel id="time-interval-label">Freq.</InputLabel>
            <Select
              labelId="time-interval-label"
              value={forecastingForm.time_interval}
              onChange={(e: SelectChangeEvent) =>
                handleTimeInterval(e.target.value)
              }
              label="Freq."
            >
              <MenuItem value="15m">15m</MenuItem>
              <MenuItem value="30m">30m</MenuItem>
              <MenuItem value="1h">1h</MenuItem>
              <MenuItem value="6h">6h</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Data Split
          </Typography>

          {forecastingForm.dataSplit && (
            <Box display="flex" justifyContent="center">
              <MultiRangeSlider
                min={0}
                max={100}
                step={1}
                minValue={forecastingForm.dataSplit[0]}
                maxValue={
                  forecastingForm.dataSplit[0] + forecastingForm.dataSplit[1]
                }
                ruler={false}
                label={true}
                labels={['0', '20', '40', '60', '80', '100']}
                barLeftColor="#4CAF50"
                barInnerColor="#FF6B6B"
                barRightColor="#536DFE"
                thumbLeftColor="white"
                thumbRightColor="white"
                style={{
                  border: 'none',
                  boxShadow: 'none',
                  width: '80%',
                  padding: '15px 10px',
                }}
                onChange={handleDataSplit}
              />
            </Box>
          )}

          <RadioGroup
            row
            value={predefinedSplit}
            onChange={handleRadioChange}
            sx={{ justifyContent: 'flex-end' }}
          >
            {['balanced', 'aggressive', 'conservative'].map(option => (
              <FormControlLabel
                key={option}
                value={option}
                control={<Radio />}
                label={
                  <Tooltip
                    title={
                      tooltipContent[option as keyof typeof tooltipContent]
                    }
                  >
                    <span>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </span>
                  </Tooltip>
                }
              />
            ))}
          </RadioGroup>
        </Box>
      </CardContent>
    </Card>
  );
};
