import { Box, useTheme, useMediaQuery, Grid } from '@mui/material';
import { useEffect } from 'react';
import { cloneDeep } from 'lodash'; // Import lodash for deep cloning
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import ResponsiveCardVegaLite from '../../../../shared/components/responsive-card-vegalite';
import InfoMessage from '../../../../shared/components/InfoMessage';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ScatterChartControlPanel from '../ChartControls/data-exploration-scatter-control';
import Uchart from './data-exploration-u-chart';
import type { VisualColumn } from '../../../../shared/models/dataexploration.model';
import { fetchDataExplorationData } from '../../../../store/slices/dataExplorationSlice';

type ScatterChartDataRow = Record<string, number | string | Date | null>;

const getColumnType = (columnType: string, fieldName?: string) => {
  if (fieldName?.toLowerCase() === 'timestamp') return 'temporal';
  switch (columnType) {
    case 'DOUBLE':
    case 'FLOAT':
    case 'INTEGER':
      return 'quantitative';
    case 'LOCAL_DATE_TIME':
      return 'temporal';
    case 'STRING':
    default:
      return 'ordinal';
  }
};

const MAX_UNIQUE_VALUES = 50;

const getUniqueValueCount = (data: ScatterChartDataRow[], field: string): number => {
  const values = new Set();

  data.forEach(row => values.add(row[field]));

  return values.size;
};

const isTooManyUniqueValues = (field: VisualColumn | undefined, data: ScatterChartDataRow[]) =>
  field?.type === 'STRING' && getUniqueValueCount(data, field.name) > MAX_UNIQUE_VALUES;

const getScatterChartOverlaySpec = ({
  data,
  xAxis,
  yAxis,
  colorBy,
}: {
  data: ScatterChartDataRow[]
  xAxis: VisualColumn
  yAxis: VisualColumn[]
  colorBy?: VisualColumn
}) => {
  const colorField = colorBy?.name;
  const colorType = colorBy ? getColumnType(colorBy.type, colorBy.name) : undefined;

  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: { values: cloneDeep(data) },
    selection: {
      brush: { type: 'interval', encodings: ['x', 'y'] },
    },
    layer: yAxis.map(y => ({
      mark: 'point',
      encoding: {

        x: {
          field: xAxis.name,
          type: getColumnType(xAxis.type, xAxis.name),
          axis: {
            title: xAxis.name,
            labelLimit: 30,
            labelOverlap: true
          }

        },
        y: {
          field: y.name,
          type: getColumnType(y.type, y.name),
          // axis: { title: y.name },
          title: 'Value'
        },
        ...(colorField && !isTooManyUniqueValues(colorBy, data) && {
          color: {
            field: colorField,
            type: colorType,
            legend: {
              title: colorField,
              labelLimit: 20,
              symbolLimit: 50
            },            scale: {
              range: ['#d9f0a3', '#74c476', '#238b8d', '#084081']

            }
          },
        }),
        tooltip: [
          { field: xAxis.name, type: getColumnType(xAxis.type, xAxis.name) },
          { field: y.name, type: getColumnType(y.type, y.name) },
          ...(colorField ? [{ field: colorField, type: colorType }] : []),
        ],
      },
    })),
  };
};

const getSingleScatterSpec = ({
  data,
  xAxis,
  y,
  colorBy,
}: {
  data: ScatterChartDataRow[]
  xAxis: VisualColumn
  y: VisualColumn
  colorBy?: VisualColumn
}) => {
  const colorField = colorBy?.name;
  const colorType = colorBy ? getColumnType(colorBy.type, colorBy.name) : undefined;

  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: { values: cloneDeep(data) },
    mark: 'point',
    encoding: {
      x: {
        field: xAxis.name,
        type: getColumnType(xAxis.type, xAxis.name),
        axis: { title: xAxis.name },
      },
      y: {
        field: y.name,
        type: getColumnType(y.type, y.name),
        axis: { title: y.name },
        // title:"Value"
      },
      ...(colorField && {
        color: {
          field: colorField,
          type: colorType,
          legend: { title: colorField },
          scale: {
            range: ['#ffffcc', '#a1dab4', '#41b6c4', '#225ea8']
          }
        },
      }),
      tooltip: [
        { field: xAxis.name, type: getColumnType(xAxis.type, xAxis.name) },
        { field: y.name, type: getColumnType(y.type, y.name) },
        ...(colorField ? [{ field: colorField, type: colorType }] : []),
      ],
    },
  };
};

const ScatterChart = () => {
  const { tab } = useAppSelector(state => state.workflowPage);
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('xl'));

  const chartData = (tab?.workflowTasks.dataExploration?.lineChart?.data?.data as ScatterChartDataRow[]) ?? [];
  const xAxis = tab?.workflowTasks.dataExploration?.controlPanel.xAxis;
  const yAxis = tab?.workflowTasks.dataExploration?.controlPanel.yAxis;
  const colorBy = tab?.workflowTasks?.dataExploration?.controlPanel?.colorBy;
  const displayMode = tab?.workflowTasks.dataExploration?.controlPanel?.viewMode || 'overlay';
  const umap = tab?.workflowTasks.dataExploration?.controlPanel.umap;

  useEffect(() => {
    const filters = tab?.workflowTasks.dataExploration?.controlPanel.filters;
    const datasetId = tab?.dataTaskTable.selectedItem?.data?.dataset?.source || '';
    const dataset = tab?.dataTaskTable.selectedItem?.data?.dataset;

    const cols = Array.from(
      new Set(
        [
          colorBy?.name,
          xAxis?.name,
          ...(yAxis?.map((axis: VisualColumn) => axis.name) || [])
        ].filter((name): name is string => typeof name === 'string' && name.trim() !== '')
      )
    );

    if (!datasetId || !xAxis || !yAxis?.length) return;

    dispatch(
      fetchDataExplorationData({
        query: {
          dataSource: {
            source: datasetId,
            format: dataset?.format || '',
            sourceType: dataset?.sourceType || '',
            fileName: dataset?.name || ''
          },
          columns: cols,
          filters,
        },
        metadata: {
          workflowId: tab?.workflowId || '',
          queryCase: 'scatterChart',
        },
      })
    );
  }, [
    tab?.workflowTasks.dataExploration?.controlPanel.xAxis,
    tab?.workflowTasks.dataExploration?.controlPanel.yAxis,
    tab?.workflowTasks.dataExploration?.controlPanel.filters,
    tab?.dataTaskTable.selectedItem?.data?.dataset?.source,
    tab?.workflowTasks.dataExploration?.controlPanel.colorBy,
  ]);

  const hasData = Array.isArray(chartData) && chartData.length > 0;

  const hasValidXAxis = xAxis && xAxis.name;
  const hasValidYAxis = Array.isArray(yAxis) && yAxis.length > 0;
  const hasValidColorBy = colorBy && colorBy.name;

  let infoMessageText = '';

  if (!hasValidXAxis || !hasValidYAxis || !hasValidColorBy) {
    infoMessageText = 'Please select x-Axis, y-Axis and color fields to display the chart.';
  } else if (!hasData) {
    infoMessageText = 'No data available for the selected configuration.';
  }

  const info = (
    <InfoMessage
      message={infoMessageText}
      type="info"
      icon={<AssessmentIcon sx={{ fontSize: 40, color: 'info.main' }} />}
      fullHeight
    />
  );

  const shouldShowInfoMessage = !hasValidXAxis || !hasValidYAxis || !hasValidColorBy || !hasData;

  return (
    <Box sx={{ height: '99%' }}>
      {umap ? (
        <Uchart />
      ) : shouldShowInfoMessage &&
      !(tab?.workflowTasks.dataExploration?.scatterChart?.loading
        || tab?.workflowTasks.dataExploration?.metaData?.loading) ? (
          <ResponsiveCardVegaLite
            spec={{}}
            title="Scatter Chart"
            actions={false}
            controlPanel={<ScatterChartControlPanel />}
            infoMessage={info}
            showInfoMessage={true}
            maxHeight={isSmallScreen ? undefined : 500}
            aspectRatio={isSmallScreen ? 2.8 : 1.8}
          />
        ) : displayMode === 'overlay' ? (
          <ResponsiveCardVegaLite
            spec={getScatterChartOverlaySpec({
              data: Array.isArray(chartData) ? chartData : [],
              xAxis: xAxis as VisualColumn,
              yAxis: yAxis as VisualColumn[],
              colorBy: colorBy as VisualColumn,
            })}
            title="Scatter Chart"
            actions={false}
            controlPanel={<ScatterChartControlPanel />}
            blinkOnStart={false}
            infoMessage={info}
            showInfoMessage={false}
            maxHeight={500}
            aspectRatio={isSmallScreen ? 2.8 : 1.8}
            loading={tab?.workflowTasks.dataExploration?.scatterChart?.loading || tab?.workflowTasks.dataExploration?.metaData?.loading}
            minHeight={300}
          />
        ) : (
          <Grid container spacing={2}>
            {yAxis?.map(y => (
              <Grid item xs={12} key={y.name}>
                <ResponsiveCardVegaLite
                  spec={getSingleScatterSpec({
                    data: Array.isArray(chartData) ? chartData : [],
                    xAxis: xAxis as VisualColumn,
                    y,
                    colorBy: colorBy as VisualColumn,
                  })}
                  title={y.name}
                  actions={false}
                  controlPanel={<ScatterChartControlPanel />}
                  loading={tab?.workflowTasks.dataExploration?.scatterChart?.loading || tab?.workflowTasks.dataExploration?.metaData?.loading}
                  isStatic={false}
                />
              </Grid>
            ))}
          </Grid>
        )}
    </Box>
  );
};

export default ScatterChart;
