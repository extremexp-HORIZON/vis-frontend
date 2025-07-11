import {
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
} from '@mui/material';
import {
  RootState,
  useAppDispatch,
  useAppSelector,
} from '../../../../../store/store';
import {
  deleteModel,
  setNewTrain,
} from '../../../../../store/slices/exploring/forecastingSlice';
import {
  BarChart as BarChartIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

export const ForecastingModelSelection = () => {
  const dispatch = useAppDispatch();
  const { savedModels } = useAppSelector(
    (state: RootState) => state.forecasting,
  );

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        borderBottom="1px solid rgba(0,0,0,0.3)"
        pb={1}
        mb={2}
      >
        <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
          Saved Models
        </Typography>
      </Box>

      {savedModels?.length > 0 && (
        <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Model Name</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {savedModels?.map(model => (
                <TableRow key={model.model_name}>
                  <TableCell>{model.model_name}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" size="small">
                      <BarChartIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => dispatch(deleteModel(model.model_name))}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box textAlign="center" mt={2}>
        <Button
          size="small"
          variant="outlined"
          color="secondary"
          onClick={() => dispatch(setNewTrain(true))}
        >
          Train a new model
        </Button>
      </Box>
    </Box>
  );
};
