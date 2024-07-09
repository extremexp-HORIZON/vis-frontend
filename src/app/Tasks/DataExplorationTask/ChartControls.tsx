import React from 'react';
import { Box, Button, Checkbox, FormControl, ListItemText, MenuItem, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
import ChartButtonGroup from './ChartButtonGroup';

interface Column {
    field: string;
    headerName: string;
    width: number;
    type: string;
}

interface ChartControlsProps {
    setMode: (mode: 'stack' | 'overlay') => void;
    mode: 'stack' | 'overlay';
setChartType: (chartType: 'line' | 'area' | 'heatmap' | 'bar') => void
    chartType: 'line' | 'bar' | 'area' | 'heatmap';
    setShowStatistics: (showStatistics: boolean) => void;
    showStatistics: boolean;
    showRollingAverage: boolean;
    handleRollingAverageToggle: () => void;
    rollingAverageWindow: number;
    handleRollingAverageWindowChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    availableColumns: Column[];
    xAxis: string;
    setXAxis: (column: string) => void;
    yAxis: string[];
    setYAxis: (columns: string[]) => void;
    aggFunction: 'None' | 'Min' | 'Max' | 'Avg'; // Initialize with 'None'
    setAggFunction: (aggFunction: 'None' | 'Min' | 'Max' | 'Avg') => void;
    category: string;
    setCategory: (category: string) => void;
}

const ChartControls: React.FC<ChartControlsProps> = ({
    setMode,
    mode,
    setChartType,
    chartType,
    showStatistics,
    setShowStatistics,
    showRollingAverage,
    handleRollingAverageToggle,
    rollingAverageWindow,
    handleRollingAverageWindowChange,
    availableColumns,
    xAxis,
    setXAxis,
    yAxis,
    setYAxis,
    aggFunction,
    setAggFunction,
    category,
    setCategory,
}) => {
    const handleXAxisChange = (event: SelectChangeEvent<string>) => {
        setXAxis(event.target.value as string);
    };

    const handleYAxisChange = (event: SelectChangeEvent<string[]>) => {
        const value = event.target.value as string[];
        setYAxis(value);
    };

    const handleAggFunctionChange = (event: SelectChangeEvent<string>) => {
        setAggFunction(event.target.value as 'None' | 'Min' | 'Max' | 'Avg');
    };
    const handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCategory(event.target.value);
    };

    let additionalControl = null;

    if (chartType === 'bar') {
        additionalControl = (
            <TextField
                label="Category"
                value={category}
                onChange={handleCategoryChange}
                sx={{ m: 1, minWidth: 120 }}
                size="small"
            />
        );
    } else if (chartType === 'heatmap') {
        additionalControl = (
            <TextField
                label="Color By"
                value={category}
                onChange={handleCategoryChange}
                sx={{ m: 1, minWidth: 120 }}
                size="small"
            />
        );
    }
    return (
    <Box sx={{ width: "90%", px: 1, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: "flex", flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", alignItems: "center", px: 1.5 }}>
                <Typography fontSize={"0.8rem"}>x-axis:</Typography>
                <FormControl
                sx={{ m: 1, minWidth: 120, maxHeight: 120 }}
                size="small"
                >
                    <Select
                        value={xAxis}
                        onChange={handleXAxisChange}
                        sx={{ fontSize: "0.8rem" }}
                        MenuProps={{
                            PaperProps: {
                            style: {
                                maxHeight: 250,
                                maxWidth: 300,
                            },
                            },
                        }}
                    >
                        {availableColumns.map((column) => (
                            <MenuItem key={column.field} value={column.field}>
                                {column.headerName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
                <Box sx={{ display: "flex", alignItems: "center", px: 1.5 }}>
                    <Typography fontSize={"0.8rem"}>y-axis:</Typography>
                    <FormControl
                    sx={{ m: 1, minWidth: 120,width:200 }}
                    size="small">
                        <Select
                            multiple
                            value={yAxis}
                            sx={{ fontSize: "0.8rem" }}

                            onChange={handleYAxisChange}
                            renderValue={(selected) => (selected as string[]).join(', ')}
                            MenuProps={{
                                PaperProps: {
                                style: {
                                    maxHeight: 250,
                                    maxWidth: 300,
                                },
                                }}
                            }
                            >
                            {availableColumns.map((column) => (
                                <MenuItem key={column.field} value={column.field}>
                                    <Checkbox checked={yAxis.indexOf(column.field) > -1} />
                                    <ListItemText primary={column.headerName} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", px: 1.5 }}>
                    <Typography fontSize={"0.8rem"}>grouping function:</Typography>
                    <FormControl
                        sx={{ m: 1, minWidth: 120 }}
                        size="small"
                    >
                        <Select
                            value={aggFunction}
                            onChange={handleAggFunctionChange}
                            sx={{ fontSize: "0.8rem" }}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 250,
                                        maxWidth: 300,
                                    },
                                },
                            }}
                        >
                            <MenuItem value="None">None</MenuItem>
                            <MenuItem value="min">Min</MenuItem>
                            <MenuItem value="max">Max</MenuItem>
                            <MenuItem value="avg">Avg</MenuItem>
                        </Select>
                    </FormControl>
                    {additionalControl}

                </Box>
        </Box>
            {/* <Button variant={showRollingAverage ? 'contained' : 'outlined'} onClick={handleRollingAverageToggle}  
                sx={{ ml: 2 }}
                size="small"
                type="button"
                >
                Rolling Average
            </Button>
            {showRollingAverage && (
                <TextField
                    label="Window"
                    value={rollingAverageWindow}
                    onChange={handleRollingAverageWindowChange}
                    InputProps={{ inputProps: { min: 1 } }}
                    sx={{  width: '5%', ml: 2 }}
                    size="small"
                />
            )}
            <Button
                variant="text"
                onClick={() => setShowStatistics(!showStatistics)}
                sx={{ ml: 2 }}
                size="small"
                type="button"
            >
                {showStatistics ? 'Hide Statistics' : 'Show Statistics'}
            </Button> */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ChartButtonGroup chartType={chartType} setChartType={setChartType}/>
                <Button
                    variant={mode === 'stack' ? 'contained' : 'outlined'}
                    onClick={() => setMode('stack')}
                    color="primary"
                    size='small'
                    type="button"
                >
                    Stack
                </Button>
                <Button
                    variant={mode === 'overlay' ? 'contained' : 'outlined'}
                    onClick={() => setMode('overlay')}
                    color="primary"
                    size="small"
                    type="button"
                >
                    Overlay
                </Button>
            </Box>
        </Box>
    );
};

export default ChartControls;


