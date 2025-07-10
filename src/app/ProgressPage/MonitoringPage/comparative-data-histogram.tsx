import { Box } from '@mui/material';
import ResponsiveCardVegaLite from '../../../shared/components/responsive-card-vegalite';
import InfoMessage from '../../../shared/components/InfoMessage';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useEffect } from 'react';
import type { RootState } from '../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import type { IAggregation } from '../../../shared/models/dataexploration.model';
import type { IDataAsset } from '../../../shared/models/experiment/data-asset.model';
import { fetchComparisonData } from '../../../store/slices/monitorPageSlice';

export interface IHistogramProps {
    columnName: string
    dataset: IDataAsset
    workflowId: string
}

const Histogram = ({ columnName, dataset, workflowId }: IHistogramProps) => {
  const dispatch = useAppDispatch();
  const aggregationFunction: IAggregation = {
    column: columnName,
    function: 'COUNT'
  };
  const histogramData = useAppSelector((state: RootState) =>
    state.monitorPage.comparativeDataExploration.dataAssetsHistograms?.[dataset.name]?.[workflowId]?.[columnName]?.histogram
  );

  const meta = useAppSelector((state: RootState) =>
    state.monitorPage.comparativeDataExploration.dataAssetsMetaData?.[dataset.name]?.[workflowId]?.meta
  );
  const metaLoading = meta.loading;

  useEffect(() => {
    const groupBy = [columnName];
    const aggregation = [aggregationFunction];
    const datasetId = dataset?.source || '';
    const existing = histogramData?.data?.data;
    const isLoading = histogramData?.loading;

    if (!datasetId || !columnName || isLoading || (Array.isArray(existing) && existing?.length > 0)) return;
    dispatch(
      fetchComparisonData({
        query: {
          dataSource: {
            source: datasetId,
            format: dataset?.format || '',
            sourceType: dataset?.sourceType || '',
            fileName: dataset?.name || ''
          },
          groupBy,
          aggregations: aggregation,
          filters: [],
          columns: groupBy,
          limit: 100
        },
        metadata: {
          workflowId: workflowId || '',
          queryCase: 'barChart',
          assetName: dataset.name,
          columnName: columnName
        },
      }),
    );
  }, [meta]);

function binData(
  data: { value: number; count: number }[],
  maxBinCount = 10
): { binLabel: string; xStart: number; count: number }[] {
  if (!Array.isArray(data) || data.length === 0) return [];

  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  if (range === 0) {
    const rounded = parseFloat(min.toFixed(2));
    return [
      {
        binLabel: `${rounded.toFixed(2)}`,
        xStart: rounded,
        count: data.reduce((acc, d) => acc + d.count, 0),
      },
    ];
  }

  const binCount = maxBinCount;
  const binSize = range / binCount;
  const roundedMin = Math.floor(min / binSize) * binSize;

  const bins = Array.from({ length: binCount }, (_, i) => {
    const binStart = roundedMin + i * binSize;
    const binEnd = binStart + binSize;
    return {
      binStart,
      binEnd,
      xStart: binStart,
      count: 0,
    };
  });

  for (const { value, count } of data) {
    if (typeof value !== 'number' || typeof count !== 'number') continue;
    const binIndex = Math.max(
      0,
      Math.min(Math.floor((value - roundedMin) / binSize), binCount - 1)
    );
    bins[binIndex].count += count;
  }

const getLabel = (start: number, end: number) => {
  return `${start.toFixed(2)} – ${end.toFixed(2)}`;
};

  return bins.map(b => ({
    binLabel: getLabel(b.binStart, b.binEnd),
    xStart: b.xStart,
    count: b.count,
  }));
}

  const rawData = histogramData?.data?.data || [];
  const countField = `count_${columnName}`;

  const isNumericColumn = Array.isArray(rawData) &&
  rawData.some(d => typeof d[columnName] === 'number');

  let chartData: { binLabel: string; count: number }[] = [];

  if (isNumericColumn) {
    const numericData = rawData
      .filter(d =>
        typeof d[columnName] === 'number' &&
        typeof d[countField] === 'number'
      )
      .map(d => ({
        value: d[columnName],
        count: d[countField],
      }));

    chartData = Array.isArray(numericData) ? binData(numericData) : [];

  } else {
    chartData = Array.isArray(rawData) ? rawData
      .filter(d =>
        typeof d[columnName] !== 'undefined' &&
      typeof d[countField] === 'number'
      )
      .map(d => ({
        binLabel: String(d[columnName]),
        count: d[countField],
      })) : [];
  }

  const specification = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: `Distribution of ${columnName}`,
    data: { values: chartData },
    mark: 'bar',
    encoding: {
      x: {
        field: 'binLabel',
        type: 'ordinal',
        title: columnName,
        axis: { labelAngle: -45 },
        sort: {
          op: 'min',
          field: 'xStart'
        }
      },
      y: {
        field: 'count',
        type: 'quantitative',
        title: 'Count',
      },
      tooltip: [
        { field: 'binLabel', type: 'nominal', title: columnName },
        { field: 'count', type: 'quantitative', title: 'Count' },
      ],
    },
  };

  const hasData = chartData.length > 0;

  const info = !hasData ? (
    <InfoMessage
      message="No data available."
      type="info"
      icon={<AssessmentIcon sx={{ fontSize: 40, color: 'info.main' }} />}
      fullHeight
    />
  ) : (
    <InfoMessage
      message= {histogramData?.error || 'Error fetching the data.'}
      type="info"
      icon={<AssessmentIcon sx={{ fontSize: 40, color: 'info.main' }} />}
      fullHeight
    />
  );

  const shouldShowInfoMessage = histogramData?.error !== null;

  return (
    <Box sx={{ height: '99%', width: '100%' }}>
      <ResponsiveCardVegaLite
        spec={specification}
        actions={false}
        title={''}
        maxHeight={300}
        infoMessage={info}
        showInfoMessage={shouldShowInfoMessage && !(histogramData?.loading || metaLoading)}
        loading={histogramData?.loading || metaLoading}
      />
    </Box>
  );
};

export default Histogram;
