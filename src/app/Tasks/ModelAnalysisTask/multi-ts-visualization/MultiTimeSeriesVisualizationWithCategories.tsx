import React, { useEffect, useState, useRef, SetStateAction, Dispatch } from 'react';
import type { View , VisualizationSpec } from 'react-vega';
import { VegaLite } from 'react-vega';
import * as vega from "vega";
import useMousePosition from './useMousePosition';
import Box from "@mui/material/Box";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import InfoIcon from "@mui/icons-material/Info"
import { getVlSpec } from './vegaLiteSpec';
import type { SelectChangeEvent} from '@mui/material';
import { Checkbox, CircularProgress, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import grey from "@mui/material/colors/grey"
import { IDataExplorationResponse } from '../../../../shared/models/dataexploration.model';

interface Metadata {
  id: string;
  category: string;
}

interface Data {
  series: string;
  timestamp: string;
  value: number;
  category: string;
}

interface FileRegion {
  series: string;
  start: Date;
  end: Date;
  misclassified: boolean;
  category: string;
  selected: boolean;
}

interface MultiTimeSeriesVisualizationWithCategoriesProps {
  multipleTimeSeries: {
    data: IDataExplorationResponse | null;
    loading: boolean;
    error: string | null;
  } | null;
  multipleTimeSeriesMetadata?: {
    data: IDataExplorationResponse | null;
    loading: boolean;
    error: string | null;
  } | null;
  setPoint: Dispatch<SetStateAction<any>>
}

var seed = 42;
function random() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

const MultiTimeSeriesVisualizationWithCategories: React.FC<MultiTimeSeriesVisualizationWithCategoriesProps> = (props) => {
  const { multipleTimeSeries, multipleTimeSeriesMetadata, setPoint } = props;
  const [condensedChartData, setCondensedChartData] = useState<Data[]>(); // line chart data in navigator
  const [chartData, setChartData] = useState<Data[]>(); // main chart data 
  const [fileRegions, setFileRegions] = useState<FileRegion[]>([]); // file regions on navigator
  const [fileCategoryMap, setFileCategoryMap] = useState<any>(null);
  const [zoomState, setZoomState] = useState<any>(null); // zoom state of navigator [start, end]
  const [brushedSeries, setBrushedSeries] = useState<string[]>([]); // files that have been brushed
  const [clickedFile, setClickedFile] = useState<string | null>(null); // file that has been clicked
  const [alignment, setAlignment] = React.useState<string>('view'); // toggle view
  const [misclassifiedInstances, setMisclassifiedInstances] = useState<boolean>(false)
  const [selectedSeries, setSelectedSeries] = useState<string>();
  const [vlSpec, setVlSpec] = useState<VisualizationSpec>({});
  const [signalListeners, setSignalListeners] = useState({});

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState<string>('');
  const mousePosition = useMousePosition(); // position of the user's mouse
  // Tooltip that contains add/remove brush functionality
  const [tooltipVisible, setTooltipVisible] = useState<boolean>(false); // tooltip visibility
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 }); // tooltip position  

  const viewRef = useRef<View | null>(null); // reference for the view. on init


  // Handles File click
  useEffect(() => {
    reset();
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
    if (viewRef.current && multipleTimeSeries) {
      const data = structuredClone(multipleTimeSeries.data?.data);
      const selectedSeries = fileRegions.filter(region => region.selected).map(region => region.series);
      const filteredData = data.filter((d: any) => selectedSeries.includes(d.series));
      const selectedFileCategories = fileRegions
        .filter(region => region.selected)
        .map(region => region.category);
      setSelectedCategories([...new Set(selectedFileCategories)]);
      updateData(filteredData);
    }
  }, [fileRegions]);

  // Updates the view when data or metadata changes
  useEffect(() => {
    if(multipleTimeSeries && multipleTimeSeriesMetadata && multipleTimeSeries.data && multipleTimeSeriesMetadata.data)
    {
    const data = structuredClone(multipleTimeSeries.data.data); 
    const metadata = structuredClone(multipleTimeSeriesMetadata.data.data); 
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
    } else {
      console.log('No metadata provided', metadata);
    }

    const fileDataMap: { [key: string]: { start: number; end: number } } = {};
    multipleTimeSeries?.data?.data.forEach((d: any) => {
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
        misclassified: random() < 0.05,
        selected: false
      });
    }
    setVlSpec(getVlSpec('view', false) as VisualizationSpec);
    setFileRegions(regions);
    // setChartData(data);
    setCondensedChartData(data);
    setFileCategoryMap(newFileCategoryMap);}
  }, [multipleTimeSeries, multipleTimeSeriesMetadata]);

  useEffect(() => {
    reset();
    setVlSpec(getVlSpec(alignment, misclassifiedInstances) as VisualizationSpec);
  }, [alignment, misclassifiedInstances]);

  useEffect(() => {
    setSignalListeners(alignment === 'view' ? {
      brushRegions: handleBrushRegions,
      headerCategory: handleHeaderCategoryChange,
      zoomPan: handleZoomPan,
    } :
    {
      brushRegions: handleBrushRegions,
      headerCategory: handleHeaderCategoryChange,
      zoomPan: handleZoomPan,
      brushLines: handleBrushLines,
      highlight: handleHighlight,
    });
  }, [vlSpec]);

  useEffect(() => {
    setTooltipPosition(mousePosition);
  }, [brushedSeries, selectedSeries])

  // Adds brushed datapoints to the selection
  const handleBrushAdd = () => {
    const currentSelection = fileRegions.filter(region => region.selected).map(region => region.series);
    const newSelection = Array.from(new Set([...currentSelection, ...brushedSeries]));
    updateSelection(newSelection);
    hideTooltip();
  };

  // Removes brushed datapoints from the selection
  const handleBrushRemove = () => {
    const currentSelection = fileRegions.filter(region => region.selected).map(region => region.series);
    const newSelection = currentSelection.filter(item => !brushedSeries.includes(item));
    updateSelection(newSelection);
    hideTooltip();
  };

  // Handles brushing. Sets brushed file names and opens the tooltip.
  const handleBrushRegions = (name: string, value: any) => {
    if (!value.start) return;
    reset();
    const [start, end] = value.start;
    const brushedFiles = fileRegions.filter(file => {
      return (file.start <= end && file.end >= start) || (file.start >= start && file.end <= end);
    });
    if (brushedFiles.length > 0) {
      setBrushedSeries(brushedFiles.map(file => file.series));
      showTooltip();
    }
  }

  /// Handles category change from the legend
  const handleHeaderCategoryChange = (_: any, value: any) => {
    const headerCategories = value.category;
    let updatedFileRegions = fileRegions;
    if(headerCategories){
      updatedFileRegions = fileRegions.map(region => {
        const newRegion = structuredClone(region);
        newRegion.selected = headerCategories.includes(region.category);
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

  const handleCategoryChangeFromSelection = (event: SelectChangeEvent<string>) => {
    setNewCategory(event.target.value as string);
  };
  
  // Handles navigator zooming / panning
  const handleZoomPan = (name: string, value: any) => {
    setZoomState(value);
    reset();
  }

  const handleBrushLines = (name: string, value: any) => {
    console.log(value);
  }

  const handleHighlight = (name: string, value: any) => {
    setSelectedSeries(value.series);
    if(value.series){
      showTooltip();
    }
  }

  const handleMisclassifiedInstancesCheckboxChange = (event: React.ChangeEvent) => {
    const checked = (event.target as HTMLInputElement).checked;
    setMisclassifiedInstances(checked);
    const updatedFileRegions = fileRegions.map(region => {
      const newRegion = structuredClone(region);
      newRegion.selected = checked ? (newRegion.misclassified) : false;
      return newRegion;
    });
    updateFileRegions(updatedFileRegions);
  }

  const handleCounterfactuals = () => {
    setPoint(true);
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


  const handleCounterfactualsClose = () => {
    reset();
  }

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
      viewRef.current.change("brushRegions_store", vega.changeset().remove((v: any) => true)).run();
    }
    updateFileRegions(updatedFileRegions);    
  };

  const updateCategories = () => {
    const updatedFileRegions = fileRegions.map(region => {
      const newRegion = structuredClone(region);
      if (newRegion.selected) {
        newRegion.category = newCategory;
      }
      return newRegion;
    });
    updateFileRegions(updatedFileRegions);
  };

  const hideTooltip = () => {
    setTooltipVisible(false);
  }

  const showTooltip = () => {
    setTooltipVisible(true);
  }

  // Removes uneeded objects from screen
  const reset = () => {
    hideTooltip();
    setSelectedSeries(undefined);
    setPoint(null);
  }

  return (
    <>
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
          { "Instance Classification" }
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Box sx={{ position: "relative" }}>
        <Tooltip title={""}>
          <IconButton>
            <InfoIcon />
          </IconButton>
        </Tooltip>
        {multipleTimeSeries && (multipleTimeSeries.loading || !multipleTimeSeries.data) && (
            <CircularProgress
              size={28}
              sx={{
                // color: green[500],
                position: "absolute",
                top: 6,
                left: 6,
                zIndex: 0,
              }}
            />
          )}
        </Box>
      </Box>
      <Box sx={{width:"100%", display: 'flex', flexDirection: 'column', flexWrap: 'wrap', p:2}}>
        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', alignItems: 'flex-start', pb: 2}}>
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
           <Box sx={{ display: 'flex', flexDirection: 'row',  pl: 10, flexWrap: 'wrap'}}>
              {/* <Box sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap'}}>
                <Typography fontSize={"1em"} fontWeight={600} textAlign={"left"}>
                  {"Selected File Categories"}
                </Typography>
                <Typography fontSize={"1em"} fontWeight={300} textAlign={"left"}>
                  {selectedCategories.length === 0 ? "None" : (selectedCategories.length === 1 ? selectedCategories[0] : "Multiple")}
                </Typography>
              </Box>
              <Select
                value={newCategory}
                onChange={handleCategoryChangeFromSelection}
                displayEmpty
                size='small'
                inputProps={{ 'aria-label': 'Without label' }}
                sx={{ ml: 2, width: 200 }}
              >
                <MenuItem value={'no anomaly'}>No Anomaly</MenuItem>
                <MenuItem value={'mechanical anomaly'}>Mechanical Anomaly</MenuItem>
                <MenuItem value={'electrical anomaly'}>Electrical Anomaly</MenuItem>
              </Select>
              <Button variant="contained" onClick={updateCategories} sx={{ ml: 2 }} size='small'>
                Update Category
              </Button>*/}
              <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                px: 1.5,
              }}
              >
            <Typography fontSize={"0.8rem"}>Misclasified Instances:</Typography>
            <Checkbox checked={misclassifiedInstances} onChange={handleMisclassifiedInstancesCheckboxChange} />
              </Box>
          </Box>
        </Box>
        <Box sx={{width:"90%", display: 'flex', flexDirection: 'row', flexWrap: 'wrap'}}>
         {vlSpec && 
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
            signalListeners={signalListeners}
          />
          }
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
              {
              selectedSeries ? 
              <>
              <div style = {{display: "flex", flexDirection:"column", padding:2}}>
                <span><b>Name:</b> {selectedSeries}</span>
                <span><b>Category:</b> {fileCategoryMap[selectedSeries]}</span>
                <div style = {{display: "flex", flexDirection:"column", padding:2}}>
                  {misclassifiedInstances && <button onClick={handleCounterfactuals}>Counterfactuals</button>}
                </div>
              </div>
              </>
              :
              <>
                <button onClick={handleBrushAdd}>Add</button>
                <button onClick={handleBrushRemove}>Remove</button>
              </>
              }
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
    </>
  );  
};

export default MultiTimeSeriesVisualizationWithCategories;
