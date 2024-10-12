// // // // //////DOULEUEI

// // // import React, { useEffect, useState } from "react";
// // // import { useAppDispatch, useAppSelector } from "../../../store/store";
// // // import { fetchDataExploration } from "../../../store/slices/dataExplorationSlice";
// // // import DataTable from "./DataTable/DataTable";
// // // import { Box, Typography, CircularProgress, Pagination } from "@mui/material";
// // // import { grey } from "@mui/material/colors";
// // // import { IFilter } from "../../../shared/models/dataexploration.model";
// // // import FilterForm from "./FilterForm";

// // // const DataExplorationComponent = () => {
// // //   const dispatch = useAppDispatch();
// // //   const { dataExploration, loading, error, initLoading } = useAppSelector(state => state.dataExploration);

// // //   const [columns, setColumns] = useState<string[]>([]);
// // //   const [currentData, setCurrentData] = useState<any[]>([]); // Data for the current page
// // //   const [currentPage, setCurrentPage] = useState(1); // Track current page
// // //   const [offset, setOffset] = useState(0); // Track the current offset for fetching data
// // //   const rowsPerPage = 100; // Number of rows per page
// // //   const [totalPages, setTotalPages] = useState(1); // Track total pages based on totalItems
// // //   const [maxFetchedPage, setMaxFetchedPage] = useState(10); // Track when new data needs to be fetched (after 10 pages)
// // //   const [filters, setFilters] = useState<IFilter[]>([]);
// // //   const [groupBy, setGroupBy] = useState<string[]>([]);
// // //   const [aggregations, setAggregations] = useState<{ [key: string]: string[] }>({});
// // //  const [tabValue, setTabValue] = useState(0);
// // //   useEffect(() => {
// // //     const payload = {
// // //       datasetId: 'file:///Users/admin/Desktop/airports.csv',
// // //       columns: [],
// // //       filters: filters,
// // //       limit: 1000, // Always fetch 1000 rows at a time
// // //       offset: 0, // Initial fetch starts at offset 0
// // //       groupBy: groupBy,
// // //       aggregation: aggregations,
// // //     };
// // //     dispatch(fetchDataExploration(payload));
// // //   }, [dispatch, filters, groupBy, aggregations]);
// // //   // Set total pages once dataExploration.totalItems is available
// // //   useEffect(() => {
// // //     if (dataExploration && dataExploration.querySize) {
// // //       setTotalPages(Math.ceil(dataExploration.querySize / rowsPerPage));
// // //     }
// // //   }, [dataExploration]);

// // //   // Populate available columns and set initial data when data is fetched
// // //   useEffect(() => {
// // //     if (dataExploration && dataExploration.originalColumns && dataExploration.data) {
// // //       const availableColumns = dataExploration.originalColumns.map((col: any) => col.name);
// // //       setColumns(availableColumns);

// // //       // Set data for the current page (slice of 100 rows)
// // //       const fetchedData = JSON.parse(dataExploration.data);
// // //       const startIdx = (currentPage - 1) % 10 * rowsPerPage; // Calculate the start index within the fetched 1000 rows
// // //       const pageData = fetchedData.slice(startIdx, startIdx + rowsPerPage);
// // //       setCurrentData(pageData);
// // //     }
// // //   }, [dataExploration, currentPage]);

// // //   // Fetch data when necessary (only when we move beyond the currently fetched 1000 rows)
// // //   useEffect(() => {
// // //     if (currentPage > maxFetchedPage) {
// // //       const newOffset = offset + 1000; // Increment offset by 1000 for the next batch
// // //       setOffset(newOffset);
// // //       setMaxFetchedPage(maxFetchedPage + 10); // Update maxFetchedPage after fetching another 1000 rows

// // //       // Trigger data fetch for the next 1000 rows
// // //       const payload = {
// // //         datasetId: 'file:///Users/admin/Desktop/airports.csv',
// // //         columns: [],
// // //         filters: filters,
// // //         limit: 1000, // Always fetch 1000 rows at a time
// // //         offset: newOffset, // Set offset dynamically
// // //         groupBy: groupBy,
// // //         aggregation: aggregations,
// // //       };
// // //       dispatch(fetchDataExploration(payload));
// // //     }
// // //   }, [currentPage, maxFetchedPage, offset, dispatch, filters, groupBy, aggregations]);

// // //   const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
// // //     setCurrentPage(page);
// // //   };

// // //   if (loading || initLoading) {
// // //     return (
// // //       <Box sx={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
// // //         <CircularProgress size={"5rem"} />
// // //         <Typography fontSize={"1.5rem"} color={grey[500]}>Initializing page...</Typography>
// // //       </Box>
// // //     );
// // //   }
// // //   console.log('dataexploraito',dataExploration);

// // //   // Render error state
// // //   if (error) {
// // //     return <Typography color="error">Error: {error}</Typography>;
// // //   }
// // //   const handleAddFilter = (newFilter: IFilter) => {
// // //       setFilters(prevFilters => [...prevFilters, newFilter]);

// // //   };

// // //   const handleRemoveFilter = (index: number) => {
// // //     setFilters(prevFilters => prevFilters.filter((_, i) => i !== index));
// // //   };
// // //   const handleRemoveAllFilters = () => {
// // //     setFilters([]);
// // //   };

// // //   const handleChangeTab = (event: React.ChangeEvent<{}>, newValue: number) => {
// // //     setTabValue(newValue);};
// // //   const handleClear=()=>{
// // //     setGroupBy([]);
// // //     setAggregations({});
// // //   }

  

// // //   return (
// // //     <>
// // //       {error && <Typography color="error">Error: {error}</Typography>}
// // //       <FilterForm columns={columns.map((col) => ({
// // //         field: col,
// // //         headerName: col,
// // //         width: 200,
// // //         type: 'string', // Adjust if needed
// // //       }))} onAddFilter={handleAddFilter} onRemoveFilter={handleRemoveFilter} filters={filters} onRemoveAllFilters={handleRemoveAllFilters} data={JSON.parse(dataExploration?.data || '[]')}/>
// // //       <DataTable
// // //         data={currentData}
// // //         columns={dataExploration?.columns}
// // //         datetimeColumn={""}
// // //       />
// // //       {/* Custom Pagination Footer */}
// // //       <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
// // //         <Pagination
// // //           count={totalPages}
// // //           page={currentPage}
// // //           onChange={handlePageChange}
// // //           color="primary"
// // //         />
// // //       </Box>
// // //     </>
// // //   );
// // // };

// // // export default DataExplorationComponent;


import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { fetchDataExploration } from "../../../store/slices/dataExplorationSlice";
import TableExpand from './DataTable/TableExpand';
import ControlPanel from './ChartControls/ControlPanel'; // Import the new ControlPanel component
import { Box, CircularProgress, Paper, Tab, Tabs, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { IDataExplorationRequest, IFilter } from '../../../shared/models/dataexploration.model'; // Ensure correct path
import Testing from './Testing';
import TableChartIcon from '@mui/icons-material/TableChartSharp';
import AddchartIcon from '@mui/icons-material/Addchart';
import GraphContainer from './Charts/GraphContainer';
const DataExplorationComponent = () => {
  const dispatch = useAppDispatch();
  const { dataExploration, loading, error } = useAppSelector((state) => state.dataExploration);

  const [data, setData] = useState([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [originalColumns, setOriginalColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [rowLimit, setRowLimit] = useState(10);
  const [activeTab, setActiveTab] = useState(0); // 0 for Raw Records, 1 for Aggregate
  const[activeChartTab,setActiveChartTab]=useState(0)
  const[filters, setFilters] = useState<IFilter[]>([]);
  const[uniqueColumnValues, setUniqueColumnValues] = useState<string[]>([]);

  console.log('data',data);


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

    };
    fetchData(initialPayload); // Fetch initial data
  }, [dispatch]); // Dependency on rowLimit to re-fetch if it changes

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
console.log('dataexplo',dataExploration);
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

      {/* Data Table */}
      <Tabs value={activeChartTab} onChange={(e, newValue) => setActiveChartTab(newValue)}>
        <Tab label="Data Table" icon={<TableChartIcon/>} />
        <Tab label="Charts" icon={<AddchartIcon/>} />
        </Tabs>
        {activeChartTab === 0 && (
          <TableExpand data={data} columns={columns} datetimeColumn="" />
        )}
     {activeChartTab === 1 && (
  <GraphContainer dataexp={dataExploration ?? []} />
)}
        </Box>
    </Box>

    </Paper>
   
  );
};

export default DataExplorationComponent;


