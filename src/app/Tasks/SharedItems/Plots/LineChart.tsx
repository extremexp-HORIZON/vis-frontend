// import React, { useState } from 'react';
// import { Box, Typography, Paper, FormControl, Select, MenuItem, InputLabel, Checkbox, ListItemText, Button } from '@mui/material';
// import { VegaLite, VisualizationSpec } from 'react-vega';

// const LineChart: React.FC = () => {
//   const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['Accuracy']);
//   const [mode, setMode] = useState<'overlay' | 'stack'>('overlay');

//   const handleMetricChange = (event: React.ChangeEvent<{ value: unknown }>) => {
//     setSelectedMetrics(event.target.value as string[]);
//   };

//   const handleModeToggle = () => {
//     setMode(prevMode => (prevMode === 'overlay' ? 'stack' : 'overlay'));
//   };

//   const metrics = ['Accuracy', 'Precision', 'Recall'];

//   const commonSpec = {
//     "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
//     "description": "A simple line chart with time on the x-axis and selected metrics on the y-axis.",
//     "data": {
//       "values": [
//         {"time": 1, "Accuracy": 0.6, "Precision": 0.42, "Recall": 0.12},
//         {"time": 2, "Accuracy": 0.65, "Precision": 0.45, "Recall": 0.15},
//         {"time": 3, "Accuracy": 0.7, "Precision": 0.5, "Recall": 0.18},
//         {"time": 4, "Accuracy": 0.75, "Precision": 0.55, "Recall": 0.2},
//         {"time": 5, "Accuracy": 0.8, "Precision": 0.6, "Recall": 0.25},
//         {"time": 6, "Accuracy": 0.82, "Precision": 0.65, "Recall": 0.3},
//         {"time": 7, "Accuracy": 0.85, "Precision": 0.7, "Recall": 0.35},
//         {"time": 8, "Accuracy": 0.88, "Precision": 0.75, "Recall": 0.4},
//         {"time": 9, "Accuracy": 0.9, "Precision": 0.8, "Recall": 0.45},
//         {"time": 10, "Accuracy": 0.92, "Precision": 0.82, "Recall": 0.5},
//         {"time": 11, "Accuracy": 0.94, "Precision": 0.85, "Recall": 0.55},
//         {"time": 12, "Accuracy": 0.96, "Precision": 0.88, "Recall": 0.6},
//         {"time": 13, "Accuracy": 0.97, "Precision": 0.9, "Recall": 0.65},
//         {"time": 14, "Accuracy": 0.98, "Precision": 0.92, "Recall": 0.7},
//         {"time": 15, "Accuracy": 0.99, "Precision": 0.95, "Recall": 0.75}
//       ]
//     },
//     "transform": [
//       {
//         "fold": selectedMetrics,
//         "as": ["metric", "value"]
//       }
//     ],
//     "mark": "line",
//     "encoding": {
//       "x": {"field": "time", "type": "quantitative", "title": "Time (seconds)"},
//       "y": {"field": "value", "type": "quantitative", "title": "Metric Value"},
//       "color": {"field": "metric", "type": "nominal", "title": "Metric"}
//     }
//   };

//   const overlaySpec: VisualizationSpec = {
//     ...commonSpec,
//     height: 400,
//   };

//   const stackSpec: VisualizationSpec = {
//     "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
//     "vconcat": selectedMetrics.map(metric => ({
//       ...commonSpec,
//       height: 200,
//       transform: [
//         {
//           filter: { field: "metric", equal: metric }
//         }
//       ],
//       encoding: {
//         ...commonSpec.encoding,
//         y: { ...commonSpec.encoding.y, title: metric }
//       }
//     })),
//   };
  
//   return (
//     <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #ccc', width: '100%', mt: 3 }}>
//       <Box sx={{ bgcolor: '#f0f0f0', display: 'flex', alignItems: 'center', height: '3.5rem', px: 2, justifyContent: 'space-between' }}>
//         <Typography variant="h6">Time Series Metrics</Typography>
//         <Button variant="contained" onClick={handleModeToggle}>
//           Toggle to {mode === 'overlay' ? 'Stack' : 'Overlay'}
//         </Button>
//       </Box>
//       <Box sx={{ p: 2 }}>
//         <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
//           <FormControl sx={{ m: 1, minWidth: 200 }}>
//             <InputLabel id="metric-select-label">Metrics</InputLabel>
//             <Select
//               labelId="metric-select-label"
//               multiple
//               value={selectedMetrics}
//               onChange={handleMetricChange}
//               renderValue={(selected) => (selected as string[]).join(', ')}
//             >
//               {metrics.map((metric) => (
//                 <MenuItem key={metric} value={metric}>
//                   <Checkbox checked={selectedMetrics.indexOf(metric) > -1} />
//                   <ListItemText primary={metric} />
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//         </Box>
//         <VegaLite spec={mode === 'overlay' ? overlaySpec : stackSpec} />
//       </Box>
//     </Paper>
//   );
// };

// export default LineChart;

// /////STACK WORKS

// // // import React, { useMemo, useState } from 'react';
// // import { VegaLite } from 'react-vega';
// // import { Box, Button, Checkbox, FormControl, FormControlLabel, Grid, MenuItem, Select, Typography } from '@mui/material';
// // import { useState, useMemo } from 'react';

// // const LineChart = ({ data }) => {
// //   const [selectedMetrics, setSelectedMetrics] = useState(['Accuracy']);
// //   const [mode, setMode] = useState<'overlay' | 'stack'>('overlay');

// //   // Handle metric selection
// //   const handleMetricChange = (event) => {
// //     setSelectedMetrics(event.target.value);
// //   };

// //   // Toggle between overlay and stack modes
// //   const handleModeToggle = () => {
// //     setMode((prevMode) => (prevMode === 'overlay' ? 'stack' : 'overlay'));
// //   };

// //   // Base transform for folding metrics
// //   const baseTransform = useMemo(() => {
// //     return [{ fold: selectedMetrics, as: ['variable', 'value'] }];
// //   }, [selectedMetrics]);

// //   // Generate Vega-Lite spec based on mode and selected metrics
// //   const spec = useMemo(() => {
// //     const commonSpec = {

// //       $schema: 'https://vega.github.io/schema/vega-lite/v5.json',

// //       "data": {
// //         "values": [
// //           {"time": 1, "Accuracy": 0.6, "Precision": 0.42, "Recall": 0.12},
// //           {"time": 2, "Accuracy": 0.65, "Precision": 0.45, "Recall": 0.15},
// //           {"time": 3, "Accuracy": 0.7, "Precision": 0.5, "Recall": 0.18},
// //           {"time": 4, "Accuracy": 0.75, "Precision": 0.55, "Recall": 0.2},
// //           {"time": 5, "Accuracy": 0.8, "Precision": 0.6, "Recall": 0.25},
// //           {"time": 6, "Accuracy": 0.82, "Precision": 0.65, "Recall": 0.3},
// //           {"time": 7, "Accuracy": 0.85, "Precision": 0.7, "Recall": 0.35},
// //           {"time": 8, "Accuracy": 0.88, "Precision": 0.75, "Recall": 0.4},
// //           {"time": 9, "Accuracy": 0.9, "Precision": 0.8, "Recall": 0.45},
// //           {"time": 10, "Accuracy": 0.92, "Precision": 0.82, "Recall": 0.5},
// //           {"time": 11, "Accuracy": 0.94, "Precision": 0.85, "Recall": 0.55},
// //           {"time": 12, "Accuracy": 0.96, "Precision": 0.88, "Recall": 0.6},
// //           {"time": 13, "Accuracy": 0.97, "Precision": 0.9, "Recall": 0.65},
// //           {"time": 14, "Accuracy": 0.98, "Precision": 0.92, "Recall": 0.7},
// //           {"time": 15, "Accuracy": 0.99, "Precision": 0.95, "Recall": 0.75}
// //         ]
// //       },      
// //     //   width: 'container',
// //       height: 500,
// //       mark: { type: 'line', tooltip: true },
// //       encoding: {
// //         x: { field: 'time', type: 'quantitative', title: 'Time (seconds)' },
// //         y: { field: 'value', type: 'quantitative', title: 'Metric Value', stack: mode === 'stack' ? 'zero' : null },
// //         color: { field: 'variable', type: 'nominal', title: 'Metric' },
// //       },
// //     };

// //     if (mode === 'stack') {
// //       // Create stacked charts for each metric
// //       const stackedCharts = selectedMetrics.map((metric) => ({
// //         ...commonSpec,
// //         width: 1000,
// //         transform: [
// //           ...baseTransform,
// //           { filter: { field: 'variable', equal: metric } },
// //         ],
// //         encoding: {
// //           ...commonSpec.encoding,
// //           y: { ...commonSpec.encoding.y, title: metric },
// //         },
// //       }));

// //       return { vconcat: stackedCharts };
// //     } else {
// //       // Overlay mode: single chart with all metrics
// //       return commonSpec;
// //     }
// //   }, [data, selectedMetrics, mode, baseTransform]);

// //   return (
// //     <Box sx={{ width: '100%', padding: 2 }}>
// //       <Grid container spacing={3} justifyContent="center">
// //         <Grid item xs={12}>
// //           <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
// //             <Typography variant="h6">Time Series Metrics</Typography>
// //             <Button variant="contained" onClick={handleModeToggle}>
// //               Toggle to {mode === 'overlay' ? 'Stack' : 'Overlay'}
// //             </Button>
// //           </Box>
// //           <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
// //             <FormControl sx={{ m: 1, minWidth: 200 }}>
// //               <Select
// //                 multiple
// //                 value={selectedMetrics}
// //                 onChange={handleMetricChange}
// //                 renderValue={(selected) => (selected as string[]).join(', ')}
// //               >
// //                 {['Accuracy', 'Precision', 'Recall'].map((metric) => (
// //                   <MenuItem key={metric} value={metric}>
// //                     <Checkbox checked={selectedMetrics.indexOf(metric) > -1} />
// //                     <Typography variant="body2">{metric}</Typography>
// //                   </MenuItem>
// //                 ))}
// //               </Select>
// //             </FormControl>
// //           </Box>
// //           <VegaLite spec={spec} actions={false} />
// //         </Grid>
// //       </Grid>
// //     </Box>
// //   );
// // };

// // export default LineChart;




import React, { useState } from 'react';
import { Box, Typography, Paper, FormControl, Select, MenuItem, InputLabel, Checkbox, ListItemText, Button, SelectChangeEvent } from '@mui/material';
import { VegaLite, VisualizationSpec } from 'react-vega';

const LineChart: React.FC = () => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['Accuracy']);
  const [mode, setMode] = useState<'overlay' | 'stack'>('overlay');

  const handleMetricChange = (event: SelectChangeEvent, child?: object) => {

    setSelectedMetrics(state =>[...state, event.target.value]);
  };


  const handleModeToggle = () => {
    setMode(prevMode => (prevMode === 'overlay' ? 'stack' : 'overlay'));
  };

  const metrics = ['Accuracy', 'Precision', 'Recall'];

  const commonSpec: VisualizationSpec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "description": "A simple line chart with time on the x-axis and selected metrics on the y-axis.",
    "data": {
      "values": [
        {"time": 1, "Accuracy": 0.6, "Precision": 0.42, "Recall": 0.12},
        {"time": 2, "Accuracy": 0.65, "Precision": 0.45, "Recall": 0.15},
        {"time": 3, "Accuracy": 0.7, "Precision": 0.5, "Recall": 0.18},
        {"time": 4, "Accuracy": 0.75, "Precision": 0.55, "Recall": 0.2},
        {"time": 5, "Accuracy": 0.8, "Precision": 0.6, "Recall": 0.25},
        {"time": 6, "Accuracy": 0.82, "Precision": 0.65, "Recall": 0.3},
        {"time": 7, "Accuracy": 0.85, "Precision": 0.7, "Recall": 0.35},
        {"time": 8, "Accuracy": 0.88, "Precision": 0.75, "Recall": 0.4},
        {"time": 9, "Accuracy": 0.9, "Precision": 0.8, "Recall": 0.45},
        {"time": 10, "Accuracy": 0.92, "Precision": 0.82, "Recall": 0.5},
        {"time": 11, "Accuracy": 0.94, "Precision": 0.85, "Recall": 0.55},
        {"time": 12, "Accuracy": 0.96, "Precision": 0.88, "Recall": 0.6},
        {"time": 13, "Accuracy": 0.97, "Precision": 0.9, "Recall": 0.65},
        {"time": 14, "Accuracy": 0.98, "Precision": 0.92, "Recall": 0.7},
        {"time": 15, "Accuracy": 0.99, "Precision": 0.95, "Recall": 0.75}
      ]
    },
    "transform": [
      {
        "fold": selectedMetrics,
        "as": ["metric", "value"]
      }
    ],
    "mark": "line",
    "encoding": {
      "x": {"field": "time", "type": "quantitative", "title": "Time (seconds)"},
      "y": {"field": "value", "type": "quantitative", "title": "Metric Value"},
      "color": {"field": "metric", "type": "nominal", "title": "Metric"}
    }
  };

  const overlaySpec: VisualizationSpec = {
    ...commonSpec,
    height: 400,
  };

  const stackSpec: VisualizationSpec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "vconcat": selectedMetrics.map(metric => ({
  ...commonSpec,
  height: 200,
  transform: [
    {
      filter: { field: "metric", equal: metric }
    }
  ],
  encoding: commonSpec.encoding ? {
    ...commonSpec.encoding,
    y: { ...commonSpec.encoding.y, title: metric }
  } : undefined
})),
  };

  return (
    <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #ccc', width: '100%', mt: 3 }}>
      <Box sx={{ bgcolor: '#f0f0f0', display: 'flex', alignItems: 'center', height: '3.5rem', px: 2, justifyContent: 'space-between' }}>
        <Typography variant="h6">Time Series Metrics</Typography>
        <Button variant="contained" onClick={handleModeToggle}>
          Toggle to {mode === 'overlay' ? 'Stack' : 'Overlay'}
        </Button>
      </Box>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <FormControl sx={{ m: 1, minWidth: 200 }}>
            <InputLabel id="metric-select-label">Metrics</InputLabel>
            <Select
              labelId="metric-select-label"
              multiple
              value={selectedMetrics}
              onChange={handleMetricChange}
              renderValue={(selected) => (selected as string[]).join(', ')}
            >
              {metrics.map((metric) => (
                <MenuItem key={metric} value={metric}>
                  <Checkbox checked={selectedMetrics.indexOf(metric) > -1} />
                  <ListItemText primary={metric} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <VegaLite spec={mode === 'overlay' ? overlaySpec : stackSpec} />
      </Box>
    </Paper>
  );
};

export default LineChart;
