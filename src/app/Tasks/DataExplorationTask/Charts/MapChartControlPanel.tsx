import React from "react";
import {
  Box,
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Slider,
  ThemeProvider,
  Typography,
  createTheme,
} from "@mui/material";

const MapControls = ({
  columns,
  colorBy,
  setColorBy,
  selectedColumns,
  setSelectedColumns,
  timestampField,
  data,
  sliderValue,
  setSliderValue,
  tripsMode,
}) => {
  const theme = createTheme({
    palette: {
      primary: { main: "#1976d2" },
      secondary: { main: "#dc004e" },
    },
    typography: {
      fontFamily: "Arial",
      h6: { fontWeight: 600 },
    },
  });

  const handleSegmentByChange = (event) => {
    const selected = event.target.value;
    setSelectedColumns(selected);
    if (selected.length > 0) {
      setColorBy("None");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" sx={{ color: "text.secondary", marginBottom: 1 }}>
        Select the fields for timestamp, latitude, and longitude, as well as the
        fields for additional data visualization.
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
        <FormControl sx={{ flex: 1 }}>
          <InputLabel>Color By</InputLabel>
          <Select
            value={colorBy}
            onChange={(e) => setColorBy(e.target.value)}
            disabled={tripsMode}
            input={<OutlinedInput label="Color By" />}
          >
            <MenuItem value="None">None</MenuItem>
            {columns.map((col) => (
              <MenuItem key={col} value={col}>
                {col}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl disabled={!timestampField} sx={{ flex: 1 }}>
          <InputLabel>Segment By</InputLabel>
          <Select
            multiple
            value={selectedColumns}
            onChange={handleSegmentByChange}
            renderValue={(selected) => selected.join(", ")}
            input={<OutlinedInput label="Segment By" />}
          >
            {columns.map((col) => (
              <MenuItem key={col} value={col}>
                <Checkbox checked={selectedColumns.includes(col)} />
                <ListItemText primary={col} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ width: "33%", padding: 2 }}>
        <Typography variant="body1" sx={{ marginBottom: 1 }}>
          Use the slider to animate through the data points over time.
        </Typography>
        <ThemeProvider theme={theme}>
          <Slider
            value={sliderValue}
            onChange={(e, newValue) => setSliderValue(newValue)}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) =>
              new Date(data[value].timestamp).toLocaleString()
            }
            min={0}
            max={data.length - 1}
          />
        </ThemeProvider>
      </Box>
    </Box>
  );
};

export default MapControls;
