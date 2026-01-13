import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Typography,
  Button,
  TextField,
  Box,
  Alert,
} from '@mui/material';
import { Close as CloseIcon, Memory as MemoryIcon } from '@mui/icons-material';
import type { IDataSource } from '../../shared/models/dataexploration.model';
import { preprocessPsqlData } from '../../store/slices/exploring/eusomeSlice';
import { useAppDispatch, useAppSelector } from '../../store/store';
import {
  defaultAugmentationOptions,
  defaultColumnMapping,
  type ColumnMapping,
} from '../../shared/models/eusome-api.model';

export interface PreprocessPsqlDataDialogProps {
  dataSource: IDataSource;
}

export const PreprocessPsqlDataDialog = (
  props: PreprocessPsqlDataDialogProps,
) => {
  const { dataSource } = props;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(`SELECT * FROM ${dataSource.fileName}`);
  const [queryError, setQueryError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const { preprocessPsqlData: preprocessPsqlDataLoading } = useAppSelector(state => state.eusome.loading);
  const { preprocessPsqlData: preprocessPsqlDataError } = useAppSelector(state => state.eusome.error);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setQueryError(null);
  };

  const colMap: ColumnMapping = {
    ...defaultColumnMapping,
    target: 'lte_rsrp_dbm',
    time_column: 'time',
    latitude: 'lat',
    longitude: 'lon',
  };

  /**
   * Validates that the SQL query is safe:
   * - Only allows SELECT * FROM table_name
   * - Optional WHERE clause that only allows filtering on time_column
   */
  const validateQuery = (sqlQuery: string): string | null => {
    if (!sqlQuery.trim()) {
      return 'Query cannot be empty';
    }

    // Normalize the query: remove extra whitespace
    const normalized = sqlQuery.trim().replace(/\s+/g, ' ');

    const simplePattern = /^SELECT\s+\*\s+FROM\s+[\w"[\]]+$/i;

    if (simplePattern.test(normalized)) {
      return null; // Valid
    }

    const wherePattern = /^SELECT\s+\*\s+FROM\s+[\w"[\]]+\s+WHERE\s+(.+)$/i;
    const whereMatch = normalized.match(wherePattern);

    if (whereMatch) {
      const whereClause = whereMatch[1].trim();

      // Check if WHERE clause only contains time_column references
      // Allow: time_column =, time_column >, time_column <, time_column >=, time_column <=,
      // time_column BETWEEN, time_column IN, etc.
      const timeColumnName = colMap.time_column.toLowerCase();

      // Extract all column references (words that could be column names)
      // This is a simple check - we look for the time_column name
      const columnPattern = /[\w"[\]]+/g;
      const columns = whereClause.match(columnPattern) || [];

      // Filter out SQL keywords and operators
      const sqlKeywords = [
        'and',
        'or',
        'not',
        'in',
        'between',
        'like',
        'ilike',
        'is',
        'null',
        '=',
        '>',
        '<',
        '>=',
        '<=',
        '<>',
        '!=',
        '(',
        ')',
        "'",
        '"',
        'true',
        'false',
        'now',
        'current_timestamp',
        'date',
        'timestamp',
      ];

      const columnNames = columns
        .map(col => col.toLowerCase().replace(/["[\]]/g, ''))
        .filter(col => !sqlKeywords.includes(col) && !/^\d/.test(col));

      // Check if all column references are time_column
      const invalidColumns = columnNames.filter(
        col => col !== timeColumnName && col !== 'time_column',
      );

      if (invalidColumns.length > 0) {
        return `WHERE clause can only reference the time_column (${colMap.time_column}). Found: ${invalidColumns.join(', ')}`;
      }

      return null; // Valid WHERE clause
    }

    return 'Query must be in the format: SELECT * FROM table_name [WHERE time_column ...]';
  };

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value;

    setQuery(newQuery);
    const error = validateQuery(newQuery);

    setQueryError(error);
  };

  const isQueryValid = queryError === null && query.trim() !== '';

  const handlePreprocess = () => {
    if (!isQueryValid) {
      return;
    }

    dispatch(
      preprocessPsqlData({
        psql_table_name: dataSource.fileName,
        psql_query: query,
        col_map_json: JSON.stringify(colMap),
        augmentation_options_json: JSON.stringify({
          ...defaultAugmentationOptions,
          enable_augmentation: false,
        }),
      }),
    );
  };

  return (
    <>
      <Tooltip title="Preprocess" placement="right" arrow>
        <IconButton color="secondary" size="small" onClick={handleOpen}>
          <MemoryIcon />
        </IconButton>
      </Tooltip>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: '12px',
            bgcolor: '#ffffff',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(to right, #f8f9fa, #edf2f7)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            px: 3,
            py: 1.5,
          }}
        >
          Preprocess Data on PostgreSQL Table: {dataSource.fileName}
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Preprocess the psql data for the {dataSource.fileName} data source.
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              SQL Query
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={query}
              onChange={handleQueryChange}
              placeholder="SELECT * FROM table_name [WHERE time_column ...]"
              error={!!queryError}
              helperText={queryError}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                },
              }}
            />
          </Box>
          {queryError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {queryError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            color="primary"
            onClick={handlePreprocess}
            disabled={!isQueryValid || preprocessPsqlDataLoading}
          >
            {preprocessPsqlDataLoading ? 'Preprocessing...' : 'Preprocess'}
          </Button>
          <Button variant="outlined" color="error" onClick={handleClose}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
