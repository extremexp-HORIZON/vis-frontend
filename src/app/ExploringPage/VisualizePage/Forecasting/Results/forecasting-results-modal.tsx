import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { RootState } from '../../../../../store/store';
import { useAppSelector } from '../../../../../store/store';
import { Visibility as VisibilityIcon } from '@mui/icons-material';

export const ForecastingResultsModal = () => {
  const { data: timeSeries } = useAppSelector(
    (state: RootState) => state.timeSeries,
  );
  const { results: forecastingResults } = useAppSelector(
    (state: RootState) => state.forecasting,
  );

  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const generateCharts = () => {
    if (!forecastingResults?.metrics) return [];

    const predictionSeries = Object.keys(forecastingResults.metrics).map(
      key =>
        forecastingResults.metrics && {
          name: key,
          opposite: false,
          offset: 0,
          data: forecastingResults.metrics[key].predictions.map(point => [
            point.timestamp,
            point.value,
          ]),
        },
    );

    const originalSeries = {
      name: 'initial Series',
      opposite: false,
      offset: 0,
      data:
        timeSeries?.map(datapoint => [datapoint.timestamp, datapoint.value]) ??
        [],
    };

    return [...predictionSeries, originalSeries];
  };

  const options = {
    title: {
      text: 'Initial vs. Predicted Time Series',
    },
    series: forecastingResults && timeSeries ? generateCharts() : [],
    xAxis: {
      ordinal: false,
      type: 'datetime',
    },
    plotOptions: {
      series: {
        dataGrouping: {
          enabled: true,
          forced: true,
          units: [['minute', [15]]],
        },
      },
    },
    rangeSelector: {
      enabled: false,
    },
    legend: {
      enabled: true,
    },
    credits: {
      enabled: false,
    },
  };

  return (
    <>
      <Tooltip title="View Forecasting Results">
        <IconButton size="small" onClick={() => setOpen(true)}>
          <VisibilityIcon />
        </IconButton>
      </Tooltip>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
        fullScreen={fullScreen}
      >
        <DialogTitle>Forecasting Results</DialogTitle>
        <DialogContent sx={{ overflow: 'hidden' }}>
          {/* TODO: Figure out a way to replace Highcharts with Vega Lite */}
          {/* <HighchartsReact
            highcharts={Highcharts}
            constructorType="stockChart"
            options={options}
          /> */}
        </DialogContent>
      </Dialog>
    </>
  );
};
