// import React from 'react';
// import { VegaLite, VisualizationSpec } from 'react-vega';

// const BarChart = ({data,columns}) => {
//     const spec: VisualizationSpec = 
//     {
        
//             "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
//             "data": {
//               "values": data
//             },
//             "repeat": {
//               "row": columns,
//               "column": columns
//             },
//             "spec": {
//               "mark": "point",
//               "encoding": {
//                 "x": {"field": {"repeat": "column"}, "type": "quantitative"},
//                 "y": {"field": {"repeat": "row"}, "type": "quantitative"},
//                 "tooltip": [
//                   {"field": {"repeat": "column"}, "type": "quantitative"},
//                   {"field": {"repeat": "row"}, "type": "quantitative"}
//                 ]
//               }
//             }
          
//     };

//     return <VegaLite spec={spec} />;
// };

// export default BarChart;
