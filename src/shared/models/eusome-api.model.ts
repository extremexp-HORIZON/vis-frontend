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
// Train Model Endpoint (/train_model)
// =============================================================================

export interface TrainingConfig {
  model_name: string; // e.g., "XGBRegressor"
  target_column: string;
  feature_columns: string[] | null;
  n_splits: number;
  hyperparameters: Record<string, unknown>;
  custom_model_name: string | null;
}

export interface TrainModelRequest {
  file: File; // Processed CSV file from /upload_data
  config_json?: string; // JSON stringified TrainingConfig
}

export interface TrainModelResponse {
  // The API returns {} - we can add fields if they appear in actual responses
  [key: string]: unknown;
}

// Default training configuration
export const defaultTrainingConfig: TrainingConfig = {
  model_name: 'XGBRegressor',
  target_column: 'rsrp_rscp_rssi',
  feature_columns: null,
  n_splits: 5,
  hyperparameters: {},
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
  geohash: string;
  radio_timestamp: string; // ISO 8601 format
  requested_heights: number[];
  model_filename: string | null;
  location_paths: LocationPaths | null;
}

export interface PredictionResponse {
  geohash: string;
  radio_timestamp: string;
  predicted_rsrp_at_heights: Array<Record<string, number | null>>;
  location_data_used: Record<string, unknown>;
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
  geohash: 'swbbqkwr',
  radio_timestamp: '2019-05-31T17:30:49+00:00',
  requested_heights: [10.0, 30.0, 60.0, 100.0],
  model_filename: 'AthensModelXGB_20251001_134924.pkl',
  location_paths: defaultLocationPaths,
};

// =============================================================================
// Models Management (/list_models)
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

// =============================================================================
// Data Management (/list_uploaded_data, /list_processed_data, /data_summary)
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
