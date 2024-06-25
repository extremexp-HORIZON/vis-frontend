import { Paper, TableContainer , Grid, Typography, Box, CircularProgress, IconButton } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import DataTable from './DataTable';
import DataExplorationChart from './DataExplorationChart';
import FilterForm from './FilterForm';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { IDataExplorationRequest } from '../../../shared/models/dataexploration.model';
import { fetchDataExploration } from '../../../store/slices/dataExplorationSlice';
import ScatterPlot from './ScatterPlot';
import CloseIcon from "@mui/icons-material/Close"


const DataExploration: React.FC = () => {

  const dispatch = useAppDispatch();
  const { dataExploration, loading, error } = useAppSelector(state => state.dataExploration);
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [selectedCols, setSelectedCols] = useState<string[]>([]);
  const [datetimeColumn, setDatetimeColumn] = useState<string>('');
  const [availableTimeColumns, setAvailableTimeColumns] = useState<string[]>([]);
  const [granularity, setGranularity] = useState<string>('');
  const [limit, setLimit] = useState<number>(100);
  const [scaler, setScaler] = useState<string>('');
  const [originalData, setOriginalData] = useState<any[]>([]); // Store original data
  const [filters, setFilters] = useState<any[]>([]);

  const handleAddFilter = (newFilter: number) => {
    setFilters([...filters, newFilter]);
    console.log('filters',filters);
  };

  const handleRemoveFilter = (index: number) => {
    const newFilters = [...filters];
    newFilters.splice(index, 1);
    setFilters(newFilters);
  };

  const handleRemoveAllFilters = () => {
    setFilters([]);  // Resets the filters state to an empty array
};
  
 const karfotela= "file:///I2Cat_phising/dataset/test.csv";

const parts = karfotela.split('/');

// Get the last element of the array, which is "test.csv"
const filenameWithExtension = parts[parts.length - 1];

// Remove the file extension by replacing it with an empty string
const filenameWithoutExtension = filenameWithExtension.replace('.csv', '');
  const fetchData = () => {
    if (selectedCols.length > 0 && datetimeColumn) {
      const requestData: IDataExplorationRequest = {
        datasetId: karfotela,
        columns: [...selectedCols, datetimeColumn], // Ensure datetimeColumn is included
        aggFunction: granularity,
        filters: filters,
        limit: limit,
        scaler: scaler,
        data: function (data: any): unknown {
          throw new Error('Function not implemented.');
        }
      };
      dispatch(fetchDataExploration(requestData));
    }
  };
  const updateData = (newData: any[]) => {
    setData(newData); // Update the main data array with selected rows
  };
  const resetData = () => {
    setData(originalData); // Reset data to the original dataset
  };

  useEffect(() => {
    dispatch(fetchDataExploration({
      datasetId: karfotela,
      columns: [],
      aggFunction: '',
      filters: filters,
      limit: 1000,
      scaler: '',
      data: function (data: any): unknown {
        throw new Error('Function not implemented.');
      }
    }));
  }, [dispatch,filters]);

  useEffect(() => {
    if (dataExploration) {
      console.log('dataexp',dataExploration['data']);
      const parsedData = JSON.parse(dataExploration.data);
      setData(parsedData);

      const gridColumns: GridColDef[] = dataExploration.columns.map(col => ({
        field: typeof col === 'string' ? col : (col as { name: string }).name,
        headerName: typeof col === 'string' ? col : (col as { name: string }).name,
        width: 200,
        type: (typeof col === 'string' ? col : (col as { type: string }).type) as GridColDef['type'], // Add explicit type casting here
      }));


      setColumns(gridColumns);
      const timeCols = gridColumns.filter(col => col.type !== undefined && col.type === 'LOCAL_DATE_TIME');
      setAvailableTimeColumns(timeCols.map(col => col.field));
      setDatetimeColumn(timeCols.length > 0 ? timeCols[0].field : '');
      // setDatetimeColumn("");
    }
  }, [dataExploration]);


  useEffect(() => {
    if (dataExploration) {
      const parsedData = JSON.parse(dataExploration.data);
      setData(parsedData);
      setOriginalData(parsedData); // Set original data here
    }
  }, [dataExploration]);

  useEffect(() => {
    fetchData();
  }, [selectedCols, datetimeColumn,filters]);


  return (
    <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #ccc' }}>
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Box sx={{ bgcolor: '#f0f0f0', display: 'flex', alignItems: 'center', height: '3.5rem', px: 2 }}>
          <Typography variant="h6">Dataset Exploration: {filenameWithoutExtension}</Typography>
          <Box sx={{ flex: 1 }} />
          {/* Optionally add a close button if necessary */}
          <IconButton>
            <CloseIcon />
          </IconButton>
        </Box>
      </Grid>

      {/* Data Exploration Chart */}
      <Grid item xs={12}>
        {!loading && data.length > 0 && (
          <Paper elevation={0} sx={{ mb: 2 }}>
            {datetimeColumn ? (
              <DataExplorationChart
                data={data}
                columns={columns}
                datetimeColumn={datetimeColumn}
                selectedColumns={selectedCols}
              />
            ) : (
              <ScatterPlot data={data} columns={columns} />
            )}
          </Paper>
        )}
        {loading && <CircularProgress />}
        {error && <Typography color="error">Error: {error}</Typography>}
      </Grid>

      {/* Filters section */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Paper elevation={0} sx={{ mb: 2 }}>
              <FilterForm
                columns={columns}
                onAddFilter={handleAddFilter}
                onRemoveFilter={handleRemoveFilter}
                onRemoveAllFilters={handleRemoveAllFilters}
                filters={filters}
              />
            </Paper>
          </Grid>

          {/* Data table section */}
          <Grid item xs={9}>
            <Paper elevation={0} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {loading && <CircularProgress />}
                {error && <Typography color="error">Error: {error}</Typography>}
                {data.length > 0 && (
                  <DataTable
                    data={data}
                    columns={columns}
                    onUpdateData={updateData}
                    onResetData={resetData}
                  />
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  </Paper>
);
};

export default DataExploration;