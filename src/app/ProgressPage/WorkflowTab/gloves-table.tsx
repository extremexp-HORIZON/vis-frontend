import type React from 'react';
import type { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import { Box, styled, Typography } from '@mui/material';
import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material';
import type { IEffCostActions, ITableContents } from '../../../shared/models/plotmodel.model';
import type { GridRenderCellParams } from '@mui/x-data-grid';
import { CustomGridColDef } from '../../../shared/types/table-types';

interface DataTableProps {
  title: string
  data: ITableContents
  eff_cost_actions?: IEffCostActions
}

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  '& .MuiDataGrid-scrollbarFiller': {
    backgroundColor: theme.palette.customGrey.main,
  },
  '& .MuiDataGrid-columnHeader': {
    backgroundColor: theme.palette.customGrey.main,
  },
  '& .MuiDataGrid-columnHeader[data-field="__check__"]': {
    backgroundColor: theme.palette.customGrey.main,
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    whiteSpace: 'nowrap',
    overflow: 'visible',
  },
  // Fix header to remain at top
  '& .MuiDataGrid-main': {
    // Critical for layout
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  '& .MuiDataGrid-columnHeaders': {
    position: 'sticky',
    top: 0,
    zIndex: 2,
  },
  // Ensure the cell container scrolls properly
  '& .MuiDataGrid-virtualScroller': {
    flex: 1,
    overflow: 'auto',
  },
  // Fix pagination to remain at bottom
  '& .MuiDataGrid-footerContainer': {
    minHeight: '56px',
    borderTop: '1px solid rgba(224, 224, 224, 1)',
    position: 'sticky',
    bottom: 0,
    zIndex: 2,
    backgroundColor: '#ffffff',
  },
  '& .MuiTablePagination-root': {
    overflow: 'visible',
  },
  // Add border radius to bottom corners
  '&.MuiDataGrid-root': {
    borderRadius: '0 0 12px 12px',
    border: 'none',
    height: '100%', // Ensure full height
  },
  // Add styling for selected row
  '& .MuiDataGrid-row.Mui-selected': {
    backgroundColor: `${theme.palette.primary.light}40`,
    '&:hover': {
      backgroundColor: `${theme.palette.primary.light}60`,
    },
  },
  '& .MuiDataGrid-columnHeader[data-field="action"]': {
    position: 'sticky',
    right: 0,
    zIndex: 999,
    backgroundColor: theme.palette.customGrey.main,
    borderLeft: '1px solid #ddd',
  },
  '& .MuiDataGrid-cell[data-field="action"]': {
    position: 'sticky',
    right: 0,
    zIndex: 999,
    backgroundColor: theme.palette.customGrey.light,
    borderLeft: '1px solid #ddd',
  },
}));

const GlovesTable: React.FC<DataTableProps> = ({
  title,
  data,
  eff_cost_actions,
}) => {
  // Extract the keys of the data object
  const keys = Object.keys(data);

  // Create rows dynamically, including effectiveness and cost if available
  const numRows = data[keys[0]].values.length;

  const rows: GridRowsProp = Array.from({ length: numRows }, (_, index) => {
    const row: { id: number; [key: string]: string | number } = {
      id: index + 1,
    };

    keys.forEach(key => {
      const rawValue = data[key].values[index];
      const parsed = parseFloat(rawValue);

      row[key] = !isNaN(parsed) ? parseFloat(parsed.toFixed(2)) : rawValue;
    });

    // Merge eff_cost_actions data if available
    if (eff_cost_actions && eff_cost_actions[index + 1]) {
      row['eff'] = (eff_cost_actions[index + 1].eff * 100).toFixed(2); // Effectiveness as percentage
      row['cost'] = eff_cost_actions[index + 1].cost.toFixed(2); // Cost
    }

    return row;
  });

  // Create columns dynamically
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'Action ID', flex: 0.5, minWidth: 100, align: 'center', headerAlign: 'center' }, // Add ID as the first column
    { field: 'eff', headerName: 'Effectiveness (%)', flex: 1, minWidth: 150, align: 'center', headerAlign: 'center' },
    { field: 'cost', headerName: 'Cost', flex: 1, minWidth: 100, align: 'center', headerAlign: 'center' },
    ...keys.map(key => ({
      field: key,
      headerName: key.replace(/_/g, ' '), // Format header names for better readability
      flex: 1,
      minWidth: 150,
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => {
        const value = params.value;
        const numValue = parseFloat(value);

        // Check if the value is positive or negative to decide the arrow color and orientation
        const isPositive = !isNaN(numValue) && numValue > 0;
        const isNegative = !isNaN(numValue) && numValue < 0;

        return (
          <Box display="flex" alignItems="center" justifyContent="center">
            <Typography variant="body2">{value}</Typography>
            {isPositive && <ArrowDropUp style={{ color: 'green' }} />}
            {isNegative && <ArrowDropDown style={{ color: 'red' }} />}
          </Box>
        );
      },
    } as GridColDef)),
  ];

  return (
    <StyledDataGrid
      rows={rows}
      columns={columns}
      pagination
      hideFooter
      pageSizeOptions={[25, 50, 100]}
      checkboxSelection={false}
      disableRowSelectionOnClick={false}
      sx={{
        width: '100%',
        border: 'none',
        '& .MuiDataGrid-cell': {
          whiteSpace: 'normal', // Allow text to wrap
          wordWrap: 'break-word',
        },
        '& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell': {
          // Add border to make cells more distinct
          borderRight: '1px solid rgba(224, 224, 224, 0.4)',
        },
        // Make the grid look better when fewer columns
        '& .MuiDataGrid-main': {
          overflow: 'hidden',
        },
        // Style for selected row
        '& .MuiDataGrid-row.Mui-selected': {
          backgroundColor: 'rgba(25, 118, 210, 0.15)',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.25)',
          },
        },
        '& .MuiDataGrid-selectedRowCount': {
          visibility: 'hidden',
        },
      }}
    />
  );
};

export default GlovesTable;
