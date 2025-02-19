import React, { useEffect } from "react";
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
interface MapControlsProps {
  columns: string[];
  colorBy: string;
  setColorBy: React.Dispatch<React.SetStateAction<string>>;
  selectedColumns: string[];
  setSelectedColumns: React.Dispatch<React.SetStateAction<string[]>>;
  timestampField: string | null;
  data: { timestamp: string }[]; // Assuming data is an array of objects with a `timestamp` field
  sliderValue: number;
  setSliderValue: React.Dispatch<React.SetStateAction<number>>;
  tripsMode: boolean;
  setTripsMode: React.Dispatch<React.SetStateAction<boolean>>;
  


}


const MapControls: React.FC<MapControlsProps> = ({
  columns,
  colorBy,
  setColorBy,
  selectedColumns,
  setSelectedColumns,
  timestampField,
  data,
  tripsMode,
  setTripsMode,
  
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

  useEffect(() => {
    setTripsMode(!!timestampField && selectedColumns.length > 0)
  }, [timestampField, selectedColumns])


  const handleSegmentByChange = (event) => {
    const selected = event.target.value;
    setSelectedColumns(selected);
    if (selected.length > 0) {
      setColorBy("None");
    }
  };

  return (
      
    <Box sx={{ display: "flex", gap: "1rem",marginTop: "1rem",flexDirection: "column" }}>
        <FormControl fullWidth >
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

        <FormControl fullWidth disabled={!timestampField} >
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

     
  );
};

export default MapControls;
