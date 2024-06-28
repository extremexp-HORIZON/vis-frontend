import React, { useState, useMemo, useEffect } from 'react';
import { Box, Paper, Switch, FormControlLabel, Typography, FormControl, Button, InputLabel, Select, MenuItem, OutlinedInput, Chip, TextField, Tooltip, IconButton, Grid, SelectChangeEvent, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { VegaLite, VisualizationSpec } from 'react-vega';
import InfoIcon from "@mui/icons-material/Info"
import grey from '@mui/material/colors/grey';
import MinimizeIcon from '@mui/icons-material/Minimize';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import StatisticsDisplay from './StatisticsDisplay';
import ScatterControls from './ScatterControls';

interface Column {
    field: string;
    headerName: string;
    width: number;
    type: string;
}

interface ScatterPlotProps {
    data: any[];
    columns: Column[];
    // datetimeColumn: string;
}

const ScatterPlot: React.FC<ScatterPlotProps> = ({ data, columns }) => {
    const selectableColumns = columns.filter(column => column.field !== "timestamp");
    console.log('colscols', selectableColumns);
    
    // Get the first two selectable columns or fallback to an empty array
    const initialSelectedColumns = selectableColumns.slice(0, 2).map(column => column.field);
    const [selectedColumns, setSelectedColumns] = useState<string[]>(initialSelectedColumns);
    const [open, setOpen] = useState(false);
    const [statistics, setStatistics] = useState({});
    const [showStatistics, setShowStatistics] = useState(false);
    const [vegaStats, setVegaStats] = useState<{ column: string; type: string; value: number; }[]>([]);
    const [isVisible, setIsVisible] = useState(true); // State for visibility toggle
    const [isMaximized, setIsMaximized] = useState(false); // State for maximize toggle
    const [zoomable, setZoomable] = useState<'no' | 'yes'>('yes'); // State for zoomable toggle
    const [colorColumn, setColorColumn] = useState<string | null>(null);
    const [sizeColumn, setSizeColumn] = useState<string | null>(null);
    const [addRegression, setAddRegression] = useState<boolean>(false);
    useEffect(() => {
        if (selectedColumns.length && data.length) {
            const newStats = calculateMultipleStatistics(data, selectedColumns);
            setStatistics(newStats);
            const statsData = Object.keys(newStats).flatMap(column => [
                { column, type: 'Mean', value: newStats[column].mean },
                { column, type: 'Median', value: newStats[column].median },
                { column, type: 'Min', value: newStats[column].min },
                { column, type: 'Max', value: newStats[column].max },
                { column, type: 'Std Deviation', value: newStats[column].stdDeviation }
            ]);
            setVegaStats(statsData);
        }
    }, [data, selectedColumns]);

    const handleMinimize = () => {
        setIsVisible(!isVisible); // Toggles the visibility of the chart
    };

    const handleMaximize = () => {
        setIsMaximized(!isMaximized); // Toggles maximization of the chart area
    };

    const handleChange = (event: SelectChangeEvent<string[]>) => {
        setSelectedColumns(event.target.value as string[]);
        setOpen(false); // Close the dropdown after selection
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleReset = () => {
        setSelectedColumns(initialSelectedColumns);
        setColorColumn(null);
    setSizeColumn(null);
    setAddRegression(false);
    };


    const zoomableSpec: VisualizationSpec = useMemo(() => ({
        width: "container",
        autosize: { type: "fit", contains: "padding", resize: true },
        height: 400,
        data: { values: data },
        mark: {type: "point", tooltip: true},

        encoding: {
          x: { type: "quantitative", field: selectedColumns[0]  },
          y: { type: "quantitative", field: selectedColumns[1]  }
        },
        selection: {
          grid_x: {
            type: "interval",
            bind: "scales",
            zoom: "wheel![event.ctrlKey]",
            encodings: ["x"]
          },
          grid_y: {
            type: "interval",
            bind: "scales",
            zoom: "wheel![!event.ctrlKey]",
            encodings: ["y"]
          }
        }
      }), [data, selectedColumns, zoomable]);
      
      const brushSpec: VisualizationSpec = useMemo(() => ({
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "description": "Drag a rectangular brush to show (first 20) selected points in a table.",
    "width": "container",

    "data": { "values": data },
    "transform": [{
      "window": [{"op": "row_number", "as": "row_number"}]
    }],
    "hconcat": [
      {
      "width": 1000,
      "height" :500, 
      "params": [{"name": "brush", "select": "interval"}],
      "mark": "point",
      "encoding": {
        "x": {"field": selectedColumns[0], "type": "quantitative"},
        "y": {"field": selectedColumns[1], "type": "quantitative"},
        
      }
    },

    ///This is the table section. 
     {
      "transform": [
        {"filter": {"param": "brush"}},
        {"window": [{"op": "rank", "as": "rank"}]},
        {"filter": {"field": "rank", "lt": 20}}
      ],
    
      "hconcat": [{
        "width": 120,
        "title": selectedColumns[0],
        "mark": "text",
        "encoding": {
          "text": {"field": selectedColumns[0], "type": "nominal"},
          "y": {"field": "row_number", "type": "ordinal", "axis": null}
        }
      }, {
        "width": 120,
        "title": selectedColumns[1],
        "mark": "text",
        "encoding": {
          "text": {"field": selectedColumns[1], "type": "nominal"},
          "y": {"field": "row_number", "type": "ordinal", "axis": null}
        }
      }]
    }],
    "resolve": {"legend": {"color": "independent"}}
      }), [data, selectedColumns]);
      
      // Use the appropriate spec based on the zoomable property
      const spec: VisualizationSpec = zoomable === 'yes' ? zoomableSpec : brushSpec;

    // const spec: VisualizationSpec = useMemo(() => ({
    //     width: "container",
    //     autosize: { type: "fit", contains: "padding", resize: true },
    //     height: 400,
    //     data: { values: data },
    //     mark: "point",
    //     encoding: {
    //         x: { type: "quantitative", field: selectedColumns[0] || "dns_interlog_time_q1" },
    //         y: { type: "quantitative", field: selectedColumns[1] || "http_interlog_time_q1" }
    //     },
    //     selection: zoomable === 'yes' ? {
    //       grid_x: {
    //           type: "interval",
    //           bind: "scales",
    //           zoom: "wheel![event.ctrlKey]",
    //           encodings: ["x"]
    //       },
    //       grid_y: {
    //           type: "interval",
    //           bind: "scales",
    //           zoom: "wheel![!event.ctrlKey]",
    //           encodings: ["y"]
    //       }
    //   } : undefined
    // }), [data, selectedColumns,zoomable]);

    const handleShowStatistics = () => {
        setShowStatistics(!showStatistics);
    };

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
            }}>

            <Box sx={{ px: 1.5, py: 0.5, display: "flex", alignItems: "center", borderBottom: `1px solid ${grey[400]}` }}>
                <Typography fontSize={"1rem"} fontWeight={600}>
                    Scatter Viewer
                </Typography>
                <Box sx={{ flex: 1 }} />

                <Tooltip title={"Description not available"}>
                    <IconButton>
                        <InfoIcon />
                    </IconButton>
                </Tooltip>
                <IconButton onClick={handleMinimize}>
                    <MinimizeIcon />
                </IconButton>
                <IconButton onClick={handleMaximize}>
                    <FullscreenIcon />
                </IconButton>
            </Box>
            {isVisible && (
                <ScatterControls
                    selectedColumns={selectedColumns}
                    handleChange={handleChange}
                    selectableColumns={selectableColumns}
                    showStatistics={showStatistics}
                    setShowStatistics={setShowStatistics}
                    handleReset={handleReset}
                    zoomable={zoomable}
                setZoomable={setZoomable} />)}
            {isVisible && (
                <Box sx={{ width: "99%", px: 1 }}>
                    <VegaLite
                        spec={spec}
                        style={{ width: "100%" }} />
                </Box>
            )}

            <Dialog open={showStatistics} onClose={handleShowStatistics}>
                <DialogTitle>Statistics</DialogTitle>
                <DialogContent>
                    <StatisticsDisplay statistics={statistics} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleShowStatistics}>Close</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default ScatterPlot;

function calculateMultipleStatistics(data: any[], columns: string[]) {
    const stats: { [key: string]: { mean: number, median: number, min: number, max: number, stdDeviation: number } } = {};
    columns.forEach(column => {
        const values = data.map(item => Number(item[column])).filter(item => !isNaN(item));
        const mean = values.reduce((acc, cur) => acc + cur, 0) / values.length;
        const sortedValues = values.slice().sort((a, b) => a - b);
        const middleIndex = Math.floor(sortedValues.length / 2);
        const median = sortedValues.length % 2 !== 0 ? sortedValues[middleIndex] : (sortedValues[middleIndex - 1] + sortedValues[middleIndex]) / 2;
        const min = Math.min(...sortedValues);
        const max = Math.max(...sortedValues);
        const variance = sortedValues.reduce((acc, cur) => acc + Math.pow(cur - mean, 2), 0) / sortedValues.length;
        const stdDeviation = Math.sqrt(variance);
        stats[column] = { mean, median, min, max, stdDeviation };
    });
    return stats;
}
