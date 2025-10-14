import { useEffect, useState } from 'react';
import {
  type RootState,
  useAppDispatch,
  useAppSelector,
} from '../../../../store/store';
import { listModels, trainModel } from '../../../../store/slices/exploring/eusomeSlice';
import { defaultTrainingConfig, type ModelInfo } from '../../../../shared/models/eusome-api.model';
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
} from '@mui/material';
import Loader from '../../../../shared/components/loader';

export const PredictionModels = () => {
  const dispatch = useAppDispatch();
  const {
    modelsList,
    loading: { listModels: loadingListModels },
  } = useAppSelector((state: RootState) => state.eusome);
  const { dataset } = useAppSelector((state: RootState) => state.dataset);
  const [availableModels, setModels] = useState<ModelInfo[]>([]);

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

  const handleTrainModel = () => {
    // TODO: Add file selection
    dispatch(trainModel({ file: new File([], 'model.csv'), trainingConfig: defaultTrainingConfig }));
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
          <Table
            size="small"
            stickyHeader
            sx={{ border: '1px solid rgba(0, 0, 0, 0.08)' }}
          >
            <TableHead>
              <TableRow>
                <TableCell>Model Name</TableCell>
                {/* <TableCell>Model Path</TableCell> */}
                <TableCell>Timestamp</TableCell>
                {/* <TableCell>Performance</TableCell> */}
                <TableCell>Features Count</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {availableModels?.map((model: ModelInfo) => (
                <TableRow key={model.model_filename}>
                  <TableCell>{model.model_filename}</TableCell>
                  {/* <TableCell>{model.model_path}</TableCell> */}
                  <TableCell>{model.timestamp}</TableCell>
                  {/* <TableCell>{model.performance}</TableCell> */}
                  <TableCell>{model.features_count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      ) : (
        <>
          <Typography variant="h6" textAlign="center">No available models found</Typography>
          <Button variant="contained" color="primary" onClick={handleTrainModel}>
            Train a new model
          </Button>
        </>
      )}
    </Box>
  );
};
