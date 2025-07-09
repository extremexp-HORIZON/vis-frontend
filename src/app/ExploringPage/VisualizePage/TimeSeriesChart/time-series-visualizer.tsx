import { useEffect, useState } from 'react';
import type { IUnivariateDataPoint } from '../../../../shared/models/exploring/univariate-datapoint.model';
// import {
//   selectForecastingForm,
//   selectIsInTrainStepper,
//   selectPredictions,
// } from '@/slices/forecastingSlice';
import type { VisualizationSpec } from 'react-vega';
import ResponsiveVegaLite from '../../../../shared/components/responsive-vegalite';

export interface ITSVisualizerProps {
  data: IUnivariateDataPoint[] | null;
  forecasting?: boolean;
  measureCol: string | null;
}

export const TimeSeriesVisualizer = (props: ITSVisualizerProps) => {
  const { data, forecasting, measureCol } = props;
  // const forecastingForm = useAppSelector(selectForecastingForm);
  // const isInTrainStepper = useAppSelector(selectIsInTrainStepper);
  // const predictions = useAppSelector(selectPredictions);

  const [seriesData, setSeriesData] = useState<number[][] | null>(null);
  // const [predictionSeriesData, setPredictionSeriesData] = useState<number[][]>(
  //   [],
  // );

  const getZones = () => {
    // if (forecastingForm && data) {
    //   const forecastingStartDate = data[0].timestamp;
    //   const forecastingEndDate = data[data.length - 1].timestamp;
    //   const forecastingDataSplit = forecastingForm.dataSplit;
    //   if (isInTrainStepper) {
    //     return [
    //       {
    //         value:
    //           forecastingStartDate +
    //           (forecastingEndDate - forecastingStartDate) *
    //             (forecastingDataSplit[0] / 100),
    //         color: '#4CAF50',
    //       },
    //       {
    //         value:
    //           forecastingStartDate +
    //           (forecastingEndDate - forecastingStartDate) *
    //             ((forecastingDataSplit[0] + forecastingDataSplit[1]) / 100),
    //         color: '#FF6B6B',
    //       },
    //       { value: forecastingEndDate, color: '#536DFE' },
    //     ];
    //   }
    // }
    return null;
  };

  useEffect(() => {
    if (data) {
      const formattedData = data.map(datapoint => [
        datapoint.timestamp,
        datapoint.value,
      ]);

      setSeriesData(formattedData);
    }
  }, [data]);

  // useEffect(() => {
  //   if (predictions) {
  //     const formattedPredictions = predictions.map(datapoint => [
  //       datapoint.timestamp,
  //       datapoint.value,
  //     ]);
  //     setPredictionSeriesData(formattedPredictions);
  //   }
  // }, [predictions]);

  const vegaSeriesData = seriesData?.map(datapoint => ({
    timestamp: datapoint[0],
    value: datapoint[1],
  }));

  function assignZoneColors(
    data: IUnivariateDataPoint[],
    zones: { value: number; color: string }[],
  ) {
    if (!zones.length) return data.map(d => ({ ...d, zoneColor: '#1f77b4' }));

    return data.map(d => {
      // Find the first zone where d.timestamp <= zone.value
      const zone = zones.find(z => d.timestamp <= z.value);

      return { ...d, zoneColor: zone ? zone.color : '#1f77b4' };
    });
  }

  const rawZones = forecasting && getZones() ? getZones() : [];
  const coloredVegaSeriesData = vegaSeriesData
    ? assignZoneColors(vegaSeriesData, rawZones ?? [])
    : [];

  const spec: VisualizationSpec = {
    mark: { type: 'line', point: true },
    encoding: {
      x: {
        field: 'timestamp',
        type: 'temporal',
        title: 'Date',
        axis: { format: '%d-%b-%y' },
      },
      y: { field: 'value', type: 'quantitative', title: measureCol },
      ...(forecasting && {
        color: {
          field: 'zoneColor',
          type: 'nominal',
          scale: null,
          legend: null,
        },
      }),
      tooltip: [
        {
          field: 'timestamp',
          type: 'temporal',
          title: 'Date',
          format: '%Y-%m-%d %H:%M',
        },
        {
          field: 'value',
          type: 'quantitative',
          title: measureCol,
          format: '.2f',
        },
      ],
    },
    data: {
      values: forecasting ? coloredVegaSeriesData : (vegaSeriesData ?? []),
    },
  };

  return vegaSeriesData && vegaSeriesData.length > 0 ? (
    <ResponsiveVegaLite
      minWidth={100}
      minHeight={100}
      aspectRatio={1 / 0.75}
      actions={false}
      spec={spec}
    />
  ) : null;
};
