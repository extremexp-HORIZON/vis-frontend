import {
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  createTheme,
  ThemeProvider,
  Chip,
  Typography,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import { setControls } from '../../../../store/slices/workflowPageSlice';
import CategoryIcon from '@mui/icons-material/Category';
import BarChartIcon from '@mui/icons-material/BarChart';
import FunctionsIcon from '@mui/icons-material/Functions';
import { AggregationFunction } from '../../../../shared/models/dataexploration.model';
import SearchableSelect from '../../../../shared/components/searchable-select';

const BarChartControlPanel = () => {
  const dispatch = useAppDispatch();
  const { tab } = useAppSelector(state => state.workflowPage);
  const selectedColumn =
    tab?.workflowTasks.dataExploration?.controlPanel.selectedMeasureColumn ||
    null;

  // Handler for updating aggregation rules for a column

  const getAggregationOptions = () => {
    if (!selectedColumn) return [];
    const column =
      tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns.find(
        col => col.name === selectedColumn,
      );

    return column?.type === 'DOUBLE' ||
      column?.type === 'FLOAT' ||
      column?.type === 'INTEGER' ||
      column?.type === 'BIGINT'
      ? [
        AggregationFunction.AVG,
        AggregationFunction.MIN,
        AggregationFunction.MAX,
        AggregationFunction.COUNT,
      ]
      : [AggregationFunction.COUNT];
  };

  const aggregationOptions = getAggregationOptions();

  // Custom theme
  const theme = createTheme({
    palette: {
      primary: { main: '#1976d2' },
      secondary: { main: '#dc004e' },
    },
    typography: {
      fontFamily: 'Arial',
      h6: { fontWeight: 600 },
    },
    components: {
      MuiButton: {
        styleOverrides: { root: { borderRadius: '20px' } },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          gap: '1rem',
          flexDirection: 'column',
        }}
      >
        {/* Group By Selection */}
        <FormControl fullWidth>
          <SearchableSelect
            labelId="group-by-category-label"
            inputLabel={
              <Box display="flex" alignItems="center" gap={1}>
                <CategoryIcon fontSize="small" />
                Group By (Category)
              </Box>
            }
            label="Group By (Category) ----"
            value={
              tab?.workflowTasks.dataExploration?.controlPanel.barGroupBy?.[0] || ''
            }
            options={
              tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns
                .filter(col => col.type === 'STRING')
                .map(col => col.name) || []
            }
            onChange={value =>
              dispatch(setControls({ barGroupBy: [value] }))
            }
            menuMaxHeight={224}
            menuWidth={250}
          />
        </FormControl>

        {/* Value Selection */}
        <FormControl fullWidth>
          <SearchableSelect
            labelId="measure-value-column-label"
            inputLabel={
              <Box display="flex" alignItems="center" gap={1}>
                <BarChartIcon fontSize="small" />
                Measure (Value Column)
              </Box>
            }
            label="Measure (Value Column)-----"
            value={selectedColumn || ''}
            options={
              tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns
                .filter(col => col.type !== 'LOCAL_DATE_TIME')
                .map(col => col.name) || []
            }
            onChange={value =>
              dispatch(setControls({ selectedMeasureColumn: value }))
            }
            menuMaxHeight={224}
            menuWidth={250}
          />
        </FormControl>

        {/* Aggregation Selection */}

        <FormControl fullWidth>
          <InputLabel>
            <Box display="flex" alignItems="center" gap={1}>
              <FunctionsIcon fontSize="small" />
              Apply Aggregation(s)
            </Box>
          </InputLabel>
          <Select
            label="Apply Aggregation(s)oook"
            multiple
            value={
              selectedColumn && Array.isArray(tab?.workflowTasks.dataExploration?.controlPanel.barAggregation)
                ? tab.workflowTasks.dataExploration.controlPanel.barAggregation
                  .filter(aggr => aggr.column === selectedColumn)
                  .map(aggr => aggr.function)
                : []
            }
            onChange={event => {
              const selectedFunctions = event.target.value as AggregationFunction[];

              if (!selectedColumn) return;
              const currentAgg =
                tab?.workflowTasks.dataExploration?.controlPanel
                  .barAggregation || [];

              // Remove old aggregations for this column
              const updatedAggs = currentAgg.filter(
                aggr => aggr.column !== selectedColumn
              );

              // Add new ones
              selectedFunctions.forEach(func => {
                updatedAggs.push({
                  column: selectedColumn,
                  function: func,
                });
              });

              dispatch(
                setControls({
                  barAggregation: updatedAggs,
                }),
              );
            }}
            renderValue={(selected: string[]) => selected.join(', ')}
          >
            {aggregationOptions.map(rule => (
              <MenuItem key={rule} value={rule}>
                {rule.charAt(0).toUpperCase() + rule.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {(tab?.workflowTasks.dataExploration?.controlPanel.barAggregation || []).length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Active Aggregations
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {tab?.workflowTasks.dataExploration?.controlPanel.barAggregation.map(aggr => (
                <Chip
                  key={`${aggr.function}-${aggr.column}`}
                  label={`${aggr.function.toLowerCase()}_${aggr.column}`}
                  onDelete={() => {
                    const updatedAggs =
                  tab.workflowTasks.dataExploration?.controlPanel.barAggregation.filter(
                    a => !(a.column === aggr.column && a.function === aggr.function)
                  );

                    dispatch(setControls({ barAggregation: updatedAggs }));

                    const remainingForColumn = updatedAggs?.filter(a => a.column === aggr.column);

                    if (selectedColumn === aggr.column && remainingForColumn?.length === 0) {
                      dispatch(setControls({ selectedMeasureColumn: '' }));
                    }
                  }}
                  color="default"
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default BarChartControlPanel;
