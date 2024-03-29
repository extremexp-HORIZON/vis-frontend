

import { ChartProps, TimeseriesDataRecord } from '@superset-ui/core';
import { ISeries } from '../shared/model/series.model';


export default function transformProps(chartProps: ChartProps) {
  console.log('Props');

  const { hooks, formData, queriesData } = chartProps;
  const data = queriesData[0].data as TimeseriesDataRecord[];
  const { setDataMask = () => {}, onContextMenu } = hooks;
  // Your existing logic to process the data
  const datasets = Object.keys(data[0]).filter((key) => key !== '__timestamp').map((key) => ({
    label: key,
    data: data.map((item) => ({
      label: item.__timestamp,
      value: item[key],
    })),
  }));
  console.log('datasets',datasets);
  
  const series = datasets.map((dataset) => ({
    name: dataset.label,
    data: dataset.data.map((item) => ({
      epoch: new Date(item.label).getTime(),
      value: item.value as number,
    })),
  } as ISeries));
  console.log('series',series);

  // console.log('form,',formData)
  return {
    series,
    formData,
    setDataMask,
    onContextMenu,
  };
}


