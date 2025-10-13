import type React from 'react';
import { useCallback } from 'react';
import { useAppDispatch } from '../../store/store';
import { uploadDataSource } from '../../store/slices/exploring/datasourceSlice';
import type { IDataSource } from '../../shared/models/dataexploration.model';
import {
  FileUpload,
  type AdditionalField,
  type UploadParams,
} from '../../shared/components/file-upload';

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
      const result = await dispatch(
        uploadDataSource({
          file: params.file,
          format: 'rawvis',
          measure0: params.additionalFields?.measure0,
          measure1: params.additionalFields?.measure1,
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
      acceptedFileTypes={['.csv']}
      maxFileSize={100 * 1024 * 1024}
      additionalFields={additionalFields}
      title="Upload Data Source"
      description="Drag and drop your CSV file here, or click to browse"
    />
  );
};
