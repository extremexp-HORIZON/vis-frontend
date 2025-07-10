import { useEffect } from 'react';
import type { RootState } from '../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import {
  Grid,
  Container,
} from '@mui/material';
import InfoMessage from '../../../shared/components/InfoMessage';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { fetchMetaData, setCommonDataAssets, setDataAssetsControlPanel, setSelectedDataset, type CommonDataAssets } from '../../../store/slices/monitorPageSlice';
import ResponsiveCardTable from '../../../shared/components/responsive-card-table';
import type { VisualColumn } from '../../../shared/models/dataexploration.model';
import Loader from '../../../shared/components/loader';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import SummaryTable from './comparative-data-table';

const ComparisonDataCharts = () => {
  const { workflowsTable, comparativeDataExploration } = useAppSelector(
    (state: RootState) => state.monitorPage,
  );
  const { workflows } =
      useAppSelector((state: RootState) => state.progressPage);
  const experimentId = useAppSelector(
    (state: RootState) => state.progressPage.experiment.data?.id || '',
  );
  const selectedDataset = useAppSelector(
    (state: RootState) => state.monitorPage.comparativeDataExploration.selectedDataset
  );
  const selectedWorkflowIds = workflowsTable.selectedWorkflows;
  const isMosaic = useAppSelector(
    (state: RootState) => state.monitorPage.isMosaic,
  );
  const dispatch = useAppDispatch();
  const { commonDataAssets, dataAssetsMetaData } = comparativeDataExploration;

  const filteredAssets = selectedDataset
    ? { [selectedDataset]: commonDataAssets[selectedDataset] }
    : {};

  const getCommonDataAssets = () => {
    if (selectedWorkflowIds.length === 0) return {};
    const selectedWorkflows = workflows.data.filter(w => selectedWorkflowIds.includes(w.id));
    const assetGroups: CommonDataAssets = {};

    for (const workflow of selectedWorkflows) {
      for (const asset of workflow.dataAssets) {
        const name = asset.name;

        if(!asset.source) continue;
        
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
    const names = Object.keys(commonDataAssets);

    if (names.length > 0) {
      dispatch(setSelectedDataset(names[0]));
    } else {
      dispatch(setSelectedDataset(null));
    }
  }, [commonDataAssets]);

  useEffect(() => {
    if (!filteredAssets) return;

    Object.entries(filteredAssets).forEach(([assetName, assetList]) => {
      if (!Array.isArray(assetList)) return;
      assetList.forEach(({ workflowId, dataAsset }) => {
        const alreadyFetched = dataAssetsMetaData?.[assetName]?.[workflowId]?.meta;

        if (
          alreadyFetched?.loading ||
        alreadyFetched?.data ||
        alreadyFetched?.error
        ) {
          return;
        }

        dispatch(
          fetchMetaData({
            query: {
              source: dataAsset?.source || '',
              format: dataAsset?.format || '',
              sourceType: dataAsset?.sourceType || '',
              fileName: dataAsset?.name || ''
            },
            metadata: {
              workflowId,
              queryCase: 'metaData',
              assetName: dataAsset.name,
            }
          })
        );
      });
    });
  }, [filteredAssets]);

  useEffect(() => {
    Object.entries(filteredAssets).forEach(([assetName, assetList]) => {
      if (!Array.isArray(assetList) || assetList.length === 0) return;

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
  }, [filteredAssets, dataAssetsMetaData]);

  const renderCharts = selectedDataset && filteredAssets[selectedDataset]
    ? filteredAssets[selectedDataset].map(({ workflowId, dataAsset }) => {
      const meta = dataAssetsMetaData?.[selectedDataset]?.[workflowId]?.meta;

      const isLoading = meta?.loading;
      const hasError = meta?.error && !meta.loading;
      const summary = meta?.data?.summary || [];

      if (isLoading) {
        return (
          <Grid item xs={isMosaic ? 6 : 12} key={workflowId}>
            <ResponsiveCardTable title={`${selectedDataset} - ${workflowId}`} minHeight={400} showSettings={false}>
              <Loader />
            </ResponsiveCardTable>
          </Grid>
        );
      }

      if (hasError || !summary.length) {
        return (
          <Grid item xs={isMosaic ? 6 : 12} key={workflowId}>
            <ResponsiveCardTable title={`${selectedDataset} - ${workflowId}`} minHeight={400} showSettings={false}>
              <InfoMessage
                message="No summary stats found for this workflow."
                type="info"
                icon={<ReportProblemRoundedIcon sx={{ fontSize: 40, color: 'info.main' }} />}
                fullHeight
              />
            </ResponsiveCardTable>
          </Grid>
        );
      }

      return (
        <Grid item xs={isMosaic ? 6 : 12} key={workflowId}>
          <ResponsiveCardTable title={`${selectedDataset} - ${workflowId}`} minHeight={400} showSettings={false} noPadding={true}>
            <SummaryTable summary={summary} dataset={dataAsset} workflowId={workflowId} />
          </ResponsiveCardTable>
        </Grid>
      );
    })
    : [];

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

  if (selectedDataset === null) {
    return (
      <InfoMessage
        message="Select Dataset to display comparisons over data."
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
