export default function transformProps(chartProps) {
  console.log('Props Start');
  var {
    hooks,
    formData,
    queriesData
  } = chartProps;
  console.log('Queired data', queriesData);
  console.log('chartprops', chartProps);
  var columnNames = chartProps.datasource.columns.map(column => column.column_name);
  // queriesData[0].data=queriesData[0].data.slice(0, 3);

  var data = queriesData[0].data;
  var {
    setDataMask = () => {},
    onContextMenu
  } = hooks;
  // Your existing logic to process the data
  var datasets = Object.keys(data[0]).filter(key => key !== '__timestamp').map(key => ({
    label: key,
    data: data.map(item => ({
      label: item.__timestamp,
      value: item[key]
    }))
  }));
  var series = datasets.map(dataset => ({
    name: dataset.label,
    data: dataset.data.map(item => ({
      epoch: new Date(item.label).getTime(),
      value: item.value
    }))
  }));
  console.log('Props End');
  return {
    series,
    formData,
    columnNames,
    setDataMask,
    onContextMenu
  };
}