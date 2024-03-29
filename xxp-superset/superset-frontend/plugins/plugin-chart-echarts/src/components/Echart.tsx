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
import React, {
  useRef,
  useEffect,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useCallback,
  useState,
} from 'react';
import { styled } from '@superset-ui/core';
import { ECharts, init } from 'echarts';
import { EchartsHandler, EchartsProps, EchartsStylesProps } from '../types';

const Styles = styled.div<EchartsStylesProps>`
  height: ${({ height }) => height};
  width: ${({ width }) => width};
`;

function Echart(
  {
    width,
    height,
    echartOptions,
    eventHandlers,
    zrEventHandlers,
    selectedValues = {},
    refs,
  }: EchartsProps,
  ref: React.Ref<EchartsHandler>,
) {
  
  const divRef = useRef<HTMLDivElement>(null);
  if (refs) {
    // eslint-disable-next-line no-param-reassign
    refs.divRef = divRef;
  }
  console.log('echart option',echartOptions);
  

  const chartRef = useRef<ECharts>();
  const currentSelection = useMemo(
    () => Object.keys(selectedValues) || [],
    [selectedValues],
  );
  const previousSelection = useRef<string[]>([]);

  const [showLegend, setShowLegend] = useState(true);
  
  // Function to handle smooth toggle


  

  useImperativeHandle(ref, () => ({
    getEchartInstance: () => chartRef.current,
  }));

  useEffect(() => {
    if (!divRef.current) return;
    if (!chartRef.current) {
      chartRef.current = init(divRef.current);
    }

    Object.entries(eventHandlers || {}).forEach(([name, handler]) => {
      chartRef.current?.off(name);
      chartRef.current?.on(name, handler);
    });

    Object.entries(zrEventHandlers || {}).forEach(([name, handler]) => {
      chartRef.current?.getZr().off(name);
      chartRef.current?.getZr().on(name, handler);
    });

  //   chartRef.current.setOption(echartOptions, true);
  // }, [echartOptions, eventHandlers, zrEventHandlers]);
  const updatedOptions = { ...echartOptions, legend: { show: showLegend }, }; // Update legend visibility
  chartRef.current.setOption(updatedOptions, true);
}, [echartOptions, eventHandlers, zrEventHandlers, showLegend,]);
// useEffect(() => {
//   if (!chartRef.current) return;
  
//   // Update smooth property in series object
  
  
//   // Update legend visibility
//   // const updatedOptions = { ...echartOptions, legend: { show: showLegend }, };
//   // chartRef.current.setOption(updatedOptions, true);
// }, [echartOptions, showLegend, smooth]);

  // highlighting
  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.dispatchAction({
      type: 'downplay',
      dataIndex: previousSelection.current.filter(
        value => !currentSelection.includes(value),
      ),
    });
    if (currentSelection.length) {
      chartRef.current.dispatchAction({
        type: 'highlight',
        dataIndex: currentSelection,
      });
    }
    previousSelection.current = currentSelection;
  }, [currentSelection]);

  const handleSizeChange = useCallback(
    ({ width, height }: { width: number; height: number }) => {
      if (chartRef.current) {
        chartRef.current.resize({ width, height });
      }
    },
    [],
  );

  // did mount
  useEffect(() => {
    handleSizeChange({ width, height });
    return () => chartRef.current?.dispose();
  }, []);

  useLayoutEffect(() => {
    handleSizeChange({ width, height });
  }, [width, height, handleSizeChange]);
 
  const handleButtonClick = () => {
    setShowLegend(!showLegend); // Toggle legend visibility
  };
  const handleButtonClick1 = () => {
    setOrderDesc(!orderDesc); // Toggle legend visibility
  };
  

  // return <Styles ref={divRef} height={height} width={width} />;
  return (
    <>

      <Styles ref={divRef} height={height} width={width} />
{/* <button onClick={handleButtonClick1}>Orderdesc</button> */}
 {/* <button onClick={handleButtonClick}>Legend</button> */}

      
    </>
  );
  
}

export default forwardRef(Echart);
