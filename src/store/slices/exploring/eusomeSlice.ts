import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { eusomeApi } from '../../../app/api/api';
import {
  type UploadDataResponse,
  type TrainModelResponse,
  type FinetuneModelResponse,
  type PredictionResponse,
  type ModelsListResponse,
  type UploadedDataResponse,
  type ProcessedDataResponse,
  type DataSummaryResponse,
  type SystemStatusResponse,
  type ColumnMapping,
  type AugmentationOptions,
  type TrainingConfig,
  type FinetuneConfig,
  type InferenceInput,
  type TaskCreateResponse,
  type TaskBase,
} from '../../../shared/models/eusome-api.model';
import { showError, showSuccess } from '../../../shared/utils/toast';
import type { AppStartListening } from '../../listenerMiddleware';

// =============================================================================
// State Interface
// =============================================================================

export interface IEusomeState {
  // Data
  uploadedData: UploadDataResponse | null;
  trainedModel: TrainModelResponse | null;
  finetunedModel: FinetuneModelResponse | null;
  predictions: PredictionResponse | null;
  modelsList: ModelsListResponse | null;
  uploadedDataList: UploadedDataResponse | null;
  processedDataList: ProcessedDataResponse | null;
  dataSummary: DataSummaryResponse | null;
  systemStatus: SystemStatusResponse | null;
  createdTasks: TaskCreateResponse[] | null;
  taskStatus: TaskBase | null;
  activeTasks: TaskBase[] | null;

  // In progress tasks
  trainingTask: boolean;

  // Loading states
  loading: {
    uploadData: boolean;
    trainModel: boolean;
    finetuneModel: boolean;
    predict: boolean;
    listModels: boolean;
    listUploadedData: boolean;
    listProcessedData: boolean;
    dataSummary: boolean;
    systemStatus: boolean;
    createTask: boolean;
    getTaskStatus: boolean;
    getActiveTasks: boolean;
  };

  // Error states
  error: {
    uploadData: string | null;
    trainModel: string | null;
    finetuneModel: string | null;
    predict: string | null;
    listModels: string | null;
    listUploadedData: string | null;
    listProcessedData: string | null;
    dataSummary: string | null;
    systemStatus: string | null;
    createTask: string | null;
    getTaskStatus: string | null;
    getActiveTasks: string | null;
  };
}

const initialState: IEusomeState = {
  uploadedData: null,
  trainedModel: null,
  finetunedModel: null,
  predictions: null,
  modelsList: null,
  uploadedDataList: null,
  processedDataList: null,
  dataSummary: null,
  systemStatus: null,
  createdTasks: null,
  taskStatus: null,
  activeTasks: null,
  trainingTask: false,
  loading: {
    uploadData: false,
    trainModel: false,
    finetuneModel: false,
    predict: false,
    listModels: false,
    listUploadedData: false,
    listProcessedData: false,
    dataSummary: false,
    systemStatus: false,
    createTask: false,
    getTaskStatus: false,
    getActiveTasks: false,
  },
  error: {
    uploadData: null,
    trainModel: null,
    finetuneModel: null,
    predict: null,
    listModels: null,
    listUploadedData: null,
    listProcessedData: null,
    dataSummary: null,
    systemStatus: null,
    createTask: null,
    getTaskStatus: null,
    getActiveTasks: null,
  },
};

// =============================================================================
// Async Thunks - Upload Data
// =============================================================================

export interface UploadDataParams {
  file: File;
  columnMapping?: ColumnMapping;
  augmentationOptions?: AugmentationOptions;
}

export const uploadData = createAsyncThunk<
  UploadDataResponse,
  UploadDataParams,
  { rejectValue: string }
>(
  'eusome/uploadData',
  async ({ file, columnMapping, augmentationOptions }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      formData.append('file', file);

      if (columnMapping) {
        formData.append('col_map_json', JSON.stringify(columnMapping));
      }

      if (augmentationOptions) {
        formData.append(
          'augmentation_options_json',
          JSON.stringify(augmentationOptions),
        );
      }

      const response = await eusomeApi.post<UploadDataResponse>(
        '/upload_data',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      return rejectWithValue(errorMessage);
    }
  },
);

// =============================================================================
// Async Thunks - Train Model
// =============================================================================

export interface TrainModelParams {
  filename: string; // Processed CSV filename from /upload_data
  trainingConfig?: TrainingConfig;
}

export const trainModel = createAsyncThunk<
  TrainModelResponse,
  TrainModelParams,
  { rejectValue: string }
>(
  'eusome/trainModel',
  async ({ filename, trainingConfig }, { rejectWithValue }) => {
    try {
      // Create the training config with the filename and defaults
      const config: TrainingConfig = {
        filename,
        model_name: 'XGBRegressor',
        target_column: 'rsrp_rscp_rssi',
        feature_columns: null,
        n_splits: 5,
        hyperparameters: {},
        custom_model_name: null,
        ...trainingConfig,
      };

      const response = await eusomeApi.post<TrainModelResponse>(
        '/train_model',
        config,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      return rejectWithValue(errorMessage);
    }
  },
);

// =============================================================================
// Async Thunks - Finetune Height Model
// =============================================================================

export interface FinetuneModelParams {
  file: File;
  finetuneConfig?: FinetuneConfig;
}

export const finetuneModel = createAsyncThunk<
  FinetuneModelResponse,
  FinetuneModelParams,
  { rejectValue: string }
>(
  'eusome/finetuneModel',
  async ({ file, finetuneConfig }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      formData.append('file', file);

      if (finetuneConfig) {
        formData.append('config_json', JSON.stringify(finetuneConfig));
      }

      const response = await eusomeApi.post<FinetuneModelResponse>(
        '/finetune_height_model',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      return rejectWithValue(errorMessage);
    }
  },
);

// =============================================================================
// Async Thunks - Predict
// =============================================================================

export const predict = createAsyncThunk<
  PredictionResponse,
  InferenceInput,
  { rejectValue: string }
>('eusome/predict', async (inferenceInput, { rejectWithValue }) => {
  try {
    const response = await eusomeApi.post<PredictionResponse>(
      '/predict',
      inferenceInput,
    );

    return response.data;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return rejectWithValue(errorMessage);
  }
});

// =============================================================================
// Async Thunks - List Models
// =============================================================================

export const listModels = createAsyncThunk<
  ModelsListResponse,
  void,
  { rejectValue: string }
>('eusome/listModels', async (_, { rejectWithValue }) => {
  try {
    const response = await eusomeApi.get<ModelsListResponse>('/list_models');

    return response.data;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return rejectWithValue(errorMessage);
  }
});

// =============================================================================
// Async Thunks - List Uploaded Data
// =============================================================================

export const listUploadedData = createAsyncThunk<
  UploadedDataResponse,
  void,
  { rejectValue: string }
>('eusome/listUploadedData', async (_, { rejectWithValue }) => {
  try {
    const response = await eusomeApi.get<UploadedDataResponse>(
      '/list_uploaded_data',
    );

    return response.data;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return rejectWithValue(errorMessage);
  }
});

// =============================================================================
// Async Thunks - List Processed Data
// =============================================================================

export const listProcessedData = createAsyncThunk<
  ProcessedDataResponse,
  void,
  { rejectValue: string }
>('eusome/listProcessedData', async (_, { rejectWithValue }) => {
  try {
    const response = await eusomeApi.get<ProcessedDataResponse>(
      '/list_processed_data',
    );

    return response.data;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return rejectWithValue(errorMessage);
  }
});

// =============================================================================
// Async Thunks - Get Data Summary
// =============================================================================

export const getDataSummary = createAsyncThunk<
  DataSummaryResponse,
  { filename: string },
  { rejectValue: string }
>('eusome/getDataSummary', async ({ filename }, { rejectWithValue }) => {
  try {
    const response = await eusomeApi.get<DataSummaryResponse>(
      `/data_summary/${filename}`,
    );

    return response.data;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return rejectWithValue(errorMessage);
  }
});

// =============================================================================
// Async Thunks - Get System Status
// =============================================================================

export const getSystemStatus = createAsyncThunk<
  SystemStatusResponse,
  void,
  { rejectValue: string }
>('eusome/getSystemStatus', async (_, { rejectWithValue }) => {
  try {
    const response =
      await eusomeApi.get<SystemStatusResponse>('/system_status');

    return response.data;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return rejectWithValue(errorMessage);
  }
});

// =============================================================================
// Async Thunks - Create Task
// =============================================================================

export const createTask = createAsyncThunk<
  TaskCreateResponse,
  {
    task_type: string;
    task_data: TrainingConfig | FinetuneConfig | InferenceInput;
  },
  { rejectValue: string }
>(
  'eusome/createTask',
  async ({ task_type, task_data }, { rejectWithValue }) => {
    try {
      const response = await eusomeApi.post<TaskCreateResponse>(
        `/tasks/${task_type}`,
        task_data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      return rejectWithValue(errorMessage);
    }
  },
);

// =============================================================================
// Async Thunks - Get Task Status
// =============================================================================

export const getTaskStatus = createAsyncThunk<
  TaskBase,
  { task_id: string },
  { rejectValue: string }
>('eusome/getTaskStatus', async ({ task_id }, { rejectWithValue }) => {
  try {
    const response = await eusomeApi.get<TaskBase>(
      `/tasks/${task_id}`,
    );

    return response.data;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return rejectWithValue(errorMessage);
  }
});

// =============================================================================
// Async Thunks - Get Active Tasks
// =============================================================================

export const getActiveTasks = createAsyncThunk<
  TaskBase[],
  void,
  { rejectValue: string }
>('eusome/getActiveTasks', async (_, { rejectWithValue }) => {
  try {
    const response = await eusomeApi.get<TaskBase[]>('/tasks/active');

    return response.data;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return rejectWithValue(errorMessage);
  }
});
// =============================================================================
// Slice
// =============================================================================

export const eusomeSlice = createSlice({
  name: 'eusome',
  initialState,
  reducers: {
    removeCreatedTask: (state, action: PayloadAction<string>) => {
      state.createdTasks = state.createdTasks?.filter(task => task.task_id !== action.payload) || null;
    },
    removeActiveTask: (state, action: PayloadAction<string>) => {
      state.activeTasks = state.activeTasks?.filter(task => task.task_id !== action.payload) || null;
    },
    setTrainingTask: (state, action: PayloadAction<boolean>) => {
      state.trainingTask = action.payload;
    },
    resetEusomeState: () => {
      return initialState;
    },
    clearPredictions: state => {
      state.predictions = null;
    },
    clearUploadedData: state => {
      state.uploadedData = null;
    },
    clearTrainedModel: state => {
      state.trainedModel = null;
    },
    clearCreatedTasks: state => {
      state.createdTasks = null;
    },
  },
  extraReducers: builder => {
    // ==========================================================================
    // Upload Data
    // ==========================================================================
    builder
      .addCase(uploadData.pending, state => {
        state.loading.uploadData = true;
        state.error.uploadData = null;
      })
      .addCase(uploadData.fulfilled, (state, action) => {
        state.loading.uploadData = false;
        state.uploadedData = action.payload;
        showSuccess('Data uploaded and preprocessed successfully!');
      })
      .addCase(
        uploadData.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading.uploadData = false;
          state.error.uploadData = action.payload || 'Failed to upload data';
          showError(action.payload || 'Failed to upload data');
        },
      );

    // ==========================================================================
    // Train Model
    // ==========================================================================
    builder
      .addCase(trainModel.pending, state => {
        state.loading.trainModel = true;
        state.error.trainModel = null;
      })
      .addCase(trainModel.fulfilled, (state, action) => {
        state.loading.trainModel = false;
        state.trainedModel = action.payload;
        showSuccess('Model trained successfully!');
      })
      .addCase(
        trainModel.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading.trainModel = false;
          state.error.trainModel = action.payload || 'Failed to train model';
          showError(action.payload || 'Failed to train model');
        },
      );

    // ==========================================================================
    // Finetune Model
    // ==========================================================================
    builder
      .addCase(finetuneModel.pending, state => {
        state.loading.finetuneModel = true;
        state.error.finetuneModel = null;
      })
      .addCase(finetuneModel.fulfilled, (state, action) => {
        state.loading.finetuneModel = false;
        state.finetunedModel = action.payload;
        showSuccess('Height model finetuned successfully!');
      })
      .addCase(
        finetuneModel.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading.finetuneModel = false;
          state.error.finetuneModel =
            action.payload || 'Failed to finetune model';
          showError(action.payload || 'Failed to finetune model');
        },
      );

    // ==========================================================================
    // Predict
    // ==========================================================================
    builder
      .addCase(predict.pending, state => {
        state.loading.predict = true;
        state.error.predict = null;
      })
      .addCase(predict.fulfilled, (state, action) => {
        state.loading.predict = false;
        state.predictions = action.payload;
        showSuccess('Prediction completed successfully!');
      })
      .addCase(
        predict.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading.predict = false;
          state.error.predict = action.payload || 'Failed to get prediction';
          showError(action.payload || 'Failed to get prediction');
        },
      );

    // ==========================================================================
    // List Models
    // ==========================================================================
    builder
      .addCase(listModels.pending, state => {
        state.loading.listModels = true;
        state.error.listModels = null;
      })
      .addCase(listModels.fulfilled, (state, action) => {
        state.loading.listModels = false;
        state.modelsList = action.payload;
        showSuccess(`${action.payload.count} models loaded!`);
      })
      .addCase(
        listModels.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading.listModels = false;
          state.error.listModels = action.payload || 'Failed to list models';
          showError(action.payload || 'Failed to list models');
        },
      );

    // ==========================================================================
    // List Uploaded Data
    // ==========================================================================
    builder
      .addCase(listUploadedData.pending, state => {
        state.loading.listUploadedData = true;
        state.error.listUploadedData = null;
      })
      .addCase(listUploadedData.fulfilled, (state, action) => {
        state.loading.listUploadedData = false;
        state.uploadedDataList = action.payload;
        showSuccess(`${action.payload.count} uploaded files found!`);
      })
      .addCase(
        listUploadedData.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading.listUploadedData = false;
          state.error.listUploadedData =
            action.payload || 'Failed to list uploaded data';
          showError(action.payload || 'Failed to list uploaded data');
        },
      );

    // ==========================================================================
    // List Processed Data
    // ==========================================================================
    builder
      .addCase(listProcessedData.pending, state => {
        state.loading.listProcessedData = true;
        state.error.listProcessedData = null;
      })
      .addCase(listProcessedData.fulfilled, (state, action) => {
        state.loading.listProcessedData = false;
        state.processedDataList = action.payload;
        showSuccess(`${action.payload.count} processed files found!`);
      })
      .addCase(
        listProcessedData.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading.listProcessedData = false;
          state.error.listProcessedData =
            action.payload || 'Failed to list processed data';
          showError(action.payload || 'Failed to list processed data');
        },
      );

    // ==========================================================================
    // Get Data Summary
    // ==========================================================================
    builder
      .addCase(getDataSummary.pending, state => {
        state.loading.dataSummary = true;
        state.error.dataSummary = null;
      })
      .addCase(getDataSummary.fulfilled, (state, action) => {
        state.loading.dataSummary = false;
        state.dataSummary = action.payload;
        showSuccess(`Data summary for ${action.payload.filename} loaded!`);
      })
      .addCase(
        getDataSummary.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading.dataSummary = false;
          state.error.dataSummary =
            action.payload || 'Failed to get data summary';
          showError(action.payload || 'Failed to get data summary');
        },
      );

    // ==========================================================================
    // Get System Status
    // ==========================================================================
    builder
      .addCase(getSystemStatus.pending, state => {
        state.loading.systemStatus = true;
        state.error.systemStatus = null;
      })
      .addCase(getSystemStatus.fulfilled, (state, action) => {
        state.loading.systemStatus = false;
        state.systemStatus = action.payload;
        showSuccess('System status loaded!');
      })
      .addCase(
        getSystemStatus.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading.systemStatus = false;
          state.error.systemStatus =
            action.payload || 'Failed to get system status';
          showError(action.payload || 'Failed to get system status');
        },
      );

    // ==========================================================================
    // Create Task
    // ==========================================================================
    builder
      .addCase(createTask.pending, state => {
        state.loading.createTask = true;
        state.error.createTask = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading.createTask = false;
        state.createdTasks = [...(state.createdTasks || []), action.payload];
        showSuccess('Task created successfully!');
      })
      .addCase(
        createTask.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading.createTask = false;
          state.error.createTask = action.payload || 'Failed to create task';
          showError(action.payload || 'Failed to create task');
        },
      );

    // ==========================================================================
    // Get Task Status
    // ==========================================================================
    builder
      .addCase(getTaskStatus.pending, state => {
        state.loading.getTaskStatus = true;
        state.error.getTaskStatus = null;
      })
      .addCase(getTaskStatus.fulfilled, (state, action) => {
        state.loading.getTaskStatus = false;
        state.taskStatus = action.payload;
        showSuccess('Task status loaded!');
      })
      .addCase(
        getTaskStatus.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading.getTaskStatus = false;
          state.error.getTaskStatus =
            action.payload || 'Failed to get task status';
          showError(action.payload || 'Failed to get task status');
        },
      );

    // ==========================================================================
    // Get Active Tasks
    // ==========================================================================
    builder
      .addCase(getActiveTasks.pending, state => {
        state.loading.getActiveTasks = true;
        state.error.getActiveTasks = null;
      })
      .addCase(getActiveTasks.fulfilled, (state, action) => {
        state.loading.getActiveTasks = false;
        state.activeTasks = action.payload;
        // showSuccess('Active tasks loaded!');
      })
      .addCase(
        getActiveTasks.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading.getActiveTasks = false;
          state.error.getActiveTasks = action.payload || 'Failed to get active tasks';
          showError(action.payload || 'Failed to get active tasks');
        },
      );
  },
});

// =============================================================================
// Exports
// =============================================================================

export const eusomeApiListeners = (startAppListening: AppStartListening) => {
  // trainModelListener
  startAppListening({
    actionCreator: trainModel.fulfilled,
    effect: async (_, listenerApi) => {
      await listenerApi.dispatch(listModels());
    },
  });
};

export const {
  removeCreatedTask,
  removeActiveTask,
  setTrainingTask,
  resetEusomeState,
  clearPredictions,
  clearUploadedData,
  clearTrainedModel,
  clearCreatedTasks,
} = eusomeSlice.actions;
