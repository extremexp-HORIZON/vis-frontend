import './visualize.css';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import {
  type RootState,
  useAppDispatch,
  useAppSelector,
} from '../../../store/store';
import { postFileMeta } from '../../../store/slices/exploring/datasetSlice';
import Loader from '../../../shared/components/loader';
import { Map } from './Map/map';
import Stats from './Stats/stats';
import { VisControl } from './VisControl/vis-control';
import { Chart } from './Chart/chart';
import { TimeSeriesChart } from './TimeSeriesChart/time-series-chart';

const VisualizePage = () => {
  const { datasetId } = useParams();
  const dispatch = useAppDispatch();
  const { dataset, loading } = useAppSelector(
    (state: RootState) => state.dataset,
  );
  const { drawnRect } = useAppSelector((state: RootState) => state.map);

  useEffect(() => {
    if (datasetId) {
      dispatch(
        postFileMeta({
          body: {
            sourceType: 'local',
            format: 'rawvis',
            source: `/opt/experiments/${datasetId}/dataset/${datasetId}.csv`,
            fileName: datasetId,
          },
        }),
      );
    }
  }, [datasetId]);

  if (loading.postFileMeta || !datasetId) {
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
      <Box
        position="absolute"
        zIndex={999}
        bottom={0}
        right={0}
        sx={{ p: 1, width: 1 / 4 }}
      >
        <Chart dataset={dataset} />
        {drawnRect && <TimeSeriesChart dataset={dataset} />}
      </Box>
    </>
  );
};

export default VisualizePage;
