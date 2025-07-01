import { Box, Tab, Tabs } from '@mui/material';
import type { RootState } from '../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { setSelectedComparisonTab } from '../../../store/slices/monitorPageSlice';
import ComparisonMetricsCharts from './comparison-metrics-charts';
import ComparisonModelsCharts from './comparison-models-charts';
import ComparisonDataCharts from './comparison-data-charts';
import ComparativeAnalysisControls from './comparative-analysis-controls';

const ComparativeAnalysis = () => {
  const { selectedComparisonTab } = useAppSelector(
    (state: RootState) => state.monitorPage,
  );
  const groupBy = useAppSelector(
    (state: RootState) => state.monitorPage.workflowsTable.groupBy,
  );

  const dispatch = useAppDispatch();

  if (groupBy.length > 0)
    dispatch(setSelectedComparisonTab(0));

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          borderColor: theme => theme.palette.customGrey.main,
          borderBottomWidth: 2,
          borderBottomStyle: 'solid',
          width: '100%',
        }}

      >
        <Tabs
          value={selectedComparisonTab}
          onChange={(event, newValue) => {
            dispatch(setSelectedComparisonTab(newValue));
          }}
          variant="scrollable"
          scrollButtons="auto"
          // aria-label="tab menu"
        >
          <Tab label="Metrics" />

          <Tab
            label="Models Insights"
            disabled={groupBy.length > 0}
          />

          <Tab
            label="Data"
            disabled={groupBy.length > 0}
          />

        </Tabs>
      </Box>
      <ComparativeAnalysisControls/>
      <Box sx={{ width: '100%', flexGrow: 1, overflow: 'auto' }}>
        {
          selectedComparisonTab === 0 && (
            <ComparisonMetricsCharts />
          )
        }
        {
          selectedComparisonTab === 1 && (
            <ComparisonModelsCharts />
          )
        }
        {
          selectedComparisonTab === 2 && (
            <ComparisonDataCharts />
          )
        }
      </Box>
    </Box>
  );

};

export default ComparativeAnalysis;
