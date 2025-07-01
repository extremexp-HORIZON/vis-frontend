import type React from 'react';
import { useEffect } from 'react';
import type { RootState } from '../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import {
  Grid,
  Container,
} from '@mui/material';
import InfoMessage from '../../../shared/components/InfoMessage';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { fetchMetaData, setCommonDataAssets, setDataAssetsControlPanel, type CommonDataAssets } from '../../../store/slices/monitorPageSlice';
import ResponsiveCardTable from '../../../shared/components/responsive-card-table';
import type { VisualColumn } from '../../../shared/models/dataexploration.model';
import Loader from '../../../shared/components/loader';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';

const ComparisonDataCharts: React.FC = () => {
  const { workflowsTable, comparativeDataExploration } = useAppSelector(
    (state: RootState) => state.monitorPage,
  );
  const { workflows } =
      useAppSelector((state: RootState) => state.progressPage);
  const experimentId = useAppSelector(
    (state: RootState) => state.progressPage.experiment.data?.id || '',
  );
  const selectedWorkflowIds = workflowsTable.selectedWorkflows;
  const isMosaic = useAppSelector(
    (state: RootState) => state.monitorPage.isMosaic,
  );
  const { hoveredWorkflowId } = workflowsTable;
  const dispatch = useAppDispatch();
  const { commonDataAssets, dataAssetsMetaData } = comparativeDataExploration;

  const getCommonDataAssets = () => {
    if (selectedWorkflowIds.length === 0) return {};
    const selectedWorkflows = workflows.data.filter(w => selectedWorkflowIds.includes(w.id));
    const assetGroups: CommonDataAssets = {};

    for (const workflow of selectedWorkflows) {
      for (const asset of workflow.dataAssets) {
        const name = asset.name;

        if (!assetGroups[name]) {
          assetGroups[name] = [];
        }
        assetGroups[name].push({ workflowId: workflow.id, dataAsset: asset });
      }
    }

    const commonAssets: CommonDataAssets = {};

    for (const [name, entries] of Object.entries(assetGroups)) {
      const uniqueWorkflows = new Set(entries.map(e => e.workflowId));

      if (uniqueWorkflows.size === selectedWorkflowIds.length) {
        commonAssets[name] = entries;
      }
    }

    return commonAssets;
  };

  useEffect(() => {
    if (!experimentId) return;
    dispatch(setCommonDataAssets(getCommonDataAssets()));

  }, [selectedWorkflowIds]);

  useEffect(() => {
    if (!commonDataAssets) return;

    Object.entries(commonDataAssets)
      .flatMap(([assetName, assetList]) =>
        assetList.forEach(({ workflowId, dataAsset }) => {
          dispatch(
            fetchMetaData({
              query: {
                source: dataAsset?.source || '',
                format: dataAsset?.format || '',
                sourceType: dataAsset?.sourceType || '',
                fileName: dataAsset?.name || ''
              },
              metadata: {
                workflowId: workflowId,
                queryCase: 'metaData',
                assetName: dataAsset.name,
              }
            })
          );
        })
      );

  }, [commonDataAssets]);

  useEffect(() => {
    Object.entries(commonDataAssets).forEach(([assetName, assetList]) => {
      const metaList = assetList.map(({ workflowId }) =>
        dataAssetsMetaData?.[assetName]?.[workflowId]?.meta
      );

      const anyLoading = metaList.some(meta => meta?.loading);
      const isAlreadyInitialized = !!comparativeDataExploration.dataAssetsControlPanel[assetName];

      if (anyLoading || isAlreadyInitialized) return;

      const successfulMeta = metaList.filter(meta => meta?.data && !meta.error);

      if (successfulMeta.length === 0) return;

      const allColumnsArrays = successfulMeta.map(meta => meta!.data!.originalColumns);
      const columnNameToColumn: Record<string, VisualColumn> = {};
      const commonColumnNames = allColumnsArrays
        .map(cols => cols.map(c => c.name))
        .reduce((acc, names) => acc.filter(name => names.includes(name)));

      const commonColumns = commonColumnNames.map(name => {
        const col = allColumnsArrays.find(cols => cols.find(c => c.name === name))?.find(c => c.name === name);

        if (col) columnNameToColumn[name] = col;

        return col!;
      });

      dispatch(setDataAssetsControlPanel({
        assetName,
        controlPanel: {
          commonColumns
        }
      }));
    });
  }, [commonDataAssets, dataAssetsMetaData]);

  const renderCharts = Object.entries(commonDataAssets).map(([assetName, assetList]) => {
    const metadataEntries = assetList.map(({ workflowId }) =>
      dataAssetsMetaData?.[assetName]?.[workflowId]?.meta
    );
    const metadataLoading = metadataEntries.some(meta => meta?.loading);
    const allMetadataFailed = metadataEntries.length > 0 && metadataEntries.every(meta => meta?.error && !meta?.loading);

    if(metadataLoading) return (
      <Grid item xs={isMosaic ? 6 : 12} key={assetName}>
        <ResponsiveCardTable title={assetName} minHeight={400} showSettings={false}>
          <Loader />
        </ResponsiveCardTable>
      </Grid>
    );

    if(allMetadataFailed) return (
      <Grid item xs={isMosaic ? 6 : 12} key={assetName}>
        <ResponsiveCardTable title={assetName} minHeight={400} showSettings={false}>
          <InfoMessage
            message="Failed to fetch metadata."
            type="info"
            icon={
              <ReportProblemRoundedIcon sx={{ fontSize: 40, color: 'info.main' }} />
            }
            fullHeight
          />
        </ResponsiveCardTable>
      </Grid>
    );

    return (
      <Grid item xs={isMosaic ? 6 : 12} key={assetName}>
        <ResponsiveCardTable title={assetName} minHeight={400} showSettings={false}>
          <InfoMessage
            message={assetList.map(a => `${a.workflowId}`).join('\n')}
            type="info"
            fullHeight
          />
        </ResponsiveCardTable>
      </Grid>
    );
  });

  if (workflowsTable.selectedWorkflows.length === 0) {
    return (
      <InfoMessage
        message="Select Workflows to display comparisons over data."
        type="info"
        icon={<AssessmentIcon sx={{ fontSize: 40, color: 'info.main' }} />}
        fullHeight
      />
    );
  }

  return (
    <Container maxWidth={false} sx={{ padding: 2 }} >
      <Grid
        container
        spacing={2}
        sx={{ width: '100%', margin: '0 auto', flexWrap: 'wrap' }}
      >
        {renderCharts}
      </Grid>
    </Container>
  );
};

export default ComparisonDataCharts;
