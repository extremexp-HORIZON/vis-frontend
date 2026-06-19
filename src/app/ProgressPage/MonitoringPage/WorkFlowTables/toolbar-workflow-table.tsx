import type * as React from 'react';
import Tooltip from '@mui/material/Tooltip';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FilterListIcon from '@mui/icons-material/FilterList';
import { alpha } from '@mui/material/styles';
import {
  Button,
  Stack,
  Box,
  Popover,
  Badge,
  TextField,
} from '@mui/material';
import type {
  RootState } from '../../../../store/store';
import {
  useAppDispatch,
  useAppSelector,
} from '../../../../store/store';
import {
  setScheduledTable,
  setVisibleTable,
  setWorkflowsTable,
  setGroupBy,
  setSelectedSpaces,
} from '../../../../store/slices/monitorPageSlice';
import { useState, useMemo } from 'react';
import PivotTableChartRoundedIcon from '@mui/icons-material/PivotTableChartRounded';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import GrainIcon from '@mui/icons-material/Grain';
import TableRowsIcon from '@mui/icons-material/TableRows';
import CategoryIcon from '@mui/icons-material/Category';
import CreateIcon from '@mui/icons-material/Create';
import type { IRun } from '../../../../shared/models/experiment/run.model';
import SegmentedToggle from '../../../../shared/components/segmented-toggle';
import { setWorkflowsData } from '../../../../store/slices/progressPageSlice';
import DownloadIcon from '@mui/icons-material/Download';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { Link } from 'react-router-dom';
import { SectionHeader } from '../../../../shared/components/responsive-card-table';
import SelectionPopover from '../../../../shared/components/selection-popover';
import SearchableSelect from '../../../../shared/components/searchable-select';
import { menuPaperSx } from '../../../../shared/styles/card-surface';

interface ToolBarWorkflowProps {
  filterNumbers: number
  numSelected: number
  tableName: string
  actionButtonName: string
  handleClickedFunction: (
    workflowId: number[] | string,
  ) => (e: React.SyntheticEvent) => void
  filterClickedFunction: (event: React.MouseEvent<HTMLElement>) => void
  groupByOptions?: string[]
  showFilterButton?: boolean;
  showSpaceButton?: boolean;
  spaceOptions?: string[]
  onDownloadCsv?: () => void
}

export default function ToolBarWorkflow(props: ToolBarWorkflowProps) {
  const {
    filterNumbers,
    numSelected,
    tableName,
    actionButtonName,
    handleClickedFunction,
    filterClickedFunction,
    groupByOptions,
    showFilterButton = false,
    showSpaceButton = false,
    spaceOptions,
    onDownloadCsv,
  } = props;
  // Narrow, field-level subscriptions so the toolbar does NOT re-render on every
  // row hover. `hoveredWorkflowId` lives in monitorPage.workflowsTable, so
  // subscribing to the whole slice (or the whole workflowsTable) re-rendered the
  // toolbar on each hover and re-ran the heavy `uniqueParameters` reduce below.
  const visibleTable = useAppSelector((state: RootState) => state.monitorPage.visibleTable);
  const selectedTab = useAppSelector((state: RootState) => state.monitorPage.selectedTab);
  const wfVisibleColumns = useAppSelector((state: RootState) => state.monitorPage.workflowsTable.visibleColumns);
  const wfColumnsVisibilityModel = useAppSelector((state: RootState) => state.monitorPage.workflowsTable.columnsVisibilityModel);
  const wfGroupBy = useAppSelector((state: RootState) => state.monitorPage.workflowsTable.groupBy);
  const wfSelectedSpaces = useAppSelector((state: RootState) => state.monitorPage.workflowsTable.selectedSpaces);
  const schColumns = useAppSelector((state: RootState) => state.monitorPage.scheduledTable.columns);
  const schColumnsVisibilityModel = useAppSelector((state: RootState) => state.monitorPage.scheduledTable.columnsVisibilityModel);
  const schSelectedSpaces = useAppSelector((state: RootState) => state.monitorPage.scheduledTable.selectedSpaces);

  const workflowsTable = useMemo(
    () => ({
      visibleColumns: wfVisibleColumns,
      columnsVisibilityModel: wfColumnsVisibilityModel,
      groupBy: wfGroupBy,
      selectedSpaces: wfSelectedSpaces,
    }),
    [wfVisibleColumns, wfColumnsVisibilityModel, wfGroupBy, wfSelectedSpaces],
  );
  const scheduledTable = useMemo(
    () => ({
      columns: schColumns,
      columnsVisibilityModel: schColumnsVisibilityModel,
      selectedSpaces: schSelectedSpaces,
    }),
    [schColumns, schColumnsVisibilityModel, schSelectedSpaces],
  );

  const { workflows, experiment } = useAppSelector(
    (state: RootState) => state.progressPage,
  );
  const dispatch = useAppDispatch();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [anchorElGroup, setAnchorElGroup] = useState<null | HTMLElement>(null);
  const [anchorElSpaces, setAnchorElSpaces] = useState<null | HTMLElement>(null);
  const [anchorElCreateWorkflow, setAnchorElCreateWorkflow] = useState<null | HTMLElement>(null);

  const uniqueParameters = useMemo(
    () => workflows.data.reduce(
      (acc: Record<string, Set<string>>, workflow) => {
        if (workflow.params) {
          workflow.params.forEach(param => {
            if (!acc[param.name]) {
              acc[param.name] = new Set();
            }
            acc[param.name].add(param.value);
          });
        }

        return acc;
      },
      {}
    ),
    [workflows.data],
  );

  const [workflowName, setWorkflowName] = useState('');
  const [selectedParams, setSelectedParams] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = Object.entries(selectedParams)
      .filter(([, v]) => v !== '' && v !== undefined)
      .map(([name, value]) => ({ name, value }));

    // for now create a new dummy scheduled workflow
    const newRun: IRun = {
      id: workflowName.trim(),
      name: workflowName.trim(),
      experimentId: experiment.data?.id || '',
      status: 'SCHEDULED',
      startTime: undefined,
      endTime: undefined,
      params,
      metrics: [],
      dataAssets: [],
      tags: {},
    };
    const updatedWorkflows = workflows.data.concat(newRun);

    dispatch(setWorkflowsData(updatedWorkflows));

    setWorkflowName('');
    setSelectedParams({});
    handleCreateWokrkflowClose();
  };

  const handleGroupClick = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorElGroup(e.currentTarget);
  const handleGroupClose = () => setAnchorElGroup(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleSpaceOptionsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElSpaces(event.currentTarget);
  };

  const handelSpaceOptionsClose = () => setAnchorElSpaces(null);

  // const handleCreateWorkflowOpen = (event: React.MouseEvent<HTMLElement>) => {
  //   setAnchorElCreateWorkflow(event.currentTarget);
  // };

  const handleCreateWokrkflowClose = () => setAnchorElCreateWorkflow(null);

  const open = Boolean(anchorEl);

  // ── Visible Columns helpers ──────────────────────────────────────────────
  const columnsToShow = visibleTable === 'workflows'
    ? workflowsTable.visibleColumns.slice(0, -2)
    : scheduledTable.columns.slice(0, -1);

  const columnsModel = visibleTable === 'workflows'
    ? workflowsTable.columnsVisibilityModel
    : scheduledTable.columnsVisibilityModel;

  const selectedColumnFields = columnsToShow
    .filter(c => columnsModel[c.field] !== false)
    .map(c => c.field);

  const handleColumnToggle = (field: string) => {
    if (visibleTable === 'workflows') {
      dispatch(setWorkflowsTable({
        columnsVisibilityModel: {
          ...workflowsTable.columnsVisibilityModel,
          [field]: !workflowsTable.columnsVisibilityModel[field],
        },
      }));
    } else {
      dispatch(setScheduledTable({
        columnsVisibilityModel: {
          ...scheduledTable.columnsVisibilityModel,
          [field]: !scheduledTable.columnsVisibilityModel[field],
        },
      }));
    }
  };

  // ── Visible Spaces helpers ───────────────────────────────────────────────
  const currentSelectedSpaces = visibleTable === 'workflows'
    ? workflowsTable.selectedSpaces
    : scheduledTable.selectedSpaces;

  const handleSpaceToggle = (option: string) => {
    const spaces = currentSelectedSpaces.includes(option)
      ? currentSelectedSpaces.filter(p => p !== option)
      : [...currentSelectedSpaces, option];

    dispatch(setSelectedSpaces({ spaces, table: visibleTable }));
  };

  return (
    <Toolbar
      variant="dense"
      sx={{
        minHeight: 44,
        height: 44,
        '@media (min-width:600px)': {
          minHeight: 44,
          height: 44,
        },
        flex: '0 0 auto',
        gap: 1,
        px: 1.5,
        borderBottom: theme => `1px solid ${theme.palette.divider}`,
        ...(numSelected > 0 &&
          selectedTab !== 1 && {
          bgcolor: theme =>
            alpha(
              theme.palette.primary.dark,
              theme.palette.action.activatedOpacity,
            ),
        }),
      }}
    >
      {numSelected > 0 && selectedTab !== 1 ? (
        <Typography
          sx={{ flex: '1 1 auto' }}
          color="inherit"
          variant="subtitle2"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        selectedTab !== 1 && (
          <Box sx={{ flex: '0 0 auto' }}>
            <SegmentedToggle
              uppercase
              aria-label="workflow table"
              value={visibleTable === 'scheduled' ? 'scheduled' : 'workflows'}
              onChange={(v) => dispatch(setVisibleTable(v as 'workflows' | 'scheduled'))}
              options={[
                { value: 'workflows', label: 'Completed' },
                { value: 'scheduled', label: 'Scheduled' },
              ]}
            />
          </Box>
        )
      )}
      {numSelected > 0 && selectedTab !== 1 ? (
        <Button
          size="small"
          variant="contained"
          disabled={numSelected < 2 && tableName === 'Workflow Execution'}
          sx={{ ml: 'auto', borderRadius: 1, fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}
          onClick={handleClickedFunction('compare-completed')}
        >
          {actionButtonName}
        </Button>
      ) : (
        <Stack
          direction="row"
          alignItems="center"
          sx={{ flex: 1, justifyContent: 'flex-end' }}
        >
            {/* <Tooltip title='Create new workflow'>
              <IconButton onClick={handleCreateWorkflowOpen}>
                <AddIcon />
              </IconButton>
            </Tooltip> */}
            {
              visibleTable === 'workflows' && (
                <Tooltip title="Experiment Highlights">
                  <IconButton component={Link} to={`/${experiment.data?.id}/highlights`}>
                    <AutoAwesomeIcon />
                  </IconButton>
                </Tooltip>
              )}
            {showSpaceButton && (
              <Tooltip title="Spaces">
                <IconButton onClick={handleSpaceOptionsOpen}>
                  <Badge color="primary" badgeContent={workflowsTable.selectedSpaces.length} invisible={workflowsTable.selectedSpaces.length === 0}>
                    <GrainIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}

            {showFilterButton && (
              <Tooltip title="Filter list">
                <IconButton onClick={filterClickedFunction}>
                  <Badge color="primary" badgeContent={filterNumbers} invisible={filterNumbers === 0}>
                    <FilterListIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Columns">
              <IconButton onClick={handleOpen}>
                <ViewColumnIcon />
              </IconButton>
            </Tooltip>

            {visibleTable === 'workflows' && (
              <Tooltip title="Group by">
                <IconButton onClick={handleGroupClick}>
                  <Badge color="primary" badgeContent={workflowsTable.groupBy.length} invisible={workflowsTable.groupBy.length === 0}>
                    <PivotTableChartRoundedIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}
            {onDownloadCsv && (
              <Tooltip title="Export to CSV">
                <IconButton onClick={onDownloadCsv}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            )}

            {/* ── Create New Workflow popover (form, kept as-is) ── */}
            <Popover
              open={Boolean(anchorElCreateWorkflow)}
              anchorEl={anchorElCreateWorkflow}
              onClose={handleCreateWokrkflowClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              PaperProps={{
                elevation: 0,
                sx: [
                  menuPaperSx({ width: 300, maxHeight: 320 }),
                  { '& .MuiList-root': { padding: 0 } },
                ],
              }}
            >
              <SectionHeader icon={<CreateIcon fontSize="small" />} title="Create New Workflow" />

              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                  p: 1.5,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.25,
                  overflow: 'auto',
                  maxHeight: 240,
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  label="workflow name"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                />

                {Object.entries(uniqueParameters)
                  .map(([paramName, valuesSet]) => {
                    const values = Array.from(valuesSet).sort((a, b) => a.localeCompare(b));
                    const selected = selectedParams[paramName] ?? '';

                    return (
                      <SearchableSelect
                        key={paramName}
                        labelId={`${paramName}-label`}
                        inputLabel={paramName}
                        label={paramName}
                        value={selected}
                        options={['', ...values]}
                        getOptionLabel={(v) => (v === '' ? 'None' : v)}
                        onChange={(v) =>
                          setSelectedParams((prev) => ({ ...prev, [paramName]: v }))
                        }
                      />
                    );
                  })}
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!workflowName.trim()}
                >
                  Create
                </Button>
              </Box>
            </Popover>

            {/* ── Visible Spaces ── */}
            <SelectionPopover
              open={Boolean(anchorElSpaces)}
              anchorEl={anchorElSpaces}
              onClose={handelSpaceOptionsClose}
              title="Visible Spaces"
              icon={<CategoryIcon fontSize="small" />}
              options={spaceOptions ?? []}
              selectedOptions={currentSelectedSpaces}
              onToggle={handleSpaceToggle}
              onClear={() => dispatch(setSelectedSpaces({ spaces: [], table: visibleTable }))}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            />

            {/* ── Visible Columns ── */}
            <SelectionPopover
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              title="Visible Columns"
              icon={<TableRowsIcon fontSize="small" />}
              options={columnsToShow.map(c => c.field)}
              selectedOptions={selectedColumnFields}
              getOptionLabel={(field) => columnsToShow.find(c => c.field === field)?.headerName ?? field}
              onToggle={handleColumnToggle}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            />

            {/* ── Group By ── */}
            <SelectionPopover
              open={Boolean(anchorElGroup)}
              anchorEl={anchorElGroup}
              onClose={handleGroupClose}
              title="Group By"
              icon={<CategoryIcon fontSize="small" />}
              options={groupByOptions ?? []}
              selectedOptions={workflowsTable.groupBy}
              onToggle={(option) => {
                dispatch(setGroupBy(
                  workflowsTable.groupBy.includes(option)
                    ? workflowsTable.groupBy.filter(p => p !== option)
                    : [...workflowsTable.groupBy, option],
                ));
              }}
              onClear={() => dispatch(setGroupBy([]))}
              clearLabel="Clear Grouping"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            />
        </Stack>
      )}
    </Toolbar>
  );
}
