import { useEffect, useState } from 'react';
import { Button, Stepper, Step, StepLabel, Box } from '@mui/material';
import type { IDataset } from '../../../../../shared/models/exploring/dataset.model';
import { IForecastingDefault } from '../../../../../shared/models/exploring/forecasting.model';
import {
  setIsInTrainStepper,
  setForecastingForm,
  startTraining,
  setNewTrain,
  setPredictions,
} from '../../../../../store/slices/exploring/forecastingSlice';
import type {
  RootState } from '../../../../../store/store';
import {
  useAppDispatch,
  useAppSelector,
} from '../../../../../store/store';
import { ForecastingAlgSelection } from '../Alg-Selection/forecasting-alg-selection';
import { ForecastingDataPrep } from '../Data-Preparation/forecasting-data-prep';
import { ForecastingFeatureExtraction } from '../Feature-Extraction/forecasting-feature-extraction';
import { ForecastingResults } from '../Results/forecasting-results';

const steps = ['Data Selection', 'Feature Selection', 'Algorithm Selection'];

export interface IForecastingTrainStepperProps {
  dataset: IDataset;
}

export const ForecastingTrainStepper = ({
  dataset,
}: IForecastingTrainStepperProps) => {
  const dispatch = useAppDispatch();
  const { forecastingForm } = useAppSelector(
    (state: RootState) => state.forecasting,
  );
  const { measureCol: timeSeriesMeasureCol, frequency } = useAppSelector(
    (state: RootState) => state.timeSeries,
  );
  const { timeRange } = useAppSelector((state: RootState) => state.dataset);

  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const getTimeIntervalFromFrequency = () => {
      switch (frequency) {
        case 900:
          return '15m';
        case 1800:
          return '30m';
        case 3600:
          return '1h';
        case 21600:
          return '6h';
        default:
          return '15m';
      }
    };

    dispatch(setIsInTrainStepper(true));

    if (dataset) {
      dispatch(
        setForecastingForm({
          ...forecastingForm,
          kind: dataset.id!,
          targetColumn: timeSeriesMeasureCol,
          startDate: timeRange.from,
          endDate: timeRange.to,
          time_interval: getTimeIntervalFromFrequency(),
          features: {
            ...forecastingForm.features,
            columnFeatures: forecastingForm.features.columnFeatures.filter(
              f => f === timeSeriesMeasureCol,
            ),
          },
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTrain = () => {
    dispatch(setIsInTrainStepper(false));
    dispatch(startTraining());
    setActiveStep(prev => prev + 1);
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => setActiveStep(prev => prev - 1);

  const handleReset = () => {
    dispatch(setNewTrain(false));
    setActiveStep(0);
    dispatch(setIsInTrainStepper(false));
    dispatch(setPredictions([]));
    dispatch(setForecastingForm(IForecastingDefault));
  };

  const isNextDisabled = () => {
    if (activeStep === 0)
      return !(forecastingForm.startDate && forecastingForm.endDate);
    if (activeStep === 1)
      return forecastingForm.features.columnFeatures.length === 0;
    if (activeStep === 2)
      return (
        Object.keys(forecastingForm.algorithms).length === 0 ||
        !forecastingForm.future_predictions
      );

    return false;
  };

  return (
    <Box mt={2} width="100%">
      {activeStep !== 3 && (
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      )}

      <Box mt={4}>
        {activeStep === 0 && <ForecastingDataPrep />}
        {activeStep === 1 && <ForecastingFeatureExtraction dataset={dataset} />}
        {activeStep === 2 && <ForecastingAlgSelection />}
        {activeStep === 3 && <ForecastingResults />}
      </Box>

      <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
        {activeStep === 3 ? (
          <Button variant="outlined" size="small" onClick={handleReset}>
            Reset
          </Button>
        ) : (
          <>
            <Button
              variant="outlined"
              size="small"
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={
                activeStep === steps.length - 1 ? handleTrain : handleNext
              }
              disabled={isNextDisabled()}
            >
              {activeStep === steps.length - 1 ? 'Train' : 'Next'}
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};
