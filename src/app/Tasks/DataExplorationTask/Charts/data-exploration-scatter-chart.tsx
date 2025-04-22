// import { Box, Paper, Typography } from '@mui/material';
// import React, { useEffect, useState } from 'react';
// import { VegaLite } from 'react-vega';
// import { VisualColumn } from '../../../../shared/models/dataexploration.model';
// import { cloneDeep } from 'lodash';
// import ResponsiveVegaLite from '../../../../shared/components/responsive-vegalite';
// import { useAppDispatch, useAppSelector } from '../../../../store/store';
// import ResponsiveCardVegaLite from '../../../../shared/components/responsive-card-vegalite';



// const getColumnType = (columnType: string) => {
//   switch (columnType) {
//     case 'DOUBLE':
//     case 'FLOAT':
//     case 'INTEGER':
//       return 'quantitative';
//     case 'LOCAL_DATE_TIME':
//       return 'temporal';
//     case 'STRING':
//     default:
//       return 'nominal';
//   }
// };
// interface ControlPanel {
//   chartType: string;
//   selectedColumns: VisualColumn[];
//   xAxis: VisualColumn;
//   xAxisScatter: VisualColumn;
//   yAxis: VisualColumn[];
//   yAxisScatter: VisualColumn[];
//   viewMode: string;
//   colorBy: string; // add this property
// }

// const ScatterChart = () => {
//   const [chartSpecs, setChartSpecs] = useState<any[]>([]);
//   const [dataCopy, setDataCopy] = useState<any[]>([]);

//   const dispatch = useAppDispatch();
//   const { tab } = useAppSelector(state => state.workflowPage);
//   const { xAxisScatter, yAxisScatter, viewMode, colorBy } = tab?.workflowTasks.dataExploration?.controlPanel as ControlPanel;  

//   const data = tab?.workflowTasks.dataExploration?.chart.data?.data;

//   useEffect(() => {
//     if (xAxisScatter && yAxisScatter && yAxisScatter.length > 0) {
//       const yAxisFields = yAxisScatter.map(axis => axis.name);
//       const dataCopy = cloneDeep(data);
//       setDataCopy(dataCopy);

//       // Build the Vega-Lite specifications
//       if (viewMode === 'overlay') {
//         const spec = {
//           mark: 'point',
//           autosize: { type: "fit", contains: "padding", resize: true },
//           width:1000,
//           height: 800,
          // selection: {
          //   paintbrush: {
          //     type: 'multi',
          //     on: 'mouseover',
          //   //   nearest: true
          //   }
          // },
//           encoding: {
//             x: {
//               field: xAxisScatter.name,
//               type: getColumnType(xAxisScatter.type),
//               axis: { title: `${xAxisScatter.name}` }
//             },
//             y: {
//               field: 'value',
//               type: getColumnType(yAxisScatter[0].type),
//               axis: { title: 'Values' }
//             },
//             color: {
//               condition: {
//                 selection: 'paintbrush',
//                 field: colorBy && colorBy !== "None" ? colorBy : 'variable',
//                 // type: getColumnType(tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns.find(column => column.name === colorBy)?.type || 'nominal'),
//                 title: colorBy!=="None" ? colorBy: "Variables"
//               },
//               value: 'grey' // Default color for unselected points
//             },
//             size: { value: 75 }, // Size of points
//             // tooltip: [
//             //   { field: xAxis.name, type: getColumnType(xAxis.type), title: `${xAxis.name}` },
//             //   { field: 'value', type: getColumnType(yAxis[0].type), title: 'Values' },
//             //   { field: colorBy || 'variable', title: colorBy || 'Variable' }
//             // ]
//             tooltip: [
//               // Add additional fields to the tooltip
//               // { field: xAxis.name, type: getColumnType(xAxis.type), title: `${xAxis.name}` }, // X-axis field
//               // { field: yAxis.name, type: getColumnType(yAxis.type), title: `${yAxis.name}` }, // Y-axis field
//               // { field: colorBy || 'variable', title: colorBy || 'Variable' }, // Color/Grouping field
//               // { field: 'value', type: getColumnType(yAxis[0].type), title: 'Value' }, // Display value
//               // Add any other relevant fields
//               { field: 'additional_field', title: 'Extra Info' } // Example of adding more details
//             ]
//           },
//           transform: [
//             {
//               fold: yAxisFields,
//               as: ['variable', 'value']
//             }
//           ],
//           data: { name: 'table' },
//         };
//         setChartSpecs([spec]);
//       } else {
//         const specs = yAxisScatter.map(axis => ({
//           mark: 'point',
//           autosize: { type: "fit", contains: "padding", resize: true },
//           width: 1000,
//           selection: {
//             paintbrush: {
//               type: 'multi',
//               on: 'mouseover',
//             //   nearest: true
//             }
//           },
//           height: 800/yAxisScatter.length,
//           encoding: {
//             x: {
//               field: xAxisScatter.name,
//               type: getColumnType(xAxisScatter.type),
//               axis: { title: `${xAxisScatter.name}` }
//             },
//             y: {
//               field: axis.name,
//               type: getColumnType(axis.type),
//               axis: { title: `${axis.name}` }
//             },
//             color: {
//               condition: {
//                 selection: 'paintbrush',
//                 field: colorBy && colorBy !== "None" ? colorBy : 'variable',
//                 type: getColumnType(tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns.find(column => column.name === colorBy)?.type || 'nominal'),
//                 title: colorBy!=="None" ? colorBy: "variable"
//               },
//               value: 'grey'
//             },
//             size: { value: 75 },
//             // tooltip: [
//             //   { field: xAxis.name, type: getColumnType(xAxis.type), title: `${xAxis.name}` },
//             //   { field: axis.name, type: getColumnType(axis.type), title: `${axis.name}` },
//             //   { field: colorBy || 'variable', title: colorBy || 'Variable' }
//             // ]
//              tooltip: [
//               // Add additional fields to the tooltip
//               // { field: xAxis.name, type: getColumnType(xAxis.type), title: `${xAxis.name}` }, // X-axis field
//               // { field: axis.name, type: getColumnType(axis.type), title: `${axis.name}` }, // Y-axis field
//               // { field: colorBy || 'variable', title: colorBy || 'Variable' }, // Color/Grouping field
//               // { field: 'value', type: getColumnType(axis.type), title: 'Value' }, // Display value
//               // Add any other relevant fields
//               { field: 'additional_field', title: 'Extra Info' } // Example of adding more details
//             ]
//           },
//           data: { name: 'table' }
//         }));
//         setChartSpecs(specs);
//       }
//     }
//   }, [xAxisScatter, yAxisScatter, viewMode, data, , colorBy]);

//   return chartSpecs.length > 0 ? (
//     <>
//       {chartSpecs.map((spec, index) => (
//         <ResponsiveCardVegaLite 
//         key={index} 
//         spec={spec} 
//         data={{ table: dataCopy }}     
//         height={viewMode === "overlay" ? 800 : 800 / yAxisScatter.length}
//         maxHeight={viewMode === "overlay" ? 800 : 800 / yAxisScatter.length} />
//       ))}
//     </>
//   ) : (
//     <Box sx={{ display: "flex", height: "20rem", justifyContent: "center", alignItems: "center" }}>
//     <Typography align="center" fontWeight="bold">Select x-Axis and y-Axis to display the chart.</Typography>
//     </Box>
//   );
// };

// export default ScatterChart;









import { Box, useTheme, useMediaQuery } from "@mui/material"
import { useEffect, useRef, useState } from "react"
import { cloneDeep } from "lodash" // Import lodash for deep cloning
import { useAppSelector } from "../../../../store/store"
import ResponsiveCardVegaLite from "../../../../shared/components/responsive-card-vegalite"
import LineChartControlPanel from "../ChartControls/data-exploration-line-control"
import InfoMessage from "../../../../shared/components/InfoMessage"
import AssessmentIcon from "@mui/icons-material/Assessment"
import ScatterChartControlPanel from "../ChartControls/data-exploration-scatter-control"
import Uchart from "./data-exploration-u-chart"



const getColumnType = (columnType: string) => {
  switch (columnType) {
    case "DOUBLE":
    case "FLOAT":
    case "INTEGER":
      return "quantitative" // Numbers -> quantitative
    case "LOCAL_DATE_TIME":
      return "temporal"
    case "STRING":
    default:
      return "nominal" // Text -> nominal or ordinal
  }
}

const ScatterChart = (
 ) => {

  const [chartSpecs, setChartSpecs] = useState<any[]>([])
  const [dataCopy, setDataCopy] = useState<any[]>([]) // Define dataCopy here
  const { tab } = useAppSelector(state => state.workflowPage)
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("xl"))

  useEffect(() => {
      const xAxis = tab?.workflowTasks.dataExploration?.controlPanel.xAxisScatter
      const yAxis = tab?.workflowTasks.dataExploration?.controlPanel.yAxisScatter
      const data = tab?.workflowTasks.dataExploration?.chart.data?.data
      const yAxisFields = yAxis?.map(axis => axis.name) // Get the names of the Y-axis fields
      const colorBy = tab?.workflowTasks?.dataExploration?.controlPanel?.colorBy?.name  
      const dataCopy = cloneDeep(data) // Deep clone the data
      setDataCopy(dataCopy)

      // Build the Vega-Lite specifications
      if (tab?.workflowTasks.dataExploration?.controlPanel.viewMode === "overlay") {
        const spec = {
          mark: "point",
          // autosize: { type: "fit", contains: "padding", resize: true },
          // width: 1000,
          // height: 800,
          selection: {
            paintbrush: {
              type: 'multi',
              on: 'mouseover',
            //   nearest: true
            }
          },
         
          encoding: {
            x: {
              field: xAxis?.name,
              type: getColumnType(xAxis ? xAxis.type : ''), // Dynamically determine xAxis type
              axis: { title: `${xAxis?.name}` }, // Title for X-axis
            },
            y: {
              field: "value", // Use the value field after folding
              type: "quantitative", // Y-axis type is representative
              axis: { title: "Values" }, // Common title for Y-axis
            },
            color: {
              condition: {
                selection: 'paintbrush',
                field: colorBy && colorBy !== "None" ? colorBy : 'variable',
                type: getColumnType(tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns.find(column => column.name === colorBy)?.type || 'nominal'),
                title: colorBy!=="None" ? colorBy: "Variables"
              },
              value: 'grey' // Default color for unselected points
            },
          },
          transform: [
            {
              fold: yAxisFields, // Fold Y-axis fields to render multiple lines
              as: ["variable", "value"], // Rename folded fields to 'variable' and 'value'
            },
          ],
          data: { name: "table" }, // Data for Vega-Lite
        }
        setChartSpecs([spec]) // Set the single spec for overlay mode
      } else {
        // Stacked mode: Create separate specs for each Y-axis
        const specs = yAxis?.map(axis => ({
          mark: "point",
          // autosize: { type: "fit", contains: "padding", resize: true },
          // width: 1000,
         selection: {
           paintbrush: {
             type: 'multi',
             on: 'mouseover',
           //   nearest: true
           }
         },
          // height: 800 / yAxis.length, // Height for individual stacked charts
          encoding: {
            x: {
              field: xAxis?.name,
              type: getColumnType(xAxis ? xAxis.type : ''), // Dynamically determine xAxis type
              axis: { title: `${xAxis?.name}` }, // Title for X-axis
            },
            y: {
              field: axis.name, // Each chart corresponds to one Y-axis
              type: getColumnType(axis.type),
              axis: { title: `${axis.name}` }, // Title for each Y-axis
            },
            color: {
              condition: {
                selection: 'paintbrush',
                field: colorBy && colorBy !== "None" ? colorBy : 'variable',
                type: getColumnType(tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns.find(column => column.name === colorBy)?.type || 'nominal'),
                title: colorBy!=="None" ? colorBy: "variable"
              },
              value: 'grey'
            },
          },
          data: { name: "table" }, // Data for Vega-Lite
        }))
        setChartSpecs(specs ?? []) // Set specs for all Y-axes in stacked mode
      }
    
  }, 
  [
    tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns,
    tab?.workflowTasks.dataExploration?.controlPanel?.xAxisScatter,
    tab?.workflowTasks.dataExploration?.controlPanel?.yAxisScatter,
    tab?.workflowTasks.dataExploration?.controlPanel?.viewMode,
    tab?.workflowTasks.dataExploration?.chart?.data?.data,
    tab?.workflowTasks.dataExploration?.controlPanel?.colorBy,
  ]) // Watch for changes in these dependencies

  const info = (
    <InfoMessage
      message="Please select x-Axis and y-Axis to display the chart."
      type="info"
      icon={<AssessmentIcon sx={{ fontSize: 40, color: "info.main" }} />}
      fullHeight
  />
  )
  const xAxis = tab?.workflowTasks.dataExploration?.controlPanel?.xAxisScatter
  const yAxis = tab?.workflowTasks.dataExploration?.controlPanel?.yAxisScatter
  
  const hasValidXAxis = xAxis && xAxis.name
  const hasValidYAxis = Array.isArray(yAxis) && yAxis.length > 0
  
  const shouldShowInfoMessage = !hasValidXAxis || !hasValidYAxis
  
  const umap=tab?.workflowTasks.dataExploration?.controlPanel.umap
  

    return (
      <Box sx={{ height: "100%" }}>
        {umap ? (
          <Uchart/>
        ) : (
          chartSpecs.map((spec, index) => (
            <ResponsiveCardVegaLite
              key={index}
              spec={spec}
              data={{ table: dataCopy }}
              actions={false}
              controlPanel={<ScatterChartControlPanel />}
              blinkOnStart={true}
              infoMessage={info}
              showInfoMessage={shouldShowInfoMessage}
              maxHeight={500}
              aspectRatio={isSmallScreen ? 2.8 : 1.8}
            />
          ))
        )}
      </Box>
    )
  
}

export default ScatterChart
