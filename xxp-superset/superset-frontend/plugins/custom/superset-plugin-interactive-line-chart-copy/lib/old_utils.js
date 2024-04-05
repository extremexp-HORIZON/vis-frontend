

// import React, { useEffect, useRef, useState,useMemo, } from 'react';
// import Highcharts from 'highcharts/highstock';
// import HighchartsReact from 'highcharts-react-official';
// import { SupersetPluginInteractiveLineChartProps } from './types';

// export default function SupersetPluginInteractiveLineChart(props: SupersetPluginInteractiveLineChartProps) {

//   const { series: initialSeries, setDataMask,formData } = props;
//   const [chartRef, setChartRef] = useState(null);
//   const [from, setFrom] = useState(0);
//   const [to, setTo] = useState(0);
//   const [queryResultsLoading, setQueryResultsLoading] = useState(false);
//   const chart = useRef(chartRef);
//   const fetchDataRef = useRef({ isScrolling: false, scrollTimeout: null });

//   useEffect(() => {
//     setFrom(initialSeries[0].data[0].epoch);
//     setTo(initialSeries[0].data[initialSeries[0].data.length - 1].epoch);
//   }, []);

//   // Effect to hide loading when results are not loading
//   useEffect(() => {
//     if (chartRef !== null) {
//       !queryResultsLoading && chartRef.hideLoading();
//     }
//   }, [queryResultsLoading]);

//   const computeChartData = () => {
//     const seriesColors = ['red', 'blue','black','orange','pink'];
//     return initialSeries.map((series, index) => {
//       // Sort the data array based on the epoch values
//       const sortedData = series.data.sort((a, b) => a.epoch - b.epoch);
//       return {
//         data: sortedData.map(d => {
//           const val = d.value;
//           const timestamp = new Date(d.epoch).getTime();
//           return [timestamp, isNaN(val) ? null : val];
//         }),
//         name: series.name,
//         color: seriesColors[index % seriesColors.length],
//         // color: formData.colorScheme,
//         yAxis: 0,
//         showInLegend: true,
//         enableMouseTracking: formData.showLegend,
//       };
//     });
//   };
//   // Required for pan to work
//   const dummyPointCreator = (text, top, height) => ({
//     title: {
//       enabled: false,
//       text,
//     },
//     opposite: false,
//     top,
//     height,
//     lineWidth: 2,
//     offset: 10,
//   });

//   // Required for pan to work
//   const dummySeriesCreator = (name, x, idx) => ({
//     type: 'line',
//     data: [
//       {
//         x,
//         y: 0,
//       },
//     ],
//     name,
//     color: 'transparent',
//     yAxis: 0,
//     // yAxis: changeChart ? selectedMeasures.length + customSelectedMeasures.length + Object.values(compare).reduce((acc: number, arr: number[]) => acc + arr.length, 0) + idx : 0,
//     // TODO: fix this
//     zoneAxis: 'x',
//     enableMouseTracking: false,
//     showInLegend: false,
//   });

//   const computeYAxisData = () => {
//     const yAxisObject = {
//       title: {
//         enabled: true,
//       },
//       opposite: false,
//       top: '0%',
//       height: '100%',
//       lineWidth: 2,
//       offset: 1,
//       startOnTick: false,
//       endOnTick: false,
//     };

//     const mergedObject = {
//       ...yAxisObject,
//       ...[dummyPointCreator('minPoint', '-10px', '0px'), dummyPointCreator('maxPoint', '-10px', '0px')],
//     };

//     return mergedObject;
//   };

//     const [keepData,SetKeepData]=useState(formData.keepData)
//     const fetchData = () => {
//       if (keepData){
//         const xAxis = chart.current.xAxis[0];
//         const { min, max } = xAxis.getExtremes();
//         // Show loading, set loading state, and update data mask
//         chart.current.showLoading();
//         setQueryResultsLoading(true);
//         setDataMask({ ownState: {start: null, end: null} });

//         setQueryResultsLoading(false);
//         SetKeepData(false);

//       }else{
//         const xAxis = chart.current.xAxis[0];
//         const { min, max } = xAxis.getExtremes();
//         // Show loading, set loading state, and update data mask
//         chart.current.showLoading();
//         setQueryResultsLoading(true);
//         setDataMask({ ownState: {start: min, end: max} });

//         setQueryResultsLoading(false);

//       }
//     };

//   const chartFunctions = (e: { target: any }) => {
//     chart.current = e.target;

//     const handleEventTimeout = (event) => {
//       if (fetchDataRef.current.scrollTimeout) {
//         clearTimeout(fetchDataRef.current.scrollTimeout);
//       }
//       fetchDataRef.current = { ...fetchDataRef.current, isScrolling: true };
//       fetchDataRef.current = {
//         ...fetchDataRef.current,
//         scrollTimeout: setTimeout(() => {
//           fetchDataRef.current = { ...fetchDataRef.current, isScrolling: false };
//           fetchData();

//         },500),
//       };
//     };

//     Highcharts.addEvent(chart.current.container, 'wheel', (event: WheelEvent) => {
//       const p = chart.current.xAxis[0].toValue(chart.current.pointer.normalize(event).chartX);
//       const { min, max, dataMax, dataMin } = chart.current.xAxis[0].getExtremes();
//       const stepleft = (p - min) * 0.25;
//       const stepright = (max - p) * 0.25;
//       if (!chart.current.loadingShown ) {
//         if (event.deltaY < 0 && max - min > 18000000000) { 
//           // in, 10000 is the max range on a zoom level
//           chart.current.xAxis[0].setExtremes(min + stepleft, max - stepright, true, false);
//           handleEventTimeout(event);
//         } else if (event.deltaY > 0 && max - min < to - from) {
//           // out
//           chart.current.xAxis[0].setExtremes(
//             Math.max(min - stepleft, from),
//             Math.min(max + stepright, to),
//             true,
//             false
//           );
//           handleEventTimeout(event);
//         }
//       }
//     });

//     Highcharts.addEvent(chart.current.container, 'mouseup', (event: MouseEvent) => {
//       if (!chart.current.loadingShown) {
//         handleEventTimeout(event);
//       }
//     });
//   }
//   // Function to get the chart reference
//   const getChartRef = (chartR: any) => {
//     setChartRef(chartR);
//   };

//   return (
//     <div>
//       <HighchartsReact
//         highcharts={Highcharts}
//         constructorType={'stockChart'}
//         containerProps={{ className: 'chartContainer', style: { top: 0, height: '100%', position: 'absolute', width: '100%' } }}
//         allowChartUpdate={true}
//         immutable={false}
//         ref={chartRef}
//         callback={getChartRef}
//         updateArgs={[true, true, true]}
//         options={{
//           title: 'null',
//           plotOptions: {

//             line: {
//               dataGrouping: {
//                 enabled: false,
//               },
//             },
//             series: {
//               connectNulls: false,
//               connectorAllowed: false,
//               allowPointSelect: true,
//               lineWidth: 1,
//               states: {
//                 hover: false,
//               },
//               boostThreshold: 0,
//             },
//           },

//           // series: computeChartData(), // Use the initial series data
//           series: [...computeChartData(),
//             dummySeriesCreator('minPoint', from, 0),
//             dummySeriesCreator('maxPoint', to, 1),
//           ],
//           chart: {
//             type: 'line',
//             marginTop: 10,
//             plotBorderWidth: 0,
//             backgroundColor: 'rgba(0,0,0, 0.05)',
//             zoomType: true,
//             panning: {
//               enabled: true,
//               type: 'x',

//             },

//             events: {
//               plotBackgroundColor: 'rgba(10,0,0,0)', // dummy color, to create an element
//               load: chartFunctions,

//             },
//           },

//           xAxis: {
//             ordinal: false,
//             type: 'datetime',
//           },
//           yAxis: computeYAxisData(),
//           rangeSelector: {
//             enabled: true,
//           },
//           navigator: {
//             enabled: false,
//             adaptToUpdatedData: true,
//           },
//           scrollbar: {
//             enabled: false,
//             liveRedraw: false,
//           },
//           colorAxis: null,

//           credits: {
//             enabled: false,
//           },
//           loading: {
//             labelStyle: {
//               color: 'black',
//               fontSize: '20px',
//             },
//             style: {
//               backgroundColor: 'transparent',
//             },
//           },
//         }}
//       />
//     </div>
//   );
// }
"use strict";