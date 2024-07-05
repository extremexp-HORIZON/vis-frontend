import type * as React from 'react';
import Tooltip from '@mui/material/Tooltip';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FilterListIcon from '@mui/icons-material/FilterList';
import { alpha } from '@mui/material/styles';
import { Button, Stack } from '@mui/material';

interface ToolBarWorkflowProps {
  filterNumbers: number;
  numSelected: number;
  tableName: string;
  actionButtonName: string;
  secondActionButtonName?: string;
  handleClickedFunction: (list: Number[]) => void;
  filterClickedFunction: (event: React.MouseEvent<HTMLButtonElement>) => void;

}

export default function ToolBarWorkflow(props: ToolBarWorkflowProps) {
  const { filterNumbers, numSelected, tableName, actionButtonName, secondActionButtonName, handleClickedFunction, filterClickedFunction } = props;

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
        <Typography
          sx={{ flex: '1 1 55%' }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          {tableName}
          <IconButton onClick={(event) => filterClickedFunction(event)}>
            <FilterListIcon />
            <Typography gap={5}> {filterNumbers > 0 ? ` (${filterNumbers})` : ''}</Typography>
          </IconButton>
        </Typography>
      )}
      {numSelected > 0 ? (
        <Tooltip title="CompareCancelSelected">
          <Button
            sx={{ padding: 1, margin: 2 }}
            size="small"
            variant="contained"
            disabled={numSelected < 2 && tableName === "Workflow Execution"}
            style={{ fontSize: "11px" }}
            onClick={() => handleClickedFunction([])} // TODO: Get the selected and get right value to open new tab or cancel scheduled
          >
            {actionButtonName}

          </Button>
        </Tooltip>
      ) : (
        <Tooltip title="Filterlist">
          <Stack spacing={2} direction="row">
            {secondActionButtonName ?
              <Button
                sx={{ padding: 1, margin: 2 }}
                size="small"
                variant="outlined"
                color="success"
                style={{ fontSize: "11px", fontWeight: 'bold' }}
                onClick={() => handleClickedFunction([])} // TODO: Get all the completed and get right value to open new tab
              >
                {secondActionButtonName}
              </Button> : ''}
          </Stack>
        </Tooltip>
      )}
    </Toolbar>
  );
}
