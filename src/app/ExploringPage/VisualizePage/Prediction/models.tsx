import { useEffect, useState } from 'react';
import {
  type RootState,
  useAppDispatch,
  useAppSelector,
} from '../../../../store/store';
import {
  listModels,
  listProcessedData,
  trainModel,
} from '../../../../store/slices/exploring/eusomeSlice';
import {
  defaultTrainingConfig,
  type ModelInfo,
} from '../../../../shared/models/eusome-api.model';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  TableContainer,
} from '@mui/material';
import Loader from '../../../../shared/components/loader';

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
    loading: { listModels: loadingListModels },
    processedDataList,
  } = useAppSelector((state: RootState) => state.eusome);
  const { dataset } = useAppSelector((state: RootState) => state.dataset);
  const [availableModels, setModels] = useState<ModelInfo[]>([]);
  const [filename, setFilename] = useState<string>('');

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

  const handleTrainModel = () => {
    dispatch(trainModel({ ...defaultTrainingConfig, filename }));
  };

  const handleModelClick = (modelFilename: string) => {
    if (onModelSelect) {
      onModelSelect(modelFilename);
    }
  };

  return loadingListModels ? (
    <Loader />
  ) : (
    <Box
      component={Paper}
      variant="outlined"
      sx={{
        mb: 2,
        p: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.09)',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      {availableModels?.length > 0 ? (
        <>
          <Typography variant="h6" textAlign="center">
            {' '}
            Available Models{' '}
          </Typography>
          <TableContainer>
            <Table
              size="small"
              stickyHeader
              sx={{ border: '1px solid rgba(0, 0, 0, 0.08)' }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>Model Name</TableCell>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Features Count</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {availableModels?.map((model: ModelInfo) => (
                  <TableRow
                    key={model.model_filename}
                    onClick={() => handleModelClick(model.model_filename)}
                    sx={{
                      cursor: 'pointer',
                      backgroundColor:
                        selectedModel === model.model_filename
                          ? 'action.selected'
                          : 'inherit',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight:
                            selectedModel === model.model_filename
                              ? 'bold'
                              : 'normal',
                          color:
                            selectedModel === model.model_filename
                              ? 'primary.main'
                              : 'inherit',
                        }}
                      >
                        {model.model_filename}
                      </Typography>
                    </TableCell>
                    <TableCell>{model.timestamp}</TableCell>
                    <TableCell>{model.features_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : (
        <>
          <Typography variant="h6" textAlign="center">
            No available models found
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleTrainModel}
          >
            Train a new model
          </Button>
        </>
      )}
    </Box>
  );
};
