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
  List,
  ListItemButton,
  Badge,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  FormControl,
  SelectChangeEvent,
  InputLabel,
  Select,
  MenuItem,
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
import { useState } from 'react';
import PivotTableChartRoundedIcon from '@mui/icons-material/PivotTableChartRounded';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import GrainIcon from '@mui/icons-material/Grain';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import TableRowsIcon from '@mui/icons-material/TableRows';
import CategoryIcon from '@mui/icons-material/Category';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import AddIcon from '@mui/icons-material/Add';
import CreateIcon from '@mui/icons-material/Create';
import { IRun } from '../../../../shared/models/experiment/run.model';
import { setWorkflowsData } from '../../../../store/slices/progressPageSlice';

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
    spaceOptions
  } = props;
  const { visibleTable, workflowsTable, scheduledTable, selectedTab } =
    useAppSelector((state: RootState) => state.monitorPage);
  const { workflows, experiment } = useAppSelector(
    (state: RootState) => state.progressPage,
  );
  const dispatch = useAppDispatch();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [anchorElGroup, setAnchorElGroup] = useState<null | HTMLElement>(null);
  const [anchorElSpaces, setAnchorElSpaces] = useState<null | HTMLElement>(null);
  const [anchorElCreateWorkflow, setAnchorElCreateWorkflow] = useState<null | HTMLElement>(null);

  const uniqueParameters = workflows.data.reduce(
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
  );

  const [workflowName, setWorkflowName] = useState("");
  const [selectedParams, setSelectedParams] = useState<Record<string, string>>({});

  const handleParamChange = (paramName: string) => (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    setSelectedParams((prev) => ({ ...prev, [paramName]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = Object.entries(selectedParams)
      .filter(([, v]) => v !== "" && v !== undefined)
      .map(([name, value]) => ({ name, value }));

    //for now create a new dummy scheduled workflow
    const newRun: IRun = {
      id: workflowName.trim(),
      name: workflowName.trim(),
      experimentId: experiment.data?.id || '',
      status: "SCHEDULED",
      startTime: undefined,
      endTime: undefined,
      params,
      metrics: [],
      dataAssets: [],
      tags: {},
    };
    const updatedWorkflows = workflows.data.concat(newRun);
    dispatch(setWorkflowsData(updatedWorkflows));

    setWorkflowName("");
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

  const handleCreateWorkflowOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElCreateWorkflow(event.currentTarget);
  };

  const handleCreateWokrkflowClose = () => setAnchorElCreateWorkflow(null);

  const open = Boolean(anchorEl);

  // Custom header component for popover sections
  const SectionHeader = ({
    icon,
    title,
  }: {
    icon: React.ReactNode
    title: string
  }) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        px: 2,
        py: 1.5,
        background: 'linear-gradient(to right, #f1f5f9, #f8fafc)',
        borderTopLeftRadius: '10px',
        borderTopRightRadius: '10px',
        margin: 0,
        width: '100%',
      }}
    >
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#3566b5',
        mr: 1.5
      }}>
        {icon}
      </Box>
      <Typography
        variant="subtitle1"
        sx={{
          display: 'flex',
          alignItems: 'center',
          fontWeight: 600,
          color: '#1e3a5f',
          letterSpacing: '0.3px',
        }}
      >
        {title}
      </Typography>
    </Box>
  );

  return (
    <Toolbar
      sx={{
        minHeight: 48,
        height: 48,
        '@media (min-width:600px)': {
          minHeight: 48,
          height: 48,
        },
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
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
          sx={{ flex: '1 1 60%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        selectedTab !== 1 && (
          <Tooltip title="" sx={{ width: '15%' }}>
            <Stack spacing={1} direction="row">
              <Button
                size="small"
                variant={
                  visibleTable === 'workflows' ? 'contained' : 'outlined'
                }
                sx={{
                  padding: 1,
                  margin: 2,
                  fontSize: '11px',
                  fontWeight: 'bold',
                  borderRadius: 4,
                }}
                onClick={() => dispatch(setVisibleTable('workflows'))}
              >
                Completed
              </Button>
              <Button
                size="small"
                variant={
                  visibleTable === 'scheduled' ? 'contained' : 'outlined'
                }
                sx={{
                  padding: 1,
                  margin: 2,
                  fontSize: '11px',
                  fontWeight: 'bold',
                  borderRadius: 4,
                }}
                onClick={() => dispatch(setVisibleTable('scheduled'))}
              >
                Scheduled
              </Button>
            </Stack>
          </Tooltip>
        )
      )}
      {numSelected > 0 && selectedTab !== 1 ? (
        <Tooltip title="">
          <Button
            sx={{ padding: 1, margin: 2 }}
            size="small"
            variant="contained"
            disabled={numSelected < 2 && tableName === 'Workflow Execution'}
            style={{ fontSize: '11px' }}
            onClick={handleClickedFunction('compare-completed')}
          >
            {actionButtonName}
          </Button>
        </Tooltip>
      ) : (
        <Box
          sx={{
            width: selectedTab !== 1 ? '85%' : '100%',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row',
            pl: 1,
          }}
        >
          <Box sx={{ gap: 0.2, marginLeft: 'auto' }}>
            {/* <Tooltip title='Create new workflow'> */}
              {/* <IconButton onClick={handleCreateWorkflowOpen}>
                <AddIcon />
              </IconButton>
            </Tooltip> */}
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
            <Popover
              open={Boolean(anchorElCreateWorkflow)}
              anchorEl={anchorElCreateWorkflow}
              onClose={handleCreateWokrkflowClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              PaperProps={{
                elevation: 3,
                sx: {
                  width: 300,
                  maxHeight: 300,
                  overflow: 'hidden',
                  padding: 0,
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.16)',
                  border: '1px solid rgba(0,0,0,0.04)',
                  mt: 1,
                  '& .MuiList-root': {
                    padding: 0,
                  }
                },
              }}
            >
              <SectionHeader icon={<CreateIcon fontSize="small" />} title="Create New Workflow" />
              
              <Box 
                component="form" 
                onSubmit={handleSubmit} 
                sx={{
                  p: 2, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 2, 
                  overflow: 'auto', 
                  maxHeight: 200
                }}
              >
                <TextField 
                  fullWidth
                  size="small"
                  label="Workflow name"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                />

                {Object.entries(uniqueParameters)
                  .map(([paramName, valuesSet]) => {
                    const values = Array.from(valuesSet).sort((a, b) => a.localeCompare(b));
                    const selected = selectedParams[paramName] ?? "";
                    return (
                      <FormControl key={paramName} size="small" fullWidth>
                        <InputLabel id={`${paramName}-label`}>{paramName}</InputLabel>
                        <Select
                          labelId={`${paramName}-label`}
                          label={paramName}
                          value={selected}
                          onChange={handleParamChange(paramName)}
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          {values.map((v) => (
                            <MenuItem key={v} value={v}>
                              {v}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
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

            <Popover
              open={Boolean(anchorElSpaces)}
              anchorEl={anchorElSpaces}
              onClose={handelSpaceOptionsClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              PaperProps={{
                elevation: 3,
                sx: {
                  width: 300,
                  maxHeight: 300,
                  overflow: 'hidden',
                  padding: 0,
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.16)',
                  border: '1px solid rgba(0,0,0,0.04)',
                  mt: 1,
                  '& .MuiList-root': {
                    padding: 0,
                  }
                },
              }}
            >
              <SectionHeader icon={<CategoryIcon fontSize="small" />} title="Visible Spaces" />

              <List sx={{ width: '100%', py: 0, maxHeight: 200, overflow: 'auto' }}>
                {spaceOptions?.map(option => (
                  <ListItem
                    key={option}
                    disablePadding
                    sx={{ '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.04)' } }}
                  >
                    <ListItemButton
                      onClick={() => {
                        const spaces = visibleTable === 'workflows' ?
                          workflowsTable.selectedSpaces.includes(option) ?
                            workflowsTable.selectedSpaces.filter(p => p !== option)
                            :
                            [...workflowsTable.selectedSpaces, option]
                          :
                          scheduledTable.selectedSpaces.includes(option) ?
                            scheduledTable.selectedSpaces.filter(p => p !== option)
                            :  [...scheduledTable.selectedSpaces, option];

                        dispatch(setSelectedSpaces(
                          { spaces, table: visibleTable }
                        ));
                      }}
                      dense
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {visibleTable === 'workflows' ? workflowsTable.selectedSpaces.includes(option) ? (
                          <CheckBoxIcon color="primary" fontSize="small" />
                        ) : (
                          <CheckBoxOutlineBlankIcon fontSize="small" color="action" />
                        ) : scheduledTable.selectedSpaces.includes(option) ? (
                          <CheckBoxIcon color="primary" fontSize="small" />
                        ) : (
                          <CheckBoxOutlineBlankIcon fontSize="small" color="action" />
                        )
                        }
                      </ListItemIcon>
                      <ListItemText
                        primary={option}
                        primaryTypographyProps={{ fontSize: '0.95rem' }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>

              {visibleTable === 'workflows' ? workflowsTable.selectedSpaces.length > 0 && (
                <Box sx={{
                  p: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                  background: '#f8f9fa'
                }}>
                  <Button
                    onClick={() => dispatch(setSelectedSpaces({ spaces: [], table: visibleTable }))}
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={<ClearAllIcon />}
                  >
                    Clear Selection
                  </Button>
                </Box>
              ) : scheduledTable.selectedSpaces.length > 0 && (
                <Box sx={{
                  p: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                  background: '#f8f9fa'
                }}>
                  <Button
                    onClick={() => dispatch(setSelectedSpaces({ spaces: [], table: visibleTable }))}
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={<ClearAllIcon />}
                  >
                    Clear Selection
                  </Button>
                </Box>
              )}
            </Popover>

            <Popover
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              PaperProps={{
                elevation: 3,
                sx: {
                  width: 300,
                  maxHeight: 300,
                  overflow: 'hidden',
                  padding: 0,
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.16)',
                  border: '1px solid rgba(0,0,0,0.04)',
                  mt: 1,
                  '& .MuiList-root': {
                    padding: 0,
                  }
                },
              }}
            >
              <SectionHeader icon={<TableRowsIcon fontSize="small" />} title="Visible Columns" />

              <List sx={{ width: '100%', py: 0, maxHeight: 200, overflow: 'auto' }}>
                {visibleTable === 'workflows'
                  ? workflowsTable.visibleColumns.slice(0, -1).map(column => (
                    <ListItem
                      key={column.field}
                      disablePadding
                      sx={{ '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.04)' } }}
                    >
                      <ListItemButton
                        onClick={() => {
                          dispatch(
                            setWorkflowsTable({
                              columnsVisibilityModel: {
                                ...workflowsTable.columnsVisibilityModel,
                                [column.field]:
                                    !workflowsTable.columnsVisibilityModel[
                                      column.field
                                    ],
                              },
                            }),
                          );
                        }}
                        dense
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {workflowsTable.columnsVisibilityModel[column.field] !== false ? (
                            <CheckBoxIcon color="primary" fontSize="small" />
                          ) : (
                            <CheckBoxOutlineBlankIcon fontSize="small" color="action" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={column.headerName}
                          primaryTypographyProps={{ fontSize: '0.95rem' }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))
                  : scheduledTable.columns.slice(0, -1).map(column => (
                    <ListItem
                      key={column.field}
                      disablePadding
                      sx={{ '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.04)' } }}
                    >
                      <ListItemButton
                        onClick={() => {
                          dispatch(
                            setScheduledTable({
                              columnsVisibilityModel: {
                                ...scheduledTable.columnsVisibilityModel,
                                [column.field]:
                                    !scheduledTable.columnsVisibilityModel[
                                      column.field
                                    ],
                              },
                            }),
                          );
                        }}
                        dense
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {scheduledTable.columnsVisibilityModel[column.field] !== false ? (
                            <CheckBoxIcon color="primary" fontSize="small" />
                          ) : (
                            <CheckBoxOutlineBlankIcon fontSize="small" color="action" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={column.headerName}
                          primaryTypographyProps={{ fontSize: '0.95rem' }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
              </List>
            </Popover>
            <Popover
              open={Boolean(anchorElGroup)}
              anchorEl={anchorElGroup}
              onClose={handleGroupClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              PaperProps={{
                elevation: 3,
                sx: {
                  width: 300,
                  maxHeight: 300,
                  overflow: 'hidden',
                  padding: 0,
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.16)',
                  border: '1px solid rgba(0,0,0,0.04)',
                  mt: 1,
                  '& .MuiList-root': {
                    padding: 0,
                  }
                },
              }}
            >
              <SectionHeader icon={<CategoryIcon fontSize="small" />} title="Group By" />

              <List sx={{ width: '100%', py: 0, maxHeight: 200, overflow: 'auto' }}>
                {groupByOptions?.map(option => (
                  <ListItem
                    key={option}
                    disablePadding
                    sx={{ '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.04)' } }}
                  >
                    <ListItemButton
                      onClick={() => {
                        dispatch(
                          setGroupBy(
                            workflowsTable.groupBy.includes(option)
                              ? workflowsTable.groupBy.filter(p => p !== option)
                              : [...workflowsTable.groupBy, option],
                          ),
                        );
                      }}
                      dense
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {workflowsTable.groupBy.includes(option) ? (
                          <CheckBoxIcon color="primary" fontSize="small" />
                        ) : (
                          <CheckBoxOutlineBlankIcon fontSize="small" color="action" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={option}
                        primaryTypographyProps={{ fontSize: '0.95rem' }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>

              {workflowsTable.groupBy.length > 0 && (
                <Box sx={{
                  p: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                  background: '#f8f9fa'
                }}>
                  <Button
                    onClick={() => dispatch(setGroupBy([]))}
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={<ClearAllIcon />}
                  >
                    Clear Grouping
                  </Button>
                </Box>
              )}
            </Popover>
          </Box>
        </Box>
      )}
    </Toolbar>
  );
}
