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
  FormControlLabel
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
  const dispatch = useAppDispatch();
  const { workflowsTable, selectedModelComparisonChart } = useAppSelector(
    (state: RootState) => state.monitorPage,
  );
  const [isMosaic, setIsMosaic] = useState(true);

  const selectedWorkflowIds = workflowsTable.selectedWorkflows;
  const [showMisclassifiedOnly, setShowMisclassifiedOnly] = useState(true);

  const options1 = [
    { label: 'confusionMatrix', name: 'Confusion\nMatrix', icon: <WindowRoundedIcon /> },
    { label: 'rocCurve', name: 'Roc\nCurve', icon: <RoundedCornerRoundedIcon /> },
    { label: 'instanceView', name: 'Instance\nView', icon: <BlurLinearIcon /> }
  ];

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

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Container maxWidth={false} sx={{ padding: 2 }}>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ marginBottom: 2 }} gap={1}>

        {/* Left-aligned Button Group */}
        <Grid item>
          <Box
            display="flex"
            flexWrap="wrap"
            gap={1}
          >
            {options1.map(option => (
              <Chip
                key={option.label}
                label={option.name}
                icon={option.icon}
                clickable
                sx={{
                  height: 40,
                  // width: 150,
                  background:
                    selectedModelComparisonChart === option.label
                      ? undefined
                      : theme.palette.customGrey.light,
                  px: 2,
                  borderRadius: 2,
                  fontWeight: 500,
                  '& .MuiChip-icon': {
                    fontSize: 25,
                    marginLeft: 0,
                    marginRight: 0.1
                  },
                  '& .MuiChip-label': {
                    whiteSpace: 'pre-line',
                    textAlign: 'left',
                    lineHeight: 1.2,
                  },
                }}
                color={selectedModelComparisonChart === option.label ? 'primary' : 'default'}
                variant={selectedModelComparisonChart === option.label ? 'filled' : 'outlined'}
                onClick={() => dispatch(setSelectedModelComparisonChart(option.label))}
              />
            ))}
          </Box>
        </Grid>

        <Grid item>

          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Checkbox
                checked={showMisclassifiedOnly}
                size="small"
                onChange={(e) => setShowMisclassifiedOnly(e.target.checked)}
              />
              <Typography variant="body1">Misclassified</Typography>
            </Box> */}
            {selectedModelComparisonChart === 'instanceView' && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showMisclassifiedOnly}
                    size="small"
                    onChange={(e) => setShowMisclassifiedOnly(e.target.checked)}
                  />
                }
                label="Misclassified"
                sx={{ ml: 0.5 }}

              />

            )}

            <ButtonGroup variant="contained" aria-label="view mode" sx={{ height: '25px' }}>
              <Button
                variant={isMosaic ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setIsMosaic(true)}
              >
            Mosaic
              </Button>
              <Button
                variant={!isMosaic ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setIsMosaic(false)}
              >
            Stacked
              </Button>
            </ButtonGroup>
            {selectedModelComparisonChart === 'instanceView' && (
              <>
                <IconButton
                  aria-label="settings"
                  onClick={handleMenuClick}
                  sx={{
                    position: 'relative',
                    '& svg': { zIndex: 1, position: 'relative' },
                  }}
                >
                  <SettingsIcon />
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={menuOpen}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  PaperProps={{
                    elevation: 3,
                    sx: {
                      width: 320,
                      maxHeight: 500,
                      padding: 0,
                      borderRadius: '12px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.16)',
                      border: '1px solid rgba(0,0,0,0.04)',
                      mt: 0,
                    },
                  }}
                  MenuListProps={{
                    sx: {
                      pt: 0,
                    }
                  }}
                >
                  <SectionHeader
                    icon={<SettingsSuggestIcon fontSize="small" />}
                    title="Control Options"
                  />

                  {/* Checkbox */}

                  {/* Control Panel */}
                  <Box sx={{ mt: 2 }}>
                    <ControlPanel
                      xAxisOption={xAxisOption}
                      yAxisOption={yAxisOption}
                      setXAxisOption={setXAxisOption}
                      setYAxisOption={setYAxisOption}
                      options={options}
                      plotData={null}
                    />
                  </Box>
                </Menu>
              </>
            )}
            {/* {selectedModelComparisonChart === 'instanceView' && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox
                  checked={showMisclassifiedOnly}
                  size="small"
                  onChange={(e) => setShowMisclassifiedOnly(e.target.checked)}
                />
                <Typography variant="body1" >
          Show Misclassified
                </Typography>
                 <ControlPanel
      xAxisOption={xAxisOption}
      yAxisOption={yAxisOption}
      setXAxisOption={setXAxisOption}
      setYAxisOption={setYAxisOption}
      options={options}
      plotData={null} // not needed here visually but must be passed; can be adjusted
    />
              </Box>
            )} */}
          </Box>
        </Grid>

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
