import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import type { RootState } from '../../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import type { IPlotModel } from '../../../../shared/models/plotmodel.model';
import { explainabilityQueryDefault } from '../../../../shared/models/tasks/explainability.model';
import { Tab, Tabs } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClosableCardTable from '../../../../shared/components/closable-card-table';
import Loader from '../../../../shared/components/loader';
import { fetchModelAnalysisExplainabilityPlot } from '../../../../store/slices/explainabilitySlice';
import type { TestInstance } from '../../../../shared/models/tasks/model-analysis.model';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

interface ITableComponent {
  children?: React.ReactNode
  point: TestInstance
  counterfactuals: {
    data: IPlotModel | null
    loading: boolean
    error: string | null
  } | null
  experimentId: string | undefined
  workflowId: string
  onClose: () => void
}

const CounterfactualsTable = (props: ITableComponent) => {
  const {
    point,
    experimentId,
    workflowId,
    onClose,
  } = props;
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState(0); // activeTab,setA
  const { tab, isTabInitialized } = useAppSelector(
    (state: RootState) => state.workflowPage,
  );

  function convertToPythonStyleString(obj: TestInstance) {
    const excludedKeys = ['isMisclassified', '_vgsid_'];

    return (
      '{' +
      Object.entries(obj)
        .filter(([key]) => !excludedKeys.includes(key)) // remove unwanted keys
        .map(([key, value]) => {
          // Rename keys
          if (key === 'actual') {
            key = 'label';
            value = parseFloat(String(value));
          } else if (key === 'predicted') {
            key = 'prediction';
            value = parseFloat(String(value));
          } else if (!isNaN(Number(value))) {
            value = parseFloat(String(value)); // convert number to float
          } else {
            value = `'${value}'`; // wrap string in single quotes
          }

          return `'${key}': ${value}`;
        })
        .join(', ') +
      '}'
    );
  }

  const query = convertToPythonStyleString(point);

  useEffect(() => {
    if (activeTab === 0 && isTabInitialized) {
      dispatch(
        fetchModelAnalysisExplainabilityPlot({
          query: {
            ...explainabilityQueryDefault,
            explanation_type: 'featureExplanation',
            explanation_method: 'counterfactuals',

            query: query
          },
          metadata: {
            workflowId: tab?.workflowId || '',
            queryCase: 'counterfactuals',
            experimentId: experimentId || '',
          },
        }),
      );
    }
    if (activeTab === 1 && isTabInitialized) {
      dispatch(
        fetchModelAnalysisExplainabilityPlot({
          query: {
            explanation_type: 'hyperparameterExplanation',
            explanation_method: 'counterfactuals',
            query: query
          },
          metadata: {
            workflowId: tab?.workflowId || workflowId,
            queryCase: 'counterfactuals',
            experimentId: experimentId || '',
          },
        }),
      );
    }
  }, [point, activeTab]);

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
  }));

  const getFilteredTableContents = (
    tableContents: Record<string, { index: number; values: string[] }>,
  ) => {
    if (!tableContents) return {};

    const filteredEntries = Object.entries(tableContents).filter(
      ([key, column]) => {
        if (key === 'BinaryLabel' || key === 'Type' || key === 'Cost')
          return false; // Skip the BinaryLabel column
        const uniqueValues = new Set(column.values);

        return uniqueValues.size > 1; // Keep only if there is more than one unique value
      },
    );

    return Object.fromEntries(filteredEntries);
  };

  const filteredTableContents = getFilteredTableContents(
    tab?.workflowTasks.modelAnalysis?.counterfactuals?.data?.tableContents || {},
  );

  const columns: GridColDef[] = Object.entries(filteredTableContents).map(([key, column]) => {
    const referenceValue = parseFloat(column.values[0]);

    return {
      field: key,
      headerName: key,
      flex: 1,
      minWidth: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: GridRenderCellParams) => {
        const currentValue = parseFloat(params.value);

        if (isNaN(referenceValue) || isNaN(currentValue)) {
          return params.value;
        }

        let icon = null;

        if (currentValue < referenceValue) {
          icon = (
            <ArrowDropDownIcon
              fontSize="small"
              sx={{ color: 'red', ml: 0.5 }}
            />
          );
        } else if (currentValue > referenceValue) {
          icon = (
            <ArrowDropUpIcon
              fontSize="small"
              sx={{ color: 'green', ml: 0.5 }}
            />
          );
        }

        return (
          <Box display="flex" alignItems="center" justifyContent="center">
            <Typography variant="body2">{params.value}</Typography>
            {icon}
          </Box>
        );
      },
    };
  });

  const rowCount =
    filteredTableContents[Object.keys(filteredTableContents)[0]]?.values
      .length || 0;

  const rows = Array.from({ length: rowCount }, (_, rowIndex) => {
    const row: Record<string, number | string> = { id: rowIndex };

    for (const [key, column] of Object.entries(filteredTableContents)) {
      row[key] = column.values[rowIndex];
    }

    return row;
  });

  return (
    <Box sx={{ height: '100%' }}>
      <ClosableCardTable
        details={ tab?.workflowTasks.modelAnalysis?.counterfactuals?.data?.plotDescr}
        title={
          activeTab === 0
            ? 'feature Counterfactual Explanations'
            : 'hyperparameters Counterfactual Explanations'
        }
        controlPanel={
          <ControlPanel
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            counterfactuals={ tab?.workflowTasks.modelAnalysis?.counterfactuals}
          />
        }
        onClose={onClose}
        noPadding={true}
      >
        { tab?.workflowTasks.modelAnalysis?.counterfactuals?.loading ? (
          // Loader when loading
          <Loader/>
        ) :  tab?.workflowTasks.modelAnalysis?.counterfactuals?.data?.plotType === 'Error' ? (
          // Display error message
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="error">
              { tab?.workflowTasks.modelAnalysis?.counterfactuals?.data.plotName || 'Error'}
            </Typography>
            <Typography variant="body2">
              { tab?.workflowTasks.modelAnalysis?.counterfactuals?.data?.plotDescr}
            </Typography>
          </Box>
        ) :  tab?.workflowTasks.modelAnalysis?.counterfactuals?.data?.tableContents ? (
          // Display table
          <StyledDataGrid
            rows={rows}
            columns={columns}
            disableRowSelectionOnClick
            sx={{
              border: theme => `1px solid ${theme.palette.customGrey.main}`,
              '& .MuiDataGrid-columnHeader': {
                backgroundColor: theme => theme.palette.customGrey.light,
                fontWeight: 600,
              },
              '& .MuiDataGrid-cell': {
                wordBreak: 'break-word',
                whiteSpace: 'normal',
              },
              // Hide footer completely since pagination is disabled
              '& .MuiDataGrid-footerContainer': {
                display: 'none',
              },
            }}
          />
        ) : (
          // Default fallback if no content at all
          <Typography variant="body2" align="center">
            No data available.
          </Typography>
        )}
      </ClosableCardTable>
    </Box>
  );
};

export default CounterfactualsTable;

const ControlPanel = ({
  activeTab,
  setActiveTab,
  counterfactuals,
}: {
  activeTab: number
  setActiveTab: (value: number) => void
  counterfactuals: {
    data: IPlotModel | null
    loading: boolean
    error: string | null
  } | null | undefined
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        mb: 0, // optional: margin bottom for spacing below tabs
      }}
    >
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{
          '& .MuiTab-root': {
            fontSize: '0.8rem',
            minHeight: '8px',
          },
        }}
      >
        <Tab label="Features" disabled={counterfactuals?.loading} />
        <Tab label="Hyperparameters" disabled={counterfactuals?.loading} />
      </Tabs>
    </Box>
  );
};
