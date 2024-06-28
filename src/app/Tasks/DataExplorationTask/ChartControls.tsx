import React from 'react';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';

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
  
}

const ChartControls: React.FC<ChartControlsProps> = ({ setMode, mode, setChartType,
    chartType, showStatistics, setShowStatistics,
    showRollingAverage, handleRollingAverageToggle, rollingAverageWindow, handleRollingAverageWindowChange,
    
}) => {
    

  

    return (
        <Box sx={{ width: "99%", px: 1, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
           


<Button variant={showRollingAverage ? 'contained' : 'outlined'} onClick={handleRollingAverageToggle}                  sx={{ ml: 2 }}
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
                <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                    <InputLabel id="chart-type-label">Chart Type</InputLabel>
                    <Select
                        labelId="chart-type-label"
                        value={chartType}
                        onChange={(event) => setChartType(event.target.value as 'line' | 'bar' | 'area' | 'heatmap')}
                        label="Chart Type"
                    >
                        <MenuItem value="bar">Bar</MenuItem>
                        <MenuItem value="line">Line</MenuItem>
                        <MenuItem value="area">Area</MenuItem>
                        <MenuItem value="heatmap">Heatmap</MenuItem>
                    </Select>
                </FormControl>
                <Button
                    variant={mode === 'stack' ? 'contained' : 'outlined'}
                    onClick={() => setMode('stack')}
                    color="primary"
                    size="small"
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
