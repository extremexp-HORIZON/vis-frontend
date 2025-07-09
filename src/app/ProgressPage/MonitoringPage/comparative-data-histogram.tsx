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

  const rawData = histogramData?.data?.data || [];
  const valueField = columnName;
  const countField = `count_${columnName}`;
  const transformedData = Array.isArray(rawData)
    ? rawData.map(item => ({
      value: item[valueField],
      count: item[countField],
    }))
    : [];

  const specification = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: `Histogram of ${columnName}`,
    data: { values: transformedData },
    mark: 'bar',
    encoding: {
      x: {
        field: 'value',
        type: 'nominal',
        bin: {
            maxbins: 10
        },
        axis: { labelAngle: -45, labelOverlap: true },
        title: columnName,
      },
      y: {
        aggregate: 'sum',
        field: 'count',
        type: 'quantitative',
        title: 'Count',
      },
      tooltip: [
        { field: 'value', type: 'nominal', title: columnName },
        { field: 'count', type: 'quantitative', title: 'Count' },
      ],
    },
  };

  const hasData = transformedData.length > 0;

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
        title={'Histogram'}
        maxHeight={300}
        infoMessage={info}
        showInfoMessage={shouldShowInfoMessage && !(histogramData?.loading || metaLoading)}
        loading={histogramData?.loading || metaLoading}
      />
    </Box>
  );
};

export default Histogram;
