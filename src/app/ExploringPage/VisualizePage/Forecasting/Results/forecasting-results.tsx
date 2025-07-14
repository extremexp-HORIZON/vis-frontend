import type React from 'react';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Alert,
  AlertTitle,
  Collapse,
  Box,
  Stack,
} from '@mui/material';
import {
  KeyboardArrowDown as ChevronDown,
  KeyboardArrowUp as ChevronUp,
  Check,
  Save,
  ShowChart as LineChart,
  CheckCircle,
  Loop,
} from '@mui/icons-material';
import { ForecastingResultsModal } from './forecasting-results-modal';
import type { IForecastingResults } from '../../../../../shared/models/exploring/forecasting-results.model';
import {
  setPredictions,
  saveModel,
} from '../../../../../store/slices/exploring/forecastingSlice';
import type {
  RootState } from '../../../../../store/store';
import {
  useAppDispatch,
  useAppSelector,
} from '../../../../../store/store';

interface RowProps {
  status: string;
  timeSeriesMeasureCol: string;
  forecastingResults: IForecastingResults;
  handleClick: (type: string) => void;
  handlePredict: () => void;
}

const Row: React.FC<RowProps> = ({
  status,
  timeSeriesMeasureCol,
  forecastingResults,
  handleClick,
  handlePredict,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <ChevronUp /> : <ChevronDown />}
          </IconButton>
        </TableCell>
        <TableCell>{timeSeriesMeasureCol}</TableCell>
        <TableCell align="center">
          {status === 'waiting' ? (
            <Loop
              className="text-warning"
              sx={{ animation: 'spin 2s linear infinite', color: 'orange' }}
            />
          ) : status === 'processing' ? (
            <Loop
              className="text-muted"
              sx={{ animation: 'spin 2s linear infinite', color: 'gray' }}
            />
          ) : (
            <Check sx={{ color: 'green' }} />
          )}
        </TableCell>
        <TableCell align="center" sx={{ textTransform: 'capitalize' }}>
          {status}
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell
          colSpan={4}
          sx={{ paddingBottom: open ? 2 : 0, paddingTop: open ? 2 : 0 }}
        >
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="subtitle2">Evaluation Metrics</Typography>
                <ForecastingResultsModal />
              </Stack>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Model</TableCell>
                      <TableCell align="center">MAE</TableCell>
                      <TableCell align="center">MAPE</TableCell>
                      <TableCell align="center">MSE</TableCell>
                      <TableCell align="center">RMSE</TableCell>
                      <TableCell align="center" />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {forecastingResults?.metrics &&
                      Object.keys(forecastingResults.metrics).map(
                        resultName => {
                          const evaluation =
                            forecastingResults.metrics &&
                            forecastingResults.metrics[resultName].evaluation;

                          return (
                            evaluation && (
                              <TableRow key={resultName}>
                                <TableCell>{resultName}</TableCell>
                                <TableCell align="center">
                                  {evaluation['MAE']}
                                </TableCell>
                                <TableCell align="center">
                                  {evaluation['MAPE']}
                                </TableCell>
                                <TableCell align="center">
                                  {evaluation['MSE']}
                                </TableCell>
                                <TableCell align="center">
                                  {evaluation['RMSE']}
                                </TableCell>
                                <TableCell align="center">
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    justifyContent="center"
                                  >
                                    <IconButton
                                      size="small"
                                      onClick={handlePredict}
                                    >
                                      <LineChart fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleClick(resultName)}
                                    >
                                      <Save fontSize="small" />
                                    </IconButton>
                                  </Stack>
                                </TableCell>
                              </TableRow>
                            )
                          );
                        },
                      )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export const ForecastingResults = () => {
  const dispatch = useAppDispatch();
  const [openSnack, setOpenSnack] = useState(false);
  const { data: timeSeries, measureCol: timeSeriesMeasureCol } = useAppSelector(
    (state: RootState) => state.timeSeries,
  );
  const { forecastingForm } = useAppSelector(
    (state: RootState) => state.forecasting,
  );
  const { results: forecastingResults } = useAppSelector(
    (state: RootState) => state.forecasting,
  );
  const { savedModels } = useAppSelector(
    (state: RootState) => state.forecasting,
  );

  const handleSnackOpen = () => setOpenSnack(true);
  const handleSnackClose = () => setOpenSnack(false);

  const handlePredict = () => {
    const { time_interval, future_predictions } = forecastingForm;

    if (
      !timeSeries?.length ||
      !time_interval ||
      !future_predictions ||
      future_predictions <= 0
    )
      return;

    const intervalInMs =
      {
        '15m': 15 * 60 * 1000,
        '30m': 30 * 60 * 1000,
        '1h': 60 * 60 * 1000,
        '6h': 6 * 60 * 60 * 1000,
      }[time_interval] ?? 60 * 60 * 1000;

    const lastTimestamp = timeSeries[timeSeries.length - 1].timestamp;
    const startTime = lastTimestamp + intervalInMs;

    const predictions = [
      {
        timestamp: lastTimestamp,
        value: timeSeries[timeSeries.length - 1].value,
      },
      ...Array.from({ length: future_predictions }, (_, i) => {
        const nextTimestamp = startTime + (i + 1) * intervalInMs;
        const value = timeSeries[Math.max(timeSeries.length - 1 - i, 0)].value;

        return { timestamp: nextTimestamp, value };
      }),
    ];

    dispatch(setPredictions(predictions));
  };

  const handleClick = (type: string) => {
    const id = savedModels?.length > 0 ? savedModels.length + 1 : 1;

    dispatch(saveModel({ model_name: `${type}-${id}`, model_type: type }));
    handleSnackOpen();
  };

  return (
    <Box width="100%">
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Measure Name</TableCell>
              <TableCell align="center">Progress</TableCell>
              <TableCell align="center" />
            </TableRow>
          </TableHead>
          <TableBody>
            {forecastingResults && (
              <Row
                status="done"
                handleClick={handleClick}
                handlePredict={handlePredict}
                timeSeriesMeasureCol={timeSeriesMeasureCol!}
                forecastingResults={forecastingResults}
              />
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Collapse in={openSnack}>
        <Alert
          severity="success"
          icon={<CheckCircle />}
          onClose={handleSnackClose}
          sx={{ mt: 2 }}
        >
          <AlertTitle>Success</AlertTitle>
          Model has been saved
        </Alert>
      </Collapse>
    </Box>
  );
};
