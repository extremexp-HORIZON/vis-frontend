import { useEffect, useLayoutEffect, useRef } from 'react';
import type { RootState } from '../../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import {
  Grid,
  Container,
} from '@mui/material';
import InfoMessage from '../../../../shared/components/InfoMessage';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { fetchMetaData, setCommonDataAssets, setDataAssetsControlPanel, setSelectedDataset, type CommonDataAssets } from '../../../../store/slices/monitorPageSlice';
import ResponsiveCardTable from '../../../../shared/components/responsive-card-table';
import type { VisualColumn } from '../../../../shared/models/dataexploration.model';
import OverlayHistogram from './DataComparison/overlay-histogram';
import Loader from '../../../../shared/components/loader';

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
  const dispatch = useAppDispatch();
  const { commonDataAssets, dataAssetsMetaData } = comparativeDataExploration;

  const filteredAssets = selectedDataset
    ? { [selectedDataset]: commonDataAssets[selectedDataset] }
    : {};

  const assetsForSelectedDataset =
    selectedDataset && Array.isArray(filteredAssets[selectedDataset])
      ? filteredAssets[selectedDataset]
      : [];

  const selectedColumns = useAppSelector(
    (state: RootState) =>
      state.monitorPage.comparativeDataExploration
        .dataAssetsControlPanel[selectedDataset || '']?.selectedColumns ?? []
  );

  const workflowColors = useAppSelector(
    (state) => state.monitorPage.workflowsTable.workflowColors
  );

  const { anyMetaLoading, anyMetaError } = useAppSelector((state: RootState) => {
    const metaRoot =
      state.monitorPage.comparativeDataExploration.dataAssetsMetaData ?? {};

    if (!selectedDataset || assetsForSelectedDataset.length === 0) {
      return { anyMetaLoading: false, anyMetaError: false };
    }

    let loading = false;
    let error = false;

    assetsForSelectedDataset.forEach(({ workflowId }) => {
      const meta = metaRoot?.[selectedDataset]?.[workflowId]?.meta;

      if (meta?.loading) {
        loading = true;
      } else if (meta?.error) {
        error = true;
      }
    });

    return { anyMetaLoading: loading, anyMetaError: error };
  });

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

    if (selectedDataset && names.includes(selectedDataset)) return;

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
              , runId: workflowId || ''
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
          commonColumns,
          selectedColumns: commonColumns.slice(0, 4).map(col => col.name)
        }
      }));
    });
  }, [filteredAssets, dataAssetsMetaData]);

  const renderCharts =
    selectedDataset && assetsForSelectedDataset.length && selectedColumns.length
      ? selectedColumns.map((col) => (
        <Grid item xs={6} key={col}>
            <OverlayHistogram
              assetName={selectedDataset!}
              columnName={col}
              assets={assetsForSelectedDataset}
              colorScale={(ids: string[]) => ({
                domain: ids,
                range: ids.map(id => workflowColors[id] || '#3f51b5'),
              })}
            />
        </Grid>
      ))
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

  if (anyMetaLoading) {
    return (
      <Loader />
    );
  }

  if (anyMetaError) {
    return (
      <InfoMessage
        message="Error fetching metadata for the selected dataset."
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
