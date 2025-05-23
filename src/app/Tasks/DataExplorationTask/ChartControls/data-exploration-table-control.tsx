import type React from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, Checkbox, ListItemText } from '@mui/material';
import TableRowsIcon from '@mui/icons-material/TableRows';
import { useAppSelector, useAppDispatch } from '../../../../store/store';
import { setControls } from '../../../../store/slices/workflowPageSlice';

// Column selection panel component
const ColumnSelectionPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tab } = useAppSelector(state => state.workflowPage);

  const originalColumns = tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns || [];
  const selectedColumns = tab?.workflowTasks.dataExploration?.controlPanel?.selectedColumns || [];
  const selectedColumnNames = selectedColumns.map(col => col.name);

  const handleColumnToggle = (columnName: string) => () => {
    const newSelectedColumns = selectedColumns.some(col => col.name === columnName)
      ? selectedColumns.filter(col => col.name !== columnName)
      : [...selectedColumns, originalColumns.find(col => col.name === columnName)!];

    dispatch(setControls({ selectedColumns: newSelectedColumns }));

    // if (newSelectedColumns.length) {
    //   handleFetchDataExploration(newSelectedColumns);
    // }
  };

  // const handleFetchDataExploration = (columns = selectedColumns) => {
  //   if (!columns?.length) return;

  //   dispatch(fetchDataExplorationData({
  //     query: {
  //       ...defaultDataExplorationQuery,
  //       datasetId: tab?.dataTaskTable.selectedItem?.data?.source || "",
  //       columns: columns.map(col => col.name),
  //       filters: tab?.workflowTasks.dataExploration?.controlPanel?.filters || [],
  //     },
  //     metadata: {
  //       workflowId: tab?.workflowId || "",
  //       queryCase: "chart",
  //     },
  //   }));
  // };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        mb: 1.5,
        color: '#3566b5',
      }}>
        <TableRowsIcon fontSize="small" sx={{ mr: 1 }} />
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: '#1e3a5f',
          }}
        >
          Select columns to display
        </Typography>
      </Box>
      <Box sx={{
        maxHeight: 250,
        overflow: 'auto',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: '8px',
        bgcolor: 'rgba(248,249,250,0.6)',
      }}>
        <List dense disablePadding>
          {originalColumns.map((column) => (
            <ListItem
              key={column.name}
              disablePadding
              divider
              sx={{
                '&:last-child': {
                  borderBottom: 'none',
                }
              }}
            >
              <ListItemButton
                onClick={handleColumnToggle(column.name)}
                sx={{
                  py: 0.5,
                  '&:hover': {
                    bgcolor: 'rgba(53, 102, 181, 0.04)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Checkbox
                    edge="start"
                    checked={selectedColumnNames.includes(column.name)}
                    tabIndex={-1}
                    disableRipple
                    size="small"
                    color="primary"
                  />
                </ListItemIcon>
                <ListItemText
                  primary={column.name}
                  primaryTypographyProps={{
                    variant: 'body2',
                    sx: {
                      fontSize: '0.875rem',
                      fontWeight: selectedColumnNames.includes(column.name) ? 500 : 400,
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default ColumnSelectionPanel;
