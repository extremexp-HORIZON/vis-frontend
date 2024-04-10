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
// import React, {useState} from 'react';
// import { styled, reactify, addAlpha } from '@superset-ui/core';
// import PropTypes from 'prop-types';
// import Component from './ParallelCoordinates';

// const ReactComponent = reactify(Component);

// const ParallelCoordinates = ({ className, ...otherProps }) => (
//   <div className={className}>
//     <ReactComponent {...otherProps} />
//   </div>
// );

// ParallelCoordinates.propTypes = {
//   className: PropTypes.string.isRequired,
// };

// ParallelCoordinates.propTypes = {
//   className: PropTypes.string.isRequired,
// };


/////tha to fitaksw

// import React, { useState } from 'react';
// import PropTypes from 'prop-types';
// import Component from './ParallelCoordinates';
// import { styled, reactify, addAlpha } from '@superset-ui/core';


// const ReactComponent = reactify(Component);

// const ParallelCoordinates = ({ className, ...otherProps }) => {
//   const [colorMetric, setColorMetric] = useState(otherProps.colorMetric);
  

//   const handleColorMetricChange = (event) => {
//     console.log('event',event)
//     setColorMetric(event.target.value); // Directly set the selected column name
//   };

//   return (
    
//     <div className={className}>
//       <div>
//         <label htmlFor="colorMetricDropdown">Color Metric:</label>
//         <select
//           id="colorMetricDropdown"
//           value={colorMetric}
//           onChange={handleColorMetricChange}
//         >
//           {otherProps.columnNames.map(column => (
//             <option key={column} value={column}>
//               {column}
//             </option>
//           ))}
//         </select>
//       </div>
//       <ReactComponent {...otherProps} colorMetric={`AVG(${colorMetric})`} /> {/* Set colorMetric back to AVG(columnName) */}
//     </div>
//   );
//   console.log(colorMetric);
// };

// ParallelCoordinates.propTypes = {
//   className: PropTypes.string.isRequired,
//   colorMetric: PropTypes.string,
//   columnNames: PropTypes.arrayOf(PropTypes.string).isRequired, // Use columnNames instead of secondaryMetrics
// };

// ParallelCoordinates.defaultProps = {
//   colorMetric: '', // Set a default value here if needed
// };


////ME TA METRICS
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { styled, reactify, addAlpha } from '@superset-ui/core';
import Component from './ParallelCoordinates';
import { Button, Flex } from 'antd';


const ReactComponent = reactify(Component);

const ParallelCoordinates = ({ className, ...otherProps }) => {
  console.log('React Start');

  const [colorMetric, setColorMetric] = useState(otherProps.colorMetric);
  const [sortMetric,setSortMetric]=useState(otherProps.colorMetric);
  const [sortedData, setSortedData] = useState(otherProps.data);



  const handleColorMetricChange = (event) => {
    setColorMetric(event.target.value);
    setSortMetric(event.target.value);
   
  };
  const filteredMetrics = otherProps.metrics.filter(metric => (
    metric === 'AVG(recall)' || metric === 'AVG(accuracy)' || metric === 'AVG(precision)' || metric === 'AVG(runtime)'
  ));

  const renamedMetrics = {
    'AVG(recall)': 'Average Recall',
    'AVG(accuracy)': 'Average Accuracy',
    'AVG(precision)': 'Average Precision',
    'AVG(runtime)': 'Average Runtime',
  };



  // const handleSortData = () => {
  //   const sorted = otherProps.data.sort((a, b) => b[sortMetric] - a[sortMetric]);
  //   setSortedData(sorted);
  // };

  const handleSaveBestConfiguration = () => {
    if (sortedData.length > 0) {
      const bestConfiguration = sortedData[0];
      const textToSave = JSON.stringify(bestConfiguration, null, 2);
      const blob = new Blob([textToSave], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'best_configuration.txt';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      console.error('No sorted data available.');
    }
  };

  return (
    <div className={className}>
      <div style={{ marginTop: '50px' }}>
        <label htmlFor="colorMetricDropdown">Sort by:</label>
        <select id="colorMetricDropdown" value={colorMetric} onChange={handleColorMetricChange}>
          {otherProps.metrics.map(metric => (
            <option key={metric} value={metric}>{renamedMetrics[metric]}</option>
          ))}
        </select>
        <Button type="primary" onClick={handleSaveBestConfiguration}>Save Best Configuration</Button>

      </div>
     
      <ReactComponent {...otherProps} colorMetric={colorMetric} sortMetric={sortMetric} />
    </div>
  );
};


//   return (
//     <div className={className}>

//       <div style={{ marginTop: '50px' }}>
//         <label htmlFor="colorMetricDropdown">Sort by:</label>
//         <select id="colorMetricDropdown" value={colorMetric} onChange={handleColorMetricChange}>
//           {filteredMetrics.map(metric => (
//             <option key={metric} value={metric}>{metric}</option>
//           ))}
//         </select>
//       </div>
//       <ReactComponent {...otherProps} colorMetric={colorMetric} sortMetric={sortMetric} />
//     </div>
//   );
// };

ParallelCoordinates.propTypes = {
  className: PropTypes.string.isRequired,
  colorMetric: PropTypes.string,
  sortMetric: PropTypes.string,
  metrics: PropTypes.arrayOf(PropTypes.string).isRequired,
  data: PropTypes.array.isRequired,


};

ParallelCoordinates.defaultProps = {
  colorMetric: '', // Set a default value here if needed
  sortMetric: '',

};



export default styled(ParallelCoordinates)`
  ${({ theme }) => `
    .superset-legacy-chart-parallel-coordinates {
      div.grid {
        overflow: auto;
        div.row {
          &:hover {
            background-color: ${theme.colors.grayscale.light2};
          }
        }
      }
    }
    .parcoords svg,
    .parcoords canvas {
      font-size: ${theme.typography.sizes.s}px;
      position: absolute;
    }
    .parcoords > canvas {
      pointer-events: none;
    }

    .parcoords text.label {
      font: 100%;
      font-size: ${theme.typography.sizes.s}px;
      cursor: drag;
    }
    .parcoords rect.background {
      fill: transparent;
    }
    .parcoords rect.background:hover {
      fill: ${addAlpha(theme.colors.grayscale.base, 0.2)};
    }
    .parcoords .resize rect {
      fill: ${addAlpha(theme.colors.grayscale.dark2, 0.1)};
    }
    .parcoords rect.extent {
      fill: ${addAlpha(theme.colors.grayscale.light5, 0.25)};
      stroke: ${addAlpha(theme.colors.grayscale.dark2, 0.6)};
    }
    .parcoords .axis line,
    .parcoords .axis path {
      fill: none;
      stroke: ${theme.colors.grayscale.dark1};
      shape-rendering: crispEdges;
    }
    .parcoords canvas {
      opacity: 1;
      -moz-transition: opacity 0.3s;
      -webkit-transition: opacity 0.3s;
      -o-transition: opacity 0.3s;
    }
    .parcoords canvas.faded {
      opacity: ${theme.opacity.mediumLight};
    }
    .parcoords {
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      background-color: ${theme.colors.grayscale.light5};
    }

    /* data table styles */
    .parcoords .row,
    .parcoords .header {
      clear: left;
      font-size: ${theme.typography.sizes.s}px;
      line-height: 18px;
      height: 18px;
      margin: 0px;
    }
    .parcoords .row:nth-of-type(odd) {
      background: ${addAlpha(theme.colors.grayscale.dark2, 0.05)};
    }
    .parcoords .header {
      font-weight: ${theme.typography.weights.bold};
    }
    .parcoords .cell {
      float: left;
      overflow: hidden;
      white-space: nowrap;
      width: 100px;
      height: 18px;
    }
    .parcoords .col-0 {
      width: 180px;
    }
  `}
`;
