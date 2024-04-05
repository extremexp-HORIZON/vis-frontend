/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
/* eslint-disable react/sort-prop-types */
// import d3 from 'd3';
// import PropTypes from 'prop-types';
// import { getSequentialSchemeRegistry } from '@superset-ui/core';

// import parcoords from './vendor/parcoords/d3.parcoords';
// import divgrid from './vendor/parcoords/divgrid';

// const propTypes = {
//   // Standard tabular data [{ fieldName1: value1, fieldName2: value2 }]
//   data: PropTypes.arrayOf(PropTypes.object),
//   width: PropTypes.number,
//   height: PropTypes.number,
//   colorMetric: PropTypes.string,
//   includeSeries: PropTypes.bool,
//   linearColorScheme: PropTypes.string,
//   metrics: PropTypes.arrayOf(PropTypes.string),
//   series: PropTypes.string,
//   showDatatable: PropTypes.bool,
//   columnNames: PropTypes.array
// };

// function ParallelCoordinates(element, props) {
//   const {
//     data,
//     width,
//     height,
//     colorMetric,
//     includeSeries,
//     linearColorScheme,
//     metrics,
//     series,
//     showDatatable,
//     columnNames
//   } = props;
  

//   const cols = includeSeries ? [series].concat(metrics) : metrics;


//   const ttypes = {};
//   ttypes[series] = 'string';
//   metrics.forEach(v => {
//     ttypes[v] = 'number';
//   });

//   console.log(colorMetric);
//   const colorScale = colorMetric
//     ? getSequentialSchemeRegistry()
//         .get(linearColorScheme)
//         .createLinearScale(d3.extent(data, d => d[colorMetric]))
//     : () => 'grey';

//   const color = d => colorScale(d[colorMetric]);
//   const container = d3
//     .select(element)
//     .classed('superset-legacy-chart-parallel-coordinates', true);
//   container.selectAll('*').remove();
//   const effHeight = showDatatable ? height / 2 : height;

//   const div = container
//     .append('div')
//     .style('height', `${effHeight}px`)
//     .classed('parcoords', true);

//   const chart = parcoords()(div.node())
//     .width(width)
//     .color(color)
//     .alpha(0.5)
//     .composite('darken')
//     .height(effHeight)
//     .data(data)
//     .dimensions(cols)
//     .types(ttypes)
//     .render()
//     .createAxes()
//     .shadows()
//     .reorderable()
//     .brushMode('1D-axes');

//   if (showDatatable) {
//     // create data table, row hover highlighting
//     const grid = divgrid();
//     container
//       .append('div')
//       .style('height', `${effHeight}px`)
//       .datum(data)
//       .call(grid)
//       .classed('parcoords grid', true)
//       .selectAll('.row')
//       .on({
//         mouseover(d) {
//           chart.highlight([d]);
//         },
//         mouseout: chart.unhighlight,
//       });
//     // update data table on brush event
//     chart.on('brush', d => {
//       d3.select('.grid')
//         .datum(d)
//         .call(grid)
//         .selectAll('.row')
//         .on({
//           mouseover(dd) {
//             chart.highlight([dd]);
//           },
//           mouseout: chart.unhighlight,
//         });
//     });
//   }
// }

// ParallelCoordinates.displayName = 'ParallelCoordinates';
// ParallelCoordinates.propTypes = propTypes;

// export default ParallelCoordinates;


import d3 from 'd3';
import PropTypes from 'prop-types';
import { getSequentialSchemeRegistry } from '@superset-ui/core';

import parcoords from './vendor/parcoords/d3.parcoords';
import divgrid from './vendor/parcoords/divgrid';
// import { sort } from 'core-js/core/array';

const propTypes = {
  // Standard tabular data [{ fieldName1: value1, fieldName2: value2 }]
  data: PropTypes.arrayOf(PropTypes.object),
  width: PropTypes.number,
  height: PropTypes.number,
  colorMetric: PropTypes.string,
  includeSeries: PropTypes.bool,
  linearColorScheme: PropTypes.string,
  metrics: PropTypes.arrayOf(PropTypes.string),
  series: PropTypes.string,
  showDatatable: PropTypes.bool,
  columnNames: PropTypes.array,
  sortMetric:PropTypes.string,
};

function ParallelCoordinates(element, props) {
  const {
    data,
    width,
    height,
    colorMetric,
    includeSeries,
    linearColorScheme,
    metrics,
    series,
    showDatatable,
    columnNames,
    sortMetric,
  } = props;
  console.log('PARALLEL START');
  console.log('Data:', data);
  console.log('Metrics:', metrics);
  console.log('Series:', series);
  console.log('Sort Metrics :', sortMetric);
  const roundedData = data.map(item => {
    const roundedItem = {};
    for (let key in item) {
      if (typeof item[key] === 'number') {
        roundedItem[key] = parseFloat(item[key].toFixed(3));
      } else {
        roundedItem[key] = item[key];
      }
    }
    return roundedItem;
  });
  let sortedData;

  // Sort the rounded data based on the sortMetric
  if (sortMetric==='AVG(runtime)'){  
     sortedData = roundedData.sort((a, b) => a[sortMetric] - b[sortMetric]);
  }else{  
     sortedData = roundedData.sort((a, b) => b[sortMetric] - a[sortMetric]);
  }
  // const sortedData = data.sort((a, b) => b[sortMetric] - a[sortMetric]);



  const excludedMetrics = ["AVG(precision)", "AVG(accuracy)","AVG(recall)","AVG(runtime)",];
  const filteredMetrics = metrics.filter(metric => !excludedMetrics.includes(metric));

  // const cols = includeSeries ? [series].concat(metrics.slice(3)) : metrics.slice(3);
  const cols = includeSeries ? [series].concat(filteredMetrics) : filteredMetrics;
  

  const ttypes = {};
  ttypes[series] = 'string';
  filteredMetrics.forEach(v => {
    ttypes[v] = 'number';
  });

  const colorScale = colorMetric
    ? getSequentialSchemeRegistry()
        .get(linearColorScheme)
        .createLinearScale(d3.extent(data, d => d[colorMetric]))
    : () => 'grey';

  const color = d => colorScale(d[colorMetric]);
  console.log('PARALLEL STOP');


  const container = d3
    .select(element)
    .classed('superset-legacy-chart-parallel-coordinates', true);
  container.selectAll('*').remove();
  const effHeight = showDatatable ? height / 2 : height;

  const div = container
    .append('div')
    .style('height', `${effHeight}px`)
    .classed('parcoords', true);

  const chart = parcoords()(div.node())
    .width(width)
    .color(color)
    .alpha(0.5)
    .composite('darken')
    .height(effHeight)
    .data(data)
    .dimensions(cols)
    .types(ttypes)
    .render()
    .createAxes()
    .shadows()
    .reorderable()
    .brushMode('1D-axes');

  if (showDatatable) {
    // create data table, row hover highlighting
    const grid = divgrid();
    container
      .append('div')
      .style('height', `${effHeight}px`)
      .datum(sortedData)
      .call(grid)
      .classed('parcoords grid', true)
      .selectAll('.row')
      .on({
        mouseover(d) {
          chart.highlight([d]);
        },
        mouseout: chart.unhighlight,
      });
    // update data table on brush event
    chart.on('brush', d => {
      d3.select('.grid')
        .datum(d)
        .call(grid)
        .selectAll('.row')
        .on({
          mouseover(dd) {
            chart.highlight([dd]);
          },
          mouseout: chart.unhighlight,
        });
    });
  }
}


ParallelCoordinates.displayName = 'ParallelCoordinates';
ParallelCoordinates.propTypes = propTypes;

export default ParallelCoordinates;
