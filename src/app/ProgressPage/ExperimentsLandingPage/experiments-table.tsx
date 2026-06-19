import { useMemo, useState } from 'react';
import {
  Box,
  ClickAwayListener,
  IconButton,
  MenuItem,
  Paper,
  Popover,
  TextField,
  Tooltip,
  Typography,
  Button,
  useTheme,
} from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
} from '@mui/x-data-grid';
import { Link } from 'react-router-dom';
import LaunchIcon from '@mui/icons-material/Launch';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import type { IExperiment } from '../../../shared/models/experiment/experiment.model';

import ExperimentsTableToolbar, {
  ExperimentsToolbarProvider,
  type ExperimentsToolbarCtxValue,
} from './experiment-table-toolbar';

import ProgressBar from '../../../shared/components/prgress-bar';
import { menuPaperSx } from '../../../shared/styles/card-surface';

export type ExperimentRow = {
  id: string;
  name: string;
  status: string;
  lastUpdateTime: number;
  creationTime: number;
  tagsString: string;
};

const ACTION_COL_WIDTH = 120;
const STATUS_COL_WIDTH = 140;

const normalizeStatus = (s?: string) => (s ?? 'UNKNOWN').toUpperCase();

const formatDate = (timestamp?: number) => {
  if (!timestamp) return '';
  try {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

const buildTagsString = (tags?: Record<string, string>) =>
  Object.entries(tags ?? {})
    .map(([k, v]) => `${k}:${v}`)
    .join(' ');

const matchesQuery = (row: ExperimentRow, q: string) => {
  const query = q.trim().toLowerCase();

  if (!query) return true;

  return (
    row.id.toLowerCase().includes(query) ||
    row.name.toLowerCase().includes(query) ||
    row.status.toLowerCase().includes(query) ||
    row.tagsString.toLowerCase().includes(query)
  );
};

const FilterHeader = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      borderBottom: theme => `1px solid ${theme.palette.divider}`,
      px: 2,
      py: 1.5,
      background: theme => theme.palette.customSurface.sectionHeader,
      borderTopLeftRadius: '10px',
      borderTopRightRadius: '10px',
      width: '100%',
      gap: 1.5,
    }}
  >
    <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
      <FilterListIcon fontSize="small" />
    </Box>
    <Typography sx={{ fontWeight: 600, color: 'text.primary' }} variant="subtitle1">
      Filters
    </Typography>
  </Box>
);

type ExperimentsTableProps = {
  experiments: IExperiment[];
  loading: boolean;
  onRefresh: () => void;
};

export default function ExperimentsTable(props: ExperimentsTableProps) {
  const { experiments, loading, onRefresh } = props;

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | string>('ALL');

  const [filtersAnchorEl, setFiltersAnchorEl] = useState<HTMLElement | null>(
    null
  );
  const filtersOpen = Boolean(filtersAnchorEl);

  const handleClear = () => {
    setQuery('');
    setStatusFilter('ALL');
  };

  const theme = useTheme();
  
  const statusOptions = useMemo(() => {
    const set = new Set<string>();

    experiments.forEach((e) => set.add(normalizeStatus(e.status)));

    return ['ALL', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [experiments]);

  const allRows = useMemo<ExperimentRow[]>(() => {
    return experiments
      .slice()
      .sort((a, b) => (b.creationTime ?? 0) - (a.creationTime ?? 0))
      .map((e) => ({
        id: e.id,
        name: e.name?.trim() ? e.name : `Experiment ${e.id.slice(0, 8)}`,
        status: normalizeStatus(e.status),
        lastUpdateTime: e.lastUpdateTime ?? 0,
        creationTime: e.creationTime ?? 0,
        tagsString: buildTagsString(e.tags),
      }));
  }, [experiments]);

  const rows = useMemo(() => {
    return allRows
      .filter((r) => matchesQuery(r, query))
      .filter((r) => (statusFilter === 'ALL' ? true : r.status === statusFilter));
  }, [allRows, query, statusFilter]);

  const filtersCount = useMemo(() => {
    let c = 0;

    if (query.trim()) c += 1;
    if (statusFilter !== 'ALL') c += 1;

    return c;
  }, [query, statusFilter]);

  const columns = useMemo<GridColDef<ExperimentRow>[]>(() => {
    return [
      { field: 'name', headerName: 'Name', flex: 1, minWidth: 260 },
      { field: 'id', headerName: 'ID', flex: 1, minWidth: 220 },
      {
        field: 'lastUpdateTime',
        headerName: 'Last Update',
        width: 200,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params: GridRenderCellParams<ExperimentRow, number>) => (
          <span>{formatDate(params.value)}</span>
        ),
      },
      {
        field: 'creationTime',
        headerName: 'Created',
        width: 200,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params: GridRenderCellParams<ExperimentRow, number>) => (
          <span>{formatDate(params.value)}</span>
        ),
      },
      {
        field: 'status',
        headerName: 'Status',
        width: STATUS_COL_WIDTH,
        align: 'center',
        headerAlign: 'center',
        sortable: true,
        renderCell: (params: GridRenderCellParams<ExperimentRow, string>) => (
          <ProgressBar
            workflowStatus={params.value ?? 'UNKNOWN'}
            workflowId={params.row.id}
          />
        ),
      },
      {
        field: 'action',
        headerName: 'Actions',
        width: ACTION_COL_WIDTH,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params: GridRenderCellParams<ExperimentRow>) => {
          const experimentId = params.row.id;

          return (
            <span
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <Link to={`/${experimentId}/monitoring`}>
                <Tooltip title="Open" arrow>
                  <IconButton>
                    <LaunchIcon
                      style={{
                        cursor: 'pointer',
                        color: theme.palette.primary.main,
                      }}
                    />
                  </IconButton>
                </Tooltip>
              </Link>
            </span>
          );
        },
      },
    ];
  }, []);

  const toolbarCtx = useMemo<ExperimentsToolbarCtxValue>(
    () => ({
      tableName: 'Experiments',
      filtersCount,
      loading,
      onOpenFilters: (anchor) => setFiltersAnchorEl(anchor),
      onRefresh,
    }),
    [filtersCount, loading, onRefresh]
  );

  return (
    <Paper elevation={2} sx={{ height: '100%', width: '100%' }}>
      <ExperimentsToolbarProvider value={toolbarCtx}>
        <DataGrid<ExperimentRow>
          rows={rows}
          columns={columns}
          disableColumnMenu
          disableRowSelectionOnClick
          density="compact"
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { page: 0, pageSize: 25 } },
          }}
          onRowClick={undefined}
          slots={{ toolbar: ExperimentsTableToolbar }}
          sx={{
            border: 'none',
            '--DataGrid-rowBorderColor': (theme) => theme.palette.divider,
            '--DataGrid-containerBackground': (theme) => theme.palette.customGrey.main,

            '& .MuiDataGrid-scrollbarFiller': {
              backgroundColor: (theme) => theme.palette.customGrey.main,
            },
            '& .MuiDataGrid-columnHeaders': {
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            },
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: (theme) => theme.palette.customGrey.main,
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              whiteSpace: 'nowrap',
              overflow: 'visible',
              fontWeight: 700,
            },
            '& .MuiDataGrid-columnSeparator': {
              color: 'transparent',
            },
            '& .MuiDataGrid-cell': {
              fontSize: '0.8rem',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: (theme) => theme.palette.action.hover,
            },

            '& .MuiDataGrid-columnHeader[data-field="action"]': {
              position: 'sticky',
              right: 0,
              zIndex: 1000,
              backgroundColor: (theme) => theme.palette.customGrey.main,
              borderLeft: (theme) => `1px solid ${theme.palette.divider}`,
            },
            '& .MuiDataGrid-cell[data-field="action"]': {
              position: 'sticky',
              right: 0,
              zIndex: 999,
              backgroundColor: (theme) => theme.palette.customGrey.light,
              borderLeft: (theme) => `1px solid ${theme.palette.divider}`,
            },

            '& .MuiDataGrid-columnHeader[data-field="status"]': {
              position: 'sticky',
              right: ACTION_COL_WIDTH,
              zIndex: 999,
              backgroundColor: (theme) => theme.palette.customGrey.main,
              borderLeft: (theme) => `1px solid ${theme.palette.divider}`,
            },
            '& .MuiDataGrid-cell[data-field="status"]': {
              position: 'sticky',
              right: ACTION_COL_WIDTH,
              zIndex: 998,
              backgroundColor: (theme) => theme.palette.customGrey.light,
              borderLeft: (theme) => `1px solid ${theme.palette.divider}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },

            '& .MuiDataGrid-footerContainer': {
              minHeight: '56px',
              borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            },
            '& .MuiTablePagination-root': {
              overflow: 'visible',
            },
          }}
        />

        {/* Filters Popover */}
        <Popover
          open={filtersOpen}
          anchorEl={filtersAnchorEl}
          onClose={() => setFiltersAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          PaperProps={{
            elevation: 0,
            sx: [menuPaperSx({ width: 420 }), { padding: 0 }],
          }}
        >
          <ClickAwayListener
            mouseEvent="onMouseDown"
            touchEvent="onTouchStart"
            disableReactTree
            onClickAway={() => setFiltersAnchorEl(null)}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <FilterHeader />

              {/* body */}
              <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  size="small"
                  label="Search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="id, name, status, tag:value…"
                  fullWidth
                />

                <TextField
                  select
                  size="small"
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  fullWidth
                  SelectProps={{
                    MenuProps: { disablePortal: true },
                  }}
                >
                  {statusOptions.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              {/* footer */}
              <Box
                sx={{
                  p: 1,
                  borderTop: theme => `1px solid ${theme.palette.divider}`,
                  backgroundColor: 'background.paper',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Button
                  onClick={handleClear}
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={<ClearAllIcon />}
                  disabled={filtersCount === 0}
                >
                  Clear Filters
                </Button>
              </Box>
            </Box>
          </ClickAwayListener>
        </Popover>
      </ExperimentsToolbarProvider>
    </Paper>
  );
}
