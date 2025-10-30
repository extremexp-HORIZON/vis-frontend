import { useEffect, useState } from 'react';
import {
  type RootState,
  useAppDispatch,
  useAppSelector,
} from '../../../../store/store';
import {
  createTask,
  listModels,
  listProcessedData,
  setTrainingTask,
} from '../../../../store/slices/exploring/eusomeSlice';
import {
  defaultTrainingConfig,
  type TrainTask,
  type ModelInfo,
  type TaskCreateResponse,
} from '../../../../shared/models/eusome-api.model';
import { formatTimestampFull } from '../../../../shared/utils/dateUtils';
import { TaskProgress } from '../../../../shared/components/task-progress';
import {
  Box,
  Button,
  Typography,
  Chip,
  Card,
  CardContent,
  CardActions,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';

interface PredictionModelsProps {
  onModelSelect?: (modelFilename: string) => void;
  selectedModel?: string | null;
}

export const PredictionModels = ({
  onModelSelect,
  selectedModel,
}: PredictionModelsProps) => {
  const dispatch = useAppDispatch();
  const {
    modelsList,
    loading: { listModels: loadingListModels, createTask: creatingTask },
    processedDataList,
    trainingTask,
    activeTasks,
  } = useAppSelector((state: RootState) => state.eusome);
  const { dataset } = useAppSelector((state: RootState) => state.dataset);
  const [availableModels, setModels] = useState<ModelInfo[]>([]);
  const [filename, setFilename] = useState<string>('');
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (!modelsList) {
      dispatch(listModels());
    }
    if (dataset) {
      setModels(
        modelsList?.available_models?.filter((model: ModelInfo) =>
          model.model_path.includes(dataset.id || ''),
        ) || [],
      );
    }
  }, [dataset, modelsList]);

  useEffect(() => {
    if (!processedDataList) {
      dispatch(listProcessedData());
    } else {
      let processedFilename = processedDataList.processed_files.find(pFile =>
        pFile.filename.includes(dataset?.id || ''),
      );

      if (processedFilename) {
        setFilename(processedFilename.filename);
      }
    }
  }, [processedDataList]);

  useEffect(() => {
    if (activeTasks && activeTasks.length > 0) {
      const trainTask: TrainTask | undefined = activeTasks.find(task =>
        task.type === 'train' && (task as TrainTask).filename?.includes(dataset?.id || ''),
      );

      if (trainTask) {
        setCurrentTaskId(trainTask.task_id);
        dispatch(setTrainingTask(true));
      }
    }
  }, [activeTasks]);

  // Handle task completion callbacks
  const handleTaskComplete = () => {
    // Refresh the models list when training completes
    dispatch(listModels());
    // Clear the current task
    setCurrentTaskId(null);
    dispatch(setTrainingTask(false));
  };

  const handleTaskFailed = () => {
    // Clear the current task on failure
    setCurrentTaskId(null);
    dispatch(setTrainingTask(false));
  };

  const handleTrainModel = async () => {
    try {
      dispatch(setTrainingTask(true));
      const result = await dispatch(
        createTask({
          task_type: 'train',
          task_data: { ...defaultTrainingConfig, filename },
        }),
      );

      if (createTask.fulfilled.match(result)) {
        const taskResponse: TaskCreateResponse = result.payload;

        setCurrentTaskId(taskResponse.task_id);
      }
    } catch (error) {
      dispatch(setTrainingTask(false));
      // eslint-disable-next-line no-console
      console.error('Failed to create training task:', error);
    }
  };

  const handleModelClick = (modelFilename: string) => {
    if (onModelSelect) {
      onModelSelect(modelFilename);
    }
  };

  if (loadingListModels) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          gap: 2,
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          Loading models...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {availableModels?.length > 0 ? (
        <>
          {/* Header with count */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              backgroundColor: '#f8f9fa',
              borderRadius: 2,
              border: '1px solid #e0e0e0',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" color="primary">
                Available Models
              </Typography>
              <Chip
                label={`${availableModels.length} model${availableModels.length !== 1 ? 's' : ''}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Click a model to select it
            </Typography>
          </Box>

          {/* Models List */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {availableModels?.map((model: ModelInfo) => (
              <Card
                key={model.model_filename}
                onClick={() => handleModelClick(model.model_filename)}
                sx={{
                  cursor: 'pointer',
                  border:
                    selectedModel === model.model_filename
                      ? '2px solid'
                      : '1px solid',
                  borderColor:
                    selectedModel === model.model_filename
                      ? 'primary.main'
                      : '#e0e0e0',
                  backgroundColor:
                    selectedModel === model.model_filename ? '#e3f2fd' : '#fff',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor:
                      selectedModel === model.model_filename
                        ? '#e3f2fd'
                        : '#f5f5f5',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight:
                            selectedModel === model.model_filename
                              ? 'bold'
                              : 'medium',
                          color:
                            selectedModel === model.model_filename
                              ? 'primary.main'
                              : 'text.primary',
                          mb: 1,
                          wordBreak: 'break-all',
                        }}
                      >
                        {model.model_filename}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Chip
                          label={`${model.features_count} features`}
                          size="small"
                          variant="outlined"
                          color="secondary"
                        />
                        <Typography variant="body2" color="text.secondary">
                          Created: {formatTimestampFull(model.timestamp)}
                        </Typography>
                      </Box>
                    </Box>
                    {selectedModel === model.model_filename && (
                      <Chip
                        label="Selected"
                        size="small"
                        color="primary"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Train New Model Button */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              p: 2,
              backgroundColor: '#f8f9fa',
              borderRadius: 2,
              border: '1px solid #e0e0e0',
              gap: 2,
            }}
          >
            {/* Progress display when task is running */}
            <TaskProgress
              taskId={currentTaskId}
              isConnected={true}
              taskType="train"
              onTaskComplete={handleTaskComplete}
              onTaskFailed={handleTaskFailed}
            />

            <Button
              variant="outlined"
              size="small"
              onClick={handleTrainModel}
              disabled={trainingTask || !filename || !!creatingTask || !!currentTaskId}
              startIcon={
                creatingTask || !!currentTaskId ? (
                  <CircularProgress size={10} />
                ) : undefined
              }
              sx={{
                borderRadius: 2,
                textTransform: 'none',
              }}
            >
              {creatingTask
                ? 'Creating Task...'
                : currentTaskId
                  ? 'Training Model...'
                  : 'Train New Model'}
            </Button>
          </Box>
        </>
      ) : (
        <Card
          sx={{
            p: 4,
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
            border: '2px dashed #e0e0e0',
          }}
        >
          <CardContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom color="text.secondary">
                No Models Available
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                You need to train a model before making predictions. This will
                create a machine learning model based on your dataset.
              </Typography>
            </Box>

            {!filename && (
              <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant="body2">
                  <strong>Note:</strong> No processed data found for the current
                  dataset. Make sure you have uploaded and processed data before
                  training a model.
                </Typography>
              </Alert>
            )}

            {/* Progress display when task is running */}
            <Box sx={{ mb: 3 }}>
              <TaskProgress
                taskId={currentTaskId}
                isConnected={true}
                taskType="train"
                onTaskComplete={handleTaskComplete}
                onTaskFailed={handleTaskFailed}
              />
            </Box>

            <CardActions sx={{ justifyContent: 'center', p: 0 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleTrainModel}
                disabled={
                  !filename || trainingTask || !!creatingTask || !!currentTaskId
                }
                startIcon={
                  trainingTask || creatingTask || !!currentTaskId ? (
                    <CircularProgress size={20} />
                  ) : undefined
                }
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                }}
              >
                {creatingTask
                  ? 'Creating Task...'
                  : currentTaskId
                    ? 'Training Model...'
                    : 'Train New Model'}
              </Button>
            </CardActions>

            {filename && (
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  <strong>Ready to train with:</strong> {filename}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
