import {
  Card,
  CardContent,
  Typography,
  Box,
  Autocomplete,
  TextField,
} from '@mui/material';
import { IDataset } from '../../../../../shared/models/exploring/dataset.model';
import { setForecastingForm } from '../../../../../store/slices/exploring/forecastingSlice';
import {
  RootState,
  useAppDispatch,
  useAppSelector,
} from '../../../../../store/store';

export interface IForecastingFeatureExtractionProps {
  dataset: IDataset;
}

export const ForecastingFeatureExtraction = (
  props: IForecastingFeatureExtractionProps,
) => {
  const { dataset } = props;
  const dispatch = useAppDispatch();
  const { forecastingForm } = useAppSelector(
    (state: RootState) => state.forecasting,
  );
  const timeSeriesMeasureCol = useAppSelector(
    (state: RootState) => state.timeSeries.measureCol,
  );

  const featureOptions =
    dataset?.originalColumns
      ?.filter(col => col.name !== timeSeriesMeasureCol)
      .map(col => ({
        label: col.name,
        value: col.name,
      })) ?? [];

  const selectedOptions = forecastingForm.features.columnFeatures.map(cf => ({
    label: cf,
    value: cf,
  }));

  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: { label: string; value: string }[],
  ) => {
    dispatch(
      setForecastingForm({
        ...forecastingForm,
        features: {
          ...forecastingForm.features,
          columnFeatures: newValue.map(opt => opt.value),
        },
      }),
    );
  };

  return (
    <Card variant="outlined" sx={{ width: '100%', p: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center">
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mr: 'auto' }}>
            {timeSeriesMeasureCol}
          </Typography>
          <Autocomplete
            multiple
            options={featureOptions}
            value={selectedOptions}
            onChange={handleChange}
            disableCloseOnSelect
            getOptionLabel={option => option.label}
            isOptionEqualToValue={(option, value) =>
              option.value === value.value
            }
            sx={{ width: '80%' }}
            renderInput={params => (
              <TextField
                {...params}
                variant="outlined"
                label="Select Features"
              />
            )}
          />
        </Box>
      </CardContent>
    </Card>
  );
};
