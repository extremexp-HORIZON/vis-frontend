import { Box, useTheme, useMediaQuery } from '@mui/material';
import ResponsiveCardVegaLite from '../../../../shared/components/responsive-card-vegalite';
import InfoMessage from '../../../../shared/components/InfoMessage';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import { useEffect } from 'react';
import { fetchDataExplorationData } from '../../../../store/slices/dataExplorationSlice';
import HeatMapControlPanel from '../ChartControls/data-exploration-heatmap-control';

// Assuming dataExploration is passed as a prop or obtained from elsewhere
const HeatMap = () => {
  const dispatch = useAppDispatch();
  const { tab } = useAppSelector(state => state.workflowPage);
  const theme = useTheme();

  const isSmallScreen = useMediaQuery(theme.breakpoints.down('xl'));

  useEffect(() => {
    const groupBy =
      tab?.workflowTasks.dataExploration?.controlPanel.barGroupByHeat;
    const aggregation =
      tab?.workflowTasks.dataExploration?.controlPanel.barAggregationHeat;
    const datasetId = tab?.dataTaskTable.selectedItem?.data?.dataset?.source || '';
    const dataset = tab?.dataTaskTable.selectedItem?.data?.dataset;
    const filters = tab?.workflowTasks.dataExploration?.controlPanel.filters;
    const groupByCols = groupBy ?? [];

    const aggregationCols = aggregation?.map(aggr => aggr.column) ?? [];
    const cols = Array.from(
      new Set([
        ...groupByCols,
        ...aggregationCols,
      ])
    );

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
          queryCase: 'heatChart',
        },
      }),
    );
  }, [
    tab?.workflowTasks.dataExploration?.controlPanel.barGroupByHeat,
    tab?.workflowTasks.dataExploration?.controlPanel.barAggregationHeat,
    tab?.dataTaskTable.selectedItem?.data?.dataset?.source,
    tab?.workflowTasks.dataExploration?.controlPanel.filters,
    dispatch,
    tab?.workflowId,
  ]);

  const columns = tab?.workflowTasks.dataExploration?.heatChart.data?.columns;
  const xAxisColumn = columns?.find(col => col.type === 'STRING')?.name;

  const categoricalColumns = columns?.filter(
    col => col.type === 'STRING' && col.name !== xAxisColumn,
  );
  const yAxisColumns = columns
    ?.filter(col => ['DOUBLE', 'BIGINT', 'INTEGER', 'FLOAT'].includes(col.type))
    .map(col => col.name);

  // Transform the data into a suitable format for grouped bar chart
  const transformedData =
  Array.isArray(tab?.workflowTasks.dataExploration?.heatChart.data?.data) &&
  Array.isArray(yAxisColumns)
    ? tab.workflowTasks.dataExploration.heatChart.data.data.flatMap(
      (item: { [x: string]: unknown }) =>
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

  const limitedData = transformedData?.slice(0, 20); // Limit to 500 rows

  const groupByFields =
    tab?.workflowTasks.dataExploration?.controlPanel.barGroupByHeat || [];

  let specification;

  if (groupByFields.length === 2) {
    // Render heatmap
    specification = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      description:
        'Heatmap showing aggregation values by two categorical variables.',
      data: { values: limitedData },
      mark: 'rect',
      encoding: {
        x: {
          field: groupByFields[0],
          type: 'nominal',
          axis: { title: groupByFields[0] },
        },
        y: {
          field: groupByFields[1],
          type: 'nominal',
          axis: { title: groupByFields[1] },
        },
        color: {
          field: 'value',
          type: 'quantitative',
          title: 'Value',
        },
        tooltip: [
          { field: groupByFields[0], type: 'nominal' },
          { field: groupByFields[1], type: 'nominal' },
          { field: 'value', type: 'quantitative' },
          { field: 'type', type: 'nominal' },
        ],
      },
    };
  } else {
    // Fallback to your current bar chart spec
    specification = {
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
            tickCount: Math.floor(500 / 20),
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
  }

  const hasData = limitedData.length > 0;

  const hasValidAggregation = (
    Array.isArray(tab?.workflowTasks.dataExploration?.controlPanel.barAggregationHeat) &&
  tab.workflowTasks.dataExploration.controlPanel.barAggregationHeat.some(
    aggr => aggr?.column && aggr?.function
  )
  );

  const hasGroupBy =
    (tab?.workflowTasks.dataExploration?.controlPanel.barGroupByHeat || [])
      .length > 0;

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

  const shouldShowInfoMessage = !hasGroupBy || !hasValidAggregation || !hasData || tab?.workflowTasks.dataExploration?.heatChart.error !== null;

  return (
    <Box sx={{ height: '99%' }}>
      <ResponsiveCardVegaLite
        spec={specification}
        actions={false}
        title={'Heatmap'}
        maxHeight={500}
        aspectRatio={isSmallScreen ? 2.8 : 1.8}
        controlPanel={<HeatMapControlPanel />}
        infoMessage={info}
        showInfoMessage={shouldShowInfoMessage && !(tab?.workflowTasks.dataExploration?.heatChart?.loading || tab?.workflowTasks.dataExploration?.metaData?.loading)}
        loading={tab?.workflowTasks.dataExploration?.heatChart?.loading || tab?.workflowTasks.dataExploration?.metaData?.loading}
      />
    </Box>
  );
};

export default HeatMap;
