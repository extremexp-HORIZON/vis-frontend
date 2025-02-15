import React from "react";
import {
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
  Typography,
  OutlinedInput,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Slider,
  ThemeProvider,
  createTheme,
  Divider,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";

interface MapControlPanelProps {
  timestampField: string;
  onTimestampChange: (value: string) => void;
  latitudeField: string;
  onLatitudeChange: (value: string) => void;
  longitudeField: string;
  onLongitudeChange: (value: string) => void;
  colorBy: string | null;
  onColorByChange: (value: string | null) => void;
  selectedColumns: string[];
  onSegmentByChange: (selected: string[]) => void;
  columns: string[];
  intColumns: string[];
  sliderValue: number;
  onSliderChange: (value: number) => void;
  tripsMode: boolean;
  data: any[];
}

const MapControlPanel = (props: MapControlPanelProps) => {
  const {
    timestampField,
    onTimestampChange,
    latitudeField,
    onLatitudeChange,
    longitudeField,
    onLongitudeChange,
    colorBy,
    onColorByChange,
    selectedColumns,
    onSegmentByChange,
    columns,
    intColumns,
    sliderValue,
    onSliderChange,
    tripsMode,
    data,
  } = props;

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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" sx={{ color: "text.secondary", marginBottom: 1 }}>
        Select the fields for timestamp, latitude, and longitude, as well as the fields for additional data visualization.
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">Configure Fields</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
              {/* Timestamp Field */}
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Timestamp Field</InputLabel>
                <Select
                  value={timestampField}
                  onChange={(e) => onTimestampChange(e.target.value)}
                  disabled={!columns.some((col) => col === "timestamp")}
                  renderValue={(selected) => selected}
                  input={<OutlinedInput label="Timestamp Field" />}
                >
                  {columns.map((col) => (
                    <MenuItem key={col} value={col}>
                      {col}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Latitude Field */}
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Latitude Field</InputLabel>
                <Select
                  value={latitudeField}
                  onChange={(e) => onLatitudeChange(e.target.value)}
                  input={<OutlinedInput label="Latitude Field" />}
                  disabled={!intColumns.some((col) => col === "otinani")}
                >
                  {intColumns.map((col) => (
                    <MenuItem key={col} value={col}>
                      {col}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Longitude Field */}
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Longitude Field</InputLabel>
                <Select
                  value={longitudeField}
                  onChange={(e) => onLongitudeChange(e.target.value)}
                  input={<OutlinedInput label="Longitude Field" />}
                  disabled={!intColumns.some((col) => col === "otinani")}
                >
                  {intColumns.map((col) => (
                    <MenuItem key={col} value={col}>
                      {col}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </AccordionDetails>
        </Accordion>

        <FormControl sx={{ flex: 1 }}>
          <InputLabel>Color By</InputLabel>
          <Select
            value={colorBy}
            onChange={(e) => onColorByChange(e.target.value)}
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
            onChange={(e) => onSegmentByChange(e.target.value as string[])}
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
      <Divider sx={{ my: 2 }} />

      {/* Slider */}
      {data.length > 0 && (
        <Box sx={{ width: "33%", padding: 2 }}>
          <Typography variant="body1" sx={{ marginBottom: 1 }}>
            Use the slider to animate through the data points over time.
          </Typography>
          <ThemeProvider theme={theme}>
            <Slider
              value={sliderValue}
              onChange={(e, newValue) => onSliderChange(newValue as number)}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) =>
                new Date(data[value].timestamp).toLocaleString()
              }
              min={0}
              max={data.length - 1}
            />
          </ThemeProvider>
        </Box>
      )}
    </Box>
  );
};

export default MapControlPanel;