import { Paper, Grid, Typography, Box, CircularProgress, IconButton, Tab, Tabs } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import type React from 'react';
import { useEffect, useState } from 'react';
import DataTable from './DataTable';
import grey from "@mui/material/colors/grey"
import FilterForm from './FilterForm';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { fetchDataExploration, fetchMultipleTimeseries } from '../../../store/slices/dataExplorationSlice';
import CloseIcon from "@mui/icons-material/Close"
import Testing from './Testing';
import { useParams } from 'react-router-dom';
import MultiTimeSeriesVisualization from './multi-ts-visualization/MultiTimeSeriesVisualization';

const DataExploration: React.FC = () => {
  const dispatch = useAppDispatch();
  const {loading, error, multipleTimeSeries,dataExploration} = useAppSelector(state => state.dataExploration);
  const [columns, setColumns] = useState<any[]>([]);
  const [originalColumns, setOriginalColumns] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [originalData, setOriginalData] = useState<any[]>([]);
  const [selectedCols, setSelectedCols] = useState<string[]>([]);
  const [datetimeColumn, setDatetimeColumn] = useState<string>('');
  const [filters, setFilters] = useState<any[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const { experimentId } = useParams();

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

  const datafile = "file:///I2Cat_phising/dataset/I2Cat_phising_dataset.csv";
  // const datafile = 
  // "zenoh://1/input_data/electrical_data/test.csv";
  // "zenoh://cars/car/ca/cars.json"

  const parts = datafile.split('/');
  const filenameWithExtension = parts[parts.length - 1];
  const filenameWithoutExtension = filenameWithExtension.replace('.csv', '');

  useEffect(() => {
    if(experimentId && experimentId.includes("ideko")){
      dispatch(fetchMultipleTimeseries({dataQuery: {
        datasetId: `folder://${experimentId}/datasets/LG600B6-100636-IDK`,
        columns: [],
        filters: [],   
      }}));
    }
  }, []);

  ////Commented out those

  // useEffect(() => {
  //   dispatch(fetchDataExploration({
  //     datasetId: datafile,
  //     columns: [],
  //     aggFunction: '',
  //     filters: filters,
  //     limit: 1000,
  //     scaler: '',
  //   }));
  // }, [dispatch, filters]);

  // useEffect(() => {
  //   if (dataExploration) {
  //     const parsedData = JSON.parse(dataExploration.data);
  //     setData(parsedData);
  //     setOriginalData(parsedData); // Set original data here
      
  //     const gridColumns: any[] = dataExploration.columns.map((col: any) => ({
  //       field: typeof col === 'string' ? col : (col as { name: string }).name,
  //       headerName: typeof col === 'string' ? col : (col as { name: string }).name,
  //       width: 200,
  //       type: (typeof col === 'string' ? col : (col as { type: string }).type) as GridColDef['type'], // Add explicit type casting here
  //     }));

  //     setColumns(gridColumns);
  //     setOriginalColumns(gridColumns); // Set original columns here
  //     const timeCols = gridColumns.filter(col => col.type !== undefined && col.type === 'LOCAL_DATE_TIME');
  //     setDatetimeColumn(timeCols.length > 0 ? timeCols[0].field : '');

  //     if (selectedCols.length === 0 && gridColumns.length > 0) {
  //       setSelectedCols([gridColumns[1].field]);
  //     }
  //   }
  // }, [dataExploration]);

  

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  return (
    <>
      <Grid
          sx={{
            flexDirection: "column",
            display: "flex",
            justifyContent: "center",
            textAlign: "center",
            border: `1px solid ${grey[400]}`,
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              bgcolor: grey[300],
              display: "flex",
              height: "3.5rem",
              alignItems: "center",
              textAlign: "left",
              px: 2,
            }}
          >
            {/* <Typography fontSize={"1.2rem"}>Dataset Exploration: {filenameWithoutExtension}</Typography> */}
            <Typography fontSize={"1.2rem"}>Dataset Exploration: LG600B6-100636-IDK</Typography>

            <Box sx={{ flex: 1 }} />
            <IconButton>
              <CloseIcon />
            </IconButton>
          </Box>
    {loading ? 
        <Box sx={{ height: "100%", width: "100%" }}>
        <CircularProgress size={"5rem"} />
        <Typography fontSize={"1.5rem"} color={grey[500]}>
          Initializing page...
        </Typography>
      </Box> :
      <Grid container spacing={2} >
      { experimentId && experimentId.includes("ideko") ?
       <Grid container spacing={2}>
        <Grid item xs={12} md={12}>
          <MultiTimeSeriesVisualization 
            data={structuredClone(multipleTimeSeries)}
          />
        </Grid>
      </Grid> 
        :
        (<>
          <Grid item xs={12} sm={4} md={3}>
            <FilterForm
              columns={columns}
              onAddFilter={handleAddFilter}
              onRemoveFilter={handleRemoveFilter}
              onRemoveAllFilters={handleRemoveAllFilters}
              filters={filters}
            />
          </Grid>
          <Grid item xs={12} sm={8} md={9}>
            <Tabs value={tabValue} onChange={handleChangeTab} aria-label="data tabs" centered>
              <Tab label="Data Table" />
              <Tab label="Charts" />
            </Tabs>
            {tabValue === 0 && (
              <>
                {error && <Typography color="error">Error: {error}</Typography>}
                  <DataTable
                   data={originalData}
                   columns={originalColumns}
                   datetimeColumn={datetimeColumn} // Pass datetimeColumn to DataTable
                   selectedColumns={selectedCols} // Pass selectedCols to DataTable
                 />
              </>
            )}
            {tabValue === 1 && (
              <>
                {error && <Typography color="error">Error: {error}</Typography>}
                <Testing
                      data={originalData}
                      columns={columns}
                      datetimeColumn={datetimeColumn}
                      selectedColumns={selectedCols}
                  />
              </>
            )}
          </Grid>
        </>)
      }
      </Grid>
    }
    </Grid>
    </>
);
};

export default DataExploration;



