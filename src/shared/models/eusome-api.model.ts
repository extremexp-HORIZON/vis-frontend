// =============================================================================
// EUSOME API Models
// Based on OpenAPI spec v0.1.0 - Predictive UAV Connectivity API
// =============================================================================

// =============================================================================
// Common Types & Error Handling
// =============================================================================

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

// =============================================================================
// Upload Data Endpoint (/upload_data)
// =============================================================================

export interface ColumnMapping {
  target: string;
  time_column: string;
  latitude: string;
  longitude: string;
  geohash: string;
}

export interface AugmentationOptions {
  enable_augmentation: boolean;
  augment_weather: boolean;
  augment_terrain: boolean;
  augment_population: boolean;
}

export interface UploadDataRequest {
  file: File;
  col_map_json?: string; // JSON stringified ColumnMapping
  augmentation_options_json?: string; // JSON stringified AugmentationOptions
}

export interface UploadDataResponse {
  // The API returns {} - we can add fields if they appear in actual responses
  [key: string]: unknown;
}

// Default values for upload
export const defaultColumnMapping: ColumnMapping = {
  target: 'rsrp_rscp_rssi',
  time_column: 'radio_timestamp',
  latitude: 'latitude',
  longitude: 'longitude',
  geohash: 'geohash',
};

export const defaultAugmentationOptions: AugmentationOptions = {
  enable_augmentation: true,
  augment_weather: true,
  augment_terrain: true,
  augment_population: true,
};

// =============================================================================
// Preprocess Psql Data Endpoint (/preprocess_psql_data)
// =============================================================================

export interface PreprocessPsqlDataRequest {
  psql_table_name: string;
  psql_query: string;
  col_map_json?: string; // JSON stringified ColumnMapping
  augmentation_options_json?: string; // JSON stringified AugmentationOptions
}

export interface PreprocessPsqlDataResponse {
  message: string;
  table_name: string;
  query: string;
  processed_file_path: string;
  rows_processed: number;
  columns_final: string[];
  nan_count: number;
  preview_data: string;
}

// =============================================================================
// Train Model Endpoint (/train_model)
// =============================================================================

export interface Hyperparameters {
  n_estimators?: number;
  learning_rate?: number;
  max_depth?: number;
  [key: string]: unknown; // Allow additional hyperparameters
}

export interface TrainingConfig {
  filename: string; // Processed CSV filename from /upload_data
  model_name: string; // e.g., "XGBRegressor"
  target_column: string;
  feature_columns: string[] | null;
  n_splits: number;
  hyperparameters: Hyperparameters;
  custom_model_name: string | null;
}

export interface TrainModelRequest {
  filename: string; // Processed CSV filename from /upload_data
  trainingConfig?: TrainingConfig;
}

export interface TrainModelResponse {
  // The API returns {} - we can add fields if they appear in actual responses
  [key: string]: unknown;
}

// TODO: Consider moving this to a separate file when we have more data
export const athensHyperparameters: Hyperparameters = {
  colsample_bytree: 0.7,
  learning_rate: 0.03,
  max_depth: 7,
  n_estimators: 200,
  reg_alpha: 1,
  reg_lambda: 10,
  subsample: 0.8,
};

// Default training configuration
export const defaultHyperparameters: Hyperparameters = {
  n_estimators: 200,
  learning_rate: 0.03,
  max_depth: 7,
};

export const defaultTrainingConfig: TrainingConfig = {
  filename: '',
  model_name: 'XGBRegressor',
  target_column: 'rsrp_rscp_rssi',
  feature_columns: null,
  n_splits: 5,
  hyperparameters: defaultHyperparameters,
  custom_model_name: null,
};

// =============================================================================
// Finetune Height Model Endpoint (/finetune_height_model)
// =============================================================================

export interface FinetuneConfig {
  epochs: number;
  learning_rate: number;
  batch_size: number;
  test_size: number;
  backup_existing_model: boolean;
  model_name: string;
}

export interface FinetuneModelRequest {
  file: File;
  config_json?: string; // JSON stringified FinetuneConfig
}

export interface FinetuneModelResponse {
  // The API returns {} - we can add fields if they appear in actual responses
  [key: string]: unknown;
}

// Default finetune configuration
export const defaultFinetuneConfig: FinetuneConfig = {
  epochs: 50,
  learning_rate: 0.001,
  batch_size: 32,
  test_size: 0.2,
  backup_existing_model: true,
  model_name: 'height_interpolation_model_finetuned.pth',
};

// =============================================================================
// Predict Endpoint (/predict)
// =============================================================================

export interface LocationPaths {
  weather: string | null;
  population: string | null;
  terrain_mean: string | null;
  terrain_std: string | null;
  stations: Record<string, [number, number]>; // station code -> [lat, lon]
}

export interface InferenceInput {
  geohashes: string[];
  radio_timestamp: string; // ISO 8601 format
  time_intervals: number;
  requested_heights: number[];
  model_filename: string | null;
  training_filename: string | null;
  location_paths: LocationPaths | null;
  zone_id: string | null;
}

export interface SinglePrediction {
  geohash: string;
  radio_timestamp: string;
  predicted_rsrp_at_heights: Array<Record<string, number | null>>;
  location_data_used: Record<string, unknown>;
}

export interface PredictionResponse {
  predictions: SinglePrediction[];
  model_used: string;
}

// Default location paths
export const defaultLocationPaths: LocationPaths = {
  weather: 'Data/asos.csv',
  population: 'Data/PopulationData/greece_geohash6_population.csv',
  terrain_mean:
    'Data/GMTED2010-7dot5arcsec/usgs_gmted2010_7pnt5arcsec_mean_stat_XszwU8PGwjhSndYxuIyz.tiff',
  terrain_std:
    'Data/GMTED2010-7dot5arcsec/usgs_gmted2010_7pnt5arcsec_standarddev_stat_XszwU8PGwjhSndYxuIyz.tiff',
  stations: {
    LGAV: [37.9364, 23.9445],
    LGEL: [38.0638, 23.556],
  },
};

// Default inference input
export const defaultInferenceInput: InferenceInput = {
  geohashes: ['swbbqkwr'],
  radio_timestamp: '2019-05-31T17:30:49+00:00',
  time_intervals: 1,
  requested_heights: [10.0, 30.0, 60.0, 100.0],
  model_filename: 'AthensModelXGB_20251001_134924.pkl',
  training_filename: null,
  location_paths: defaultLocationPaths,
  zone_id: 'zone_id',
};

// =============================================================================
// Models Management (/list_models, /delete_model)
// =============================================================================

export interface ModelInfo {
  model_filename: string;
  model_path: string;
  timestamp: string;
  performance: Record<string, number>;
  features_count: number;
}

export interface ModelsListResponse {
  available_models: ModelInfo[];
  count: number;
  message: string;
}

export interface DeleteModelResponse {
  message: string;
}

// =============================================================================
// Data Management (/list_uploaded_data, /list_processed_data, /data_summary, /delete_data)
// =============================================================================

// Uploaded data
export interface UploadedFileInfo {
  filename: string;
  full_path: string;
  size_bytes: number;
  upload_time: string;
  is_original: boolean;
}

export interface UploadedDataResponse {
  uploaded_files: UploadedFileInfo[];
  count: number;
  message: string;
}

// Processed data
export interface ProcessedFileInfo {
  filename: string;
  full_path: string;
  size_bytes: number;
  processed_time: string;
  rows_count: number;
  columns_count: number;
  sample_columns: string[];
}

export interface ProcessedDataResponse {
  processed_files: ProcessedFileInfo[];
  count: number;
  message: string;
}

// Data summary
export interface DataSummaryResponse {
  filename: string;
  full_path: string;
  shape: Record<string, number>;
  columns: string[];
  dtypes: Record<string, string>;
  missing_values: Record<string, number>;
  numeric_summary: Record<string, Record<string, number>>;
  categorical_summary: Record<string, Record<string, unknown>>;
  sample_data: Array<Record<string, unknown>>;
}

export interface DeleteDataResponse {
  message: string;
  count: number;
}

// =============================================================================
// System Status (/system_status)
// =============================================================================

export interface SystemStatusResponse {
  api_status: string;
  height_model_loaded: boolean;
  height_model_scalers: Record<string, boolean>;
  directories: Record<string, Record<string, unknown>>;
  models_available: number;
  data_summary: Record<string, number>;
}

// =============================================================================
// Task Management (/tasks, /tasks/train, /tasks/predict, /tasks/finetune)
// =============================================================================

export interface TaskProgress {
  task_id: string;
  status: TaskStatus;
  percent: number;
  step: string;
  message: string;
  error?: string;
  isConnected: boolean;
}

export type TaskStatus =
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'canceled';

export type TaskType = 'train' | 'predict' | 'finetune' | 'other';

export interface TaskCreateResponse {
  task_id: string;
  task_type: TaskType;
  message: string;
  zone_id?: string;
}

/**
 * Base class with common fields for all task types
 * Matches Python TaskBase model
 */
export interface TaskBase {
  // Identity
  task_id: string;
  type: TaskType;
  owner_id?: string;

  // Lifecycle
  status: TaskStatus;
  created_at: string;
  updated_at?: string;
  started_at?: string;
  finished_at?: string;
  success?: boolean;
  error?: string;

  // Progress
  percent?: number; // 0-100
  step?: string;
  message?: string;

  // Housekeeping
  schema_version: number; // Default: 1
}

/**
 * Training task model with training-specific inputs and outputs
 * Matches Python TrainTask model
 */
export interface TrainTask extends TaskBase {
  // Inputs (metadata)
  filename?: string;
  model_name?: string;
  n_splits?: number;
  hyperparameters_json?: string; // JSON string of hyperparameters
  custom_model_name?: string;

  // Outputs (results)
  result_model_filename?: string;
  metrics_json?: string; // JSON string with final metrics/results
}

/**
 * Prediction task model with prediction-specific inputs and outputs
 * Matches Python PredictTask model
 */
export interface PredictTask extends TaskBase {
  // Inputs (prediction-specific)
  zone_id?: string;
  input_data_json?: string; // JSON string of input data for prediction
  model_filename?: string;

  // Outputs (prediction results)
  predictions_json?: string; // JSON string with prediction results
  model_used?: string;
}

export interface TaskEventData {
  task_id: string;
  type: TaskType;
  owner_id?: string;
  ts: string; // ISO timestamp
  status: TaskStatus;
  percent: string; // Note: Redis stores as string
  step: string;
  message: string;
  created_at: string;
  updated_at?: string;
  started_at?: string;
  finished_at?: string;
  success?: boolean;
  error?: string;
  schema_version: number;

  // Task-specific fields
  result_model_filename?: string;
  metrics_json?: string;
  predictions_json?: string;
  model_used?: string;
  input_data_json?: string;
  model_filename?: string;
}

// ============================================================================
// WebSocket Message Types for EUSOME-API Task Progress
// ============================================================================

// Base message structure
interface BaseWebSocketMessage {
  type: string;
}

// ============================================================================
// MESSAGE TYPES
// ============================================================================

// 1. TASK STATUS (Initial status when connecting)
export interface TaskStatusMessage extends BaseWebSocketMessage {
  type: 'task_status';
  data: {
    task_id: string;
    type: TaskType;
    owner_id?: string;
    status: TaskStatus;
    percent: number;
    step: string;
    message: string;
    created_at: string;
    updated_at?: string;
    started_at?: string;
    finished_at?: string;
    success?: boolean;
    error?: string | null;
    schema_version: number;

    // Task-specific fields
    result_model_filename?: string | null;
    metrics_json?: string | null;
    predictions_json?: string | null;
    model_used?: string | null;
    input_data_json?: string | null;
    model_filename?: string | null;
  };
}

// 2. HISTORICAL EVENT (Past events from Redis Stream)
export interface HistoricalEventMessage extends BaseWebSocketMessage {
  type: 'historical_event';
  event_id: string;
  data: TaskEventData;
}

// 3. LIVE EVENT (Real-time progress updates)
export interface LiveEventMessage extends BaseWebSocketMessage {
  type: 'live_event';
  data: TaskEventData;
}

// 4. HEARTBEAT (Keep-alive messages every 30 seconds)
export interface HeartbeatMessage extends BaseWebSocketMessage {
  type: 'heartbeat';
  timestamp: string; // ISO timestamp
}

// 5. ERROR (Error messages)
export interface ErrorMessage extends BaseWebSocketMessage {
  type: 'error';
  message: string;
}

export type WebSocketMessage =
  | TaskStatusMessage
  | HistoricalEventMessage
  | LiveEventMessage
  | HeartbeatMessage
  | ErrorMessage;
