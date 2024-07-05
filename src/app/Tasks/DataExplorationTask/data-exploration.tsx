import { Paper, Grid, Typography, Box, CircularProgress, IconButton, Tab, Tabs } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import DataTable from './DataTable';
import DataExplorationChart from './DataExplorationChart';
import FilterForm from './FilterForm';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { fetchDataExploration } from '../../../store/slices/dataExplorationSlice';
import ScatterPlot from './ScatterPlot';
import CloseIcon from "@mui/icons-material/Close"

const DataExploration: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dataExploration, loading, error } = useAppSelector(state => state.dataExploration);
  const [columns, setColumns] = useState<any[]>([]);
  const [originalColumns, setOriginalColumns] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [originalData, setOriginalData] = useState<any[]>([]);
  const [selectedCols, setSelectedCols] = useState<string[]>([]);
  const [datetimeColumn, setDatetimeColumn] = useState<string>('');
  const [filters, setFilters] = useState<any[]>([]);
  const [tabValue, setTabValue] = useState(0);


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

  const datafile = "file:///I2Cat_phising/dataset/test.csv";
  // const datafile = 
  // "zenoh://1/input_data/electrical_data/test.csv";
    // "zenoh://cars/car/ca/cars.json"


  const parts = datafile.split('/');
  const filenameWithExtension = parts[parts.length - 1];
  const filenameWithoutExtension = filenameWithExtension.replace('.csv', '');

  
  useEffect(() => {
    dispatch(fetchDataExploration({
      datasetId: datafile,
      columns: [],
      aggFunction: '',
      filters: filters,
      limit: 1000,
      scaler: '',
    }));
  }, [dispatch, filters]);

  useEffect(() => {
    if (dataExploration) {
      console.log('data',dataExploration)
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
      setDatetimeColumn(timeCols.length > 0 ? timeCols[0].field : '');
      // setDatetimeColumn('');

      // Set default selected column for the SelectColumnsComponent if not already set
      if (selectedCols.length === 0 && gridColumns.length > 0) {
        setSelectedCols([gridColumns[1].field]);
      }
    }
  }, [dataExploration]);


  //  useEffect(() => {
  //   if (dataExploration) {
  //     const parsedData = JSON.parse(dataExploration.data);
  //     setData(parsedData);
  //     setOriginalData(parsedData); // Set original data here
  //   }
  // }, [dataExploration]);


  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  

  return (
    <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #ccc' }}>
      <Box sx={{ bgcolor: '#f0f0f0', display: 'flex', alignItems: 'center', height: '3.5rem', px: 2 }}>
        <Typography variant="h6">Dataset Exploration: {filenameWithoutExtension}</Typography>
        <Box sx={{ flex: 1 }} />
        <IconButton>
          <CloseIcon />
        </IconButton>
      </Box>
      <Grid container spacing={2} >
        <Grid item xs={12} sm={4} md={3}>
          <FilterForm
            columns={columns}
            onAddFilter={handleAddFilter}
            onRemoveFilter={handleRemoveFilter}
            onRemoveAllFilters={handleRemoveAllFilters}
            filters={filters}
          />
          {/* {tabValue === 1 &&(
          <SelectColumnsComponent
            selectableColumns={columns}
            selectedColumns={selectedCols}
            handleColumnChange={handleColumnChange}
          />)} */}
        </Grid>
        <Grid item xs={12} sm={8} md={9}>
          <Tabs value={tabValue} onChange={handleChangeTab} aria-label="data tabs" centered>
            <Tab label="Data Table" />
            <Tab label="Charts" />
          </Tabs>
          

            {tabValue === 0 && (
              <>
                {loading && <CircularProgress />}
                {error && <Typography color="error">Error: {error}</Typography>}
                {!loading && (
                   <DataTable
                   data={originalData}
                   columns={originalColumns}
                   datetimeColumn={datetimeColumn} // Pass datetimeColumn to DataTable

                   selectedColumns={selectedCols} // Pass selectedCols to DataTable
                 />
                ) }
              </>
            )}

            {tabValue === 1 && (
              <>
                {loading && <CircularProgress />}
                {error && <Typography color="error">Error: {error}</Typography>}
                {!loading && (
                  datetimeColumn ? (
                    <DataExplorationChart
                      data={originalData}
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
           
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DataExploration;







// const fetchData = () => {
  //   if (datetimeColumn) {
  //     const requestData: IDataExplorationRequest = {
  //       datasetId: datafile,
  //       columns: [...selectedCols, datetimeColumn],
  //       aggFunction: granularity,
  //       filters: filters,
  //       limit: limit,
  //       scaler: scaler,
  //     };
  //     dispatch(fetchDataExploration(requestData));
  //   }
  // };

    // useEffect(() => {
  //   fetchData();
  // }, [selectedCols, datetimeColumn,filters]);

  // useEffect(() => {
  //   if (datetimeColumn && selectedCols.length > 0) {
  //     fetchData();
  //   }
  // }, [selectedCols, datetimeColumn, filters]);

