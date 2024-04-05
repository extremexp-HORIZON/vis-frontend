import React, { useEffect, useRef, useState } from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import { SupersetPluginInteractiveLineChartProps } from './types';
import type { MenuProps } from 'antd';

import { Select, Button,Menu,Switch } from 'antd';


export default function SupersetPluginInteractiveLineChartCopy(props: SupersetPluginInteractiveLineChartProps) {
  console.log('AppPano');
  
  const { Option } = Select;
  const { series: initialSeries, setDataMask, formData, columnNames } = props;
  const [chartRef, setChartRef] = useState(null);
  const [from, setFrom] = useState(initialSeries[0].data[0].epoch);
  const [to, setTo] = useState(initialSeries[0].data[initialSeries[0].data.length - 1].epoch);
  const [queryResultsLoading, setQueryResultsLoading] = useState(false);
  const chart = useRef(chartRef);
  const fetchDataRef = useRef({ isScrolling: false, scrollTimeout: null });

  const metrikiOptions = ['MIN', 'MAX', 'COUNT', 'SUM', 'AVG'];
  const timeOptions = ['"P1D"', '"PT30M"'];
  const trainOptions = ['Yes','No'];



  const [showMetricsOptions, setShowMetricsOptions] = useState(false);
  const [showTrainOptions, setShowTrainOptions] = useState(false); // Track visibility of metrics options
  const [showColumnOptions, setShowColumnOptions] = useState(false);
  const [showTimeOptions, setShowTimeOptions] = useState(false);


  const [selectedMetric, setSelectedMetric] = useState(null);
  const [selectedTrain,setSelectedTrain]=useState(false);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState("Settings");
  const [isTrainTestActive, setIsTrainTestActive] = useState(false);



  useEffect(() => {
    setFrom(initialSeries[0].data[0].epoch);
    setTo(initialSeries[0].data[initialSeries[0].data.length - 1].epoch);
  }, []);
 
  useEffect(() => {
    if (chartRef !== null) {
      !queryResultsLoading && chartRef.hideLoading();
    }
  }, [queryResultsLoading,]);

  const computeOldChartData = () => {
    const seriesColors = ['red', 'blue', 'black', 'orange', 'pink'];
    return initialSeries.map((series, index) => {
      const sortedData = series.data.sort((a, b) => a.epoch - b.epoch);
      return {
        data: sortedData.map(d => {
          const val = d.value;
          const timestamp = new Date(d.epoch).getTime();
          return [timestamp, isNaN(val) ? null : val];
        }),
        name: series.name,
        color: seriesColors[index % seriesColors.length],
        showInLegend: true,
        enableMouseTracking: formData.showLegend,
      };
    });
  };

  const computeNewChartData = () => {
    const seriesColors = ['red', 'blue'];
    const newData = [];
    initialSeries.forEach(series => {
      const sortedData = series.data.sort((a, b) => a.epoch - b.epoch);
      const newDataPoints = sortedData.reduce((accumulator, currentValue, index) => {
        const timestamp = new Date(currentValue.epoch).getTime();
        const value = isNaN(currentValue.value) ? null : currentValue.value;
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
        enableMouseTracking: formData.showLegend,
      }, {
        data: newDataPoints[1],
        name: series.name + ' (20%)',
        color: seriesColors[1],
        showInLegend: true,
        enableMouseTracking: formData.showLegend,
      });
    });
    return newData;
  };

  const dummyPointCreator = (text, top, height) => ({
    title: {
      enabled: false,
      text,
    },
    opposite: false,
    top,
    height,
    lineWidth: 2,
    offset: 100,
  });

  const dummySeriesCreator = (name, x, idx) => ({
    type: 'line',
    data: [
      {
        x,
        y: 0,
      },
    ],
    name,
    color: 'transparent',
    yAxis: 0,
    zoneAxis: 'x',
    enableMouseTracking: false,
    showInLegend: false,
  });

  const computeYAxisData = () => {
    const yAxisObject = {
      title: {
        enabled: true,
      },
      opposite: false,
      top: '0%',
      height: '100%',
      lineWidth: 2,
      offset: 1,
      startOnTick: false,
      endOnTick: false,
    };

    const mergedObject = {
      ...yAxisObject,
      ...[dummyPointCreator('minPoint', '-10px', '0px'), dummyPointCreator('maxPoint', '-10px', '0px')],
    };

    return mergedObject;
  };

  const fetchData = () => {
    const xAxis = chart.current.xAxis[0];
    const { min, max } = xAxis.getExtremes();

    chart.current.showLoading();
    setQueryResultsLoading(true);
    if (chart.current.renderTo) {
      setDataMask({ ownState: { start: min, end: max } });
      
  
    }
    setQueryResultsLoading(false);
  };

  const chartFunctions = (e: { target: any }) => {
    chart.current = e.target;
    const handleEventTimeout = (event) => {
      if (fetchDataRef.current.scrollTimeout) {
        clearTimeout(fetchDataRef.current.scrollTimeout);
      }
      fetchDataRef.current = { ...fetchDataRef.current, isScrolling: true };
      fetchDataRef.current = {
        ...fetchDataRef.current,
        scrollTimeout: setTimeout(() => {
          fetchDataRef.current = { ...fetchDataRef.current, isScrolling: false };
          fetchData();
        }, 500),
      };
    };

    Highcharts.addEvent(chart.current.container, 'wheel', (event: WheelEvent) => {
      if (formData.zooming) {
        const p = chart.current.xAxis[0].toValue(chart.current.pointer.normalize(event).chartX);
        const { min, max, dataMax, dataMin } = chart.current.xAxis[0].getExtremes();
        const stepleft = (p - min) * 0.10;
        const stepright = (max - p) * 0.10;
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

    Highcharts.addEvent(chart.current.container, 'mouseup', (event: MouseEvent) => {
      if (!chart.current.loadingShown) {
        handleEventTimeout(event);
      }
    });
  };

  const getChartRef = (chartR: any) => {
    setChartRef(chartR);
  };
  
  
  const updateMetriki = (newMetriki) => {
    setSelectedMetric(newMetriki);
    setSelectedMenu("Settings"); // Return to Settings after selecting a metric
    setShowMetricsOptions(false);
    setDataMask({ ownState: {  metriki: newMetriki } });
  };

  const updateColones = (columnNames) => {
    setSelectedColumn(columnNames);
    setSelectedMenu("Settings"); // Return to Settings after selecting a metric
    setShowColumnOptions(false);
    setDataMask({ ownState: {  colona: columnNames } });
  };

  const updateTime = (newtime) => {
    setSelectedTime(newtime);
    setSelectedMenu("Settings"); // Return to Settings after selecting a metric

    setShowTimeOptions(false);
    setDataMask({ ownState: {  timegran: newtime } });
  };
  // const updateTrain=(newtrain)=>{
  //   setSelectedMenu("Settings");

  //   setSelectedTrain(newtrain)
  //   setShowTrainOptions(false);
  // }
  const handleTrainTestToggle = (checked) => {
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
  const computeChartData = () => {
    if (isTrainTestActive) {
      // Compute chart data for train-test active
      return computeNewChartData();
    } else {
      // Compute chart data for train-test inactive
      return computeOldChartData();
    }
  };

  
  
  const handleSelectOption = (value) => {
    setSelectedMenu(value);
    setShowMetricsOptions(value==='metric');
    setShowColumnOptions(value === 'column');
    setShowTimeOptions(value === 'time');
    setShowTrainOptions(value==='train-test');
  };
  


  return (
    <div>
       {/* Dropdown for selecting parent options */}
       <div style={{ position: 'absolute', zIndex: 9999, top: '30px', width: '200px',marginTop: '50px' }}>
       
      <Select value={selectedMenu} onChange={handleSelectOption} style={{ width: '100%' }}>
        <Select.Option value="metric">Metrics</Select.Option>
        <Select.Option value="column">Columns</Select.Option>
        <Select.Option value="time">Timegran</Select.Option>
        <Select.Option value="train-test">
            <Button onClick={handleTrainTestToggle}>
              {isTrainTestActive ? 'Train Test: On' : 'Train Test: Off'}
            </Button>
          </Select.Option>
      </Select>
    </div>

    {/* Options for selecting metrics */}
    {showMetricsOptions && (
      <div style={{ position: 'absolute', zIndex: 9999, top: '70px' }}>
        <Select defaultValue="SelectMetric" style={{ width: 120 }} onChange={updateMetriki}>
          {metrikiOptions.map((option) => (
            <Option key={option} value={option}>
              {option}
            </Option>
          ))}
        </Select>
      </div>      
       )}
     {/* {showTrainOptions && (
      <div style={{ position: 'absolute', zIndex: 9999, top: '70px' }}>
        <Button defaultValue="Train Test" style={{ width: 120 }} onChange={updateTrain}>
          {trainOptions.map((option) => (
            <Option key={option} value={option}>
              {option}
            </Option>
          ))}
        </Button>
      </div>
    )} */}

    {/* Options for selecting columns */}
    {showColumnOptions && (
      <div style={{ position: 'absolute', zIndex: 9999, top: '70px' }}>
        <Select defaultValue="Select Column" style={{ width: 120 }} onChange={updateColones}>
          {columnNames.map((option) => (
            <Option key={option} value={option}>
              {option}
            </Option>
          ))}          
        </Select>
      </div>
    )}

    {/* Options for selecting time granularity */}
    {showTimeOptions && (
      <div style={{ position: 'absolute', zIndex: 9999, top: '70px' }}>
        <Select defaultValue="Select Time" style={{ width: 120 }} onChange={updateTime}>
          {timeOptions.map((option) => (
            <Option key={option} value={option}>
              {option}
            </Option>
          ))}          
        </Select>
      </div>
    )}

      <HighchartsReact
        highcharts={Highcharts}
        constructorType={'stockChart'}
        containerProps={{ className: 'chartContainer', style: { top: 0, height: '100%', position: 'absolute', width: '100%' } }}
        allowChartUpdate={true}
        immutable={false}
        ref={chartRef}
        callback={getChartRef}
        updateArgs={[true, true, true]}
        options={{
          title: 'null',
          plotOptions: {
            line: {
              dataGrouping: {
                enabled: false,
              },
            },
            series: {
              connectNulls: false,
              connectorAllowed: false,
              allowPointSelect: true,
              lineWidth: 1,
              states: {
                hover: false,
              },
              boostThreshold: 0,
            },
          },
          series: [...computeChartData(),
            dummySeriesCreator('minPoint', from, 0),
            dummySeriesCreator('maxPoint', to, 1),
          ],
          chart: {
            type: 'line',
            marginTop: 10,
            plotBorderWidth: 0,
            backgroundColor: 'rgba(0,0,0, 0.05)',
            zoomType: false,
            panning: {
              enabled: formData.panning,
              type: 'x',
            },
            events: {
              plotBackgroundColor: 'rgba(10,0,0,0)',
              load: chartFunctions,
            },
          },
          xAxis: {
            ordinal: false,
            type: 'datetime',
          },
          yAxis: computeYAxisData(),
          rangeSelector: {
            enabled: false,
            verticalAlign: 'top',
            x: 0,
            y: 0,
          },
          navigator: {
            enabled: false,
            adaptToUpdatedData: true,
          },
          scrollbar: {
            enabled: false,
            liveRedraw: false,
          },
          colorAxis: null,
          credits: {
            enabled: false,
          },
          loading: {
            labelStyle: {
              color: 'black',
              fontSize: '20px',
            },
            style: {
              backgroundColor: 'transparent',
            },
          },
        }}
      />
    </div>
  );
}

 
