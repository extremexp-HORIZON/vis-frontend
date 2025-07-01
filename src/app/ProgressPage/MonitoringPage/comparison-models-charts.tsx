import type React from 'react';
import { useState } from 'react';
import type { RootState } from '../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import {
  Grid,
  Container,
  ButtonGroup,
  Button,
  Chip,
  Box,
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  IconButton,
  Menu,
  FormControlLabel,
  Divider,
  Card
} from '@mui/material';
import InfoMessage from '../../../shared/components/InfoMessage';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { setSelectedModelComparisonChart } from '../../../store/slices/monitorPageSlice';
import WindowRoundedIcon from '@mui/icons-material/WindowRounded';
import RoundedCornerRoundedIcon from '@mui/icons-material/RoundedCornerRounded';
import ComparisonModelConfusion from './ModelComparison/comparison-model-confusion';
import BlurLinearIcon from '@mui/icons-material/BlurLinear';
import ComparisonModelInstance from './ModelComparison/comparison-model-instance';
import ComparisonModelRoc from './ModelComparison/comparison-model-roc';
import type { TestInstance } from '../../../shared/models/tasks/model-analysis.model';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import theme from '../../../mui-theme';
import SettingsIcon from '@mui/icons-material/Settings';
import { SectionHeader } from '../../../shared/components/responsive-card-table';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';

interface ControlPanelProps {
  xAxisOption: string
  yAxisOption: string
  setXAxisOption: (val: string) => void
  setYAxisOption: (val: string) => void
  options: string[]
  plotData: {
    data: TestInstance[] | null
    loading: boolean
    error: string | null
  } | null

}

const ControlPanel = ({
  xAxisOption,
  yAxisOption,
  setXAxisOption,
  setYAxisOption,
  options,
  plotData,

}: ControlPanelProps) => {
  const handleAxisSelection =
    (axis: 'x' | 'y') => (e: { target: { value: string } }) => {
      if (axis === 'x') setXAxisOption(e.target.value);
      else setYAxisOption(e.target.value);
    };

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, px: 1.5 }}>

        {/* X-Axis Selector */}
        <FormControl fullWidth>
          <InputLabel id="x-axis-select-label">
            <Box display="flex" alignItems="center" gap={1}>
              <ShowChartIcon fontSize="small" />
                X-Axis
            </Box>
          </InputLabel>
          <Select
            labelId="x-axis-select-label"
            label="X-Axis-----"
            // disabled={plotData?.loading || !plotData?.data}
            value={xAxisOption}
            onChange={handleAxisSelection('x')}
            MenuProps={{
              PaperProps: { style: { maxHeight: 224, width: 250 } },
            }}
          >
            {options
              .filter(option => option !== yAxisOption)
              .map((feature, idx) => (
                <MenuItem key={`xAxis-${feature}-${idx}`} value={feature}>
                  {feature}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel id="y-axis-select-label">
            <Box display="flex" alignItems="center" gap={1}>
              <ShowChartIcon fontSize="small" />
                Y-Axis
            </Box>
          </InputLabel>
          <Select
            labelId="y-axis-select-label"
            label="Y-Axis-----"
            // disabled={plotData?.loading || !plotData?.data}
            value={yAxisOption}
            onChange={handleAxisSelection('y')}
            MenuProps={{
              PaperProps: { style: { maxHeight: 224, width: 250 } },
            }}
          >
            {options
              .filter(option => option !== xAxisOption)
              .map((feature, idx) => (
                <MenuItem key={`yAxis-${feature}-${idx}`} value={feature}>
                  {feature}
                </MenuItem>
              ))}

            {options.filter(option => option !== xAxisOption).length === 0 && (
              <MenuItem disabled value="">
                No available options
              </MenuItem>
            )}
          </Select>
        </FormControl>
      </Box>

    </>
  );
};
const ComparisonModelsCharts: React.FC = () => {
 
  const { workflowsTable, selectedModelComparisonChart ,showMisclassifiedOnly} = useAppSelector(
    (state: RootState) => state.monitorPage,
  );
  const isMosaic = useAppSelector(
    (state: RootState) => state.monitorPage.isMosaic,
  );
  const selectedWorkflowIds = workflowsTable.selectedWorkflows;

  const [options, setOptions] = useState<string[]>([]);
  const [xAxisOption, setXAxisOption] = useState<string>('');
  const [yAxisOption, setYAxisOption] = useState<string>('');

  if (selectedWorkflowIds.length === 0) {
    return (
      <InfoMessage
        message="Select Workflows to display comparisons over models."
        type="info"
        icon={<AssessmentIcon sx={{ fontSize: 40, color: 'info.main' }} />}
        fullHeight
      />
    );
  }


  return (
    <Container maxWidth={false} sx={{ padding: 2 }}>
<Grid
  container
  justifyContent="space-between"
  alignItems="center"
  sx={{ marginBottom: 2, flexWrap: 'wrap', gap: 2 }}
>
        {/* Left-aligned Button Group */}


      
      </Grid>



      <Grid container spacing={2} sx={{ width: '100%', margin: '0 auto', flexWrap: 'wrap' }}>
        {selectedModelComparisonChart === 'confusionMatrix' && <ComparisonModelConfusion isMosaic={isMosaic} />}
      </Grid>
      <Grid container spacing={2} sx={{ width: '100%', margin: '0 auto', flexWrap: 'wrap' }}>
        {selectedModelComparisonChart === 'rocCurve' && <ComparisonModelRoc isMosaic={isMosaic} />}
      </Grid>
      <Grid container spacing={2} sx={{ width: '100%', margin: '0 auto', flexWrap: 'wrap' }}>
        {selectedModelComparisonChart === 'instanceView' && <ComparisonModelInstance
          isMosaic={isMosaic}
          showMisclassifiedOnly={showMisclassifiedOnly}
          xAxisOption={xAxisOption}
          yAxisOption={yAxisOption}
          setXAxisOption={setXAxisOption}
          setYAxisOption={setYAxisOption}
          options={options}
          setOptions={setOptions}
        />}
      </Grid>
    </Container>
  );
};

export default ComparisonModelsCharts;
