import ChartButtonGroup from '../ChartControls/data-exploration-chart-button-group';
import { Box, IconButton, Popover, Stack, Tooltip, Badge, Typography } from '@mui/material';
import FilterBar from '../../../../shared/components/filter-bar';
import { useState } from 'react';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import { setControls } from '../../../../store/slices/workflowPageSlice';
import type { IFilter } from '../../../../shared/models/dataexploration.model';

const LeftPanel = () => {

  const dispatch = useAppDispatch();
  const { tab } = useAppSelector(state => state.workflowPage);
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  // Get columns from the Redux store
  const originalColumns = tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns || [];
  // Format columns for FilterBar
  const formattedColumns = originalColumns.map((col) => ({
    field: col.name,
    headerName: col.name,
    originalType: col.type,
  }));

  // Get filters from Redux store
  const activeFilters = tab?.workflowTasks.dataExploration?.controlPanel?.filters || [];

  // Format filters for FilterBar
  const formattedFilters = activeFilters.map((filter: IFilter) => {
    // Convert range type filters to operator format
    if (filter.type === 'inequality') {
      if(filter.operator === 'gte') {
        return {
          column: filter.column,
          operator: '>=',
          value: filter.value.toString(),
        };
      } else if(filter.operator === 'lte') {
        return {
          column: filter.column,
          operator: '<=',
          value: filter.value.toString(),
        };
      } else if(filter.operator === 'gt') {
        return {
          column: filter.column,
          operator: '>',
          value: filter.value.toString(),
        };
      } else if(filter.operator === 'lt') {
        return {
          column: filter.column,
          operator: '<',
          value: filter.value.toString(),
        };
      }
    } else if (filter.type === 'string') {
      if (filter.operator === 'contains') {
        return {
          column: filter.column,
          operator: 'contains',
          value: filter.value.toString(),
        };
      } else if(filter.operator === 'startsWith') {
        return {
          column: filter.column,
          operator: 'startsWith',
          value: filter.value.toString(),
        };
      } else if(filter.operator === 'endsWith') {
        return {
          column: filter.column,
          operator: 'endsWith',
          value: filter.value.toString(),
        };
      }
    } else {
      return {
        column: filter.column,
        operator: '=',
        value: filter.value.toString(),
      };
    }

    // Default return if no conditions match
    return {
      column: filter.column,
      operator: '=',
      value: filter.value.toString(),
    };
  }).filter((filter): filter is { column: string; operator: string; value: string } => filter !== undefined);

  const handleOpenFilter = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setFilterOpen(true);
  };

  const handleFilterChange = (
    index: number,
    column: string,
    operator: string,
    value: string,
  ) => {

    // Find the column type from originalColumns
    const columnInfo = originalColumns.find((col) => col.name === column);
    const columnType = columnInfo?.type?.toLowerCase();

    // Convert to the format used in the store
    let storeFilter: IFilter | undefined;

    if (['>', '<', '>=', '<=', '='].includes(operator)) {
      // Handle numeric type filters
      let parsedValue: number | string = value;

      // Parse based on column type
      if (columnType === 'integer') {
        parsedValue = parseInt(value, 10);
      } else if (columnType === 'double' || columnType === 'float') {
        parsedValue = parseFloat(value);
      } else {
        parsedValue = value;
      }

      if (operator === '>=') {
        storeFilter = {
          column,
          type: 'inequality',
          operator: 'gte',
          value: parsedValue,
        };
      } else if (operator === '>') {
        storeFilter = {
          column,
          type: 'inequality',
          operator: 'gt',
          value: parsedValue,
        };
      } else if (operator === '<=') {
        storeFilter = {
          column,
          type: 'inequality',
          operator: 'lte',
          value: parsedValue,
        };
      } else if (operator === '<') {
        storeFilter = {
          column,
          type: 'inequality',
          operator: 'lt',
          value: parsedValue,
        };
      } else {
        // Handle equals type filters
        storeFilter = {
          column,
          type: 'equals',
          operator: '=',
          value: parsedValue,
        };
      }
    } else {
      if(operator === 'contains') {
        storeFilter = {
          column,
          type: 'string',
          operator: 'contains',
          value,
        };
      } else if(operator === 'startsWith') {
        storeFilter = {
          column,
          type: 'string',
          operator: 'startsWith',
          value,
        };
      } else if(operator === 'endsWith') {
        storeFilter = {
          column,
          type: 'string',
          operator: 'endsWith',
          value,
        };
      }
    }
    if(!storeFilter) return;
    const allFilters = [...activeFilters];

    if (index < allFilters.length) {
      allFilters[index] = storeFilter;
    } else {
      allFilters.push(storeFilter);
    }
    dispatch(setControls({ filters: allFilters }));
  };

  const handleAddFilter = () => {
    // Adding is handled by handleFilterChange
    // This is called before each filter is added
  };

  const handleRemoveFilter = (index: number) => {
    const updatedFilters = activeFilters.filter((_, idx) => idx !== index);

    dispatch(setControls({ filters: updatedFilters }));
  };

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'space-between', // This pushes content to opposite ends
      width: '100%'
    }}>
      {/* Left side components */}
      <Stack direction="row" spacing={1}>
        {/* <ColumnsPanel/> */}
        <Tooltip title="Filters">
          <IconButton onClick={handleOpenFilter}>
            <Badge
              badgeContent={activeFilters.length}
              color="primary"
              invisible={activeFilters.length === 0}
              sx={{ m: 0.5 }}
            >
              <FilterListIcon color="primary" fontSize="medium" />
            </Badge>
          </IconButton>
        </Tooltip>
        <Popover
          id="filter-popover"
          open={isFilterOpen}
          anchorEl={anchorEl}
          onClose={() => setFilterOpen(false)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          PaperProps={{
            sx: {
              width: '550px',
              p: 2,
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.16)',
              border: '1px solid rgba(0,0,0,0.04)',
            }
          }}
        >
          <Box sx={{ mb: 1 }}>
            {activeFilters.length > 0 ? (
              <Box sx={{ mb: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="primary">
                  {activeFilters.length} active filter{activeFilters.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
            ) : null}
          </Box>
          <FilterBar
            columns={formattedColumns}
            filters={formattedFilters}
            onFilterChange={handleFilterChange}
            onAddFilter={handleAddFilter}
            onRemoveFilter={handleRemoveFilter}
          />
        </Popover>
      </Stack>

      {/* Right side component */}
      <Box>
        <ChartButtonGroup />
      </Box>
    </Box>
  );
};

export default LeftPanel;
