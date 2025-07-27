import { useMemo, useState } from 'react';
import type { SelectChangeEvent } from '@mui/material';
import {
  Button,
  Select,
  MenuItem,
  Box,
  InputLabel,
  FormControl,
  OutlinedInput,
  Tooltip,
  Divider,
} from '@mui/material';
import GlovesScatter from '../../Tasks/ModelAnalysisTask/plots/gloves-scatter';
import GlovesMetricSummary from './gloves-metric-summary';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { fetchAffected } from '../../../store/slices/modelAnalysisSlice';
import { fetchModelAnalysisExplainabilityPlot } from '../../../store/slices/explainabilitySlice';
import { useParams } from 'react-router-dom';

interface IValues {
  values: string[]
  index: number
  colour: string[]
}

const CGlanceExecution = () => {
  const { experimentId } = useParams();
  const [gcfSizes, setGcfSizes] = useState<Map<string, number>>(new Map());
  const availableCfMethods = useMemo(
    () => ['Dice', 'NearestNeighbors', 'RandomSampling'],
    [],
  );
  const availableActionStrategies = ['max-eff', 'min-cost', 'mean-action'];
  const [cfMethod, setCfMethod] = useState<string>('Dice'); // Default cfMethod,
  const [actionChoiceStrategy, setActionChoiceStrategy] =
    useState<string>('max-eff'); // Default actionChoiceStrategy = useMemo(() => "max-eff", [])
  const [gcfSize, setGcfSize] = useState<number>(3); // Default size
  const [selectedFeature, setSelectedFeature] = useState<string[]>([]); // Start with empty array
  const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState(true); // To control the collapse state
  const tab = useAppSelector(state => state.workflowPage.tab);

  const dispatch = useAppDispatch();

  const fetchData = async () => {
    try {
      // Dispatch global_counterfactuals
      await dispatch(
        fetchModelAnalysisExplainabilityPlot({
          query: {
            explanation_type: 'featureExplanation',
            explanation_method: 'global_counterfactuals',

            gcf_size: gcfSize,
            cfGenerator: cfMethod,
            clusterActionChoiceAlgo: actionChoiceStrategy,
          },
          metadata: {
            experimentId: experimentId || '',
            workflowId: tab?.workflowId || '',
            queryCase: 'globalCounterfactuals',
          },
        }),
      );

      // Dispatch affected
      await dispatch(
        fetchAffected({
          workflowId: tab?.workflowId || '',
          queryCase: 'affected',
        }),
      );

      console.log(
        'Dispatched global_counterfactuals and affected successfully.',
      );
    } catch (error) {
      console.error('Error dispatching data:', error);
    }
  };

  return (
    <>
      {/* Box container to arrange elements side by side */}
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="flex-start"
        gap={2}
        marginBottom={2}
        marginTop={2}
        width="98%"
        padding={1}
      >
        {/* GCF Size Dropdown */}
        <Tooltip
          title="The number of actions to be generated in the end of the algorithm"
          style={{ width: '100%' }}
        >
          <Box flex={1}>
            <FormControl fullWidth>
              <InputLabel id="gcf-size-select-label">
                Number of CounterFactual Actions
              </InputLabel>
              <Select
                MenuProps={{
                  PaperProps: { style: { maxHeight: 224, width: 250 } },
                }}
                labelId="gcf-size-select-label"
                input={
                  <OutlinedInput label="Number of CounterFactual Actions" />
                }
                value={gcfSize}
                onChange={(event: SelectChangeEvent<number | string>) =>
                  setGcfSize(Number(event.target.value))
                }
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map(value => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Tooltip>

        {/* CF Method Dropdown */}
        <Tooltip
          title="Methods that generate candidate counterfactual explanations"
          style={{ width: '100%' }}
        >
          <Box flex={1}>
            <FormControl fullWidth>
              <InputLabel id="cf-method-select-label">
                Local Counterfactual Method
              </InputLabel>
              <Select
                labelId="cf-method-select-label"
                input={<OutlinedInput label="Local Counterfactual Method" />}
                value={cfMethod}
                onChange={e => setCfMethod(e.target.value as string)}
                MenuProps={{
                  PaperProps: { style: { maxHeight: 224, width: 250 } },
                }}
              >
                {availableCfMethods.map(method => (
                  <MenuItem key={method} value={method}>
                    {method}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Tooltip>

        {/* Action Strategy Dropdown */}
        <Tooltip
          title="Different strategies for selecting the best actions from the generated counterfactuals based on different criteria"
          style={{ width: '100%' }}
        >
          <Box flex={1}>
            <FormControl fullWidth>
              <InputLabel id="action-choice-strategy-select-label">
                Action Choice Strategy
              </InputLabel>
              <Select
                MenuProps={{
                  PaperProps: { style: { maxHeight: 224, width: 250 } },
                }}
                labelId="action-choice-strategy-select-label"
                input={<OutlinedInput label="Action Choice Strategy" />}
                value={actionChoiceStrategy}
                onChange={e =>
                  setActionChoiceStrategy(e.target.value as string)
                }
              >
                {availableActionStrategies.map(strategy => (
                  <MenuItem key={strategy} value={strategy}>
                    {strategy}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Tooltip>

        {/* Run Button */}
        <Box>
          <Button variant="contained" onClick={fetchData} color="primary">
            Run
          </Button>
        </Box>
      </Box>

      <Divider
        sx={{
          my: 0.5,
          borderBottomWidth: 2,
          borderColor: 'grey.300',
        }}
      />
      <Box padding={2}>
        <GlovesMetricSummary />
        {tab?.workflowTasks?.modelAnalysis?.global_counterfactuals?.data
          ?.affectedClusters &&
        tab?.workflowTasks?.modelAnalysis?.affected?.data &&
        tab?.workflowTasks?.modelAnalysis?.global_counterfactuals?.data
          ?.actions &&
        tab?.workflowTasks?.modelAnalysis?.global_counterfactuals?.data
          ?.effCostActions ? (
            <GlovesScatter
              data1={
                tab.workflowTasks.modelAnalysis.global_counterfactuals.data
                  .affectedClusters
              }
              data2={tab.workflowTasks.modelAnalysis.affected.data}
              actions={
                tab.workflowTasks.modelAnalysis.global_counterfactuals.data
                  .actions
              }
              eff_cost_actions={
                tab.workflowTasks.modelAnalysis.global_counterfactuals.data
                  .effCostActions
              }
            />
          ) : (
            <></>
          )}
      </Box>
    </>
  );
};

export default CGlanceExecution;
