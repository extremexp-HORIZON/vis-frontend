import { useEffect, useState, useCallback, useRef } from 'react';
import {
  TextField,
  Popper,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface NominatimResult {
  display_name: string;
  boundingbox: [string, string, string, string];
}

interface SearchResult {
  title: string;
  id: number;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

const MapSearch: React.FC = () => {
  const map = useMap();
  const [value, setValue] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const searchHandle = useCallback((value: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setLoading(true);
    setValue(value);

    timeoutRef.current = setTimeout(() => {
      if (value.length === 0) {
        setResults([]);
        setLoading(false);
        setOpen(false);

        return;
      }

      fetch(
        `https://nominatim.openstreetmap.org/search?q=${value}&format=json&addressdetails=1`,
      )
        .then(res => res.json())
        .then(data => {
          const items = data.map((result: NominatimResult, index: number) => ({
            title: result.display_name,
            id: index,
            xMin: result.boundingbox[0],
            xMax: result.boundingbox[1],
            yMin: result.boundingbox[2],
            yMax: result.boundingbox[3],
          }));

          setResults(items);
          setOpen(items.length > 0);
          setLoading(false);
        });
    }, 300);
  }, []);

  const resultHandle = (result: SearchResult) => {
    map.flyToBounds(
      [
        [parseFloat(`${result.xMin}`), parseFloat(`${result.yMin}`)],
        [parseFloat(`${result.xMax}`), parseFloat(`${result.yMax}`)],
      ],
      {
        animate: true,
        duration: 3,
      },
    );
    setOpen(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Add Leaflet event handling to prevent map interactions
  useEffect(() => {
    if (!anchorRef.current) return;

    const container = anchorRef.current;

    // Only prevent events that interfere with map functionality
    const preventDoubleClick = (e: Event) => {
      L.DomEvent.stopPropagation(e);
      L.DomEvent.preventDefault(e);
    };

    const preventDrag = (e: Event) => {
      L.DomEvent.stopPropagation(e);
      // Don't prevent default for mousedown/mouseup to allow text selection
    };

    const preventWheel = (e: Event) => {
      L.DomEvent.stopPropagation(e);
      L.DomEvent.preventDefault(e);
    };

    // Add event listeners using Leaflet's DomEvent
    L.DomEvent.on(container, 'dblclick', preventDoubleClick);
    L.DomEvent.on(container, 'mousedown', preventDrag);
    L.DomEvent.on(container, 'mouseup', preventDrag);
    L.DomEvent.on(container, 'mousemove', preventDrag);
    L.DomEvent.on(container, 'wheel', preventWheel);
    L.DomEvent.on(container, 'contextmenu', preventDoubleClick);

    return () => {
      // Clean up event listeners
      L.DomEvent.off(container, 'dblclick', preventDoubleClick);
      L.DomEvent.off(container, 'mousedown', preventDrag);
      L.DomEvent.off(container, 'mouseup', preventDrag);
      L.DomEvent.off(container, 'mousemove', preventDrag);
      L.DomEvent.off(container, 'wheel', preventWheel);
      L.DomEvent.off(container, 'contextmenu', preventDoubleClick);
    };
  }, []);

  return (
    <div
      ref={anchorRef}
      style={{
        position: 'absolute',
        top: '2vh',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999,
        maxWidth: '90vw',
      }}
    >
      <TextField
        fullWidth
        placeholder="Search location..."
        value={value}
        onChange={e => searchHandle(e.target.value)}
        variant="outlined"
        size="small"
        inputProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                {loading ? (
                  <CircularProgress size={18} />
                ) : (
                  <SearchIcon color="action" />
                )}
              </InputAdornment>
            ),
          },
        }}
        sx={{
          backgroundColor: 'background.paper',
        }}
        onFocus={() => {
          if (results.length > 0) setOpen(true);
        }}
        onBlur={() => {
          setTimeout(() => setOpen(false), 100); // Delay to allow click
        }}
      />
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        style={{ zIndex: 1300, width: anchorRef.current?.offsetWidth }}
      >
        <Paper elevation={3} sx={{ maxHeight: 300, overflowY: 'auto' }}>
          <List dense>
            {results.map(res => (
              <ListItemButton
                key={res.id}
                onMouseDown={() => resultHandle(res)}
              >
                <ListItemText primary={res.title} />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      </Popper>
    </div>
  );
};

export default MapSearch;
