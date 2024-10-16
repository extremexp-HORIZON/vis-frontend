import React, { useState } from 'react';
import { Box, TextField, MenuItem, Chip, Button, createTheme, ThemeProvider } from '@mui/material';

interface BarChartControlPanelProps {
  originalColumns: Array<{ name: string; type: string }>;
  barGroupBy: string[];
  setBarGroupBy: (value: string[]) => void;
  barAggregation: { [key: string]: string[] };
  setBarAggregation: (value: { [key: string]: string[] }) => void;
  onFetchBarChartData: () => void;
}

const BarChartControlPanel: React.FC<BarChartControlPanelProps> = ({
  originalColumns,
  barGroupBy,
  setBarGroupBy,
  barAggregation,
  setBarAggregation,
  onFetchBarChartData,
}) => {
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null); // State to hold the selected column

  const handleAggregationChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string[]; // Get the selected aggregation rules
    if (!selectedColumn) return;

    setBarAggregation((prev) => ({
      ...prev,
      [selectedColumn]: value,
    }));
  };

  const handleGroupByChange = (selected: string[]) => {
    if (selected.includes('Not Group')) {
      setBarGroupBy([]); // Clear previous selections
    } else {
      setBarGroupBy(selected); // Update with selected values
    }
  };

  const getAggregationOptions = () => {
    if (!selectedColumn) return [];
    
    // Find the selected column in originalColumns
    const column = originalColumns.find(col => col.name === selectedColumn);
    if (!column) return [];

    // Return aggregation options based on column type
    return column.type === 'DOUBLE' || column.type === 'FLOAT' || column.type === 'INTEGER'
      ? ['avg', 'min', 'max', 'count'] 
      : ['count'];
  };

  const aggregationOptions = getAggregationOptions();
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
  return (
    <ThemeProvider theme={theme}>

    <Box sx={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Box sx={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <TextField
          select
          label="Category"
          value={barGroupBy}
          onChange={(e) => handleGroupByChange(e.target.value as string[])}
          variant="outlined"
          MenuProps={{ PaperProps: { style: { maxHeight: 224, width: 250 } } }}

          SelectProps={{
            multiple: true,
            renderValue: (selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {(selected as string[]).map((value) => (
                  <Chip key={value} label={value} onDelete={() => handleGroupByChange(selected.filter((s: string) => s !== value))} />
                ))}
              </Box>
            ),
          }}
          sx={{ width: '300px' }} // Set a fixed width for the Group By dropdown
        >
          <MenuItem value="Not Group">Not Group</MenuItem>
          {originalColumns.map((col) => (
            <MenuItem key={col.name} value={col.name}>
              {col.name}
            </MenuItem>
          ))}
        </TextField>

        <Box>
          <TextField
            select
            label="Value"
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            variant="outlined"
            MenuProps={{ PaperProps: { style: { maxHeight: 224, width: 250 } } }}

            sx={{ width: '300px' }} // Set a fixed width for the Value dropdown
          >
            {originalColumns.map((col) => (
              <MenuItem key={col.name} value={col.name}>
                {col.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {selectedColumn && (
          <Box >
            <TextField
              select
              label="Select Aggregations"
              value={barAggregation[selectedColumn] || []}
              onChange={handleAggregationChange}
              variant="outlined"
              SelectProps={{
                multiple: true,
                renderValue: (selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {(selected as string[]).map((value) => (
                      <Chip key={value} label={value} onDelete={() => handleAggregationChange({ target: { value: (selected as string[]).filter(v => v !== value) } })} />
                    ))}
                  </Box>
                ),
              }}
              sx={{ width: '300px' }} // Set a fixed width for the Aggregation dropdown
            >
              {aggregationOptions.map((rule) => (
                <MenuItem key={rule} value={rule}>
                  {rule.charAt(0).toUpperCase() + rule.slice(1)} {/* Capitalize first letter */}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        )}
        <Button variant="contained" color="primary"  onClick={onFetchBarChartData}>
          Aggregate
        </Button>
      </Box>

    </Box>
    </ThemeProvider>
  );
};

export default BarChartControlPanel;

