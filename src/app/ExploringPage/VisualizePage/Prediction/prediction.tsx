import { useState } from 'react';
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
  Card,
  CardContent,
  Grid,
  TextField,
  DialogActions,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { IZone } from '../../../../shared/models/exploring/zone.model';
import OnlinePredictionIcon from '@mui/icons-material/OnlinePrediction';

export interface IPredictionProps {
  zone: IZone;
}

export const Prediction = ({ zone }: IPredictionProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [intervalsAmount, setIntervalsAmount] = useState(1);
  const [predictionResults, setPredictionResults] = useState<
    IPredictionResult[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setIsLoading(false);
    setPredictionResults([]);
    setError(null);
  };

  const handleExportToJSON = () => {
    if (predictionResults.length === 0) {
      return;
    }

    // Create the export data with metadata
    const exportData = {
      zoneId: zone.id,
      geohashesCount: zone.geohashes?.length || 0,
      intervalsAmount,
      exportTimestamp: new Date().toISOString(),
      results: predictionResults,
    };

    // Convert to JSON string with pretty formatting
    const jsonString = JSON.stringify(exportData, null, 2);

    // Create a blob with the JSON data
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Create a temporary URL for the blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element and trigger download
    const link = document.createElement('a');

    link.href = url;
    link.download = `prediction-results-${zone.id}-${
      new Date().toISOString()
        .split('T')[0]
    }.json`;
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Generate dummy prediction data
  const generateDummyPredictionData = (): IPredictionResult[] => {
    const results: IPredictionResult[] = [];
    const now = new Date();

    zone.geohashes?.forEach(geohash => {
      for (let i = 0; i < intervalsAmount; i++) {
        results.push({
          id: `pred-${geohash}-${i + 1}`,
          rsrp: Math.floor(Math.random() * 50) - 100, // Random RSRP between -100 and -50
          timestamp: new Date(now.getTime() + i * 600000).toISOString(), // 10 minutes intervals
          geohash: geohash,
          height: Math.floor(Math.random() * 100),
        });
      }
    });

    return results;
  };

  const handlePredict = () => {
    setIsLoading(true);
    setError(null);
    setPredictionResults([]);

    // Simulate API call with 3-5 second delay
    const delay = Math.random() * 2000 + 3000; // 3-5 seconds

    setTimeout(() => {
      try {
        const results = generateDummyPredictionData();

        setPredictionResults(results);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to generate prediction results');
        setIsLoading(false);
      }
    }, delay);
  };

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
              10 minute intervals:
            </Typography>
            <TextField
              variant="outlined"
              type="number"
              inputProps={{ min: 1, max: 12 }} // up to 2 hours
              value={intervalsAmount}
              onChange={e => setIntervalsAmount(parseInt(e.target.value))}
              size="small"
              sx={{ width: 70 }}
            />
          </Box>

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
            <Box>
              <Typography variant="h6" gutterBottom textAlign="center">
                Results
              </Typography>
              <Grid container spacing={2} justifyContent="center">
                {predictionResults.map(result => (
                  <Grid item key={result.id}>
                    <Card
                      variant="outlined"
                      sx={{ width: 280, height: '100%' }}
                    >
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Geohash:</strong> {result.geohash}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>RSRP:</strong> {result.rsrp} dBm
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Time:</strong>{' '}
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Height:</strong> {result.height} m
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            p: 2,
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
            background: '#f8f9fa',
          }}
        >
          <Button
            onClick={handleClose}
            color="primary"
            variant="outlined"
            aria-label="close"
          >
            Close
          </Button>
          {predictionResults.length > 0 && (
            <Button
              onClick={handleExportToJSON}
              color="primary"
              variant="contained"
              aria-label="export"
              disabled={predictionResults.length === 0}
            >
              Export JSON
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};
