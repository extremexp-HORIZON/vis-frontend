import React, { useState, useMemo, useEffect } from 'react';
import { Box, Paper, Switch, FormControlLabel, Typography, FormControl, Button, InputLabel, Select, MenuItem, OutlinedInput, Chip, TextField, Tooltip, IconButton, Grid, SelectChangeEvent, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { VegaLite, VisualizationSpec } from 'react-vega';
import InfoIcon from "@mui/icons-material/Info"
import grey from '@mui/material/colors/grey';
import MinimizeIcon from '@mui/icons-material/Minimize';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import ChartControls from './ChartControls';
import StatisticsDisplay from './StatisticsDisplay';

interface Column {
    field: string;
    headerName: string;
    width: number;
    type: string;
}

interface DataExplorationChartProps {
    data: any[];
    columns: Column[];
    datetimeColumn: string;
}

const DataExplorationChart: React.FC<DataExplorationChartProps> = ({ data, columns, datetimeColumn,}) => {
    const selectableColumns = columns.filter(column => column.field !== datetimeColumn);
    const initialSelectedColumn = selectableColumns[0]?.field || "";
    const [selectedColumns, setSelectedColumns] = useState<string[]>([initialSelectedColumn]);
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<'overlay' | 'stack'>('overlay');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [chartType, setChartType] = useState<'line' | 'bar'>('line');
    const [statistics, setStatistics] = useState({});
    const [showStatistics, setShowStatistics] = useState(false);
    const [vegaStats, setVegaStats] = useState<{ column: string; type: string; value: number; }[]>([]);
    const [isVisible, setIsVisible] = useState(true); // State for visibility toggle
    const [isMaximized, setIsMaximized] = useState(false); // State for maximize toggle
    // const [chartView, setChartView] = useState<'linechart' | 'scatter'>('linechart');

    
    
    useEffect(() => {
        if (selectedColumns.length && data.length) {
            const newStats = calculateMultipleStatistics(data, selectedColumns);
            setStatistics(newStats)
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


    const filteredData = data.filter(item => {
        const itemDate = new Date(item[datetimeColumn]);
        return (!startDate || itemDate >= startDate) && (!endDate || itemDate <= endDate);
    });


    const handleMinimize = () => {
        setIsVisible(!isVisible); // Toggles the visibility of the chart
    };

    const handleMaximize = () => {
        setIsMaximized(!isMaximized); // Toggles maximization of the chart area
    };

    // const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    //     setSelectedColumns(event.target.value as string[]);
    //     setOpen(false); // Close the dropdown after selection
    // };

    
   const handleChange = (event: SelectChangeEvent<string[]>, child: React.ReactElement<any, any> | null):void => {
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
        setSelectedColumns([initialSelectedColumn]);

        setMenuMode('overlay');
    };

    const spec: VisualizationSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Dynamic data visualization.",
        "width": "container",
        "autosize": { "type": "fit", "contains": "padding", "resize": true },
        "height": 400,
        "data": { "values": filteredData },
        "params": [{
    "name": "grid",
    "select": "interval",
    "bind": "scales"
  }],
        "encoding": {
            "x": { "field": datetimeColumn, "type": "temporal", "title": "Timestamp" },
            "y": { "field": "value", "type": "quantitative", "title": "Value","stack": mode === 'stack' ? 'zero' : null },
            "color": { "field": "variable", "type": "nominal", "title": "Variable" }
        },
        "layer": [
            {
                "mark": chartType === 'line' ? { "type": "line", "interpolate": "linear" } : { "type": "bar" },
                "encoding": {
                    "tooltip": [
                        { "field": "variable", "type": "nominal" },
                        { "field": "value", "type": "quantitative" }
                    ]
                }
            },
            
        
        ],
        "transform": [
            {
                "fold": selectedColumns.length > 0 ? selectedColumns : selectableColumns.map(col => col.field),
                "as": ["variable", "value"]
            }
        ]
    };
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
                    Chart Viewer
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
                <ChartControls 
                selectedColumns={selectedColumns}
                handleChange={handleChange}
                handleOpen={handleOpen}
                handleClose={handleClose}
                open={open}
                selectableColumns={selectableColumns}
                setMode={setMode}
                mode={mode}
                setChartType={setChartType}
                setShowStatistics={setShowStatistics}
                chartType={chartType}
                showStatistics={showStatistics}
                handleReset={handleReset}/> )}
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

            {/* {showStatistics && isVisible && <StatisticsDisplay statistics={statistics} />} */}
            

        </Paper>
    );
};

export default DataExplorationChart;

function setMenuMode(arg0: string) {
    throw new Error('Function not implemented.');
}

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



