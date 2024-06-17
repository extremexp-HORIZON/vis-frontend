import { Paper, TableContainer , Grid, Typography, Box, CircularProgress } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchDataExploration } from '../../store/slices/dataExplorationSlice';
import DataTable from './DataTable';
import DataExplorationChart from './DataExplorationChart';
import { IDataExplorationRequest } from '../../shared/models/dataexploration.model';
import FilterForm from './FilterForm';

const DataExploration: React.FC = () => {

  const dispatch = useAppDispatch();
  const { dataExploration, loading, error } = useAppSelector(state => state.dataExploration);
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [selectedCols, setSelectedCols] = useState<string[]>(["dns_interlog_time_q1"]);
  const [initialSelectionDone, setInitialSelectionDone] = useState(false);
  const [datetimeColumn, setDatetimeColumn] = useState<string>('timestamp');
  const [availableTimeColumns, setAvailableTimeColumns] = useState<string[]>([]);
  const [granularity, setGranularity] = useState<string>('');
  const [limit, setLimit] = useState<number>(100);
  const [scaler, setScaler] = useState<string>('');
  const [chartType, setChartType] = useState('line'); // Default to line chart
  const [originalData, setOriginalData] = useState<any[]>([]); // Store original data
  const [isFullScreen, setIsFullScreen] = useState(false); // State to manage full-screen mode
  const [filters, setFilters] = useState([]);

  const handleAddFilter = (newFilter) => {
    setFilters([...filters, newFilter]);
    console.log('filters',filters);
  };

  const handleRemoveFilter = (index) => {
    const newFilters = [...filters];
    newFilters.splice(index, 1);
    setFilters(newFilters);
  };

  const handleRemoveAllFilters = () => {
    setFilters([]);  // Resets the filters state to an empty array
};
  
 const karfotela= "file:///I2Cat_phising/dataset/test.csv";
//  const karfotela="file:///Users/admin/Desktop/test.csv"

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
      };
      dispatch(fetchDataExploration(requestData));
      setInitialSelectionDone(true);
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
    }));
  }, [dispatch,filters]);

  useEffect(() => {
    if (dataExploration) {
      console.log('dataexp',dataExploration);
      const parsedData = JSON.parse(dataExploration.data);
      setData(parsedData);

      const gridColumns: GridColDef[] = dataExploration.columns.map(col => ({
        field: col.name,
        headerName: col.name,
        width: 200,
        type: col.type
      }));
      setColumns(gridColumns);
      const timeCols = gridColumns.filter(col => col.type === 'LOCAL_DATE_TIME');
      setAvailableTimeColumns(timeCols.map(col => col.field));
      setDatetimeColumn(timeCols.length > 0 ? timeCols[0].field : '');
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

  const handleColumnChange = (event) => {
    setSelectedCols(event.target.value);
  };

  const handleTimeColumnChange = (event) => {
    setDatetimeColumn(event.target.value);
  };



  return (
    <Grid container spacing={2}>
      {/* Data Exploration Chart at the top, taking full width */}
      <Grid item xs={12}>
        {!loading && data.length > 0 && (
          <Paper elevation={3}>
            <DataExplorationChart 
              data={data}
              columns={columns}
              datetimeColumn={datetimeColumn}
              selectedColumns={selectedCols}
            />
          </Paper>
        )}
      </Grid>

      {/* Dataset name and potentially other controls */}
      <Grid item xs={12}>
        <Typography variant="h6">Dataset Exploration: {filenameWithoutExtension}</Typography>
      </Grid>

      {/* Filters section */}
      <Grid item xs={3}>
        <Paper elevation={3}>
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
        <Paper elevation={3}>
          <TableContainer component={Paper}>
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
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default DataExploration;