"use strict";

exports.__esModule = true;
exports.default = SupersetPluginInteractiveLineChartCopy;
var _react = _interopRequireWildcard(require("react"));
var _highstock = _interopRequireDefault(require("highcharts/highstock"));
var _highchartsReactOfficial = _interopRequireDefault(require("highcharts-react-official"));
var _antd = require("antd");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function SupersetPluginInteractiveLineChartCopy(props) {
  console.log('AppPano');
  var {
    Option
  } = _antd.Select;
  var {
    series: initialSeries,
    setDataMask,
    formData,
    columnNames
  } = props;
  var [chartRef, setChartRef] = (0, _react.useState)(null);
  var [from, setFrom] = (0, _react.useState)(initialSeries[0].data[0].epoch);
  var [to, setTo] = (0, _react.useState)(initialSeries[0].data[initialSeries[0].data.length - 1].epoch);
  var [queryResultsLoading, setQueryResultsLoading] = (0, _react.useState)(false);
  var chart = (0, _react.useRef)(chartRef);
  var fetchDataRef = (0, _react.useRef)({
    isScrolling: false,
    scrollTimeout: null
  });
  var metrikiOptions = ['MIN', 'MAX', 'COUNT', 'SUM', 'AVG'];
  var timeOptions = ['"P1D"', '"PT30M"'];
  var trainOptions = ['Yes', 'No'];
  var [showMetricsOptions, setShowMetricsOptions] = (0, _react.useState)(false);
  var [showTrainOptions, setShowTrainOptions] = (0, _react.useState)(false); // Track visibility of metrics options
  var [showColumnOptions, setShowColumnOptions] = (0, _react.useState)(false);
  var [showTimeOptions, setShowTimeOptions] = (0, _react.useState)(false);
  var [selectedMetric, setSelectedMetric] = (0, _react.useState)(null);
  var [selectedTrain, setSelectedTrain] = (0, _react.useState)(false);
  var [selectedColumn, setSelectedColumn] = (0, _react.useState)(null);
  var [selectedTime, setSelectedTime] = (0, _react.useState)(null);
  var [selectedMenu, setSelectedMenu] = (0, _react.useState)("Settings");
  var [isTrainTestActive, setIsTrainTestActive] = (0, _react.useState)(false);
  (0, _react.useEffect)(() => {
    setFrom(initialSeries[0].data[0].epoch);
    setTo(initialSeries[0].data[initialSeries[0].data.length - 1].epoch);
  }, []);
  (0, _react.useEffect)(() => {
    if (chartRef !== null) {
      !queryResultsLoading && chartRef.hideLoading();
    }
  }, [queryResultsLoading]);
  var computeOldChartData = () => {
    var seriesColors = ['red', 'blue', 'black', 'orange', 'pink'];
    return initialSeries.map((series, index) => {
      var sortedData = series.data.sort((a, b) => a.epoch - b.epoch);
      return {
        data: sortedData.map(d => {
          var val = d.value;
          var timestamp = new Date(d.epoch).getTime();
          return [timestamp, isNaN(val) ? null : val];
        }),
        name: series.name,
        color: seriesColors[index % seriesColors.length],
        showInLegend: true,
        enableMouseTracking: formData.showLegend
      };
    });
  };
  var computeNewChartData = () => {
    var seriesColors = ['red', 'blue'];
    var newData = [];
    initialSeries.forEach(series => {
      var sortedData = series.data.sort((a, b) => a.epoch - b.epoch);
      var newDataPoints = sortedData.reduce((accumulator, currentValue, index) => {
        var timestamp = new Date(currentValue.epoch).getTime();
        var value = isNaN(currentValue.value) ? null : currentValue.value;
        if (index < Math.floor(sortedData.length * 0.8)) {
          accumulator[0].push([timestamp, value]);
        } else {
          accumulator[1].push([timestamp, value]);
        }
        return accumulator;
      }, [[], []]);
      newData.push({
        data: newDataPoints[0],
        name: series.name + ' (80%)',
        color: seriesColors[0],
        showInLegend: true,
        enableMouseTracking: formData.showLegend
      }, {
        data: newDataPoints[1],
        name: series.name + ' (20%)',
        color: seriesColors[1],
        showInLegend: true,
        enableMouseTracking: formData.showLegend
      });
    });
    return newData;
  };
  var dummyPointCreator = (text, top, height) => ({
    title: {
      enabled: false,
      text
    },
    opposite: false,
    top,
    height,
    lineWidth: 2,
    offset: 100
  });
  var dummySeriesCreator = (name, x, idx) => ({
    type: 'line',
    data: [{
      x,
      y: 0
    }],
    name,
    color: 'transparent',
    yAxis: 0,
    zoneAxis: 'x',
    enableMouseTracking: false,
    showInLegend: false
  });
  var computeYAxisData = () => {
    var yAxisObject = {
      title: {
        enabled: true
      },
      opposite: false,
      top: '0%',
      height: '100%',
      lineWidth: 2,
      offset: 1,
      startOnTick: false,
      endOnTick: false
    };
    var mergedObject = _extends({}, yAxisObject, [dummyPointCreator('minPoint', '-10px', '0px'), dummyPointCreator('maxPoint', '-10px', '0px')]);
    return mergedObject;
  };
  var fetchData = () => {
    var xAxis = chart.current.xAxis[0];
    var {
      min,
      max
    } = xAxis.getExtremes();
    chart.current.showLoading();
    setQueryResultsLoading(true);
    if (chart.current.renderTo) {
      setDataMask({
        ownState: {
          start: min,
          end: max
        }
      });
    }
    setQueryResultsLoading(false);
  };
  var chartFunctions = e => {
    chart.current = e.target;
    var handleEventTimeout = event => {
      if (fetchDataRef.current.scrollTimeout) {
        clearTimeout(fetchDataRef.current.scrollTimeout);
      }
      fetchDataRef.current = _extends({}, fetchDataRef.current, {
        isScrolling: true
      });
      fetchDataRef.current = _extends({}, fetchDataRef.current, {
        scrollTimeout: setTimeout(() => {
          fetchDataRef.current = _extends({}, fetchDataRef.current, {
            isScrolling: false
          });
          fetchData();
        }, 500)
      });
    };
    _highstock.default.addEvent(chart.current.container, 'wheel', event => {
      if (formData.zooming) {
        var p = chart.current.xAxis[0].toValue(chart.current.pointer.normalize(event).chartX);
        var {
          min,
          max,
          dataMax,
          dataMin
        } = chart.current.xAxis[0].getExtremes();
        var stepleft = (p - min) * 0.10;
        var stepright = (max - p) * 0.10;
        if (!chart.current.loadingShown) {
          if (event.deltaY < 0 && max - min > 10000) {
            chart.current.xAxis[0].setExtremes(min + stepleft, max - stepright, true, false);
            handleEventTimeout(event);
          } else if (event.deltaY > 0 && max - min < to - from) {
            chart.current.xAxis[0].setExtremes(Math.max(min - stepleft, from), Math.min(max + stepright, to), true, false);
            handleEventTimeout(event);
          }
        }
      }
    });
    _highstock.default.addEvent(chart.current.container, 'mouseup', event => {
      if (!chart.current.loadingShown) {
        handleEventTimeout(event);
      }
    });
  };
  var getChartRef = chartR => {
    setChartRef(chartR);
  };
  var updateMetriki = newMetriki => {
    setSelectedMetric(newMetriki);
    setSelectedMenu("Settings"); // Return to Settings after selecting a metric
    setShowMetricsOptions(false);
    setDataMask({
      ownState: {
        metriki: newMetriki
      }
    });
  };
  var updateColones = columnNames => {
    setSelectedColumn(columnNames);
    setSelectedMenu("Settings"); // Return to Settings after selecting a metric
    setShowColumnOptions(false);
    setDataMask({
      ownState: {
        colona: columnNames
      }
    });
  };
  var updateTime = newtime => {
    setSelectedTime(newtime);
    setSelectedMenu("Settings"); // Return to Settings after selecting a metric

    setShowTimeOptions(false);
    setDataMask({
      ownState: {
        timegran: newtime
      }
    });
  };
  // const updateTrain=(newtrain)=>{
  //   setSelectedMenu("Settings");

  //   setSelectedTrain(newtrain)
  //   setShowTrainOptions(false);
  // }
  var handleTrainTestToggle = checked => {
    setIsTrainTestActive(!isTrainTestActive);
    setSelectedMenu("Settings");
    setShowMetricsOptions(false);
    setShowColumnOptions(false);
    setShowTimeOptions(false);
    setShowTrainOptions(false);
  };
  // const computeChartData = () => {
  //   if (showTrainOptions) {
  //     return computeNewChartData();
  //   } else {
  //     return computeOldChartData();
  //   }
  // };
  var computeChartData = () => {
    if (isTrainTestActive) {
      // Compute chart data for train-test active
      return computeNewChartData();
    } else {
      // Compute chart data for train-test inactive
      return computeOldChartData();
    }
  };
  var handleSelectOption = value => {
    setSelectedMenu(value);
    setShowMetricsOptions(value === 'metric');
    setShowColumnOptions(value === 'column');
    setShowTimeOptions(value === 'time');
    setShowTrainOptions(value === 'train-test');
  };
  return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
    style: {
      position: 'absolute',
      zIndex: 9999,
      top: '30px',
      width: '200px'
    }
  }, /*#__PURE__*/_react.default.createElement(_antd.Select, {
    value: selectedMenu,
    onChange: handleSelectOption,
    style: {
      width: '100%'
    }
  }, /*#__PURE__*/_react.default.createElement(_antd.Select.Option, {
    value: "metric"
  }, "Metrics"), /*#__PURE__*/_react.default.createElement(_antd.Select.Option, {
    value: "column"
  }, "Columns"), /*#__PURE__*/_react.default.createElement(_antd.Select.Option, {
    value: "time"
  }, "Timegran"), /*#__PURE__*/_react.default.createElement(_antd.Select.Option, {
    value: "train-test"
  }, /*#__PURE__*/_react.default.createElement(_antd.Button, {
    onClick: handleTrainTestToggle
  }, isTrainTestActive ? 'Train Test: On' : 'Train Test: Off')))), showMetricsOptions && /*#__PURE__*/_react.default.createElement("div", {
    style: {
      position: 'absolute',
      zIndex: 9999,
      top: '70px'
    }
  }, /*#__PURE__*/_react.default.createElement(_antd.Select, {
    defaultValue: "Select Metric",
    style: {
      width: 120
    },
    onChange: updateMetriki
  }, metrikiOptions.map(option => /*#__PURE__*/_react.default.createElement(Option, {
    key: option,
    value: option
  }, option)))), showColumnOptions && /*#__PURE__*/_react.default.createElement("div", {
    style: {
      position: 'absolute',
      zIndex: 9999,
      top: '70px'
    }
  }, /*#__PURE__*/_react.default.createElement(_antd.Select, {
    defaultValue: "Select Column",
    style: {
      width: 120
    },
    onChange: updateColones
  }, columnNames.map(option => /*#__PURE__*/_react.default.createElement(Option, {
    key: option,
    value: option
  }, option)))), showTimeOptions && /*#__PURE__*/_react.default.createElement("div", {
    style: {
      position: 'absolute',
      zIndex: 9999,
      top: '70px'
    }
  }, /*#__PURE__*/_react.default.createElement(_antd.Select, {
    defaultValue: "Select Time",
    style: {
      width: 120
    },
    onChange: updateTime
  }, timeOptions.map(option => /*#__PURE__*/_react.default.createElement(Option, {
    key: option,
    value: option
  }, option)))), /*#__PURE__*/_react.default.createElement(_highchartsReactOfficial.default, {
    highcharts: _highstock.default,
    constructorType: 'stockChart',
    containerProps: {
      className: 'chartContainer',
      style: {
        top: 0,
        height: '100%',
        position: 'absolute',
        width: '100%'
      }
    },
    allowChartUpdate: true,
    immutable: false,
    ref: chartRef,
    callback: getChartRef,
    updateArgs: [true, true, true],
    options: {
      title: 'null',
      plotOptions: {
        line: {
          dataGrouping: {
            enabled: false
          }
        },
        series: {
          connectNulls: false,
          connectorAllowed: false,
          allowPointSelect: true,
          lineWidth: 1,
          states: {
            hover: false
          },
          boostThreshold: 0
        }
      },
      series: [...computeChartData(), dummySeriesCreator('minPoint', from, 0), dummySeriesCreator('maxPoint', to, 1)],
      chart: {
        type: 'line',
        marginTop: 10,
        plotBorderWidth: 0,
        backgroundColor: 'rgba(0,0,0, 0.05)',
        zoomType: false,
        panning: {
          enabled: formData.panning,
          type: 'x'
        },
        events: {
          plotBackgroundColor: 'rgba(10,0,0,0)',
          load: chartFunctions
        }
      },
      xAxis: {
        ordinal: false,
        type: 'datetime'
      },
      yAxis: computeYAxisData(),
      rangeSelector: {
        enabled: false,
        verticalAlign: 'top',
        x: 0,
        y: 0
      },
      navigator: {
        enabled: false,
        adaptToUpdatedData: true
      },
      scrollbar: {
        enabled: false,
        liveRedraw: false
      },
      colorAxis: null,
      credits: {
        enabled: false
      },
      loading: {
        labelStyle: {
          color: 'black',
          fontSize: '20px'
        },
        style: {
          backgroundColor: 'transparent'
        }
      }
    }
  }));
}