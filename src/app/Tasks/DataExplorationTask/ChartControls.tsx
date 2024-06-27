import React, { useState } from 'react';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, OutlinedInput, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, Switch, TextField, Typography, Tab, Tabs, SelectChangeEvent } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

interface ChartControlsProps {
    selectedColumns: string[];
    handleChange: (event: SelectChangeEvent<string[]>) => void;
    selectableColumns: { field: string; headerName: string }[];
    setMode: (mode: 'stack' | 'overlay') => void;
    mode: 'stack' | 'overlay';
    setChartType: (chartType: 'line' | 'bar' | 'area' | 'heatmap') => void;
  chartType: 'line' | 'bar' | 'area' | 'heatmap';
    setShowStatistics: (showStatistics: boolean) => void;
    showStatistics: boolean;
    handleReset: () => void;
    zoomable: 'yes' | 'no';
    setZoomable: (zoomable: 'yes' | 'no') => void;
    showRollingAverage: boolean;
  handleRollingAverageToggle: () => void;
  rollingAverageWindow: number;
  handleRollingAverageWindowChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  
}

const ChartControls: React.FC<ChartControlsProps> = ({
    selectedColumns, handleChange, selectableColumns, setMode, mode, setChartType,
    chartType, showStatistics, handleReset, setShowStatistics, zoomable, setZoomable,
    showRollingAverage, handleRollingAverageToggle, rollingAverageWindow, handleRollingAverageWindowChange,
    
}) => {
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleOpenDialog = () => {
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    const handleSelect = (value: string) => {
        handleChange({ target: { value: [...selectedColumns, value] } } as any);
    };

    const handleChipDelete = (value: string) => {
        handleChange({ target: { value: selectedColumns.filter(col => col !== value) } } as any);
    };

  

    return (
        <Box sx={{ width: "99%", px: 1, py:2 }}>
            <IconButton onClick={handleOpenDialog} aria-label="toggle-select" size="small">
                <MenuIcon />
            </IconButton>

            <Dialog open={dialogOpen} onClose={handleCloseDialog}>
                <DialogTitle>Select Columns</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth>
                        {/* <InputLabel id="select-columns-label"></InputLabel> */}
                        <Select
                            labelId="select-columns-label"
                            multiple
                            value={selectedColumns}
                            onChange={(event) => handleChange(event as any)}
                            input={<OutlinedInput id="select-columns" label="" />}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 224,
                                        width: 250,
                                    },
                                },
                            }}
                            renderValue={(selected) => 'Select Columns'}
                        >
                            {selectableColumns.map((column) => (
                                <MenuItem key={column.field} value={column.field}>
                                    {column.headerName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                        {selectedColumns.map((value) => (
                            <Chip key={value} label={value} onDelete={() => handleChipDelete(value)} />
                        ))}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Close</Button>
                </DialogActions>
            </Dialog>

            <Button
                variant={mode === 'stack' ? 'contained' : 'outlined'}
                onClick={() => setMode('stack')}
                color="primary"
                sx={{ ml: 1 }}
                size="small"
            >
                Stack
            </Button>
            <Button
                variant={mode === 'overlay' ? 'contained' : 'outlined'}
                onClick={() => setMode('overlay')}
                color="primary"
                sx={{ ml: 1 }}
                size="small"
            >
                Overlay
            </Button>
            <FormControl variant="filled" sx={{ ml: 2 , minWidth: 100 }} size="small">
                <InputLabel id="chart-type-label">Chart Type</InputLabel>
                <Select
                    labelId="chart-type-label"
                    value={chartType}
                    label="Chart Type"
                    onChange={(event) => setChartType(event.target.value as 'line' | 'bar' )}
                    size="small"
                >
                    <MenuItem value="bar">Bar</MenuItem>
                    <MenuItem value="line">Line</MenuItem>
                    <MenuItem value="area">Area</MenuItem>
          <MenuItem value="heatmap">Heatmap</MenuItem>
                </Select>
            </FormControl>

            
            {/* <Button
                variant={zoomable === 'yes' ? 'contained' : 'outlined'}
                onClick={() => setZoomable(zoomable === 'yes' ? 'no' : 'yes')}
                color="primary"
                sx={{ ml: 1 }}
                size="small"
            >
                Zoomable
            </Button> */}

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
      onClick={handleReset}
      sx={{ ml: 2 }}
      size="small"
      >
        Reset View
      </Button>
            <Button
                variant="text"
                onClick={() => setShowStatistics(!showStatistics)}
                sx={{ ml: 2 }}
                size="small"
            >
                {showStatistics ? 'Hide Statistics' : 'Show Statistics'}
            </Button>
     

      

        </Box>
    );
};

export default ChartControls;
