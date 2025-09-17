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
} from '@mui/material';
import type { IZone } from '../../../../shared/models/exploring/zone.model';
import OnlinePredictionIcon from '@mui/icons-material/OnlinePrediction';

export interface IPredictionProps {
  zone: IZone;
}

export const Prediction = ({ zone }: IPredictionProps) => {
  const { rectangle } = zone;
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  // Generate dummy prediction data
  const generateDummyPredictionData = (): IPredictionResult[] => {
    const results: IPredictionResult[] = [];
    const now = new Date();

    for (let i = 0; i < 5; i++) {
      results.push({
        id: `prediction-${i + 1}`,
        rsrp: Math.floor(Math.random() * 50) - 100, // Random RSRP between -100 and -50
        timestamp: new Date(now.getTime() + i * 600000).toISOString(), // 10 minutes intervals
        geohash: zone.geohashes?.[i] ?? '',
      });
    }

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

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Prediction for zone: <em>{zone.id}</em>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Make a prediction for the rectangle
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>lat:</strong> [{rectangle?.lat.join(', ')}],{' '}
              <strong>lon:</strong> [{rectangle?.lon.join(', ')}]
            </Typography>
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
              <Typography variant="h6" gutterBottom>
                Prediction Results
              </Typography>
              <Grid container spacing={2}>
                {predictionResults.map(result => (
                  <Grid item xs={12} sm={6} md={4} key={result.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>
                          {result.id}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>RSRP:</strong> {result.rsrp} dBm
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Time:</strong>{' '}
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Geohash:</strong> {result.geohash}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
