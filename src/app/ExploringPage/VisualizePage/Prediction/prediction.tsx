import { useEffect, useState } from 'react';
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
  Alert,
  TextField,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { type Dayjs } from 'dayjs';
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
import { createTask } from '../../../../store/slices/exploring/eusomeSlice';
import {
  type InferenceInput,
  type SinglePrediction,
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
import { TaskProgress } from '../../../../shared/components/task-progress';

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
    SinglePrediction[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPredictionTaskId, setCurrentPredictionTaskId] = useState<
    string | null
  >(null);

  // Wizard state
  const [activeStep, setActiveStep] = useState(0);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [predictionTimestamp, setPredictionTimestamp] = useState<Dayjs | null>(
    dayjs(),
  );
  const { zoneIds, results, intervals, predictionDisplay } = useAppSelector(
    (state: RootState) => state.prediction,
  );
  const { loading: eusomeLoading, processedDataList } = useAppSelector(
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
    setPredictionTimestamp(dayjs());
    // Reset task state
    setCurrentPredictionTaskId(null);
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

  // Task completion handlers
  const handlePredictionComplete = (taskResult?: unknown) => {
    // Handle the prediction results if provided
    if (taskResult) {
      handlePredictionTaskComplete(taskResult);
    }
    // Move to results step after successful prediction
    setActiveStep(2);
    // Clear the current task
    setCurrentPredictionTaskId(null);
  };

  const handlePredictionFailed = () => {
    // Clear the current task on failure
    setCurrentPredictionTaskId(null);
    setError('Prediction task failed. Please try again.');
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

    if (!predictionTimestamp) {
      setError('Please select a prediction timestamp');

      return;
    }

    setError(null);
    setPredictionResults([]);
    dispatch(setPredictionDisplay(true));

    try {
      // Create inference input for all geohashes
      const inferenceInput: InferenceInput = {
        ...defaultInferenceInput,
        geohashes: zone.geohashes,
        radio_timestamp: predictionTimestamp.toISOString(),
        time_intervals: intervalsAmount,
        requested_heights: fixedHeights.map(h => h.value),
        model_filename: selectedModel,
        training_csv_filename:
          processedDataList?.processed_files.find(d =>
            d.filename.includes(zone.fileName || ''),
          )?.filename || null,
      };

      // Create prediction task
      const result = await dispatch(
        createTask({
          task_type: 'predict',
          task_data: inferenceInput,
        }),
      );

      if (createTask.fulfilled.match(result)) {
        // Set the task ID for progress tracking
        setCurrentPredictionTaskId(result.payload.task_id);
      } else {
        setError('Failed to create prediction task');
      }
    } catch (err) {
      setError('Failed to create prediction task');
    }
  };

  // Handle prediction task completion with results
  const handlePredictionTaskComplete = (taskResult: unknown) => {
    if (taskResult && typeof taskResult === 'object' && taskResult !== null) {
      setPredictionResults(taskResult as SinglePrediction[]);
      dispatch(addZoneId(zone.id!));
      dispatch(
        addTimestamp({
          zoneId: zone.id!,
          timestamp: predictionTimestamp!.toISOString(),
        }),
      );
      dispatch(addIntervals({ zoneId: zone.id!, intervals: intervalsAmount }));
      dispatch(
        addResults({
          zoneId: zone.id!,
          results: taskResult as SinglePrediction[],
        }),
      );
    }
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
          <LocalizationProvider dateAdapter={AdapterDayjs}>
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
                  {/* Model Info Card */}
                  <Box
                    sx={{
                      p: 2,
                      mb: 3,
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      backgroundColor: '#f8f9fa',
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      color="primary"
                      gutterBottom
                    >
                      Selected Model
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                      {selectedModel}
                    </Typography>
                  </Box>

                  {/* Configuration Grid */}
                  <Box sx={{ display: 'grid', gap: 3, mb: 3 }}>
                    {/* Time Configuration */}
                    <Box
                      sx={{
                        p: 2,
                        border: '1px solid #e0e0e0',
                        borderRadius: 2,
                        backgroundColor: '#fff',
                      }}
                    >
                      <Typography variant="subtitle2" gutterBottom>
                        ⏰ Prediction Timing
                      </Typography>
                      <Box
                        sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            Start Time
                          </Typography>
                          <DateTimePicker
                            ampm={false}
                            value={predictionTimestamp}
                            onChange={newValue =>
                              setPredictionTimestamp(newValue)
                            }
                            minDateTime={dayjs().subtract(1, 'hour')}
                            slotProps={{
                              textField: {
                                size: 'small',
                                fullWidth: true,
                                helperText: 'When should predictions begin?',
                              },
                            }}
                          />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            Time Ahead
                          </Typography>
                          <TextField
                            select
                            variant="outlined"
                            value={intervalsAmount}
                            onChange={e =>
                              setIntervalsAmount(Number(e.target.value))
                            }
                            size="small"
                            fullWidth
                            helperText="How far ahead to predict?"
                          >
                            {fixedIntervals.map(option => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.text}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Box>
                      </Box>
                    </Box>

                    {/* Location & Parameters */}
                    <Box
                      sx={{
                        p: 2,
                        border: '1px solid #e0e0e0',
                        borderRadius: 2,
                        backgroundColor: '#fff',
                      }}
                    >
                      <Typography variant="subtitle2" gutterBottom>
                        📍 Location & Parameters
                      </Typography>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: 2,
                        }}
                      >
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Geohashes
                          </Typography>
                          <Typography variant="h6" color="primary">
                            {zone.geohashes?.length || 0}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Heights (meters)
                          </Typography>
                          <Typography variant="body2">
                            {fixedHeights
                              .map(height => height.value)
                              .join(', ')}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}

                  {/* Task Progress Display */}
                  <TaskProgress
                    taskId={currentPredictionTaskId}
                    isConnected={true}
                    taskType="predict"
                    onTaskComplete={handlePredictionComplete}
                    onTaskFailed={handlePredictionFailed}
                    showTitle={true}
                  />

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
                        disabled={
                          eusomeLoading.createTask || !!currentPredictionTaskId
                        }
                        startIcon={
                          eusomeLoading.createTask ||
                          !!currentPredictionTaskId ? (
                              <CircularProgress size={20} />
                            ) : null
                        }
                      >
                        {eusomeLoading.createTask
                          ? 'Creating Task...'
                          : currentPredictionTaskId
                            ? 'Predicting...'
                            : 'Predict'}
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
                  {/* Success Header */}
                  <Box
                    sx={{
                      textAlign: 'center',
                      mb: 4,
                      p: 3,
                      backgroundColor: '#e8f5e8',
                      borderRadius: 2,
                      border: '1px solid #4caf50',
                    }}
                  >
                    <Typography variant="h5" color="success.main" gutterBottom>
                      Prediction Complete!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {predictionResults.length * predictionResults[0].predicted_rsrp_at_heights.length} predictions generated
                      successfully
                    </Typography>
                  </Box>

                  {/* Results Summary Cards */}
                  <Box sx={{ display: 'grid', gap: 2, mb: 4 }}>
                    <Box
                      sx={{
                        p: 2,
                        border: '1px solid #e0e0e0',
                        borderRadius: 2,
                        backgroundColor: '#fff',
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        color="primary"
                        gutterBottom
                      >
                        📊 Prediction Summary
                      </Typography>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: 2,
                        }}
                      >
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Model
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ wordBreak: 'break-all' }}
                          >
                            {selectedModel?.split('_').slice(0, 2)
                              .join('_')}...
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Start Time
                          </Typography>
                          <Typography variant="body2">
                            {predictionTimestamp?.format('MMM DD, HH:mm')}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Time Ahead
                          </Typography>
                          <Typography variant="body2">
                            {intervalsAmount} × 10 minutes
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Locations
                          </Typography>
                          <Typography variant="body2">
                            {zone.geohashes?.length} geohashes
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        p: 2,
                        border: '1px solid #e0e0e0',
                        borderRadius: 2,
                        backgroundColor: '#fff',
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        color="primary"
                        gutterBottom
                      >
                        📈 Prediction Details
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Box>
                          <Typography variant="h4" color="primary">
                            {predictionResults.length * predictionResults[0].predicted_rsrp_at_heights.length}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Predictions
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" color="text.secondary">
                            Heights: {predictionResults[0].predicted_rsrp_at_heights.map(h => h.height_m).join(', ')}
                            m
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {predictionResults[0].predicted_rsrp_at_heights.length} heights ×{' '}
                            {zone.geohashes?.length} locations ×{' '}
                            {intervalsAmount} intervals
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* Action Buttons */}
                  {predictionResults.length > 0 && (
                    <Box
                      sx={{
                        p: 3,
                        backgroundColor: '#f8f9fa',
                        borderRadius: 2,
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        What would you like to do next?
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 2,
                          justifyContent: 'center',
                        }}
                      >
                        <Button
                          onClick={handleView}
                          color="primary"
                          variant="contained"
                          size="large"
                        >
                          View Results
                        </Button>
                        <Button
                          onClick={handleExportToJSON}
                          color="primary"
                          variant="outlined"
                          size="large"
                        >
                          Export Data
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
          </LocalizationProvider>
        </DialogContent>
      </Dialog>
    </>
  );
};
