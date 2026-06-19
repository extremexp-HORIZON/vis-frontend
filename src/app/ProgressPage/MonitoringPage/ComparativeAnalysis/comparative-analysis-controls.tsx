import { Box, Divider, IconButton, Menu, Tooltip } from '@mui/material';
import CompactMenuItem from '../../../../shared/components/compact-menu-item';
import type { RootState } from '../../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import { setComparativeModelInstanceControlPanel, setComparativeVisibleMetrics, setDataComparisonSelectedColumns, setDataComparisonViewMode, setIsMosaic, setSelectedDataset, setSelectedExecutionsView, setSelectedModelComparisonChart, setShowMisclassifiedOnly, setSortConfusionByF1, setSortRocByAuc } from '../../../../store/slices/monitorPageSlice';
import WindowRoundedIcon from '@mui/icons-material/WindowRounded';
import RoundedCornerRoundedIcon from '@mui/icons-material/RoundedCornerRounded';
import BlurLinearIcon from '@mui/icons-material/BlurLinear';
import SummarizeRoundedIcon from '@mui/icons-material/SummarizeRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import { SectionHeader } from '../../../../shared/components/responsive-card-table';
import { menuPaperSx } from '../../../../shared/styles/card-surface';
import MisclassifiedToggle from '../../../../shared/components/misclassified-toggle';
import SegmentedToggle from '../../../../shared/components/segmented-toggle';
import InstanceScatterControls from '../../../../shared/components/instance-scatter-controls';
import SettingsIcon from '@mui/icons-material/Settings';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import { useMemo, useState } from 'react';
import DownloadIcon from '@mui/icons-material/Download';
import CodeIcon from '@mui/icons-material/Code';
import FilterListIcon from '@mui/icons-material/FilterList';
import StorageIcon from '@mui/icons-material/Storage';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { GridTableRowsIcon } from '@mui/x-data-grid';
import BarChartIcon from '@mui/icons-material/BarChart';
import CandlestickChartIcon from '@mui/icons-material/CandlestickChart';
import SelectionPopover from '../../../../shared/components/selection-popover';
import PillToggle from '../../../../shared/components/pill-toggle';
import SortIcon from '@mui/icons-material/Sort';

const ComparativeAnalysisControls = ()=> {
  const isMosaic = useAppSelector((state: RootState) => state.monitorPage.isMosaic);
  const selectedModelComparisonChart = useAppSelector((state: RootState) => state.monitorPage.selectedModelComparisonChart);
  const selectedExecutionsView = useAppSelector((state: RootState) => state.monitorPage.selectedExecutionsView);
  const isLlmExperiment = useAppSelector(
    (state: RootState) => state.progressPage.experiment.data?.tags?.experiment_type?.toLowerCase() === 'llm',
  );
  const showMisclassifiedOnly = useAppSelector((state: RootState) => state.monitorPage.showMisclassifiedOnly);
  const sortRocByAuc = useAppSelector((state: RootState) => state.monitorPage.sortRocByAuc);
  const sortConfusionByF1 = useAppSelector((state: RootState) => state.monitorPage.sortConfusionByF1);
  const selectedComparisonTab = useAppSelector((state: RootState) => state.monitorPage.selectedComparisonTab);
  const comparativeVisibleMetrics = useAppSelector((state: RootState) => state.monitorPage.comparativeVisibleMetrics);
  const [anchorEl, setAnchorEl] = useState <null | HTMLElement>(null);
  const [columnsAnchorEl, setColumnsAnchorEl] = useState <null | HTMLElement>(null);
  const [datasetAnchorEl, setDatasetAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(columnsAnchorEl);
  const isDatasetSelectorOpen = Boolean(datasetAnchorEl);
  const [metricsAnchorEl, setMetricsAnchorEl] = useState<null | HTMLElement>(null);
  const isMetricsMenuOpen = Boolean(metricsAnchorEl);
  const comparativeModelInstanceControlPanel = useAppSelector((state: RootState) => state.monitorPage.comparativeModelInstanceControlPanel);
  const selectedDataset = useAppSelector((state: RootState) => state.monitorPage.comparativeDataExploration.selectedDataset);
  const dataComparisonViewMode = useAppSelector((state: RootState) => state.monitorPage.comparativeDataExploration.dataComparisonViewMode);
  const commonDataAssets = useAppSelector((state: RootState) => state.monitorPage.comparativeDataExploration.commonDataAssets);
  const dataAssetsMetaData = useAppSelector((state: RootState) => state.monitorPage.comparativeDataExploration.dataAssetsMetaData);
  const dataAssetsControlPanel = useAppSelector(
    (state: RootState) =>
      selectedDataset
        ? state.monitorPage.comparativeDataExploration.dataAssetsControlPanel[selectedDataset]
        : undefined
  );
  const commonColumns = dataAssetsControlPanel?.commonColumns ?? [];
  const selectedColumns = dataAssetsControlPanel?.selectedColumns ?? [];

  const datasetNames = useMemo(
    () =>
      Object.entries(commonDataAssets)
        .filter(([, entries]) =>
          Array.isArray(entries) &&
          entries.length > 0 &&
          entries.every(({ dataAsset }) => {
            const rawFormat = (dataAsset as { format?: unknown } | null | undefined)?.format;

            if (typeof rawFormat !== 'string') return false;

            const normalized = rawFormat.trim().toLowerCase()
              .replace(/^\./, '');

            return normalized === 'csv' || normalized === 'parquet';
          })
        )
        .map(([name]) => name),
    [commonDataAssets]
  );

  const showDataComparisonViewModeToggle = (() => {
    if (selectedComparisonTab !== 2) return false;
    if (!selectedDataset) return true;

    const assets = commonDataAssets[selectedDataset];

    if (!Array.isArray(assets) || assets.length === 0) return true;

    const allImages = assets.every(({ workflowId }) => {
      const meta = dataAssetsMetaData?.[selectedDataset]?.[workflowId]?.meta;
      const datasetType = meta?.data?.datasetType;

      return typeof datasetType === 'string' && datasetType.match('IMAGE');
    });

    return !allImages;
  })();

  const { workflowsTable } = useAppSelector(
    (state: RootState) => state.monitorPage
  );

  const menuOpen = Boolean(anchorEl);
  const dispatch = useAppDispatch();
  const { xAxisOption, yAxisOption, options } = comparativeModelInstanceControlPanel;

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setColumnsAnchorEl(event.currentTarget);
  };

  const handleClose = () => setColumnsAnchorEl(null);

  const handleOpenMetricsMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMetricsAnchorEl(event.currentTarget);
  };

  const handleCloseMetricsMenu = () => {
    setMetricsAnchorEl(null);
  };

  const datasetSelectorClicked = (event: React.MouseEvent<HTMLElement>) => {
    setDatasetAnchorEl(prev => (prev ? null : event.currentTarget));
  };

  const options1 = [
    { label: 'confusionMatrix', name: 'Confusion\nMatrix', icon: <WindowRoundedIcon fontSize="small" /> },
    { label: 'rocCurve', name: 'Roc\nCurve', icon: <RoundedCornerRoundedIcon fontSize="small" /> },
    { label: 'instanceView', name: 'Instance\nView', icon: <BlurLinearIcon fontSize="small" /> }
  ];

  const llmExecutionsOptions = [
    { label: 'summary' as const, name: 'Summary', icon: <SummarizeRoundedIcon fontSize="small" /> },
    { label: 'timeline' as const, name: 'Timeline', icon: <TimelineRoundedIcon fontSize="small" /> },
    { label: 'verdicts' as const, name: 'Verdicts', icon: <GavelRoundedIcon fontSize="small" /> },
  ];

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        sx={{
          px: 1.5,
          height: 48,
          minHeight: 48,
          flexWrap: { xs: 'wrap', lg: 'nowrap' },
          overflowX: 'auto',
        }}
      >
        {selectedComparisonTab === 0 && (
          <Box>
            <Tooltip title="Select Metrics">
              <IconButton onClick={handleOpenMetricsMenu} size="small">
                <ViewColumnIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <SelectionPopover
              open={isMetricsMenuOpen}
              anchorEl={metricsAnchorEl}
              onClose={handleCloseMetricsMenu}
              title="Visible Metrics"
              icon={<GridTableRowsIcon fontSize="small" />}
              options={workflowsTable.uniqueMetrics.filter(m => m !== 'rating')}
              selectedOptions={comparativeVisibleMetrics}
              onToggle={(metricName) => {
                const updated = comparativeVisibleMetrics.includes(metricName)
                  ? comparativeVisibleMetrics.filter(m => m !== metricName)
                  : [metricName, ...comparativeVisibleMetrics];

                dispatch(setComparativeVisibleMetrics(updated));
              }}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            />
          </Box>
        )}
        {selectedComparisonTab === 1 ? (
          <SegmentedToggle
            uppercase
            aria-label={isLlmExperiment ? 'executions view' : 'model comparison chart'}
            value={isLlmExperiment ? selectedExecutionsView : selectedModelComparisonChart}
            onChange={(value) =>
              isLlmExperiment
                ? dispatch(setSelectedExecutionsView(value as 'summary' | 'timeline' | 'verdicts'))
                : dispatch(setSelectedModelComparisonChart(value))
            }
            options={(isLlmExperiment ? llmExecutionsOptions : options1).map(option => ({
              value: option.label,
              label: option.name.replace('\n', ' '),
              icon: option.icon,
            }))}
          />
        ) : selectedComparisonTab === 2 && workflowsTable.selectedWorkflows.length > 0 && (
          <>
            <Box display="flex" flexWrap="wrap" gap={0.2}>
              <Tooltip title="Select Dataset">
                <IconButton onClick={datasetSelectorClicked} size="small">
                  <FilterListIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Columns">
                <IconButton onClick={handleOpen} size="small">
                  <ViewColumnIcon fontSize="small" />
                </IconButton>
              </Tooltip>

            </Box>
            <SelectionPopover
              id="Datasets"
              open={isDatasetSelectorOpen}
              anchorEl={datasetAnchorEl}
              onClose={() => setDatasetAnchorEl(null)}
              title="Datasets"
              icon={<StorageIcon fontSize="small" />}
              options={datasetNames}
              selectedOptions={selectedDataset ? [selectedDataset] : []}
              onToggle={(name) => {
                dispatch(setSelectedDataset(name === selectedDataset ? null : name));
                setDatasetAnchorEl(null);
              }}
              onClear={() => {
                dispatch(setSelectedDataset(null));
                setDatasetAnchorEl(null);
              }}
              clearLabel="Clear Dataset"
              multiSelect={false}
              searchable
              searchPlaceholder="Search datasets…"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            />
            <SelectionPopover
              id="Columns"
              open={open}
              anchorEl={columnsAnchorEl}
              onClose={handleClose}
              title="Visible Columns"
              icon={<GridTableRowsIcon fontSize="small" />}
              options={commonColumns.map(c => c.name)}
              selectedOptions={selectedColumns}
              onToggle={(colName) => {
                if (!selectedDataset) return;
                const updated = selectedColumns.includes(colName)
                  ? selectedColumns.filter(col => col !== colName)
                  : [...selectedColumns, colName];

                dispatch(setDataComparisonSelectedColumns({ assetName: selectedDataset, selectedColumns: updated }));
              }}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            />

          </>
        )}

        <Box
          display="flex"
          alignItems="center"
          flexWrap="wrap"
          gap={0.5}
          sx={{ ml: 'auto' }}
        >

          {showDataComparisonViewModeToggle && selectedComparisonTab === 2 && (
            <SegmentedToggle
              aria-label="data comparison view mode"
              value={dataComparisonViewMode === 'boxplot' ? 'boxplot' : 'overlay'}
              onChange={(v) => dispatch(setDataComparisonViewMode(v as 'overlay' | 'boxplot'))}
              options={[
                { value: 'overlay', icon: <BarChartIcon fontSize="small" />, tooltip: 'Distribution Plots', disabled: !selectedDataset },
                { value: 'boxplot', icon: <CandlestickChartIcon fontSize="small" />, tooltip: 'Box Plots', disabled: !selectedDataset },
              ]}
            />
          )}

          {!isLlmExperiment && selectedModelComparisonChart === 'instanceView' && selectedComparisonTab === 1 && (
            <MisclassifiedToggle
              checked={showMisclassifiedOnly}
              onChange={(checked) => dispatch(setShowMisclassifiedOnly(checked))}
            />
          )}

          {selectedComparisonTab !== 2
            && !(isLlmExperiment && selectedComparisonTab === 1 && selectedExecutionsView === 'verdicts') && (
            <SegmentedToggle
              uppercase
              aria-label="view mode"
              value={isMosaic ? 'mosaic' : 'stacked'}
              onChange={(v) => dispatch(setIsMosaic(v === 'mosaic'))}
              options={[
                { value: 'mosaic', label: 'Mosaic' },
                { value: 'stacked', label: 'Stacked' },
              ]}
            />
          )}
          {!isLlmExperiment && selectedModelComparisonChart === 'confusionMatrix' && selectedComparisonTab === 1 && (
            <PillToggle
              checked={sortConfusionByF1}
              onChange={(c) => dispatch(setSortConfusionByF1(c))}
              label="Sort by F1"
              icon={<SortIcon fontSize="small" />}
              tooltip="Sort confusion matrices by F1 score"
            />
          )}

          {!isLlmExperiment && selectedModelComparisonChart === 'rocCurve' && selectedComparisonTab === 1 && (
            <PillToggle
              checked={sortRocByAuc}
              onChange={(c) => dispatch(setSortRocByAuc(c))}
              label="Sort by AUC"
              icon={<SortIcon fontSize="small" />}
              tooltip="Sort ROC curves by AUC"
            />
          )}

          {!isLlmExperiment && selectedModelComparisonChart === 'instanceView' && selectedComparisonTab === 1 && (
            <>
              <IconButton
                aria-label="settings"
                onClick={handleMenuClick}
                size="small"
                sx={{
                  position: 'relative',
                  '& svg': { zIndex: 1, position: 'relative' },
                }}
              >
                <SettingsIcon fontSize="small" />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                  elevation: 0,
                  sx: menuPaperSx(),
                }}
                MenuListProps={{ sx: { pt: 0, pb: 0 } }}
              >
                <SectionHeader
                  icon={<TuneRoundedIcon fontSize="small" />}
                  title="Chart Options"
                />
                <Box sx={{ px: 1.25, pt: 1.25, pb: 0.5 }}>
                  <InstanceScatterControls
                    options={options}
                    xAxisOption={xAxisOption}
                    yAxisOption={yAxisOption}
                    useUmap={comparativeModelInstanceControlPanel.useUmap}
                    onXAxisChange={(value) =>
                      dispatch(setComparativeModelInstanceControlPanel({ xAxisOption: value }))
                    }
                    onYAxisChange={(value) =>
                      dispatch(setComparativeModelInstanceControlPanel({ yAxisOption: value }))
                    }
                    onUseUmapChange={(useUmap) =>
                      dispatch(setComparativeModelInstanceControlPanel({ useUmap }))
                    }
                  />
                </Box>
                <Divider sx={{ opacity: 0.6 }} />
                <Box sx={{ py: 0.5 }}>
                  <CompactMenuItem
                    icon={<DownloadIcon fontSize="small" />}
                    primary="Download as PNG"
                    secondary="Save chart as image"
                  />
                  <CompactMenuItem
                    icon={<CodeIcon fontSize="small" />}
                    primary="Download Data as JSON"
                    secondary="Export chart's underlying data"
                  />
                </Box>
              </Menu>
            </>
          )}
        </Box>
      </Box>

      <Divider
        sx={{
          my: 0,
          borderBottomWidth: 1,
          borderColor: theme => theme.palette.customGrey.main,
        }}
      />
    </>
  );
};

export default ComparativeAnalysisControls;
