import { Box } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import type React from 'react';
import type { IMetaDataSummary } from '../../../shared/models/dataexploration.model';

export interface SummaryTableProps {
  summary: IMetaDataSummary[];
  title?: string;
}

type StatKey = keyof IMetaDataSummary;

const SummaryTable: React.FC<SummaryTableProps> = ({ summary }) => {
  const columnNames: string[] = summary.map(column => column.column_name).filter((name): name is string => typeof name === 'string');

  const columns: GridColDef[] = [
    {
      field: '__stat',
      headerName: '',
      minWidth: 100,
      flex: 0.5,
      sortable: false,
      filterable: false,
      headerAlign: 'center',
      align: 'left',
    },
    ...columnNames.map((col): GridColDef => ({
      field: col,
      headerName: col,
      flex: 1,
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      filterable: false,
    })),
  ];

  const buildStatRow = (statKey: StatKey, label: string) => ({
    id: statKey,
    __stat: label,
    ...Object.fromEntries(
      columnNames.map(col => {
        const colSummary = summary.find(s => s.column_name === col);
        const value = colSummary?.[statKey];

        return [col, value != null ? Number(value).toFixed(3) : '—'];
      })
    ),
  });

  const rows = [
    buildStatRow('min', 'Min'),
    buildStatRow('max', 'Max'),
    buildStatRow('avg', 'Avg'),
    buildStatRow('std', 'Std'),
    buildStatRow('approx_unique', 'Unique'),
    buildStatRow('null_percentage', 'Null Percentage'),
  ];

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <DataGrid
        columns={columns}
        rows={rows}
        hideFooter
        disableColumnMenu
        disableRowSelectionOnClick
        sx={{
          '& .MuiDataGrid-cell': {
            justifyContent: 'center',
            fontSize: '0.85rem',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 'bold',
          },
          '& .MuiDataGrid-virtualScroller': {
            overflow: 'auto',
          },
        }}
      />
    </Box>
  );
};

export default SummaryTable;
