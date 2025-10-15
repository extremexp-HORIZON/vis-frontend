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
  Stepper,
  Step,
  StepLabel,
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
import { predict as eusomePredict } from '../../../../store/slices/exploring/eusomeSlice';
import {
  type InferenceInput,
  type PredictionResponse,
  defaultInferenceInput,
} from '../../../../shared/models/eusome-api.model';
import {
  type RootState,
  useAppDispatch,
  useAppSelector,
} from '../../../../store/store';
import { setModalOpen as setZoneModalOpen } from '../../../../store/slices/exploring/zoneSlice';
import { exportZoneToJSON } from '../../../../shared/utils/exportUtils';
import { PredictionModels } from './models';

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
  const [intervalsAmount, setIntervalsAmount] = useState(
    fixedIntervals[0].value,
  );
  const [predictionResults, setPredictionResults] = useState<
    IPredictionResult[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  // Wizard state
  const [activeStep, setActiveStep] = useState(0);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const { zoneIds, results, intervals, predictionDisplay } = useAppSelector(
    (state: RootState) => state.prediction,
  );
  const { loading: eusomeLoading } = useAppSelector(
    (state: RootState) => state.eusome,
  );
  const dispatch = useAppDispatch();

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setError(null);
    // Reset wizard state
    setActiveStep(0);
    setSelectedModel(null);
  };

  // Wizard navigation functions
  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleModelSelect = (modelFilename: string) => {
    setSelectedModel(modelFilename);
  };

  // Stepper steps
  const steps = [
    {
      label: 'Select Model',
      description: 'Choose a trained model for prediction',
    },
    {
      label: 'Configure Prediction',
      description: 'Set prediction parameters and run prediction',
    },
    {
      label: 'Results',
      description: 'View and export prediction results',
    },
  ];

  const handleExportToJSON = () => {
    exportZoneToJSON(zone, predictionResults, intervals[zone.id!]);
  };

  const handleView = () => {
    setOpen(false);
    dispatch(setZoneModalOpen(false));

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

  const handlePredict = async () => {
    if (!selectedModel || !zone.geohashes || zone.geohashes.length === 0) {
      setError('Please select a model and ensure the zone has geohashes');

      return;
    }

    setError(null);
    setPredictionResults([]);
    dispatch(setPredictionDisplay(true));

    try {
      // Create inference input for each geohash
      const now = new Date();
      const inferenceInput: InferenceInput = {
        ...defaultInferenceInput,
        geohash: zone.geohashes[0], // Use first geohash for now
        radio_timestamp: now.toISOString(),
        requested_heights: fixedHeights.map(h => h.value),
        model_filename: selectedModel,
      };

      // Dispatch the EUSOME predict action
      const result = await dispatch(eusomePredict(inferenceInput));

      if (eusomePredict.fulfilled.match(result)) {
        // Convert EUSOME prediction response to our internal format
        const convertedResults = convertEusomePredictionToInternal(
          result.payload,
          zone.id!,
          zone.geohashes,
          intervalsAmount,
        );

        setPredictionResults(convertedResults);
        dispatch(addZoneId(zone.id!));
        dispatch(
          addTimestamp({ zoneId: zone.id!, timestamp: now.toISOString() }),
        );
        dispatch(
          addIntervals({ zoneId: zone.id!, intervals: intervalsAmount }),
        );
        dispatch(addResults({ zoneId: zone.id!, results: convertedResults }));

        // Move to results step after successful prediction
        setActiveStep(2);
      } else {
        setError('Failed to get prediction from EUSOME API');
      }
    } catch (err) {
      setError('Failed to generate prediction results');
    }
  };

  // Convert EUSOME API response to internal prediction format
  const convertEusomePredictionToInternal = (
    eusomeResponse: PredictionResponse,
    zoneId: string,
    geohashes: string[],
    intervals: number,
  ): IPredictionResult[] => {
    const results: IPredictionResult[] = [];
    const now = new Date();

    // For now, we'll create results based on the EUSOME response structure
    // This will need to be adjusted based on the actual API response format
    geohashes.forEach(geohash => {
      for (let i = 0; i < intervals; i++) {
        for (let j = 0; j < fixedHeights.length; j++) {
          results.push({
            id: `pred-${geohash}-${i + 1}-${fixedHeights[j].value}`,
            zoneId: zoneId,
            rsrp:
              eusomeResponse.predicted_rsrp_at_heights[j][
                'predicted_rsrp_dbm'
              ] || 0,
            timestamp: new Date(now.getTime() + i * 600000).toISOString(),
            geohash: geohash,
            height: fixedHeights[j].value,
          });
        }
      }
    });

    return results;
  };

  useEffect(() => {
    if (zone.id && zoneIds.includes(zone.id)) {
      setPredictionResults(results[zone.id]);
    }
  }, [zone]);

  useEffect(() => {
    if (Object.keys(results).length === 0) {
      setPredictionResults([]);
    }
  }, [results]);

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
            maxHeight: '80vh',
            overflow: 'auto',
          }}
        >
          <Stepper activeStep={activeStep} orientation="horizontal">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step Content */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {steps[activeStep]?.description}
            </Typography>

            {/* Step 1: Model Selection */}
            {activeStep === 0 && (
              <Box>
                <PredictionModels
                  onModelSelect={handleModelSelect}
                  selectedModel={selectedModel}
                />
                <Box
                  sx={{
                    mt: 2,
                    display: 'flex',
                    gap: 1,
                    justifyContent: 'space-between',
                  }}
                >
                  <Button onClick={handleClose}>Cancel</Button>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!selectedModel}
                  >
                    Next
                  </Button>
                </Box>
              </Box>
            )}

            {/* Step 2: Prediction Configuration */}
            {activeStep === 1 && (
              <Box>
                <Typography variant="body1" gutterBottom>
                  Selected Model: {selectedModel}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Included geohashes: {zone.geohashes?.length}
                </Typography>

                <Box
                  sx={{
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
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
                  <Typography
                    variant="body2"
                    gutterBottom
                    sx={{ fontStyle: 'italic' }}
                  >
                    (in 10 minute intervals)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    for {fixedHeights.map(height => height.value).join(', ')}{' '}
                    meters
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                {eusomeLoading.predict && (
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Generating prediction results...
                    </Typography>
                    <LinearProgress />
                  </Box>
                )}

                <Box
                  sx={{
                    mt: 2,
                    display: 'flex',
                    gap: 1,
                    justifyContent: 'space-between',
                  }}
                >
                  <Button onClick={handleBack}>Back</Button>
                  {predictionResults.length === 0 ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handlePredict}
                      disabled={eusomeLoading.predict}
                      startIcon={
                        eusomeLoading.predict ? (
                          <CircularProgress size={20} />
                        ) : null
                      }
                    >
                      {eusomeLoading.predict ? 'Predicting...' : 'Predict'}
                    </Button>
                  ) : (
                    <Button variant="contained" onClick={handleNext}>
                      Next
                    </Button>
                  )}
                </Box>
              </Box>
            )}

            {/* Step 3: Results */}
            {activeStep === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom textAlign="center">
                  Prediction Results
                </Typography>

                <Typography variant="body1" gutterBottom>
                  Selected Model: {selectedModel}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Included geohashes: {zone.geohashes?.length}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Time intervals: {intervalsAmount} × 10 minutes
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Heights: {fixedHeights.map(height => height.value).join(', ')}{' '}
                  meters
                </Typography>

                {predictionResults.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom textAlign="center">
                      Results ({predictionResults.length} predictions)
                    </Typography>
                    <Box
                      sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}
                    >
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
                  </Box>
                )}

                <Box
                  sx={{
                    mt: 3,
                    display: 'flex',
                    gap: 1,
                    justifyContent: 'space-between',
                  }}
                >
                  <Button onClick={handleBack}>Back</Button>
                  <Button onClick={handleClose}>Close</Button>
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
