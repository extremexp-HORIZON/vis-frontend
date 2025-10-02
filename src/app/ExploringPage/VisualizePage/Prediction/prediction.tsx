import { useEffect, useState } from 'react';
import type { IPredictionResult } from '../../../../shared/models/exploring/prediction-result.model';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
  Box,
  IconButton,
  Tooltip,
  CircularProgress,
  LinearProgress,
  Alert,
  TextField,
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { IZone } from '../../../../shared/models/exploring/zone.model';
import OnlinePredictionIcon from '@mui/icons-material/OnlinePrediction';
import {
  addResults,
  addTimestamp,
  addZoneId,
  addIntervals,
  setPredictionDisplay,
  setSelectedZoneId,
  setSelectedTimeIndex,
} from '../../../../store/slices/exploring/predictionSlice';
import {
  type RootState,
  useAppDispatch,
  useAppSelector,
} from '../../../../store/store';
import { setModalOpen as setZoneModalOpen } from '../../../../store/slices/exploring/zoneSlice';
import { exportZoneToJSON } from '../../../../shared/utils/exportUtils';
import { setDrawnRect } from '../../../../store/slices/exploring/mapSlice';

export interface IPredictionProps {
  zone: IZone;
}

// Fixed intervals in 10 minutes
const fixedIntervals = [
  { text: '10mins', value: 1 },
  { text: '30mins', value: 3 },
  { text: '1h', value: 6 },
  { text: '2h', value: 12 },
  { text: '4h', value: 24 },
  { text: '6h', value: 36 },
  { text: '8h', value: 48 },
];

// Fixed heights
const fixedHeights = [
  { text: '10m', value: 10 },
  { text: '20m', value: 20 },
  { text: '30m', value: 30 },
  { text: '40m', value: 40 },
  { text: '50m', value: 50 },
];

export const Prediction = ({ zone }: IPredictionProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [intervalsAmount, setIntervalsAmount] = useState(
    fixedIntervals[0].value,
  );
  const [predictionResults, setPredictionResults] = useState<
    IPredictionResult[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const { zoneIds, results, intervals, predictionDisplay } = useAppSelector(
    (state: RootState) => state.prediction,
  );
  const { dataset } = useAppSelector((state: RootState) => state.dataset);
  const dispatch = useAppDispatch();

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setIsLoading(false);
    setError(null);
  };

  const handleExportToJSON = () => {
    exportZoneToJSON(zone, predictionResults, intervals[zone.id!]);
  };

  const handleView = () => {
    setOpen(false);
    dispatch(setZoneModalOpen(false));

    // Clear drawn rectangle for better prediction visibility
    if (dataset.id) {
      dispatch(setDrawnRect({ id: dataset.id, bounds: null }));
    }

    if (predictionResults.length > 0) {
      // Set this zone as the selected zone for timeline display
      if (zone.id) {
        dispatch(setSelectedZoneId(zone.id));
        dispatch(setSelectedTimeIndex(0));
      }
      if (!predictionDisplay) {
        dispatch(setPredictionDisplay(true));
      }
    }
  };

  // Generate dummy prediction data
  const generateDummyPredictionData = (): IPredictionResult[] => {
    const results: IPredictionResult[] = [];
    const now = new Date();

    if (zone.id) {
      dispatch(addZoneId(zone.id));
      dispatch(addTimestamp({ zoneId: zone.id, timestamp: now.toISOString() }));
      dispatch(addIntervals({ zoneId: zone.id, intervals: intervalsAmount }));

      zone.geohashes?.forEach(geohash => {
        for (let i = 0; i < intervalsAmount; i++) {
          for (let j = 0; j < fixedHeights.length; j++) {
            results.push({
              id: `pred-${geohash}-${i + 1}-${fixedHeights[j].value}`,
              zoneId: zone.id!,
              rsrp: Math.floor(Math.random() * 50) - 100, // Random RSRP between -100 and -50
              timestamp: new Date(now.getTime() + i * 600000).toISOString(), // 10 minutes intervals
              geohash: geohash,
              height: fixedHeights[j].value,
            });
          }
        }
      });
    }

    return results;
  };

  const handlePredict = () => {
    setIsLoading(true);
    setError(null);
    setPredictionResults([]);
    dispatch(setPredictionDisplay(true));

    // Simulate API call with 3-5 second delay
    const delay = Math.random() * 2000 + 3000; // 3-5 seconds

    setTimeout(() => {
      try {
        const results = generateDummyPredictionData();

        setPredictionResults(results);
        dispatch(addResults({ zoneId: zone.id!, results: results }));
        setIsLoading(false);
      } catch (err) {
        setError('Failed to generate prediction results');
        setIsLoading(false);
      }
    }, delay);
  };

  useEffect(() => {
    if (zone.id && zoneIds.includes(zone.id)) {
      setPredictionResults(results[zone.id]);
    }
  }, [zone]);

  return (
    <>
      <Tooltip
        title="Predict"
        placement="top"
        slotProps={{
          popper: {
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, -14],
                },
              },
            ],
          },
        }}
      >
        <IconButton onClick={handleOpen} color="secondary" size="small">
          <OnlinePredictionIcon />
        </IconButton>
      </Tooltip>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xl"
        PaperProps={{
          sx: {
            borderRadius: '12px',
            bgcolor: '#ffffff',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(to right, #f8f9fa, #edf2f7)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            px: 3,
            py: 1.5,
          }}
        >
          Prediction for zone: {zone.id}
          <IconButton onClick={handleClose} color="inherit" aria-label="close">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxHeight: '80vh',
            overflow: 'auto',
          }}
        >
          <Typography variant="body1" gutterBottom>
            Included geohashes: {zone.geohashes?.length}
          </Typography>

          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Time ahead
            </Typography>
            <TextField
              select
              variant="outlined"
              value={intervalsAmount}
              onChange={e => setIntervalsAmount(Number(e.target.value))}
              size="small"
              sx={{ width: 120 }}
            >
              {fixedIntervals.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.text}
                </MenuItem>
              ))}
            </TextField>
            <Typography variant="body2" color="text.secondary">
              for {fixedHeights.map(height => height.value).join(', ')} meters
            </Typography>
          </Box>
          <Typography variant="body2" gutterBottom sx={{ fontStyle: 'italic' }}>
            (in 10 minute intervals)
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handlePredict}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? 'Predicting...' : 'Predict'}
            </Button>
          </Box>

          {isLoading && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Generating prediction results...
              </Typography>
              <LinearProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {predictionResults.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom textAlign="center">
                Results
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  onClick={handleView}
                  color="primary"
                  variant="contained"
                  aria-label="view"
                >
                  View
                </Button>
                <Button
                  onClick={handleExportToJSON}
                  color="primary"
                  variant="outlined"
                  aria-label="export"
                >
                  Export
                </Button>
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
