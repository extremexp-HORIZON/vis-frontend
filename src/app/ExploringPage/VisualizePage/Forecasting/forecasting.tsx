import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
} from '@mui/material';
import { Launch as LaunchIcon, Close as CloseIcon } from '@mui/icons-material';
import type { IDataset } from '../../../../shared/models/exploring/dataset.model';
import type { RootState } from '../../../../store/store';
import { useAppSelector } from '../../../../store/store';
import { TimeSeriesVisualizer } from '../TimeSeriesChart/time-series-visualizer';
import { ForecastingTrainStepper } from './Landing/forecastin-train-stepper';
import { ForecastingModelSelection } from './Landing/forecasting-model-selection';

export interface IForecastingProps {
  dataset: IDataset;
}

export const Forecasting = ({ dataset }: IForecastingProps) => {
  const { data, measureCol, loading } = useAppSelector(
    (state: RootState) => state.timeSeries,
  );
  const { newTrain } = useAppSelector((state: RootState) => state.forecasting);
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <IconButton
        onClick={handleOpen}
        color="primary"
        size="small"
        sx={{ border: '1px solid', borderRadius: 1 }}
      >
        <LaunchIcon />
      </IconButton>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <DialogTitle>Forecasting {measureCol}</DialogTitle>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent dividers>
          {!loading && (
            <TimeSeriesVisualizer
              data={data}
              measureCol={measureCol}
              forecasting
            />
          )}
          {!newTrain ? (
            <ForecastingModelSelection />
          ) : (
            <ForecastingTrainStepper dataset={dataset} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
