import {
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import { setControls } from '../../../../store/slices/workflowPageSlice';
import CategoryIcon from '@mui/icons-material/Category';
import BarChartIcon from '@mui/icons-material/BarChart';
import FunctionsIcon from '@mui/icons-material/Functions';
import { AggregationFunction } from '../../../../shared/models/dataexploration.model';
import SearchableMultiSelect from '../../../../shared/components/searchable-select-multiple';
import SearchableSelect from '../../../../shared/components/searchable-select';

const HeatMapControlPanel = () => {
  const dispatch = useAppDispatch();
  const { tab } = useAppSelector(state => state.workflowPage);
  const selectedColumn =
    tab?.workflowTasks.dataExploration?.controlPanel
      .selectedMeasureColumnHeat || null;

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
          <SearchableMultiSelect
            labelId="group-by-heat-label"
            inputLabel={
              <Box display="flex" alignItems="center" gap={1}>
                <CategoryIcon fontSize="small" />
                Group By (Category)
              </Box>
            }
            label="Group By (Category)-----"
            value={
              tab?.workflowTasks.dataExploration?.controlPanel.barGroupByHeat || []
            }
            options={
              tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns
                .filter(col => col.type === 'STRING')
                .map(col => col.name) || []
            }
            onChange={(selected: string[]) => {
              if (selected.length <= 2) {
                dispatch(setControls({ barGroupByHeat: selected }));
              }
            }}
            isOptionDisabled={(option, selected) =>
              selected.length >= 2 && !selected.includes(option)
            }
            menuMaxHeight={224}
            menuWidth={250}
          />
        </FormControl>

        {/* Value Selection */}
        <FormControl fullWidth>
          <SearchableSelect
            labelId="measure-value-column-heat-label"
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
            onChange={newColumn =>
              dispatch(
                setControls({
                  selectedMeasureColumnHeat: newColumn,
                }),
              )
            }
            menuMaxHeight={224}
            menuWidth={250}
          />
        </FormControl>

        {/* Aggregation Selection */}
        {selectedColumn && (
          <FormControl fullWidth>
            <InputLabel>
              <Box display="flex" alignItems="center" gap={1}>
                <FunctionsIcon fontSize="small" />
                Apply Aggregation
              </Box>
            </InputLabel>
            <Select
              label="Apply Aggregation-----"
              value={
                tab?.workflowTasks.dataExploration?.controlPanel.barAggregationHeat
                  ?.find(aggr => aggr.column === selectedColumn)?.function || ''
              }
              onChange={event => {
                const value = event.target.value as AggregationFunction;

                if (!selectedColumn) return;

                dispatch(
                  setControls({
                    barAggregationHeat: [
                      {
                        column: selectedColumn,
                        function: value,
                      },
                    ],
                  }),
                );
              }}
            >
              {aggregationOptions.map(rule => (
                <MenuItem key={rule} value={rule}>
                  {rule.charAt(0).toUpperCase() + rule.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default HeatMapControlPanel;
