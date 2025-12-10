import type React from 'react';
import { useCallback } from 'react';
import { useAppDispatch } from '../../store/store';
import { uploadDataSource } from '../../store/slices/exploring/datasourceSlice';
import type { IDataSource } from '../../shared/models/dataexploration.model';
import {
  uploadData,
  listProcessedData,
} from '../../store/slices/exploring/eusomeSlice';
import {
  FileUpload,
  type AdditionalField,
  type UploadParams,
} from '../../shared/components/file-upload';
import {
  defaultAugmentationOptions,
  defaultColumnMapping,
} from '../../shared/models/eusome-api.model';

interface DataSourceFileUploadProps {
  onUploadSuccess?: (dataset: IDataSource) => void;
  onUploadError?: (error: string) => void;
}

export const DataSourceFileUpload: React.FC<DataSourceFileUploadProps> = ({
  onUploadSuccess,
  onUploadError,
}) => {
  const dispatch = useAppDispatch();

  const additionalFields: AdditionalField[] = [
    {
      name: 'target',
      label: 'Target',
      required: true,
      placeholder: 'Enter target column name',
    },
    {
      name: 'latitude',
      label: 'Latitude',
      required: true,
      placeholder: 'Enter latitude column name',
    },
    {
      name: 'longitude',
      label: 'Longitude',
      required: true,
      placeholder: 'Enter longitude column name',
    },
    {
      name: 'measure0',
      label: 'Measure 0',
      required: true,
      placeholder: 'Enter first measure name',
    },
    {
      name: 'measure1',
      label: 'Measure 1',
      required: true,
      placeholder: 'Enter second measure name',
    },
  ];

  const handleUpload = useCallback(
    async (params: UploadParams): Promise<IDataSource> => {
      await dispatch(
        uploadData({
          file: params.file,
          columnMapping: {
            ...defaultColumnMapping,
            target: params.additionalFields?.target || '',
            latitude: params.additionalFields?.latitude || '',
            longitude: params.additionalFields?.longitude || '',
          },
          // temporary disable augmentation
          augmentationOptions: {
            ...defaultAugmentationOptions,
            enable_augmentation: false,
          },
        }),
      ).unwrap();

      dispatch(listProcessedData());

      const result = await dispatch(
        uploadDataSource({
          file: params.file,
          format: params.file.name.split('.').pop() || '',
          measure0: params.additionalFields?.measure0,
          measure1: params.additionalFields?.measure1,
          isRawVis: true,
        }),
      ).unwrap();

      return result;
    },
    [dispatch],
  );

  return (
    <FileUpload<IDataSource>
      onUpload={handleUpload}
      onUploadSuccess={onUploadSuccess}
      onUploadError={onUploadError}
      acceptedFileTypes={['.csv', '.parquet']}
      maxFileSize={100 * 1024 * 1024}
      additionalFields={additionalFields}
      title="Upload Data Source"
      description="Drag and drop your CSV` or Parquet file here, or click to browse"
    />
  );
};
