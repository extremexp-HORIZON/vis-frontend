import type * as React from 'react';
import Tooltip from '@mui/material/Tooltip';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FilterListIcon from '@mui/icons-material/FilterList';
import { alpha } from '@mui/material/styles';
import { Button, Stack, Box, Chip, Popover, FormControlLabel, Checkbox } from '@mui/material';
import { RootState, useAppDispatch, useAppSelector } from '../../../../store/store';
import { setScheduledTable, setVisibleTable, setWorkflowsTable } from '../../../../store/slices/monitorPageSlice';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { useState } from 'react';
interface ToolBarWorkflowProps {
  filterNumbers: number;
  numSelected: number;
  tableName: string;
  actionButtonName: string;
  handleClickedFunction: (workflowId: number[] | string) => (e: React.SyntheticEvent) => void;
  filterClickedFunction: (event: React.MouseEvent<HTMLButtonElement>) => void;
  tableId: string;
  onRemoveFilter: (index: number) => void
}

export default function ToolBarWorkflow(props: ToolBarWorkflowProps) {
  const { filterNumbers, numSelected, tableName, actionButtonName, handleClickedFunction, filterClickedFunction, tableId, onRemoveFilter } = props;
  const { visibleTable, workflowsTable, scheduledTable } = useAppSelector(
    (state: RootState) => state.monitorPage
  )
  const dispatch = useAppDispatch()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const open = Boolean(anchorEl);


  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 &&
        {
          bgcolor: (theme) =>
            alpha(
              theme.palette.primary.dark,
              theme.palette.action.activatedOpacity
            ),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: '1 1 60%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Tooltip title="" sx={{width: "15%"}}>
          <Stack spacing={1} direction="row">
              <Button
                size="small"
                variant={ visibleTable === "workflows" ? "contained" : "outlined"}
                sx={{ padding: 1, margin: 2, fontSize: "11px", fontWeight: 'bold', borderRadius: 4 }}
                onClick={() => dispatch(setVisibleTable("workflows"))}
              >
                Workflows
              </Button>
              <Button
                size="small"
                variant={ visibleTable === "scheduled" ? "contained" : "outlined"}
                sx={{ padding: 1, margin: 2, fontSize: "11px", fontWeight: 'bold', borderRadius: 4 }}
                onClick={() => dispatch(setVisibleTable("scheduled"))}
              >
                Scheduled
              </Button>
          </Stack>
        </Tooltip>
      )}
      {numSelected > 0 ? (
        <Tooltip title="">
          <Button
            sx={{ padding: 1, margin: 2 }}
            size="small"
            variant="contained"
            disabled={numSelected < 2 && tableName === "Workflow Execution"}
            style={{ fontSize: "11px" }}
            onClick={handleClickedFunction("compare-completed")} // TODO: Get the selected and get right value to open new tab or cancel scheduled
          >
            {actionButtonName}

          </Button>
        </Tooltip>
      ) : (
        <Box sx={{ width: "85%", display: "flex",alignItems: "center",  flexDirection: "row", pl: 1}}>
          {visibleTable === "workflows" ? (
            workflowsTable.filters?.length > 0 &&
            <Box sx={{width: {lg: "70%", xl: "80%"}, overflowX: "auto", display: "flex", whiteSpace: 'nowrap', gap: 0.2}}>
              {workflowsTable.filters.map((filter, index) => {
                const label = `${filter.column} ${filter.operator} ${filter.value}`
                return (
                  <Chip label={label} onDelete={() => onRemoveFilter(index)}/>
                )
              })}
            </Box>
          ) : (
            scheduledTable.filters?.length > 0 &&
            <Box sx={{width: {lg: "70%", xl: "20%"},overflowX: "auto", display: "flex", whiteSpace: 'nowrap', gap: 0.2}}>
              {scheduledTable.filters.map((filter, index) => {
                const label = `${filter.column} ${filter.operator} ${filter.value}`
                return (
                  <Chip label={label} onDelete={() => onRemoveFilter(index)}/>
                )
              })}
            </Box>
          )}
          <Box sx={{ width: {lg: "30%", xl: "20%"}, gap: 0.2, marginLeft: "auto" }}>
            <IconButton sx={{gap: 0.2 }} onClick={(event) => filterClickedFunction(event)}>
              <FilterListIcon sx={{ color: theme => theme.palette.primary.main }} />
              <Typography variant="body2" sx={{ color: theme => theme.palette.primary.main }} > {filterNumbers > 0 ? ` (${filterNumbers})` : ''}</Typography>
              <Typography variant="body2" sx={{ color: theme => theme.palette.primary.main }} >FILTERS</Typography>
            </IconButton>
            <IconButton sx={{gap: 0.2 }} onClick={handleOpen}>
              <MenuRoundedIcon sx={{ color: theme => theme.palette.primary.main }} />
              <Typography variant="body2" sx={{ color: theme => theme.palette.primary.main }}>COLUMNS</Typography>
            </IconButton>
            <Popover
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
              <Box sx={{p: 2, display: "flex", flexDirection: "column", height: "250px"}}>
                {
                  visibleTable === "workflows" ? (
                    workflowsTable.columns.map(column => (
                      <FormControlLabel 
                        key={column.field}
                        control={
                          <Checkbox
                            checked={workflowsTable.columnsVisibilityModel[column.field] ?? true}
                            onChange={() => {
                              dispatch(setWorkflowsTable({
                                columnsVisibilityModel: {
                                  ...workflowsTable.columnsVisibilityModel,
                                  [column.field]: !workflowsTable.columnsVisibilityModel[column.field],
                                },
                              }));
                            }}
                          />  
                        } 
                        label={column.headerName}        
                      />
                    ))
                  ) : (
                    scheduledTable.columns.map(column => (
                      <FormControlLabel 
                        key={column.field}
                        control={
                          <Checkbox
                            checked={scheduledTable.columnsVisibilityModel[column.field] ?? true}
                            onChange={() => {
                              dispatch(setScheduledTable({
                                columnsVisibilityModel: {
                                  ...scheduledTable.columnsVisibilityModel,
                                  [column.field]: !scheduledTable.columnsVisibilityModel[column.field],
                                },
                              }));
                            }}
                          />  
                        } 
                        label={column.headerName}        
                      />
                    ))
                  )
                }
              </Box>
            </Popover>
          </Box>
        </Box>
      )}
    </Toolbar>
  );
}
