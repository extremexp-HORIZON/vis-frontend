import './visualize.css';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
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
import { resetMapState, setDrawnRect } from '../../../store/slices/exploring/mapSlice';
import { resetStatsState } from '../../../store/slices/exploring/statsSlice';
import { resetTimeSeriesState } from '../../../store/slices/exploring/timeSeriesSlice';
import { resetZoneState, setZone } from '../../../store/slices/exploring/zoneSlice';
import {
  resetPredictionState,
  setPredictionDisplay,
} from '../../../store/slices/exploring/predictionSlice';
import { PredictionTimeline } from './Map/PredictionTimeline/prediction-timeline';
import CloseIcon from '@mui/icons-material/Close';
import { Zones } from './Zones/zones';

const VisualizePage = () => {
  const { datasetId } = useParams();
  const dispatch = useAppDispatch();
  const [isChartFullscreen, setIsChartFullscreen] = useState(false);
  const { dataset, loading } = useAppSelector(
    (state: RootState) => state.dataset,
  );
  const { drawnRect, selectedGeohash } = useAppSelector(
    (state: RootState) => state.map,
  );
  const {
    dataSource,
    loading: { fetch: dataSourceLoading },
  } = useAppSelector((state: RootState) => state.dataSource);
  const { predictionDisplay } = useAppSelector(
    (state: RootState) => state.prediction,
  );

  const toggleChartFullscreen = React.useCallback(() => {
    setIsChartFullscreen(!isChartFullscreen);
  }, [isChartFullscreen]);

  const handleClosePredictionDisplay = () => {
    dispatch(setPredictionDisplay(false));
    dispatch(setZone({}));
    dispatch(setDrawnRect({ id: datasetId!, bounds: null }));
  };

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
      dispatch(resetPredictionState());
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
      {predictionDisplay ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'secondary.main',
            position: 'relative',
          }}
        >
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <Typography variant="h6" textAlign="center">
              Prediction Display
            </Typography>
          </Box>
          <Box sx={{ position: 'absolute', right: 16 }}>
            <Button onClick={handleClosePredictionDisplay}>
              <CloseIcon />
            </Button>
          </Box>
        </Box>
      ) : (
        <Box
          position="absolute"
          zIndex={999}
          top={predictionDisplay ? 32 : 0}
          sx={{ p: 2, minWidth: 200 }}
        >
          <VisControl dataset={dataset} />
        </Box>
      )}
      <Map id={datasetId} dataset={dataset} />
      <Box
        sx={{
          position: 'absolute',
          zIndex: 999,
          top: predictionDisplay ? 242 : 210,
          right: 55,
          backgroundColor: 'white',
          borderRadius: 1,
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Zones dataset={dataset} />
      </Box>
      {predictionDisplay ? (
        <PredictionTimeline />
      ) : (
        <>
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
              sx={{ p: 1, minWidth: 311, maxWidth: 1 / 4 }}
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
      )}
    </>
  );
};

export default VisualizePage;
