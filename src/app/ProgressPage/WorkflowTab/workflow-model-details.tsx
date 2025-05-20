import {
  Box,
  Grid,
  Typography
} from '@mui/material';
import {
  DetailsCard,
  DetailsCardItem,
} from '../../../shared/components/details-card';
import ConfusionMatrixPlot from '../../Tasks/ModelAnalysisTask/plots/confusion-matrix-plot';
import RocCurvePlot from '../../Tasks/ModelAnalysisTask/plots/roc-curve-plot';
import ClassificationReportTable from '../../Tasks/ModelAnalysisTask/tables/classification-report-table';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { useEffect } from 'react';
import { fetchModelSummary } from '../../../store/slices/modelAnalysisSlice';
import { useParams } from 'react-router-dom';
import { InfoOutlined } from '@mui/icons-material';
import Loader from '../../../shared/components/loader';

const LoadingOrEmpty = ({ loading, condition, message }: { loading: boolean; condition: boolean; message: string }) => {
  if (loading) {
    return (
      <Loader/>
    );
  }

  if (condition) {
    return (
      <Box sx={{ minHeight: 120, display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
        <InfoOutlined fontSize="small" color="disabled" />
        <Typography variant="body1">{message}</Typography>
      </Box>
    );
  }

  return null;
};

const ModelDetails = () => {
  const { tab, isTabInitialized } = useAppSelector((state) => state.workflowPage);
  const summary = tab?.workflowTasks?.modelAnalysis?.modelSummary;
  const dispatch = useAppDispatch();
  const { experimentId } = useParams();

  useEffect(() => {
    if (tab && experimentId) {
      dispatch(fetchModelSummary({ experimentId, runId: tab.workflowId }));
    }
  }, [isTabInitialized]);

  const isLoading = !!summary?.loading;
  const hasError = !!summary?.error;

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3, width: '100%' }}>
        {/* Model Overview */}
        <DetailsCard title="Model Overview">
          <LoadingOrEmpty
            loading={isLoading}
            condition={
              hasError ||
              (!summary?.data?.numSamples &&
                !summary?.data?.numFeatures &&
                (!summary?.data?.classLabels || summary?.data?.classLabels.length === 0))
            }
            message="No model overview available"
          />
          {!isLoading && !hasError && summary?.data && (
            <>
              <DetailsCardItem label="Samples" value={summary.data.numSamples} />
              <DetailsCardItem label="Features" value={summary.data.numFeatures} />
              <DetailsCardItem
                label="Classes"
                value={summary.data.classLabels?.join(', ') || '-'}
              />
            </>
          )}
        </DetailsCard>

        {/* Data Splits */}
        <DetailsCard title="Data Splits">
          <LoadingOrEmpty
            loading={isLoading}
            condition={
              hasError ||
              !summary?.data?.dataSplitSizes ||
              Object.keys(summary.data.dataSplitSizes).length === 0
            }
            message="No data split information available"
          />
          {!isLoading && !hasError && summary?.data?.dataSplitSizes && (
            Object.entries(summary.data.dataSplitSizes).map(([split, size]) => (
              <DetailsCardItem
                key={split}
                label={split.charAt(0).toUpperCase() + split.slice(1)}
                value={size as number}
              />
            ))
          )}
        </DetailsCard>
      </Box>

      <Box paddingTop={2}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box sx={{ minHeight: { md: 305, xl: 400 } }}>
              <ConfusionMatrixPlot />
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ minHeight: { md: 305, xl: 400 } }}>
              <RocCurvePlot />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <ClassificationReportTable />
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default ModelDetails;
