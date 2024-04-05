// export default function transformProps(chartProps) {
//   console.log("chartProps:", chartProps);

//   const { width, height, formData, queriesData } = chartProps;
  
//   const {
//     includeSeries,
//     linearColorScheme,
//     metrics,
//     secondaryMetric,
//     series,
//     showDatatable,
//   } = formData;
 
//   const columnNames = chartProps.datasource.columns.map(
//     column => column.column_name);


//   return {
//     width,
//     height,
//     data: queriesData[0].data,
//     includeSeries,
//     linearColorScheme,
//     metrics: metrics.map(m => m.label || m),
//     colorMetric:
//       secondaryMetric && secondaryMetric.label
//         ? secondaryMetric.label
//         : secondaryMetric,
//     series,
//     showDatatable,
//     columnNames,
//     formData,
//   };
// }



export default function transformProps(chartProps) {
  console.log('PROPS START');

  console.log("chartProps:", chartProps);

  const { width, height, formData, queriesData } = chartProps;
  
  console.log("FormData:", formData);
  console.log("QueriesData:", queriesData);

  const {
    includeSeries,
    linearColorScheme,
    metrics,
    secondaryMetric,
    series,
    showDatatable,
    timeseriesLimitMetric,
  } = formData;

  console.log("Metrics:", metrics);
  console.log("Secondary Metric:", secondaryMetric);
  console.log('timeseriesLimitMetric',timeseriesLimitMetric);
  // timeseriesLimitMetric.label="AVG(precision)";
 
  const columnNames = chartProps.datasource.columns.map(
    column => column.column_name);

  console.log('PROPS STOP');


  return {
    width,
    height,
    data: queriesData[0].data,
    includeSeries,
    linearColorScheme,
    metrics: metrics.map(m => m.label || m),
    colorMetric:
      secondaryMetric && secondaryMetric.label
        ? secondaryMetric.label
        : secondaryMetric,
    series,
    showDatatable,
    columnNames,
    formData,
    timeseriesLimitMetric,
  };
}
