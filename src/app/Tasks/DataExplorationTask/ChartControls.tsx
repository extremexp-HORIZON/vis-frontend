import React from 'react';
import { Box, Button, Checkbox, FormControl, InputLabel, ListItemText, MenuItem, Select, TextField } from '@mui/material';
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
    setChartType: (chartType: 'line' | 'bar' | 'area' | 'heatmap') => void;
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
  
}

const ChartControls: React.FC<ChartControlsProps> = ({ setMode, mode, setChartType,
    chartType, showStatistics, setShowStatistics,
    showRollingAverage, handleRollingAverageToggle, rollingAverageWindow, handleRollingAverageWindowChange,
    availableColumns, xAxis, setXAxis, yAxis, setYAxis
    }) => {
        const handleXAxisChange = (event) => {
            setXAxis(event.target.value);
        };
    
        const handleYAxisChange = (event) => {
            const value = event.target.value;
            setYAxis(value);
        };
      


    return (
        <Box sx={{ width: "99%", px: 1, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
<FormControl sx={{ minWidth: 120 }}>
                <InputLabel>X-Axis</InputLabel>
                <Select
                    value={xAxis}
                    onChange={handleXAxisChange}
                    MenuProps={{
                        PaperProps: {
                            style: {
                                maxHeight: 224,
                                width: 250,
                            },
                        },
                    }}
                    size="small"

                >
                    {availableColumns.map((column) => (
                        <MenuItem key={column.field} value={column.field}>
                            {column.headerName}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Y-Axis</InputLabel>
                <Select
                    multiple
                    value={yAxis}
                    onChange={handleYAxisChange}
                    renderValue={(selected) => (selected as string[]).join(', ')}
                    size="small"
                    MenuProps={{
                        PaperProps: {
                            style: {
                                maxHeight: 224,
                                width: 250,
                            },
                        },
                    }}
                >
                    {availableColumns.map((column) => (
                        <MenuItem key={column.field} value={column.field}>
                            <Checkbox checked={yAxis.indexOf(column.field) > -1} />
                            <ListItemText primary={column.headerName} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
<Button variant={showRollingAverage ? 'contained' : 'outlined'} onClick={handleRollingAverageToggle}  
                sx={{ ml: 2 }}
               size="small">
        Rolling Average
      </Button>
      {showRollingAverage && (
        <TextField
          label="Window"
        //   type="number"
          value={rollingAverageWindow}
          onChange={handleRollingAverageWindowChange}
          InputProps={{ inputProps: { min: 1 } }}
          sx={{  width: '5%',ml:2 }}
          size="small"
        />
      )}
     
            <Button
                variant="text"
                onClick={() => setShowStatistics(!showStatistics)}
                sx={{ ml: 2 }}
                size="small"
            >
                {showStatistics ? 'Hide Statistics' : 'Show Statistics'}
            </Button>

<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ChartButtonGroup chartType={chartType} setChartType={setChartType}/>
                <Button
                    variant={mode === 'stack' ? 'contained' : 'outlined'}
                    onClick={() => setMode('stack')}
                    color="primary"
                    // size="small"
                >
                    Stack
                </Button>
                <Button
                    variant={mode === 'overlay' ? 'contained' : 'outlined'}
                    onClick={() => setMode('overlay')}
                    color="primary"
                    size="small"
                >
                    Overlay
                </Button>
            </Box>
      

        </Box>
    );
};

export default ChartControls;
