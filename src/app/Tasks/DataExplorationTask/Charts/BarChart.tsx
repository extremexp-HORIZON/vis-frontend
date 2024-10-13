// // import React from 'react';
// // import { Vega } from 'react-vega';

// // const data = [
// //   { state: "MS",  MeanLongitude: -89.23450472, MinLongitude: -89.23450472, CountLongitude: 1.0, MeanLatitude: 31.95376472 },
// //   { state: "TX", MeanLongitude: -95.01792778, MinLongitude: -95.01792778, CountLongitude: 1.0, MeanLatitude: 30.68586111 },
// //   { state: "CO",  MeanLongitude: -104.63507165, MinLongitude: -104.70025, CountLongitude: 2.0, MeanLatitude: 38.875777225 },
// //   { state: "NY",  MeanLongitude: -78.05208056, MinLongitude: -78.05208056, CountLongitude: 1.0, MeanLatitude: 42.74134667 },
// //   { state: "FL",  MeanLongitude: -81.90594389, MinLongitude: -81.90594389, CountLongitude: 1.0, MeanLatitude: 30.6880125 },
// //   { state: "MS",  MeanLongitude: -88.20111111, MinLongitude: -88.20111111, CountLongitude: 1.0, MeanLatitude: 34.49166667 },
// //   { state: "AL",  MeanLongitude: -86.61145333, MinLongitude: -86.61145333, CountLongitude: 1.0, MeanLatitude: 32.85048667 },
// //   { state: "WI",  MeanLongitude: -88.17786917, MinLongitude: -88.17786917, CountLongitude: 1.0, MeanLatitude: 43.08751 },
// //   { state: "OH",  MeanLongitude: -80.64140639, MinLongitude: -80.64140639, CountLongitude: 1.0, MeanLatitude: 40.67331278 },
// //   { state: "MO",  MeanLongitude: -92.22696056, MinLongitude: -92.22696056, CountLongitude: 1.0, MeanLatitude: 40.44725889 },
// // ];

// // // Transform data to create a single array for grouped bars
// // const transformedData = data.flatMap(({ state, MeanLongitude, MeanLatitude,MinLongitude,CountLongitude, }) => [
// //   { state, type: 'Mean Longitude', value: MeanLongitude },
// //   { state, type: 'Mean Latitude', value: MeanLatitude },
// //   { state, type: 'Min Longitude', value: MinLongitude },
// //   { state, type: 'Count Longitude', value: CountLongitude },
// // ]);

// // const specification = {
// //   "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
// //   "description": "A grouped bar chart showing Mean Longitude and Mean Latitude by State.",
// //   "data": {
// //     "values": transformedData,
// //   },
// //   "mark": "bar",
// //   "encoding": {
// //     "x": {
// //       "field": "state",
// //       "type": "nominal",
// //       "axis": { "labelAngle": 0 },
// //       "sort": null,  // Sort by state name
// //     },
// //     "y": {
// //       "field": "value",
// //       "type": "quantitative",
// //       "title": "Value",
// //     },
// //     "color": {
// //       "field": "type",
// //       "type": "nominal",
// //       "scale": {
// //         "domain": ["Mean Longitude", "Mean Latitude", "Min Longitude", "Count Longitude"],
// //         "range": ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"], // Different colors for each type
// //       },
// //       "title": "Aggregation Type",
// //     },
// //     "xOffset": {
// //       "field": "type",
// //       "type": "nominal",
// //     },
// //   }
// // };

// // const BarChart: React.FC = () => {
// //   return (
// //     <Vega
// //       spec={specification}
// //       style={{ width: "100%", height: "400px" }}
// //     />
// //   );
// // };

// // export default BarChart;


// import React from 'react';
// import { Vega } from 'react-vega';

// // Updated data with city names instead of states
// const data = [
//   { city: "Jackson", state: "MS",  MeanLongitude: -89.23450472, MinLongitude: -89.23450472, CountLongitude: 1.0, MeanLatitude: 31.95376472 },
//   { city: "Austin", state: "TX", MeanLongitude: -95.01792778, MinLongitude: -95.01792778, CountLongitude: 1.0, MeanLatitude: 30.68586111 },
//   { city: "Denver", state: "CO",  MeanLongitude: -104.63507165, MinLongitude: -104.70025, CountLongitude: 2.0, MeanLatitude: 38.875777225 },
//   { city: "Albany", state: "NY",  MeanLongitude: -78.05208056, MinLongitude: -78.05208056, CountLongitude: 1.0, MeanLatitude: 42.74134667 },
//   { city: "Tallahassee", state: "FL",  MeanLongitude: -81.90594389, MinLongitude: -81.90594389, CountLongitude: 1.0, MeanLatitude: 30.6880125 },
//   { city: "Gulfport", state: "MS",  MeanLongitude: -88.20111111, MinLongitude: -88.20111111, CountLongitude: 1.0, MeanLatitude: 34.49166667 },
//   { city: "Birmingham", state: "AL",  MeanLongitude: -86.61145333, MinLongitude: -86.61145333, CountLongitude: 1.0, MeanLatitude: 32.85048667 },
//   { city: "Milwaukee", state: "WI",  MeanLongitude: -88.17786917, MinLongitude: -88.17786917, CountLongitude: 1.0, MeanLatitude: 43.08751 },
//   { city: "Columbus", state: "OH",  MeanLongitude: -80.64140639, MinLongitude: -80.64140639, CountLongitude: 1.0, MeanLatitude: 40.67331278 },
//   { city: "Kansas City", state: "MO",  MeanLongitude: -92.22696056, MinLongitude: -92.22696056, CountLongitude: 1.0, MeanLatitude: 40.44725889 },
// ];

// // Transform data to create a single array for grouped bars with city as the categorical name
// const transformedData = data.flatMap(({ city, state, MeanLongitude, MeanLatitude, MinLongitude, CountLongitude }) => [
//   { city, state, type: 'Mean Longitude', value: MeanLongitude },
//   { city, state, type: 'Mean Latitude', value: MeanLatitude },
//   { city, state, type: 'Min Longitude', value: MinLongitude },
//   { city, state, type: 'Count Longitude', value: CountLongitude },
// ]);

// const specification = {
//   "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
//   "description": "A grouped bar chart showing Mean Longitude and Mean Latitude by City.",
//   "data": {
//     "values": transformedData,
//   },
//   "mark": "bar",
//   "encoding": {
//     "x": {
//       "field": "city",
//       "type": "nominal",
//       "axis": { "labelAngle": 0 },
//       "sort": null,  // Sort by city name
//     },
//     "y": {
//       "field": "value",
//       "type": "quantitative",
//       "title": "Value",
//     },
//     "color": {
//       "field": "type",
//       "type": "nominal",
//       "scale": {
//         "domain": ["Mean Longitude", "Mean Latitude", "Min Longitude", "Count Longitude"],
//         "range": ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"], // Different colors for each type
//       },
//       "title": "Aggregation Type",
//     },
//     "xOffset": {
//       "field": "type",
//       "type": "nominal",
//     },
//   }
// };

// const BarChart: React.FC = () => {
//   return (
//     <Vega
//       spec={specification}
//       style={{ width: "100%", height: "400px" }}
//     />
//   );
// };

// export default BarChart


import React from 'react';
import { Vega } from 'react-vega';

// Updated data with city names and associated states
const data = [
  { city: "Jackson", state: "MS",  MeanLongitude: -89.23450472, MinLongitude: -89.23450472, CountLongitude: 1.0, MeanLatitude: 31.95376472 },
  { city: "Austin", state: "TX", MeanLongitude: -95.01792778, MinLongitude: -95.01792778, CountLongitude: 1.0, MeanLatitude: 30.68586111 },
  { city: "Denver", state: "CO",  MeanLongitude: -104.63507165, MinLongitude: -104.70025, CountLongitude: 2.0, MeanLatitude: 38.875777225 },
  { city: "Albany", state: "NY",  MeanLongitude: -78.05208056, MinLongitude: -78.05208056, CountLongitude: 1.0, MeanLatitude: 42.74134667 },
  { city: "Tallahassee", state: "FL",  MeanLongitude: -81.90594389, MinLongitude: -81.90594389, CountLongitude: 1.0, MeanLatitude: 30.6880125 },
  { city: "Gulfport", state: "MS",  MeanLongitude: -88.20111111, MinLongitude: -88.20111111, CountLongitude: 1.0, MeanLatitude: 34.49166667 },
  { city: "Birmingham", state: "AL",  MeanLongitude: -86.61145333, MinLongitude: -86.61145333, CountLongitude: 1.0, MeanLatitude: 32.85048667 },
  { city: "Milwaukee", state: "WI",  MeanLongitude: -88.17786917, MinLongitude: -88.17786917, CountLongitude: 1.0, MeanLatitude: 43.08751 },
  { city: "Columbus", state: "OH",  MeanLongitude: -80.64140639, MinLongitude: -80.64140639, CountLongitude: 1.0, MeanLatitude: 40.67331278 },
  { city: "Kansas City", state: "MO",  MeanLongitude: -92.22696056, MinLongitude: -92.22696056, CountLongitude: 1.0, MeanLatitude: 40.44725889 },
];

// Transform data to create a single array for grouped bars
const transformedData = data.flatMap(({ city, state, MeanLongitude, MeanLatitude, MinLongitude, CountLongitude }) => [
  { city, state, type: 'Mean Longitude', value: MeanLongitude },
  { city, state, type: 'Mean Latitude', value: MeanLatitude },
  { city, state, type: 'Min Longitude', value: MinLongitude },
  { city, state, type: 'Count Longitude', value: CountLongitude },
]);

const specification = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "description": "A grouped bar chart showing Mean Longitude and Mean Latitude by City and State.",
  "data": {
    "values": transformedData,
  },
  "mark": "bar",
  "encoding": {
    "x": {
      "field": "state",
      "type": "nominal",
      "axis": { "labelAngle": 0 },
      "sort": null,  // Sort by city name
    },
    "y": {
      "field": "value",
      "type": "quantitative",
      "title": "Value",
    },
    "color": {
      "field": "type",
      "type": "nominal",
      "scale": {
        "domain": ["Mean Longitude", "Mean Latitude", "Min Longitude", "Count Longitude"],
        "range": ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"], // Different colors for each type
      },
      "title": "Aggregation Type",
    },
    "xOffset": {
      "field": "type",
      "type": "nominal",
    },
    "tooltip": [
      { "field": "city", "type": "nominal", "title": "City" },
      { "field": "state", "type": "nominal", "title": "State" },
      { "field": "value", "type": "quantitative", "title": "Value" },
      { "field": "type", "type": "nominal", "title": "Aggregation Type" },
    ],
  }
};

const BarChart: React.FC = () => {
  return (
    <Vega
      spec={specification}
      style={{ width: "100%", height: "400px" }}
    />
  );
};

export default BarChart;
