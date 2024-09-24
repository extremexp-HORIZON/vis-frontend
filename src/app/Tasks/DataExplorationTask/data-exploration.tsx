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
import { useParams } from 'react-router-dom';
import MultiTimeSeriesVisualization from './multi-ts-visualization/MultiTimeSeriesVisualization';
import DataExplorationChart from './DataExplorationChart';
import Testing from './Testing';
import FacettedSearch from './Deprecated/Ideas';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TableChartIcon from '@mui/icons-material/TableChartSharp';
import AddchartIcon from '@mui/icons-material/Addchart';

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
  const [filenameWithoutExtension, setFilenameWithoutExtension] = useState('');

  const theme = createTheme({
    palette: {
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
    typography: {
      fontFamily: 'Arial',
      h6: {
        fontWeight: 600,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '20px',  // Example of button customization
          },
        },
      },
    },
  });

  const handleAddFilter = (newFilter: number) => {
    setFilters([...filters, newFilter]);
  };

  const handleRemoveFilter = (index: number) => {
    const newFilters = [...filters];
    newFilters.splice(index, 1);
    setFilters(newFilters);
  };

  const handleRemoveAllFilters = () => {
    setFilters([]); 
  };

  // const datafile = 
  // "zenoh://1/input_data/electrical_data/test.csv";
  // "zenoh://cars/car/ca/cars.json"
 
  useEffect(() => {
    if(experimentId && experimentId.includes("ideko")){
      dispatch(fetchMultipleTimeseries({dataQuery: {
        datasetId: `folder://${experimentId}/datasets/LG600B6-100636-IDK`,
        columns: [],
        filters: [],   
      }}));
      setFilenameWithoutExtension('LG600B6_100636_IDK');

    }else if(experimentId && experimentId.includes("I2Cat_phising")){
      const datafile = "file:///I2Cat_phising/dataset/I2Cat_phising_dataset.csv";

      dispatch(fetchDataExploration({
        datasetId: datafile,
        columns: [],
        aggFunction: '',
        filters: filters,
        limit: 1000,
        scaler: '',
      }));
      const parts = datafile.split('/');
      const filenameWithExtension = parts[parts.length - 1];
      setFilenameWithoutExtension(filenameWithExtension.replace('.csv', ''));

    }
  }, [filters,experimentId,dispatch]);
  useEffect(() => {
    if (dataExploration) {
      const parsedData = JSON.parse(dataExploration.data);
      setData(parsedData);
      setOriginalData(parsedData); 
      
      const gridColumns: any[] = dataExploration.columns.map((col: any) => ({
        field: typeof col === 'string' ? col : (col as { name: string }).name,
        headerName: typeof col === 'string' ? col : (col as { name: string }).name,
        width: 200,
        type: (typeof col === 'string' ? col : (col as { type: string }).type) as GridColDef['type'], 
      }));

      setColumns(gridColumns);
      setOriginalColumns(gridColumns); 
      const timeCols = gridColumns.filter(col => col.type !== undefined && col.type === 'LOCAL_DATE_TIME');
      setDatetimeColumn(timeCols.length > 0 ? timeCols[0].field : '');

      if (selectedCols.length === 0 && gridColumns.length > 0) {
        setSelectedCols([gridColumns[1].field]);
      }
    }
  }, [dataExploration]);

  

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
            <Typography fontSize={"1.2rem"}>Dataset Exploration: {filenameWithoutExtension}</Typography>

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
          <ThemeProvider theme={theme}>

            {/* <FilterForm
              columns={columns}
              onAddFilter={handleAddFilter}
              onRemoveFilter={handleRemoveFilter}
              onRemoveAllFilters={handleRemoveAllFilters}
              filters={filters}
            /> */}
            <FilterForm
  columns={columns}
  data={originalData}  
  onAddFilter={handleAddFilter}
  onRemoveFilter={handleRemoveFilter}
  onRemoveAllFilters={handleRemoveAllFilters}
  filters={filters}
/>
            </ThemeProvider>

          </Grid>
          <Grid item xs={12} sm={8} md={9}>
            <Tabs value={tabValue} onChange={handleChangeTab} aria-label="data tabs" centered>
              <Tab label="Data Table" icon={<TableChartIcon/>} />
              <Tab label="Charts" icon={<AddchartIcon/>} />
            </Tabs>
            {tabValue === 0 && (
              <>
                {error && <Typography color="error">Error: {error}</Typography>}
                  <DataTable
                   data={originalData}
                   columns={originalColumns}
                   datetimeColumn={datetimeColumn} 
                   selectedColumns={selectedCols}
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
                        />
                            {/* <ThemeProvider theme={theme}>

                        <FacettedSearch/>
                        </ThemeProvider> */}
                        
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



