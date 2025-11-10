import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import type { RootState } from '../../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import type { IPlotModel } from '../../../../shared/models/plotmodel.model';
import { explainabilityQueryDefault } from '../../../../shared/models/tasks/explainability.model';
import { IconButton, Tab, Tabs, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClosableCardTable from '../../../../shared/components/closable-card-table';
import Loader from '../../../../shared/components/loader';
import { fetchModelAnalysisExplainabilityPlot } from '../../../../store/slices/explainabilitySlice';
import type { TestInstance } from '../../../../shared/models/tasks/model-analysis.model';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import InfoMessage from '../../../../shared/components/InfoMessage';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import BuildIcon from '@mui/icons-material/Build';
import type { IRun } from '../../../../shared/models/experiment/run.model';
import { setWorkflowsData } from '../../../../store/slices/progressPageSlice';
import { Snackbar, Alert } from '@mui/material';


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
  const { workflows } = useAppSelector(
    (state: RootState) => state.progressPage,
  );
  const [snackbar, setSnackbar] = useState<{ open: boolean; text: string }>({
    open: false,
    text: '',
  });


  function convertToPythonStyleString(obj: TestInstance) {
    const excludedKeys = ['isMisclassified', '_vgsid_', 'pointType', 'instanceId'];

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

  const baseColumns: GridColDef[] = Object.entries(filteredTableContents).map(([key, column]) => {
    const referenceValue = parseFloat(column.values[0]);

    // Reusable formatter for numbers: up to 3 decimals, but avoid trailing zeros if possible
    const numberFormatter = new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    });

    return {
      field: key,
      headerName: key,
      flex: 1,
      minWidth: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: GridRenderCellParams) => {
        const raw = params.value;
        const currentValue = parseFloat(String(raw));

        // If either value isn't numeric, render the raw value
        if (isNaN(referenceValue) || isNaN(currentValue)) {
          return <Typography variant="body2">{String(raw)}</Typography>;
        }

        let icon = null;

        if (referenceValue + currentValue < referenceValue) {
          icon = (
            <ArrowDropDownIcon
              fontSize="small"
              sx={{ color: 'red', ml: 0.5 }}
            />
          );
        } else if (referenceValue + currentValue > referenceValue) {
          icon = (
            <ArrowDropUpIcon
              fontSize="small"
              sx={{ color: 'green', ml: 0.5 }}
            />
          );
        }

        const formatted = numberFormatter.format(currentValue);

        return (
          <Box display="flex" alignItems="center" justifyContent="center">
            <Typography variant="body2">{formatted}</Typography>
            {icon}
          </Box>
        );
      },
    };
  });

  const isNumericLike = (v: unknown) => {
    if (v === null || v === undefined) return false;
    const n = Number(v);

    return !isNaN(n) && isFinite(n);
  };

  const handleReconfigure = (row: any) => {
    const currentWorkflow = workflows?.data?.find(
      (workflow) => workflow.id === tab?.workflowId
    );

    if (!currentWorkflow) return;

    const updatedParams = (currentWorkflow.params ?? []).map((p) => {
      const rowValue = row?.[p.name];

      if (rowValue === undefined || rowValue === null || rowValue === '-') return p;

      const pVal = p.value;

      const trimmed = String(rowValue).trim();

      if (isNumericLike(trimmed) && isNumericLike(pVal)) {
        const tableNumber = Number(trimmed);
        const baseNumber = Number(pVal);
        const next = baseNumber + tableNumber;

        return { ...p, value: String(next) };
      }

      return { ...p, value: String(rowValue) };
    });

    // for now create a new dummy scheduled workflow
    const newRun: IRun = {
      id: `${tab?.workflowName} (copy ${String(row?.id)})`.trim(),
      name: `${tab?.workflowName} (copy ${String(row?.id)})`.trim(),
      experimentId: experimentId || '',
      status: 'SCHEDULED',
      startTime: undefined,
      endTime: undefined,
      params: updatedParams,
      metrics: [],
      dataAssets: [],
      tags: {},
    };
    const updatedWorkflows = workflows.data.concat(newRun);

    dispatch(setWorkflowsData(updatedWorkflows));

    setSnackbar({
      open: true,
      text: `New workflow "${newRun.name}" created`,
    });
  };

  const actionColumn: GridColDef = {
    field: 'action',
    headerName: 'actions',
    headerAlign: 'center',
    align: 'center',
    sortable: false,
    filterable: false,
    headerClassName: 'datagrid-header-fixed',
    minWidth: 100,
    renderCell: (params: GridRenderCellParams) => (
      <Box
        onClick={(e) => e.stopPropagation()}
        display="flex"
        justifyContent="center"
        alignItems="center"
        width="100%"
        height="100%"
      >
        <Tooltip title="Reconfigure">
          <IconButton
            onClick={() => { handleReconfigure(params.row); }}
          >
            <BuildIcon fontSize="small" color="primary" />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  };

  const columns =  activeTab === 0 ? baseColumns : [...baseColumns, actionColumn];

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
        ) :  tab?.workflowTasks.modelAnalysis?.counterfactuals?.error ? (
          // Display error message
          <InfoMessage
            message="Error fetching counterfactuals."
            type="info"
            icon={<ReportProblemRoundedIcon sx={{ fontSize: 40, color: 'info.main' }} />}
            fullHeight
          />

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
      <Snackbar
        open={snackbar.open}
        autoHideDuration={1000}
        onClose={(_, reason) => {
          if (reason === 'clickaway') return;
          setSnackbar((s) => ({ ...s, open: false }));
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.text}
        </Alert>
      </Snackbar>
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
