import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { Button } from 'antd';

var ParallelCoordinatesPlot = _ref => {
  var {
    data
  } = _ref;
  var svgRef = useRef();
  var heatmapRef = useRef();
  var chartContainerRef = useRef();
  var [clickedLine, setClickedLine] = useState(null);
  var [saveButtonEnabled, setSaveButtonEnabled] = useState(false);

  var handleContainerClick = () => {// Remove the clicked line when clicking anywhere on the chart container
    // setClickedLine(null);
    // setSaveButtonEnabled(false);
  };

  var handleSaveConfigClick = () => {
    // Download data of the clicked line as JSON
    if (clickedLine) {
      var jsonData = JSON.stringify(clickedLine, null, 2);
      var blob = new Blob([jsonData], {
        type: 'application/json'
      });
      var url = window.URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'clicked_line_data.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };

  useEffect(() => {
    if (!data || data.length === 0) return;
    var existingSVGContainers = document.querySelector('.svg-container');
    console.log(existingSVGContainers);

    if (existingSVGContainers) {
      existingSVGContainers.remove();
      var existingHeatmapContainers = document.querySelector('.heatmap-container');
      if (existingHeatmapContainers) existingHeatmapContainers.remove();
    }

    var margin = {
      top: 50,
      right: 50,
      bottom: 50,
      left: 50
    };
    var width = 1000 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;
    var keys = Object.keys(data[0]).filter(key => key !== 'BinaryLabel' && key !== 'Cost' && key !== 'preprocessor__num__scaler');
    var categoricalKeys = keys.filter(key => !Number.isFinite(data[0][key]));
    var x = d3.scale.ordinal().rangePoints([0, width], 1).domain(keys);
    var y = {};
    keys.forEach(key => {
      if (categoricalKeys.includes(key)) {
        y[key] = d3.scale.ordinal().rangePoints([height, 0], 1).domain(d3.set(data.map(d => d[key])).values());
      } else {
        y[key] = d3.scale.linear().range([height, 0]).domain(d3.extent(data, d => parseFloat(d[key])));
      }
    });
    var line = d3.svg.line().defined(d => !isNaN(d[1])).x(d => x(d[0])).y(d => y[d[0]](d[1]));
    var svg = d3.select(svgRef.current).append('svg').attr('class', 'svg-container').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    var color = d3.scale.linear().domain(d3.extent(data, function (d) {
      return d['Cost'];
    })).range(["green", "blue"]);
    svg.selectAll('.myPath').data(data).enter().append('path').attr('class', 'myPath').attr('d', d => line(keys.map(key => [key, parseFloat(d[key])]))).style('fill', 'none').style('stroke', d => color(d['Cost'])).style('stroke-width', '1.5px') // Make lines more solid
    .style('opacity', 0.7) // Adjust opacity as needed
    // Add mouse event listeners
    .on('mouseover', (event, d) => handleMouseOver(event, d)).on('mouseout', (event, d) => handleMouseOut(event, d)).on('click', (event, d) => handleLineClick(event, d)).style('cursor', 'default'); // Set default cursor initially
    // Render the vertical heatmap

    var heatmapHeight = height;
    var colorScale = d3.scale.linear().domain([0, heatmapHeight]).range(["blue", "green"]);
    var heatmap = d3.select(heatmapRef.current).append('svg').attr('class', 'heatmap-container').attr('width', 25) // Adjust width as needed
    .attr('height', heatmapHeight).append('g');
    var numColors = 5;
    var colorStep = heatmapHeight / numColors;
    var costExtent = d3.extent(data, d => d['Cost']);
    var costScale = d3.scale.linear().domain(costExtent).range([numColors, 1]);

    for (var i = 0; i < numColors; i++) {
      heatmap.append('rect').attr('x', 0).attr('y', i * colorStep).attr('width', 25) // Adjust width as needed
      .attr('height', colorStep).style('fill', colorScale(i * colorStep)); // Add text labels for the scale

      heatmap.append('text').attr('x', 0) // Adjust x position to place the label next to the heatmap
      .attr('y', i * colorStep + colorStep / 2) // Adjust y position to center the label
      .attr('text-anchor', 'start').attr('alignment-baseline', 'middle').attr('font-size', '10px').attr('fill', 'white') // Set text color to white
      .text(costScale.invert(i + 1).toFixed(2)); // Set the text content based on the Cost values
    } // Add a title above the heatmap


    heatmap.append('text').attr('x', 0) // Adjust x position as needed
    .attr('y', 0) // Adjust y position as needed
    .attr('text-anchor', 'middle').attr('font-size', '14px').text('Cost'); // Change this to your desired title
    // Define mouseover event handler

    function handleMouseOver(event, d) {
      var hoveredLine = svg.select(".myPath:nth-child(" + (d + 1) + ")");
      var isLineClicked = clickedLine === d;
      if (!isLineClicked) hoveredLine // .style('stroke-width', '3px') // Revert to original stroke width
      .style('cursor', 'pointer'); // Revert cursor to default on mouseout
    } // Define mouseout event handler


    function handleMouseOut(event, d) {// const hoveredLine = svg.select(`.myPath:nth-child(${d + 1})`);
      // const isLineClicked = clickedLine === d;    
      // if(!isLineClicked)
      //   hoveredLine
      //     .style('stroke-width', '1.5px') // Revert to original stroke width
      //     .style('cursor', 'default'); // Revert cursor to default on mouseout
    }

    var handleLineClick = (event, d) => {
      svg.selectAll('.myPath').style('stroke-width', '1.5px'); // Make the clicked line bold

      svg.select(".myPath:nth-child(" + (d + 1) + ")").style('stroke-width', '3px'); // Update the clicked line state

      setClickedLine(d);
      setSaveButtonEnabled(true);
    };

    keys.forEach(key => {
      svg.append('g').attr('class', 'axis').attr('transform', 'translate(' + x(key) + ',0)') // Changed y coordinate to 0 for correct positioning
      .call(d3.svg.axis().scale(y[key]).orient('left')).append('text').attr('y', -9).style('text-anchor', 'middle').text(key);
    });
    chartContainerRef.current.addEventListener('click', handleContainerClick);
    return () => {
      // Cleanup function to remove the SVG when component unmounts
      svg.selectAll('*').remove();
      heatmap.selectAll('*').remove();
      chartContainerRef.current.removeEventListener('click', handleContainerClick);
    };
  }, [data]);
  return /*#__PURE__*/React.createElement("div", {
    className: "chart-container",
    ref: chartContainerRef,
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: svgRef
  }), /*#__PURE__*/React.createElement("div", {
    ref: heatmapRef,
    style: {
      position: 'absolute',
      top: 50,
      left: 'calc(90%)'
    }
  }), /*#__PURE__*/React.createElement(Button, {
    className: "save-button",
    type: "primary",
    onClick: handleSaveConfigClick,
    disabled: !saveButtonEnabled,
    style: {
      position: 'absolute',
      bottom: 10,
      right: 50
    }
  }, "Save Configuration"));
};

export default ParallelCoordinatesPlot;