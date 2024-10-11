import React, { useEffect, useState } from 'react';
import { Box, Tab, Tabs, Typography, Button, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, Tooltip, Slider } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import { grey } from '@mui/material/colors';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import TableRowsIcon from '@mui/icons-material/TableRows';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { createTheme,ThemeProvider } from '@mui/material';

const ControlPanel = ({ 
    originalColumns, 
    selectedColumns, 
    setSelectedColumns, 
    rowLimit, 
    setRowLimit, 
    activeTab, 
    setActiveTab, 
    onFetchData,
    filters,
    setFilters,
    uniqueValues
    
}) => {
    const handleChange = (event) => {
        const {
            target: { value },
        } = event;
        setSelectedColumns(typeof value === 'string' ? value.split(',') : value);
    };


    const theme = createTheme({
        palette: {
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#dc004e',
          },
        },
        typography: {
          fontFamily: 'Arial',
          h6: {
            fontWeight: 600,
          },
       },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: '20px',  // Example of button customization
              },
            },
          },
        },
      });
    const [showColumnDropdown, setShowColumnDropdown] = useState(false);
    const [showRowLimitDropdown, setShowRowLimitDropdown] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    
    const [filterColumn, setFilterColumn] = useState(''); // Selected column
    const [filterType, setFilterType] = useState('equals'); // 'equals' or 'range'
    const [filterValue, setFilterValue] = useState(''); // For equals, or range object {min, max}
    const [sliderRange, setSliderRange] = useState([0, 100]); // Min and Max values for the slider
    useEffect(() => {
        // Update slider range (min, max) whenever a new column is selected for range filtering
        if (filterType === 'range' && filterColumn) {
            const columnValues = uniqueValues[filterColumn]?.map(Number).filter(v => !isNaN(v)) || [];
            const min = Math.min(...columnValues);
            const max = Math.max(...columnValues);
            setSliderRange([min, max]);
            setFilterValue({ min, max }); // Set default slider values to min and max
        }
    }, [filterColumn, filterType, uniqueValues]);

    const handleAddFilter = () => {
        const newFilter = {
            column: filterColumn,
            type: filterType,
            value: filterType === 'equals' ? filterValue : { min: filterValue.min, max: filterValue.max }
        };
        setFilters([...filters, newFilter]);
    };
    
    const handleDeleteFilter = (index) => {
        const updatedFilters = filters.filter((_, i) => i !== index);
        setFilters(updatedFilters);
    };
    const handleSliderChange = (event, newValue) => {
        setFilterValue({ min: newValue[0], max: newValue[1] });
    };


    // Determine the display value for the Select component
    const getDisplayValue = () => {
        if (selectedColumns.length === 0) return "None selected";
        if (selectedColumns.length === originalColumns.length) return "All selected";
        return selectedColumns.join(', '); // Show selected columns
    };

    const handleEasterFilter = () => {
        // Create a new filter based on the IFilter interface
        const newFilter = {
            column: 'country',   // column from state
            type: 'equals',         // type is "equals"
            value: 'Federated States of Micronesia'             // value is "MS"
        };

        // Update filters with the new filter
        setFilters([...filters, newFilter]);
        setSelectedColumns(['name','iata'])
    };
    

    

    return (
    <ThemeProvider theme={theme}>

    <Box sx={{ width: '250px', padding: 2, borderRight: '1px solid #ccc' }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Raw Records" />
            <Tab label="Aggregate" />
        </Tabs>
        {activeTab === 0 && (
            <Box sx={{ marginTop: 2 }}>

                <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${grey[400]}` }}>
                    <ViewColumnIcon />
                    <Typography 
                        variant="h6" 
                        onClick={() => setShowColumnDropdown(!showColumnDropdown)} 
                        sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center',ml: 1, fontWeight: 'bold' }}
                    >
                        Columns <ExpandMoreIcon />
                        <Tooltip title="Select the columns for display." arrow>
                            <InfoIcon sx={{ marginLeft: 1, fontSize: 16, color: 'gray' }} />
                        </Tooltip>
                    </Typography>
                </Box>
                {showColumnDropdown && (
                    <FormControl fullWidth>
                        <InputLabel id="column-select-label">Select Columns</InputLabel>
                        <Select
                        labelId="column-select-label"
                        multiple
                        value={selectedColumns}
                        onChange={handleChange}
                        renderValue={getDisplayValue} // Use the new display function
                        MenuProps={{ PaperProps: { style: { maxHeight: 224, width: 250 } } }}
                        >
                            {originalColumns.map((column:any) => (
                                <MenuItem key={column.name} value={column.name}>
                                    <Checkbox checked={selectedColumns.indexOf(column.name) > -1} />
                                        <ListItemText primary={column.name} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
                <Box sx={{ marginTop: 3 }} /> {/* Adjust spacing as needed */}

                <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${grey[400]}` }}>
                    <TableRowsIcon />
                    <Typography 
                    variant="h6" 
                    onClick={() => setShowRowLimitDropdown(!showRowLimitDropdown)} 
                    sx={{ marginTop: 2, cursor: 'pointer', display: 'flex', alignItems: 'center' ,ml: 1, fontWeight: 'bold' }}
                    >
                        Row Limit <ExpandMoreIcon />
                        <Tooltip title="Limits the number of rows that get displayed." arrow>
                            <InfoIcon sx={{ marginLeft: 1, fontSize: 16, color: 'gray' }} />
                        </Tooltip>
                    </Typography>
                </Box>
                {showRowLimitDropdown && (
                    <FormControl fullWidth>
                        <Select
                        value={rowLimit}
                        onChange={(e) => setRowLimit(e.target.value)}
                        MenuProps={{ PaperProps: { style: { maxHeight: 224, width: 250 } } }}

                        >
                            <MenuItem value={10}>10</MenuItem>
                            <MenuItem value={100}>100</MenuItem>
                            <MenuItem value={1000}>1000</MenuItem>
                            <MenuItem value={1234}>1234</MenuItem>

                        </Select>
                    </FormControl>   
                )}
              
                    <Box sx={{ marginTop: 3 }} /> {/* Adjust spacing as needed */}
                    <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={handleEasterFilter} 
                    sx={{ marginTop: 2 }}
                >
                    XP Filter
                </Button>
                <Box sx={{ marginTop: 3 }} /> {/* Adjust spacing as needed */}
                <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${grey[400]}` }}>
                    <FilterAltIcon />
                    <Typography 
                        variant="h6" 
                        onClick={() => setShowFilterDropdown(!showFilterDropdown)} 
                        sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center',ml: 1, fontWeight: 'bold' }}
                    >
                        Filters <ExpandMoreIcon />
                        <Tooltip title="Select filters for display." arrow>
                            <InfoIcon sx={{ marginLeft: 1, fontSize: 16, color: 'gray' }} />
                        </Tooltip>
                    </Typography>
                </Box>
                {showFilterDropdown && (
                       <Box>
                       <FormControl fullWidth sx={{ mt: 2 }}>
                               <InputLabel id="column-select-label">Select Column</InputLabel>
                               <Select
                                   labelId="column-select-label"
                                   value={filterColumn}
                                   onChange={(e) => setFilterColumn(e.target.value)}
                                   MenuProps={{ PaperProps: { style: { maxHeight: 224, width: 250 } } }}
       
                               >
                                   {Object.keys(uniqueValues).map((column) => (
                                       <MenuItem key={column} value={column}>
                                           {column}
                                       </MenuItem>
                                   ))}
                               </Select>
                           </FormControl>
       
                           <FormControl fullWidth sx={{ mt: 2 }}>
                               <InputLabel id="type-select-label">Select Filter Type</InputLabel>
                               <Select
                                   labelId="type-select-label"
                                   value={filterType}
                                   onChange={(e) => setFilterType(e.target.value)}
                                   MenuProps={{ PaperProps: { style: { maxHeight: 224, width: 250 } } }}
       
                               >
                                   <MenuItem value="equals">Equals</MenuItem>
                                   <MenuItem value="range">Range</MenuItem>
                               </Select>
                           </FormControl>
       
                           {filterType === 'equals' ? (
                               <FormControl fullWidth sx={{ mt: 2 }}>
                                   <InputLabel id="value-select-label">Select Value</InputLabel>
                                   <Select
                                       labelId="value-select-label"
                                       value={filterValue}
                                       onChange={(e) => setFilterValue(e.target.value)}
                                       MenuProps={{ PaperProps: { style: { maxHeight: 224, width: 250 } } }}
       
                                   >
                                       {uniqueValues[filterColumn]?.slice(0, 100).map((value) => (
                                           <MenuItem key={value} value={value}>
                                               {value}
                                           </MenuItem>
                                       ))}
                                   </Select>
                               </FormControl>
                           ) : (
                            <Box sx={{ mt: 2 }}>
                                    <Typography gutterBottom>Range</Typography>
                                    <Slider
                                        value={[filterValue.min, filterValue.max]}
                                        onChange={handleSliderChange}
                                        valueLabelDisplay="auto"
                                        min={sliderRange[0]}
                                        max={sliderRange[1]}
                                    />
                                    <Typography>Min: {filterValue.min}</Typography>
                                    <Typography>Max: {filterValue.max}</Typography>
                                </Box>

                            //    <Box sx={{ mt: 2 }}>
                            //        <Typography>Min</Typography>
                            //        <input
                            //            type="number"
                            //            value={filterValue.min || ''}
                            //            onChange={(e) => setFilterValue({ ...filterValue, min: e.target.value })}
                            //        />
                            //        <Typography>Max</Typography>
                            //        <input
                            //            type="number"
                            //            value={filterValue.max || ''}
                            //            onChange={(e) => setFilterValue({ ...filterValue, max: e.target.value })}
                            //        />
                            //    </Box>
                           )}
       
                           <Button variant="contained" color="primary" onClick={handleAddFilter} sx={{ mt: 2 }}>
                               Add Filter
                           </Button>
       
                           {/* Render Filters */}
                           <Box sx={{ mt: 3 }}>
                               {filters.map((filter, index) => (
                                   <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                       <Typography>
                                           {filter.column} {filter.type} {filter.type === 'equals' ? filter.value : `${filter.value.min} - ${filter.value.max}`}
                                       </Typography>
                                       <Button variant="contained" color="secondary" onClick={() => handleDeleteFilter(index)} sx={{ ml: 2 }}>
                                           Delete
                                       </Button>
                                   </Box>
                               ))}
                           </Box>
                           </Box>
                    
                )}
                  <Box sx={{ marginTop: 3 }} /> {/* Adjust spacing as needed */}
                    <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={onFetchData}
                    sx={{ marginTop: 2 }}
                    >
                        Fetch Data
                    </Button>
                    
             

                </Box>
                
        )}
        {activeTab === 1 && (
            <Box sx={{ marginTop: 2 }}>
                <Typography variant="h6">Aggregate</Typography>
                <Typography>This section will have aggregate functionalities in the future.</Typography>
            </Box>
        )}
    </Box>
    </ThemeProvider>
    );
};

export default ControlPanel;

