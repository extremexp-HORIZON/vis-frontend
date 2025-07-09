import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  RootState,
  useAppDispatch,
  useAppSelector,
} from '../../../store/store';
import { postFileMeta } from '../../../store/slices/exploring/datasetSlice';
import Loader from '../../../shared/components/loader';
import { Map } from './Map/map';

const VisualizePage = () => {
  const { datasetId } = useParams();
  const dispatch = useAppDispatch();
  const { dataset, loading } = useAppSelector(
    (state: RootState) => state.dataset,
  );

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

  return <Map id={datasetId} dataset={dataset} />;
};

export default VisualizePage;
