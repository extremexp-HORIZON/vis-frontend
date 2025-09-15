import './visualize.css';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import {
  type RootState,
  useAppDispatch,
  useAppSelector,
} from '../../../store/store';
import {
  postFileMeta,
  resetDatasetState,
} from '../../../store/slices/exploring/datasetSlice';
import Loader from '../../../shared/components/loader';
import { Map } from './Map/map';
import Stats from './Stats/stats';
import { VisControl } from './VisControl/vis-control';
import { Chart } from './Chart/chart';
import { TimeSeriesChart } from './TimeSeriesChart/time-series-chart';
import { getDataSource } from '../../../store/slices/exploring/datasourceSlice';
import { resetChartState } from '../../../store/slices/exploring/chartSlice';
import { resetMapState } from '../../../store/slices/exploring/mapSlice';
import { resetStatsState } from '../../../store/slices/exploring/statsSlice';
import { resetTimeSeriesState } from '../../../store/slices/exploring/timeSeriesSlice';
import { resetZoneState } from '../../../store/slices/exploring/zoneSlice';

const VisualizePage = () => {
  const { datasetId } = useParams();
  const dispatch = useAppDispatch();
  const [isChartFullscreen, setIsChartFullscreen] = useState(false);
  const { dataset, loading } = useAppSelector(
    (state: RootState) => state.dataset,
  );

  const toggleChartFullscreen = React.useCallback(() => {
    setIsChartFullscreen(!isChartFullscreen);
  }, [isChartFullscreen]);
  const { drawnRect, selectedGeohash } = useAppSelector(
    (state: RootState) => state.map,
  );
  const {
    dataSource,
    loading: { fetch: dataSourceLoading },
  } = useAppSelector((state: RootState) => state.dataSource);

  useEffect(() => {
    if (datasetId && !dataSource) {
      dispatch(getDataSource({ datasetId }));
    }

    return () => {
      dispatch(resetMapState());
      dispatch(resetDatasetState());
      dispatch(resetChartState());
      dispatch(resetStatsState());
      dispatch(resetTimeSeriesState());
      dispatch(resetZoneState());
    };
  }, []);

  useEffect(() => {
    if (datasetId && dataSource) {
      dispatch(
        postFileMeta({
          body: dataSource,
        }),
      );
    }
  }, [datasetId, dataSource]);

  if (loading.postFileMeta || !datasetId || dataSourceLoading) {
    return <Loader />;
  }

  return (
    <>
      <Box
        position="absolute"
        zIndex={999}
        top={0}
        sx={{ p: 2, minWidth: 200 }}
      >
        <VisControl dataset={dataset} />
      </Box>
      <Map id={datasetId} dataset={dataset} />
      <Box
        position="absolute"
        zIndex={999}
        bottom={0}
        sx={{ p: 2, minWidth: 200 }}
      >
        <Stats dataset={dataset} />
      </Box>
      {isChartFullscreen ? (
        <Chart
          dataset={dataset}
          isFullscreen={isChartFullscreen}
          onToggleFullscreen={toggleChartFullscreen}
        />
      ) : (
        <Box
          position="absolute"
          zIndex={999}
          bottom={0}
          right={0}
          sx={{ p: 1, width: 1 / 4 }}
        >
          <Chart
            dataset={dataset}
            isFullscreen={isChartFullscreen}
            onToggleFullscreen={toggleChartFullscreen}
          />
          {dataset.timeColumn && (drawnRect || selectedGeohash.rect) && (
            <TimeSeriesChart dataset={dataset} />
          )}
        </Box>
      )}
    </>
  );
};

export default VisualizePage;
