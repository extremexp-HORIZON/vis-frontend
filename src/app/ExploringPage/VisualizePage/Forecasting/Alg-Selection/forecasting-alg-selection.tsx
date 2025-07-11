import { useState } from 'react';
import {
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Box,
} from '@mui/material';
import { ForecastingAlgSelectionModal } from './forecasting-alg-selection-modal';
import {
  AlgorithmName,
  IXGBoostDefault,
  ILGBMDefault,
  ILinearRegressionDefault,
} from '../../../../../shared/models/exploring/forecasting.model';
import { setForecastingForm } from '../../../../../store/slices/exploring/forecastingSlice';
import {
  RootState,
  useAppDispatch,
  useAppSelector,
} from '../../../../../store/store';

export const ForecastingAlgSelection = () => {
  const dispatch = useAppDispatch();
  const { forecastingForm } = useAppSelector(
    (state: RootState) => state.forecasting,
  );
  const [customNumber, setCustomNumber] = useState(1);
  const algorithms: AlgorithmName[] = ['XGBoost', 'LGBM', 'LinearRegression'];

  const handleAlgorithmSelection = (algName: AlgorithmName) => {
    const tempForm = { ...forecastingForm };
    const isEnabled = algName in tempForm.algorithms;

    if (isEnabled) {
      delete tempForm.algorithms[algName];
      dispatch(
        setForecastingForm({
          ...forecastingForm,
          algorithms: { ...tempForm.algorithms },
        }),
      );
    } else {
      let defaults:
        | typeof IXGBoostDefault
        | typeof ILGBMDefault
        | typeof ILinearRegressionDefault
        | undefined;
      if (algName === 'XGBoost') defaults = IXGBoostDefault;
      else if (algName === 'LGBM') defaults = ILGBMDefault;
      else if (algName === 'LinearRegression')
        defaults = ILinearRegressionDefault;

      dispatch(
        setForecastingForm({
          ...forecastingForm,
          algorithms: { ...forecastingForm.algorithms, [algName]: defaults },
        }),
      );
    }
  };

  const handleCustomInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;
    if (/^\d+$/.test(value) && +value >= 1 && +value <= 30) {
      setCustomNumber(+value);
      dispatch(
        setForecastingForm({
          ...forecastingForm,
          future_predictions: +value,
        }),
      );
    } else {
      setCustomNumber(0);
      dispatch(
        setForecastingForm({
          ...forecastingForm,
          future_predictions: null,
        }),
      );
    }
  };

  const humanReadableDuration = (number: number) => {
    const intervals = ['15m', '30m', '1h', '6h'];
    const index = intervals.indexOf(forecastingForm.time_interval);
    if (index !== -1) {
      const totalMinutes =
        number * (index === 0 ? 15 : index === 1 ? 30 : index === 2 ? 60 : 360);
      const days = Math.floor(totalMinutes / (24 * 60));
      const remainingMinutes = totalMinutes % (24 * 60);
      const hours = Math.floor(remainingMinutes / 60);
      const minutes = remainingMinutes % 60;
      return days > 0
        ? `${days}d ${hours}h ${minutes}m`
        : `${hours}h ${minutes}m`;
    }
    return '';
  };

  return (
    <Box
      component={Paper}
      elevation={2}
      p={3}
      display="flex"
      flexDirection="column"
      gap={3}
    >
      <Paper variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography fontWeight={600}>Algorithm</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography fontWeight={600}>Parameters</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {algorithms.map(alg => (
              <TableRow key={alg}>
                <TableCell>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={alg in forecastingForm.algorithms}
                        onChange={() => handleAlgorithmSelection(alg)}
                      />
                    }
                    label={alg}
                  />
                </TableCell>
                <TableCell align="center">
                  <ForecastingAlgSelectionModal algorithmName={alg} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Paper
        variant="outlined"
        sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}
      >
        <Typography sx={{ minWidth: 100 }}>Predictions</Typography>
        <TextField
          variant="outlined"
          type="number"
          inputProps={{ min: 1, max: 30 }}
          value={forecastingForm.future_predictions ?? ''}
          onChange={handleCustomInputChange}
          placeholder="Enter number (1-30)"
          sx={{ width: 120 }}
        />
        {forecastingForm.future_predictions && (
          <Typography>{humanReadableDuration(customNumber)}</Typography>
        )}
      </Paper>
    </Box>
  );
};
