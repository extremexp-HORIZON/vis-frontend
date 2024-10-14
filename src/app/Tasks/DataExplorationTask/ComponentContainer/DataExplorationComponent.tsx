
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import { fetchDataExploration } from "../../../../store/slices/dataExplorationSlice";
import TableExpand from '../DataTable/TableExpand';
import ControlPanel from '../ChartControls/ControlPanel'; // Import the new ControlPanel component
import { Box, CircularProgress, Paper, Tab, Tabs, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { IDataExplorationRequest, IFilter } from '../../../../shared/models/dataexploration.model'; // Ensure correct path
import TableChartIcon from '@mui/icons-material/TableChartSharp';
import AddchartIcon from '@mui/icons-material/Addchart';
import GraphContainer from './GraphContainer';
const DataExplorationComponent = () => {
  const dispatch = useAppDispatch();
  const { dataExploration, loading, error } = useAppSelector((state) => state.dataExploration);

  const [data, setData] = useState([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [originalColumns, setOriginalColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [rowLimit, setRowLimit] = useState(1000);
  const [activeTab, setActiveTab] = useState(0); // 0 for Raw Records, 1 for Aggregate
  const[activeChartTab,setActiveChartTab]=useState(0)
  const[filters, setFilters] = useState<IFilter[]>([]);
  const[uniqueColumnValues, setUniqueColumnValues] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'overlay' | 'stacked'>('overlay');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'scatter'>('line');
  const [xAxis, setXAxis] = useState<string>('');
  const [yAxis, setYAxis] = useState<string[]>([]);
  const [groupFunction, setGroupFunction] = useState<string>('sum');
  const [barGroupBy, setBarGroupBy] = useState<string[]>([]); // State for bar chart grouping
  const [barAggregation, setBarAggregation] = useState<any>({}); // State for bar chart aggregation
  

  


  // Function to fetch data based on selected columns and row limit
  const fetchData = (payload : IDataExplorationRequest) => {
    dispatch(fetchDataExploration(payload));
  };

  // Fetch initial data when the component mounts
  useEffect(() => {
    const initialPayload = {
      datasetId: 'file:///Users/admin/Desktop/airports.csv',
      limit: rowLimit, // Default row limit
      columns: [], // Fetch all columns by default
      filters:[],
      groupBy:[],
      aggregation: {},
      offset:0

    };
    fetchData(initialPayload); // Fetch initial data
  }, [dispatch, rowLimit]); // Dependency on rowLimit to re-fetch if it changes

  // Update data and columns when new data comes in
  useEffect(() => {
    if (dataExploration?.data) {
      const parsedData = JSON.parse(dataExploration.data);
      setData(parsedData);
      setColumns(dataExploration.columns);
      setOriginalColumns(dataExploration.originalColumns); // Set original columns from the response
      setUniqueColumnValues(dataExploration.uniqueColumnValues);
      // Set default selected columns if none are selected
      if (selectedColumns.length === 0 && dataExploration.originalColumns) {
        const defaultColumns = dataExploration.originalColumns.map((col: { name: string; }) => col.name);
        setSelectedColumns(defaultColumns);
      }
    }
  }, [dataExploration, selectedColumns]); // Listen for new dataExploration responses

  // Function to handle fetching data when the user clicks the button
  const handleFetchData = () => {
    const payload = {
      datasetId: 'file:///Users/admin/Desktop/airports.csv',
      limit: rowLimit,
      columns: selectedColumns, // Include selected columns in the payload
      filters:filters
      
    };
    fetchData(payload);
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <CircularProgress size={"5rem"} />
        <Typography fontSize={"1.5rem"} color={grey[500]}>
          Initializing page...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }
  return (
  <Paper>
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Control Panel */}
      <ControlPanel
        originalColumns={originalColumns}
        selectedColumns={selectedColumns}
        setSelectedColumns={setSelectedColumns}
        rowLimit={rowLimit}
        setRowLimit={setRowLimit}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onFetchData={handleFetchData} // Pass the fetchData function to ControlPanel
        filters={filters}
        setFilters={setFilters}
        uniqueValues={uniqueColumnValues}
      />
      <Box sx={{ flexGrow: 1 }}>

        <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <Tabs value={activeChartTab} onChange={(e, newValue) => setActiveChartTab(newValue)}>
            <Tab label="Data Table" icon={<TableChartIcon/>} />
            <Tab label="Charts" icon={<AddchartIcon/>} />
          </Tabs>
        </Box>
        {activeChartTab === 0 && (
          <TableExpand data={data} columns={columns} datetimeColumn="" />
          )}
        {activeChartTab === 1 && (
          <GraphContainer dataexp={dataExploration ?? []}
          filters={filters}
          chartType={chartType}
          setChartType={setChartType}
          xAxis={xAxis}
          setXAxis={setXAxis}
          yAxis={yAxis}
          setYAxis={setYAxis}
          viewMode={viewMode}
          setViewMode={setViewMode}
          groupFunction={groupFunction}
          setGroupFunction={setGroupFunction}
          barGroupBy={barGroupBy}
          setBarGroupBy={setBarGroupBy}
          barAggregation={barAggregation}
          setBarAggregation={setBarAggregation}
           />
          )}
      </Box>
    </Box>

  </Paper>
   
  );
};

export default DataExplorationComponent;


