
// // import { ChartProps } from '@superset-ui/core';
// // import { noOp } from 'src/utils/common';

// // export default function transformProps(chartProps: ChartProps) {
// //   const {
// //     formData,
// //     height,
// //     hooks,
// //     queriesData,
// //     width,
// //     behaviors,
// //     filterState,
// //     inputRef,
// //     displaySettings,
// //   } = chartProps;
// //   const {
// //     setDataMask = noOp,
// //     setFocusedFilter = noOp,
// //     unsetFocusedFilter = noOp,
// //     setHoveredFilter = noOp,
// //     unsetHoveredFilter = noOp,
// //     setFilterActive = noOp,
// //   } = hooks;
// //   const { data } = queriesData[0];

// //   return {
// //     data,
// //     formData,
// //     behaviors,
// //     height,
// //     setDataMask,
// //     filterState,
// //     width,
// //     setHoveredFilter,
// //     unsetHoveredFilter,
// //     setFocusedFilter,
// //     unsetFocusedFilter,
// //     setFilterActive,
// //     inputRef,
// //     isOverflowingFilterBar: displaySettings?.isOverflowingFilterBar,
// //     filterBarOrientation: displaySettings?.filterBarOrientation,
// //   };
// // }




// import { ChartProps } from '@superset-ui/core';
// import { noOp } from 'src/utils/common';

// export default function transformProps(chartProps: ChartProps) {
//   console.log("Transform props start");
  
//   // Destructuring chartProps
//   const {
//     formData,
//     height,
//     hooks,
//     queriesData,
//     width,
//     behaviors,
//     filterState,
//     inputRef,
//     displaySettings,
//   } = chartProps;

//   // Destructuring hooks object
//   const {
//     // setDataMask = noOp,
//     setFocusedFilter = noOp,
//     unsetFocusedFilter = noOp,
//     setHoveredFilter = noOp,
//     unsetHoveredFilter = noOp,
//     setFilterActive = noOp,
//   } = hooks;
//   const { setDataMask = () => {}, onContextMenu } = hooks;


//   // Destructuring data from queriesData
//   const { data } = queriesData[0];

//   // Creating an object to return
//   const transformedProps = {
//     data,
//     formData,
//     behaviors,
//     height,
//     setDataMask,
//     filterState,
//     onContextMenu,
//     width,
//     setHoveredFilter,
//     unsetHoveredFilter,
//     setFocusedFilter,
//     unsetFocusedFilter,
//     setFilterActive,
//     inputRef,
//     isOverflowingFilterBar: displaySettings?.isOverflowingFilterBar,
//     filterBarOrientation: displaySettings?.filterBarOrientation,
//   };

//   console.log("Transformed Props:", transformedProps);
//   console.log("Transform props end");

//   return transformedProps;
// }



import { ChartProps, TimeseriesDataRecord } from '@superset-ui/core';
import { ISeries } from '../shared/model/series.model';


export default function transformProps(chartProps: ChartProps) {
  console.log('Props Start');

  const { hooks, formData, queriesData} = chartProps;
  console.log('Queired data',queriesData);
  console.log('chart data',chartProps);
  const columnNames = chartProps.datasource.columns.map(
    column => column.column_name);
  console.log(columnNames);


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


  // console.log('form,',formData)
  return {
    series,
    formData,
    columnNames,
    setDataMask,
    onContextMenu,
  };
}


