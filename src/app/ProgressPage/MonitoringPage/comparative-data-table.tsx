import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
} from '@mui/material';
import type { IMetaDataSummary } from '../../../shared/models/dataexploration.model';
import type { IDataAsset } from '../../../shared/models/experiment/data-asset.model';
import Histogram from './comparative-data-histogram';
import { useMemo } from 'react';

export interface SummaryTableProps {
  summary: IMetaDataSummary[];
  dataset: IDataAsset;
  workflowId: string;
  title?: string;
}

type StatKey = keyof IMetaDataSummary;

const stats: { key: StatKey; label: string }[] = [
  // { key: 'min', label: 'Min' },
  // { key: 'max', label: 'Max' },
  { key: 'avg', label: 'Avg' },
  { key: 'std', label: 'Std' },
  { key: 'approx_unique', label: 'Unique' },
  { key: 'null_percentage', label: 'Null %' },
];

const stickyCellSx = {
  position: 'sticky',
  left: 0,
  zIndex: 999,
  backgroundColor: 'background.paper',
  fontWeight: 'bold',
};

const SummaryTable = ({ summary, dataset, workflowId, title }: SummaryTableProps) => {
  const columnNames = useMemo(
    () => summary.map(col => col.column_name).filter((name): name is string => typeof name === 'string'),
    [summary]
  );

  const getStatValue = (col: string, statKey: StatKey) => {
    const colSummary = summary.find(s => s.column_name === col);
    const value = colSummary?.[statKey];

    return value != null ? Number(value).toFixed(3) : '—';
  };

  return (
    <Box sx={{ width: '100%' }}>
      {title && (
        <Typography variant="h6" gutterBottom sx={{ pl: 2 }}>
          {title}
        </Typography>
      )}
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableBody>
            {/* Histogram Row */}
            <TableRow>
              <TableCell sx={stickyCellSx}/>
              {columnNames.map(col => (
                <TableCell key={col}>
                  <Box sx={{ height: 300, width: '100%' }}>
                    <Histogram columnName={col} dataset={dataset} workflowId={workflowId} />
                  </Box>
                </TableCell>
              ))}
            </TableRow>

            {/* Summary Stat Rows */}
            {stats.map(({ key, label }) => (
              <TableRow key={key}>
                <TableCell sx={stickyCellSx}>{label}</TableCell>
                {columnNames.map(col => (
                  <TableCell key={col} align="center">
                    {getStatValue(col, key)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SummaryTable;
