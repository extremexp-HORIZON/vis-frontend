import type React from 'react';
import { useEffect, useState } from 'react';
import type { RootState } from '../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import {
  Grid,
  Container,
  ButtonGroup,
  Button,
} from '@mui/material';
import InfoMessage from '../../../shared/components/InfoMessage';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { setCommonDataAssets, type CommonDataAssets } from '../../../store/slices/monitorPageSlice';
import ResponsiveCardTable from '../../../shared/components/responsive-card-table';

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
  const [isMosaic, setIsMosaic] = useState(true);
  const { hoveredWorkflowId } = workflowsTable;
  const dispatch = useAppDispatch();
  const commonDataAssets = comparativeDataExploration.commonDataAssets;

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
  }

  useEffect(() => {
    if (!experimentId) return;
    dispatch(setCommonDataAssets(getCommonDataAssets()));

  },[selectedWorkflowIds]);

  const renderCharts = Object.entries(commonDataAssets).map(([assetName, assetList]) => {
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
  })

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
        justifyContent="flex-end" // Align to the right
        alignItems="center"
        sx={{ marginBottom: 2 }}
      >
        <ButtonGroup
          variant="contained"
          aria-label="view mode"
          sx={{
            height: '25px', // Ensure consistent height for the button group
          }}
        >
          <Button
            variant={isMosaic ? 'contained' : 'outlined'}
            color="primary"
            onClick={() => setIsMosaic(true)}
          >
            Mosaic
          </Button>
          <Button
            variant={!isMosaic ? 'contained' : 'outlined'}
            color="primary"
            onClick={() => setIsMosaic(false)}
          >
           Stacked
          </Button>
        </ButtonGroup>
      </Grid>
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
