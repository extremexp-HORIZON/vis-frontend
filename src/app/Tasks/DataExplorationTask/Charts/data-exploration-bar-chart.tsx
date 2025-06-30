import { Box, useTheme, useMediaQuery } from '@mui/material';
import ResponsiveCardVegaLite from '../../../../shared/components/responsive-card-vegalite';
import BarChartControlPanel from '../ChartControls/data-exploration-bar-control';
import InfoMessage from '../../../../shared/components/InfoMessage';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import { useEffect } from 'react';
import { fetchDataExplorationData } from '../../../../store/slices/dataExplorationSlice';

// Assuming dataExploration is passed as a prop or obtained from elsewhere
const BarChart = () => {
  const dispatch = useAppDispatch();
  const { tab } = useAppSelector(state => state.workflowPage);
  const theme = useTheme();

  const groupByCols = tab?.workflowTasks.dataExploration?.controlPanel.barGroupBy ?? [];

  const aggregationCols = tab?.workflowTasks.dataExploration?.controlPanel.barAggregation
    ?.map(aggr => aggr.column) ?? [];

  const cols = Array.from(
    new Set([
      ...groupByCols,
      ...aggregationCols,
    ])
  );

  const isSmallScreen = useMediaQuery(theme.breakpoints.down('xl'));

  useEffect(() => {
    const groupBy = tab?.workflowTasks.dataExploration?.controlPanel.barGroupBy;
    const aggregation =
      tab?.workflowTasks.dataExploration?.controlPanel.barAggregation;
    const datasetId = tab?.dataTaskTable.selectedItem?.data?.dataset?.source || '';
    const dataset = tab?.dataTaskTable.selectedItem?.data?.dataset;
    const filters = tab?.workflowTasks.dataExploration?.controlPanel.filters;

    if (
      !datasetId ||
      !groupBy?.length ||
      !aggregation?.length
    ) {
      return; // Don't dispatch if missing dataset, groupBy, or aggregation
    }
    dispatch(
      fetchDataExplorationData({
        query: {
          dataSource: {
            source: datasetId,
            format: dataset?.format || '',
            sourceType: dataset?.sourceType || '',
            fileName: dataset?.name || ''
          },
          groupBy,
          aggregations: aggregation,
          filters,
          columns: cols
        },
        metadata: {
          workflowId: tab?.workflowId || '',
          queryCase: 'barChart',
        },
      }),
    );
  }, [
    tab?.workflowTasks.dataExploration?.controlPanel.barGroupBy,
    tab?.workflowTasks.dataExploration?.controlPanel.barAggregation,
    tab?.dataTaskTable.selectedItem?.data?.dataset?.source,
    tab?.workflowTasks.dataExploration?.controlPanel.filters,
  ]);

  const columns = tab?.workflowTasks.dataExploration?.barChart.data?.columns;
  const xAxisColumn = columns?.find(col => col.type === 'STRING')?.name;
  const categoricalColumns = columns?.filter(
    col => col.type === 'STRING' && col.name !== xAxisColumn,
  );
  const yAxisColumns = columns
    ?.filter(col => ['DOUBLE', 'BIGINT', 'INTEGER', 'FLOAT'].includes(col.type))
    .map(col => col.name);

  // Transform the data into a suitable format for grouped bar chart
  const transformedData =
  Array.isArray(tab?.workflowTasks.dataExploration?.barChart.data?.data) && Array.isArray(yAxisColumns)
    ? tab?.workflowTasks.dataExploration?.barChart.data?.data.flatMap(item =>
      yAxisColumns.map(col => ({
        [xAxisColumn as string]: item[xAxisColumn as string],
        type: col,
        value: item[col],
        ...Object.fromEntries(
          (categoricalColumns || []).map(catCol => [
            catCol.name,
            item[catCol.name],
          ])
        ),
      }))
    )
    : [];

  const limitedData = transformedData?.slice(0, 20);

  const specification = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description:
      'A grouped bar chart showing different numeric values by category.',
    autosize: { type: 'fit', contains: 'padding', resize: true },
    data: { values: limitedData },
    mark: 'bar',
    params: [
      {
        name: 'industry',
        select: { type: 'point', fields: ['type'] },
        bind: 'legend',
      },
    ],
    encoding: {
      y: {
        field: xAxisColumn,
        type: 'nominal',
        axis: {
          labelAngle: 0,
          labelLimit: 100,
          labelOverlap: 'parity',
          tickCount: Math.floor(500 / 20), // Show only ticks that fit within height 800
        },
        sort: null,
      },
      x: {
        field: 'value',
        type: 'quantitative',
        title: 'Value',
      },
      color: {
        field: 'type',
        type: 'nominal',
        title: 'Metric',
        // legend:
        //   null
      },
      xOffset: {
        field: 'type',
        type: 'nominal',
      },
      tooltip: [
        { field: xAxisColumn, type: 'nominal', title: xAxisColumn },
        ...(categoricalColumns || []).map(col => ({
          field: col.name,
          type: 'nominal',
          title: col.name,
        })),
        { field: 'value', type: 'quantitative', title: 'Value' },
        { field: 'type', type: 'nominal', title: 'Metric' },
      ],
      opacity: {
        condition: { param: 'industry', value: 1 },
        value: 0.01,
      },
    },
  };

  const hasData = limitedData.length > 0;

  const hasValidAggregation = (
    Array.isArray(tab?.workflowTasks.dataExploration?.controlPanel.barAggregation) &&
  tab.workflowTasks.dataExploration.controlPanel.barAggregation.some(
    aggr => aggr?.column && aggr?.function
  )
  );

  const hasGroupBy =
    (tab?.workflowTasks.dataExploration?.controlPanel.barGroupBy || []).length >
    0;

  const info = !hasData ? (
    <InfoMessage
      message="No data available for the selected configuration."
      type="info"
      icon={<AssessmentIcon sx={{ fontSize: 40, color: 'info.main' }} />}
      fullHeight
    />
  ) : !hasGroupBy || !hasValidAggregation ? (
    <InfoMessage
      message="Please select both Group By and Aggregation to display the chart."
      type="info"
      icon={<AssessmentIcon sx={{ fontSize: 40, color: 'info.main' }} />}
      fullHeight
    />
  ) : (
    <InfoMessage
      message= {tab?.workflowTasks.dataExploration?.barChart.error || 'Error fetching the data.'}
      type="info"
      icon={<AssessmentIcon sx={{ fontSize: 40, color: 'info.main' }} />}
      fullHeight
    />
  );

  const shouldShowInfoMessage = !hasGroupBy || !hasValidAggregation || !hasData || tab?.workflowTasks.dataExploration?.barChart.error !== null;

  return (
    <Box sx={{ height: '99%' }}>
      <ResponsiveCardVegaLite
        spec={specification}
        actions={false}
        title={'Bar Chart'}
        maxHeight={500}
        aspectRatio={isSmallScreen ? 2.8 : 1.8}
        controlPanel={<BarChartControlPanel />}
        infoMessage={info}
        showInfoMessage={shouldShowInfoMessage && !(tab?.workflowTasks.dataExploration?.barChart?.loading || tab?.workflowTasks.dataExploration?.metaData?.loading)}
        loading={tab?.workflowTasks.dataExploration?.barChart?.loading || tab?.workflowTasks.dataExploration?.metaData?.loading}
      />
    </Box>
  );
};

export default BarChart;
