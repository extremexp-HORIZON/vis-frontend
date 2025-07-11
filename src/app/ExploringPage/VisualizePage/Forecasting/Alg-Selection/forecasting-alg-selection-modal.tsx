import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import { useEffect, useState } from 'react';
import {
  AlgorithmName,
  IXGBoostIntervals,
  ILGBMIntervals,
  IXGBoostDefaultFT,
  IXGBoostDefault,
  ILGBMDefaultFT,
  ILGBMDefault,
  IStringParameters,
} from '../../../../../shared/models/exploring/forecasting.model';
import { setForecastingForm } from '../../../../../store/slices/exploring/forecastingSlice';
import {
  RootState,
  useAppDispatch,
  useAppSelector,
} from '../../../../../store/store';

export interface IForecastingAlgSelectionModal {
  algorithmName: AlgorithmName;
}

export const ForecastingAlgSelectionModal = ({
  algorithmName,
}: IForecastingAlgSelectionModal) => {
  const dispatch = useAppDispatch();
  const { forecastingForm } = useAppSelector(
    (state: RootState) => state.forecasting,
  );
  const [open, setOpen] = useState(false);
  const [fineTuneSelection, setFineTuneSelection] = useState<string[]>([]);
  const [algoParameters, setAlgoParameters] = useState<
    typeof IXGBoostIntervals | typeof ILGBMIntervals | null
  >(null);

  useEffect(() => {
    if (algorithmName === 'XGBoost') {
      setAlgoParameters(IXGBoostIntervals);
    } else if (algorithmName === 'LGBM') {
      setAlgoParameters(ILGBMIntervals);
    }
  }, [algorithmName]);

  const handleFineTuneCheckbox = (algName: string) => (checked: boolean) => {
    if (checked) {
      setFineTuneSelection(state => [...state, algName]);
    } else {
      setFineTuneSelection(state => state.filter(n => n !== algName));
    }

    const newAlgo =
      algName === 'XGBoost'
        ? checked
          ? IXGBoostDefaultFT
          : IXGBoostDefault
        : algName === 'LGBM'
          ? checked
            ? ILGBMDefaultFT
            : ILGBMDefault
          : null;

    if (newAlgo) {
      dispatch(
        setForecastingForm({
          ...forecastingForm,
          algorithms: {
            ...forecastingForm.algorithms,
            [algName]: newAlgo,
          },
        }),
      );
    }
  };

  const handleFTNumericBoxChange =
    (parameter: string, idx: number) => (value: string) => {
      const algoConfig = forecastingForm.algorithms[algorithmName] as Record<
        string,
        unknown
      >;
      if (!algoConfig || !Array.isArray(algoConfig[parameter])) return;

      const arrayCopy = [...(algoConfig[parameter] as number[])];
      arrayCopy[idx] = parseFloat(value);
      dispatch(
        setForecastingForm({
          ...forecastingForm,
          algorithms: {
            ...forecastingForm.algorithms,
            [algorithmName]: {
              ...algoConfig,
              [parameter]: arrayCopy,
            },
          },
        }),
      );
    };

  const handleNumericBoxChange = (parameter: string) => (value: string) => {
    dispatch(
      setForecastingForm({
        ...forecastingForm,
        algorithms: {
          ...forecastingForm.algorithms,
          [algorithmName]: {
            ...forecastingForm.algorithms[algorithmName],
            [parameter]: parseFloat(value),
          },
        },
      }),
    );
  };

  const handleStringBoxChange = (parameter: string) => (value: string) => {
    dispatch(
      setForecastingForm({
        ...forecastingForm,
        algorithms: {
          ...forecastingForm.algorithms,
          [algorithmName]: {
            ...forecastingForm.algorithms[algorithmName],
            [parameter]: value,
          },
        },
      }),
    );
  };

  const prettyPrintJSON = (obj: unknown) => JSON.stringify(obj, null, 2);

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        onClick={() => setOpen(true)}
        disabled={
          !Object.keys(forecastingForm.algorithms).includes(algorithmName)
        }
      >
        Configure
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Configuration</DialogTitle>
        <DialogContent sx={{ display: 'flex', gap: 2, height: 500 }}>
          {/* Left Panel */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              paddingRight: 16,
              borderRight: '1px solid #ccc',
            }}
          >
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={fineTuneSelection.includes(algorithmName)}
                    onChange={e =>
                      handleFineTuneCheckbox(algorithmName)(e.target.checked)
                    }
                  />
                }
                label="Fine Tune"
              />
            </FormGroup>

            {Object.keys(forecastingForm.algorithms[algorithmName] || {}).map(
              par => {
                const algoConfig = forecastingForm.algorithms[algorithmName];
                if (!algoConfig) return null;

                // Use type assertion for property access
                const value = (algoConfig as Record<string, unknown>)[par];

                return (
                  <div key={par} style={{ marginTop: 16 }}>
                    <InputLabel sx={{ fontWeight: 600 }}>{par}</InputLabel>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      {typeof value !== 'string' ? (
                        fineTuneSelection.includes(algorithmName) ? (
                          ['Min', 'Max', 'Step'].map((label, idx) => (
                            <TextField
                              key={`${par}-${label}`}
                              label={label}
                              type="number"
                              value={Array.isArray(value) ? value[idx] : ''}
                              fullWidth
                              onChange={e =>
                                handleFTNumericBoxChange(
                                  par,
                                  idx,
                                )(e.target.value)
                              }
                            />
                          ))
                        ) : (
                          <TextField
                            type="number"
                            fullWidth
                            value={value as number}
                            onChange={e =>
                              handleNumericBoxChange(par)(e.target.value)
                            }
                          />
                        )
                      ) : (
                        <FormControl fullWidth>
                          <InputLabel id={`${par}-label`}>
                            Select {par}
                          </InputLabel>
                          <Select
                            labelId={`${par}-label`}
                            value={value}
                            onChange={e =>
                              handleStringBoxChange(par)(e.target.value)
                            }
                          >
                            {Object.prototype.hasOwnProperty.call(
                              IStringParameters,
                              par,
                            ) &&
                              (
                                IStringParameters as unknown as Record<
                                  string,
                                  string[]
                                >
                              )[par]?.map((val: string) => (
                                <MenuItem key={val} value={val}>
                                  {val}
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                      )}
                    </div>
                  </div>
                );
              },
            )}
          </div>

          {/* Right Panel */}
          <div style={{ flex: 1, padding: 16, overflowY: 'auto' }}>
            <h2
              style={{
                fontWeight: 'bold',
                fontSize: 18,
                color: '#666',
                marginBottom: 12,
              }}
            >
              {algorithmName} parameters
            </h2>
            <pre
              style={{
                backgroundColor: '#f7f7f7',
                color: '#0366d6',
                padding: 16,
                borderRadius: 8,
                fontSize: 14,
                overflowX: 'auto',
              }}
            >
              {forecastingForm.algorithms[algorithmName] &&
                prettyPrintJSON(forecastingForm.algorithms[algorithmName])}
            </pre>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
