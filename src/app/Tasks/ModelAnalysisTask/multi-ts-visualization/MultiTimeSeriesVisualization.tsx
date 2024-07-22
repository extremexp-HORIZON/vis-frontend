import React, { useEffect, useState, useRef } from 'react';
import type { VisualizationSpec, View } from 'react-vega';
import { VegaLite } from 'react-vega';
import * as vega from "vega";
import useMousePosition from './useMousePosition';
import Box from "@mui/material/Box";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import InfoIcon from "@mui/icons-material/Info"
import { getVegaLiteSpec } from './vegaLiteSpec';
import { IconButton, Paper, Tooltip, Typography } from '@mui/material';
import grey from "@mui/material/colors/grey"

interface Metadata {
  id: string;
  category: string;
}

interface Data {
  series: string;
  timestamp: string;
  value: number;
}

interface FileRegion {
  series: string;
  start: Date;
  end: Date;
  category: string;
  selected: boolean;
}

interface MultiTimeSeriesVisualizationProps {
  data: Data[];
  metadata: Metadata[];
}

const MultiTimeSeriesVisualization: React.FC<MultiTimeSeriesVisualizationProps> = ({ data, metadata }) => {
  const [condensedChartData, setCondensedChartData] = useState<Data[]>(data); // line chart data in navigator
  const [chartData, setChartData] = useState<Data[]>(); // main chart data 
  const [fileRegions, setFileRegions] = useState<FileRegion[]>([]); // file regions on navigator
  const [fileCategoryMap, setFileCategoryMap] = useState<any>(null);
  const [zoomState, setZoomState] = useState<any>(null); // zoom state of navigator [start, end]
  const [brushedSeries, setBrushedSeries] = useState<string[]>([]); // files that have been brushed
  const [clickedFile, setClickedFile] = useState<string | null>(null); // file that has been clicked
  const [alignment, setAlignment] = React.useState<string>('view'); // toggle view
  const [vlSpec, setVlSpec] = useState<VisualizationSpec>({}); // vega lite specification

  const mousePosition = useMousePosition(); // position of the user's mouse

  // Tooltip that contains add/remove brush functionality
  const [tooltipVisible, setTooltipVisible] = useState<boolean>(false); // tooltip visibility
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 }); // tooltip position  

  const viewRef = useRef<View | null>(null); // reference for the view. on init


  // Handles File click
  useEffect(() => {
    setTooltipVisible(false);
    // Toggle the selected state of the clicked series
    const updatedFileRegions = fileRegions.map(region => {
      const newRegion = structuredClone(region);
      newRegion.selected = clickedFile === region.series ? !region.selected : region.selected ;
      return newRegion;
    });
    updateFileRegions(updatedFileRegions);
  }, [clickedFile]);


  // Handles fileRegions update
  // Occurs on single click selection / brush / category selection from legend
  useEffect(() => {
    if (viewRef.current) {
      const selectedSeries = fileRegions.filter(region => region.selected).map(region => region.series);
      const filteredData = data.filter(d => selectedSeries.includes(d.series));
      updateData(filteredData);
    }
  }, [fileRegions]);

  // Updates the view when data or metadata changes
  useEffect(() => {
    const regions: FileRegion[] = [];
    const newFileCategoryMap: { [key: string]: string } = {};

    // Check if metadata is extensible
    if (!Object.isExtensible(data)) {
      console.warn('Metadata is non-extensible:', metadata);
    }
    if (!Object.isExtensible(metadata)) {
      console.warn('Metadata is non-extensible:', metadata);
    }
    if (Array.isArray(metadata)) {
      metadata.forEach(({ id, category }) => {
        newFileCategoryMap[id.replace('.csv', '')] = category;
      });

      const fileDataMap: { [key: string]: { start: number; end: number } } = {};
      data.forEach(d => {
        const series = d.series;
        const timestamp = new Date(d.timestamp).getTime();

        if (!fileDataMap[series]) {
          fileDataMap[series] = { start: timestamp, end: timestamp };
        } else {
          fileDataMap[series].start = Math.min(fileDataMap[series].start, timestamp);
          fileDataMap[series].end = Math.max(fileDataMap[series].end, timestamp);
        }
      });

      for (const series in fileDataMap) {
        regions.push({
          series,
          start: new Date(fileDataMap[series].start),
          end: new Date(fileDataMap[series].end),
          category: newFileCategoryMap[series],
          selected: false
        });
      }
    } else {
      console.error('Metadata is not an array:', metadata);
    }
    // updateFileRegions(regions);
    setFileRegions(regions);
    setChartData(data);
    setCondensedChartData(data);
    setFileCategoryMap(newFileCategoryMap);
    setVlSpec(getVegaLiteSpec(alignment) as VisualizationSpec);
  }, [data, metadata]);

  useEffect(() => {
    setVlSpec(getVegaLiteSpec(alignment) as VisualizationSpec);
  }, [alignment]);

  // Adds brushed datapoints to the selection
  const handleBrushAdd = () => {
    const currentSelection = fileRegions.filter(region => region.selected).map(region => region.series);
    const newSelection = Array.from(new Set([...currentSelection, ...brushedSeries]));
    updateSelection(newSelection);
    setTooltipVisible(false);
  };

  // Removes brushed datapoints from the selection
  const handleBrushRemove = () => {
    const currentSelection = fileRegions.filter(region => region.selected).map(region => region.series);
    const newSelection = currentSelection.filter(item => !brushedSeries.includes(item));
    updateSelection(newSelection);
    setTooltipVisible(false);
  };

  // Handles brushing. Sets brushed file names and opens the tooltip.
  const handleBrush = (name: string, value: any) => {
    if (!value.start) return;
    const [start, end] = value.start;
    const brushedFiles = fileRegions.filter(file => {
      return (file.start <= end && file.end >= start) || (file.start >= start && file.end <= end);
    });
    if (brushedFiles.length > 0) {
      setBrushedSeries(brushedFiles.map(file => file.series));
      setTooltipVisible(true);
      setTooltipPosition(mousePosition);
    }
  }

  /// Handles category change from the legend
  const handleCategoryChange = (_: any, value: any) => {
    const selectedCategories = value.category;
    let updatedFileRegions = fileRegions;
    if(selectedCategories){
      updatedFileRegions = fileRegions.map(region => {
        const newRegion = structuredClone(region);
        newRegion.selected = selectedCategories.includes(region.category);
        return newRegion;
      });
    }
    else{
      updatedFileRegions = fileRegions.map(region => {
        const newRegion = structuredClone(region);
        newRegion.selected = false;
        return newRegion;
      });
    }
    updateFileRegions(updatedFileRegions);
  }

  // Handles navigator zooming / panning
  const handleZoomPan = (name: string, value: any) => {
    setZoomState(value);
    reset();
  }

  const handleHighlight = (name: string, value: any) => {
    // console.log(fileCategoryMap[value.series]);
  }

  // Initialization
  const handleNewView = (view: View) => {
    viewRef.current = view;
    // insert needed event listeners to view
    viewRef.current.addEventListener("click", (event: any, item: any) => {
      reset();
      if (item && item.datum) {
        if(item.datum.series && item.datum.series.includes("file")) { // corresponds to events in the fileRegion
          if (event.shiftKey) {
            setClickedFile(item.datum.series);
          }
          else{
            //nothing
          }
         }
        else{
          //nothing
        }
      } else {
        //nothing
      }
    })
  }

  // Handles view change
  const handleViewChange = (event: React.MouseEvent<HTMLElement>, newAlignment: string) => {
    if(newAlignment) setAlignment(newAlignment);
  };


  // Updates file regions data for navigator.
  // Each object contains a boolean selected parameter that triggers the file's visualization parameters.
  const updateFileRegions = (updatedFileRegions: FileRegion[]) => {
    if (viewRef.current) {
      viewRef.current.change("fileRegions",
       vega.changeset().insert(updatedFileRegions).remove(vega.truthy())).runAsync();
    }
    setFileRegions(updatedFileRegions);
  }

  // Updates main chart data
  const updateData = (fileData: Data[]) => {
    setChartData(fileData);
  }

  // Updates the selected value of fileRegions
  // Updates the main chart view
    const updateSelection = (selection: string | string[]) => {
      const updatedFileRegions = fileRegions.map(region => {
        const newRegion = structuredClone(region);
        newRegion.selected = selection.includes(region.series);
        return newRegion;
      });
      if(viewRef.current){
        viewRef.current.change("brush_store", vega.changeset().remove((v: any) => true)).run();
      }
      updateFileRegions(updatedFileRegions);    
  };

  // Removes uneeded objects from screen
  const reset = () => {
    setTooltipVisible(false);
  }
  
  return (
    <Paper
      className="Category-Item"
      elevation={2}
      sx={{
        borderRadius: 4,
        width: "inherit",
        display: "flex",
        flexDirection: "column",
        rowGap: 0,
        minWidth: "300px",
        height: "100%",
      }}
    >
      <Box
        sx={{
          px: 1.5,
          py: 0.5,
          display: "flex",
          alignItems: "center",
          borderBottom: `1px solid ${grey[400]}`,
        }}
      >
        <Typography fontSize={"1rem"} fontWeight={600}>
          {"Instance Classification"}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Tooltip title={""}>
          <IconButton>
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{width:"100%", display: 'flex', flexDirection: 'row', flexWrap: 'wrap', p:2}}>
        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', alignItems: 'flex-start'}}>
          <ToggleButtonGroup
            color="primary"
            value={alignment}
            exclusive
            onChange={handleViewChange}
            aria-label="Platform"
          >
            <ToggleButton size="small" value="view">View</ToggleButton>
            <ToggleButton size="small" value="compare">Compare</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Box sx={{width:"90%", display: 'flex', flexDirection: 'row', flexWrap: 'wrap'}}>
          <VegaLite
            key={`multi-ts-visualization`}
            spec={vlSpec}
            style={{ width: "100%" }}
            actions={false} // hides 3 dots action button
            data={{
              chartData: chartData,
              condensedChartData: condensedChartData,
              fileRegions: fileRegions
            }}
            onNewView={handleNewView}
            signalListeners={{
              brush: handleBrush,
              category: handleCategoryChange,
              zoomPan: handleZoomPan,
            }}
          />
          {tooltipVisible && (
            <Box
              style={{
                position: 'absolute',
                left: `${tooltipPosition.x}px`,
                top: `${tooltipPosition.y}px`,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'white',
                border: '1px solid black',
                padding: '10px',
                zIndex: 100,
              }}
            >
              <button onClick={handleBrushAdd}>Add</button>
              <button onClick={handleBrushRemove}>Remove</button>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );  
};

export default MultiTimeSeriesVisualization;
