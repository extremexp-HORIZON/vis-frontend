import type React from 'react';
import { useState, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
  TextField,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

export interface AdditionalField {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
}

export interface UploadParams {
  file: File;
  additionalFields?: Record<string, string>;
}

interface FileUploadProps<T = unknown> {
  onUpload: (params: UploadParams) => Promise<T>;
  onUploadSuccess?: (result: T) => void;
  onUploadError?: (error: string) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
  additionalFields?: AdditionalField[];
  title?: string;
  description?: string;
}

export const FileUpload = <T = unknown, >({
  onUpload,
  onUploadSuccess,
  onUploadError,
  acceptedFileTypes = ['.csv'],
  maxFileSize = 100 * 1024 * 1024, // 100MB
  additionalFields = [],
  title = 'Upload Dataset',
  description = 'Drag and drop your file here, or click to browse',
}: FileUploadProps<T>) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf('.'));

    if (!acceptedFileTypes.includes(fileExtension)) {
      return `File type not supported. Please upload a ${acceptedFileTypes.join(' or ')} file.`;
    }

    // Check file size
    if (file.size > maxFileSize) {
      return `File size too large. Maximum size is ${Math.round(maxFileSize / (1024 * 1024))}MB.`;
    }

    return null;
  };

  const handleFileSelect = useCallback(
    (file: File) => {
      const validationError = validateFile(file);

      if (validationError) {
        onUploadError?.(validationError);

        return;
      }

      setSelectedFile(file);
    },
    [onUploadError],
  );

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = event.dataTransfer.files;

    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    // Validate required fields
    const missingFields = additionalFields
      .filter(field => field.required && !fieldValues[field.name])
      .map(field => field.label);

    if (missingFields.length > 0) {
      const errorMsg = `Please fill in required fields: ${missingFields.join(', ')}`;

      setUploadError(errorMsg);

      onUploadError?.(errorMsg);

      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await onUpload({
        file: selectedFile,
        additionalFields:
          Object.keys(fieldValues).length > 0 ? fieldValues : undefined,
      });

      setSelectedFile(null);
      setFieldValues({});
      onUploadSuccess?.(result);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);

      setUploadError(errorMsg);

      onUploadError?.(errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClickUpload = () => {
    if (!selectedFile) {
      fileInputRef.current?.click();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        elevation={isDragOver ? 8 : 1}
        sx={{
          border: '2px dashed',
          borderColor: isDragOver ? 'primary.main' : 'grey.300',
          backgroundColor: isDragOver ? 'action.hover' : 'background.paper',
          transition: 'all 0.2s ease-in-out',
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover',
          },
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClickUpload}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFileTypes.join(',')}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />

        {!selectedFile ? (
          <Box>
            <CloudUploadIcon
              sx={{ fontSize: 48, color: 'primary.main', mb: 2 }}
            />
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {description}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Supported formats: {acceptedFileTypes.join(', ')} (Max size:{' '}
              {Math.round(maxFileSize / (1024 * 1024))}MB)
            </Typography>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'left' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <InsertDriveFileIcon
                sx={{ fontSize: 32, color: 'primary.main', mr: 2 }}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {selectedFile.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatFileSize(selectedFile.size)}
                </Typography>

                {additionalFields.map(field => (
                  <TextField
                    key={field.name}
                    size="small"
                    label={field.label}
                    placeholder={field.placeholder}
                    value={fieldValues[field.name] || ''}
                    onChange={e =>
                      setFieldValues(prev => ({
                        ...prev,
                        [field.name]: e.target.value,
                      }))
                    }
                    onClick={e => e.stopPropagation()}
                    required={field.required}
                    sx={{ m: 1 }}
                  />
                ))}
              </Box>
              <IconButton
                onClick={e => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
            <Chip
              label={selectedFile.name.endsWith('.csv') ? 'CSV' : 'JSON'}
              color="primary"
              size="small"
              sx={{ mr: 1 }}
            />
            <Button
              variant="contained"
              onClick={e => {
                e.stopPropagation();
                handleUpload();
              }}
              disabled={isUploading}
              sx={{ mt: 2 }}
            >
              {isUploading ? (
                <>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  Uploading...
                </>
              ) : (
                'Upload Dataset'
              )}
            </Button>
          </Box>
        )}
      </Paper>

      {uploadError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {uploadError}
        </Alert>
      )}
    </Box>
  );
};
