import { Paper, Grid, Typography, Box, CircularProgress, IconButton, Tab, Tabs } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import React, { ChangeEvent, SetStateAction, useEffect, useState } from 'react';
import DataTable from './DataTable';
import DataExplorationChart from './DataExplorationChart';
import FilterForm from './FilterForm';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { IDataExplorationRequest } from '../../../shared/models/dataexploration.model';
import { fetchDataExploration } from '../../../store/slices/dataExplorationSlice';
import ScatterPlot from './ScatterPlot';
import CloseIcon from "@mui/icons-material/Close"
import SelectColumnsComponent from './SelectColumnsComponent';

const DataExploration: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dataExploration, loading, error } = useAppSelector(state => state.dataExploration);
  const [columns, setColumns] = useState<any[]>([]);
  const [originalColumns, setOriginalColumns] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [originalData, setOriginalData] = useState<any[]>([]);
  const [selectedCols, setSelectedCols] = useState<string[]>([]);
  const [datetimeColumn, setDatetimeColumn] = useState<string>('');
  const [availableTimeColumns, setAvailableTimeColumns] = useState<string[]>([]);
  const [granularity, setGranularity] = useState<string>('');
  const [limit, setLimit] = useState<number>(1000);
  const [scaler, setScaler] = useState<string>('');
  const [filters, setFilters] = useState<any[]>([]);

  const handleAddFilter = (newFilter: number) => {
    setFilters([...filters, newFilter]);
  };

  const handleRemoveFilter = (index: number) => {
    const newFilters = [...filters];
    newFilters.splice(index, 1);
    setFilters(newFilters);
  };

  const handleRemoveAllFilters = () => {
    setFilters([]);  // Resets the filters state to an empty array
  };

  const karfotela = "file:///I2Cat_phising/dataset/test.csv";

  const parts = karfotela.split('/');
  const filenameWithExtension = parts[parts.length - 1];
  const filenameWithoutExtension = filenameWithExtension.replace('.csv', '');

  // const fetchData = () => {
  //   if (datetimeColumn) {
  //     const requestData: IDataExplorationRequest = {
  //       datasetId: karfotela,
  //       columns: [...selectedCols, datetimeColumn],
  //       aggFunction: granularity,
  //       filters: filters,
  //       limit: limit,
  //       scaler: scaler,
  //     };
  //     dispatch(fetchDataExploration(requestData));
  //   }
  // };



  useEffect(() => {
    dispatch(fetchDataExploration({
      datasetId: karfotela,
      columns: [],
      aggFunction: '',
      filters: filters,
      limit: 1000,
      scaler: '',
    }));
  }, [dispatch, filters]);

  useEffect(() => {
    if (dataExploration) {
      const parsedData = JSON.parse(dataExploration.data);
      setData(parsedData);
      setOriginalData(parsedData); // Set original data here

      const gridColumns: any[] = dataExploration.columns.map((col: any) => ({
        field: typeof col === 'string' ? col : (col as { name: string }).name,
        headerName: typeof col === 'string' ? col : (col as { name: string }).name,
        width: 200,
        type: (typeof col === 'string' ? col : (col as { type: string }).type) as GridColDef['type'], // Add explicit type casting here
      }));

      setColumns(gridColumns);
      setOriginalColumns(gridColumns); // Set original columns here
      const timeCols = gridColumns.filter(col => col.type !== undefined && col.type === 'LOCAL_DATE_TIME');
      setAvailableTimeColumns(timeCols.map(col => col.field));
      setDatetimeColumn(timeCols.length > 0 ? timeCols[0].field : '');

      // Set default selected column for the SelectColumnsComponent if not already set
      if (selectedCols.length === 0 && gridColumns.length > 0) {
        setSelectedCols([gridColumns[1].field]);
      }
    }
  }, [dataExploration]);


   useEffect(() => {
    if (dataExploration) {
      const parsedData = JSON.parse(dataExploration.data);
      setData(parsedData);
      setOriginalData(parsedData); // Set original data here
    }
  }, [dataExploration]);

  // useEffect(() => {
  //   fetchData();
  // }, [selectedCols, datetimeColumn,filters]);

  // useEffect(() => {
  //   if (datetimeColumn && selectedCols.length > 0) {
  //     fetchData();
  //   }
  // }, [selectedCols, datetimeColumn, filters]);

  const [tabValue, setTabValue] = useState(0);

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleColumnChange = (event: ChangeEvent<{ value: unknown; }>) => {
    setSelectedCols(event.target.value as SetStateAction<string[]>);
  };

  return (
    <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #ccc' }}>
      <Box sx={{ bgcolor: '#f0f0f0', display: 'flex', alignItems: 'center', height: '3.5rem', px: 2 }}>
        <Typography variant="h6">Dataset Exploration: {filenameWithoutExtension}</Typography>
        <Box sx={{ flex: 1 }} />
        <IconButton>
          <CloseIcon />
        </IconButton>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4} md={3}>
          <FilterForm
            columns={columns}
            onAddFilter={handleAddFilter}
            onRemoveFilter={handleRemoveFilter}
            onRemoveAllFilters={handleRemoveAllFilters}
            filters={filters}
          />
          <SelectColumnsComponent
            selectableColumns={columns}
            selectedColumns={selectedCols}
            handleColumnChange={handleColumnChange}
          />
        </Grid>
        <Grid item xs={12} sm={8} md={9}>
          <Tabs value={tabValue} onChange={handleChangeTab} aria-label="data tabs">
            <Tab label="Data Table" />
            <Tab label="Charts" />
          </Tabs>
          <Box sx={{ p: 3 }}>
            {tabValue === 0 && (
              <>
                {loading && <CircularProgress />}
                {error && <Typography color="error">Error: {error}</Typography>}
                {originalData.length > 0 ? (
                  <DataTable
                    data={originalData}
                    columns={originalColumns}
                  
                  />
                ) : (
                  <Typography>No data available</Typography>
                )}
              </>
            )}

            {tabValue === 1 && (
              <>
                {loading && <CircularProgress />}
                {error && <Typography color="error">Error: {error}</Typography>}
                {!loading && data.length > 0 && (
                  datetimeColumn ? (
                    <DataExplorationChart
                      data={data}
                      columns={columns}
                      datetimeColumn={datetimeColumn}
                      selectedColumns={selectedCols}
                    />
                  ) : (
                    <ScatterPlot data={data} columns={columns} />
                  )
                )}
              </>
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DataExploration;
