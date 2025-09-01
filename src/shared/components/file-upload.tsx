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
import { useAppDispatch, useAppSelector } from '../../store/store';
import { uploadDataSource } from '../../store/slices/exploring/datasourceSlice';
import type { IDataSource } from '../models/dataexploration.model';

interface FileUploadProps {
  onUploadSuccess?: (dataset: IDataSource) => void;
  onUploadError?: (error: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  onUploadError,
}) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.dataSource);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [measure0, setMeasure0] = useState<string | null>(null);
  const [measure1, setMeasure1] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedFileTypes = ['.csv'];
  const maxFileSize = 100 * 1024 * 1024; // 100MB

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

  const handleUpload = async (measure0?: string, measure1?: string) => {
    if (!selectedFile) return;

    try {
      const result = await dispatch(
        uploadDataSource({
          file: selectedFile,
          format: 'rawvis',
          measure0,
          measure1,
        }),
      ).unwrap();

      setSelectedFile(null);
      onUploadSuccess?.(result);
    } catch (error) {
      onUploadError?.(error as string);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
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
              Upload Dataset
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Drag and drop your file here, or click to browse
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

                <TextField
                  size="small"
                  label="Measure 0"
                  value={measure0 || ''}
                  onChange={e => setMeasure0(e.target.value)}
                  onClick={e => e.stopPropagation()}
                />
                <TextField
                  size="small"
                  label="Measure 1"
                  value={measure1 || ''}
                  onChange={e => setMeasure1(e.target.value)}
                  onClick={e => e.stopPropagation()}
                />
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
                handleUpload(
                  measure0 ? measure0 : undefined,
                  measure1 ? measure1 : undefined,
                );
              }}
              disabled={!measure0 || !measure1 || loading.upload}
              sx={{ mt: 2 }}
            >
              {loading.upload ? (
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

      {error.upload && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error.upload}
        </Alert>
      )}
    </Box>
  );
};
