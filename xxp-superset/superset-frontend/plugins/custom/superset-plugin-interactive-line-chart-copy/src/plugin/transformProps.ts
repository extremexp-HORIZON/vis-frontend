

import { ChartProps, TimeseriesDataRecord } from '@superset-ui/core';
import { ISeries } from '../shared/model/series.model';


export default function transformProps(chartProps: ChartProps) {
  console.log('Props Start');

  const { hooks, formData, queriesData} = chartProps;
  console.log('Queired data',queriesData);
  console.log('chartprops',chartProps);
  const columnNames = chartProps.datasource.columns.map(
    column => column.column_name);
// queriesData[0].data=queriesData[0].data.slice(0, 3);

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
  
  const series = datasets.map((dataset) => ({
    name: dataset.label,
    data: dataset.data.map((item) => ({
      epoch: new Date(item.label).getTime(),
      value: item.value as number,
    })),
  } as ISeries));
  console.log('Props End');


  return {
    series,
    formData,
    columnNames,
    setDataMask,
    onContextMenu,
  };
}


