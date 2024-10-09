//ORGINAL
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { fetchDataExploration } from "../../../store/slices/dataExplorationSlice";
import DataTable from "./DataTable/DataTable";
import FilterForm from "./FilterForm";
import GroupByAggregationForm from "./GroupByAggregationForm";
import { IFilter } from "../../../shared/models/dataexploration.model";
import { Grid, Box, Typography, IconButton,Pagination, CircularProgress, Tabs, Tab } from "@mui/material";
import { grey } from "@mui/material/colors";
import CloseIcon from '@mui/icons-material/Close';
import TableChartIcon from '@mui/icons-material/TableChart';
import AddchartIcon from '@mui/icons-material/Addchart';
import TableExpand from "./DataTable/TableExpand";

const DataExplorationComponent = () => {
  const dispatch = useAppDispatch();
  const { dataExploration, loading, error, initLoading } = useAppSelector(state => state.dataExploration);
  
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [groupBy, setGroupBy] = useState<string[]>([]);
  const [aggregations, setAggregations] = useState<{ [key: string]: string[] }>({});
  const [columns, setColumns] = useState<string[]>([]);
  const [filters, setFilters] = useState<IFilter[]>([]);
  const [tabValue, setTabValue] = useState(0);


  // Populate available columns when data is fetched
  useEffect(() => {
    if (dataExploration && dataExploration.originalColumns) {
      const availableColumns = dataExploration.originalColumns.map((col: any) => col.name);
      setColumns(availableColumns);
    }
  }, [dataExploration]);

  useEffect(() => {
    const payload = {
      datasetId: 'file:///Users/admin/Desktop/airports.csv',
      columns: [],
      filters,
      limit: 1000,
      offset: 0,
      groupBy,
      aggregation: aggregations,
    };

    dispatch(fetchDataExploration(payload));
  }, [filters, groupBy, aggregations, dispatch]);


  // Handle adding new filters
  const handleAddFilter = (newFilter: IFilter) => {
    setFilters(prevFilters => [...prevFilters, newFilter]);
  };

  // Remove a filter by index
  const handleRemoveFilter = (index: number) => {
    setFilters(prevFilters => prevFilters.filter((_, i) => i !== index));
  };

  // Clear all filters
  const handleRemoveAllFilters = () => {
    setFilters([]);
  };

  // Fetch filtered data when filters change
  
  // Handle form submission for groupBy and aggregations
  // Render loading state
  if (loading || initLoading) {
    return (
      <Box sx={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress size={"5rem"} />
        <Typography fontSize={"1.5rem"} color={grey[500]}>Initializing page...</Typography>
      </Box>
    );
  }

  // Render error state
  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleClear = () => {
    setGroupBy([]);
    setAggregations({});
  };

  console.log("Data Exploration:", dataExploration);


  return (
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
        <Typography fontSize={"1.2rem"}>Dataset Exploration</Typography>
        <Box sx={{ flex: 1 }} />
        <IconButton>
          <CloseIcon />
        </IconButton>
      </Box>
      <Grid container>
        <Grid item xs={12} sm={4} md={3}>
          <FilterForm
            columns={columns.map((col) => ({
              field: col,
              headerName: col,
              width: 200,
              type: 'string', // Adjust if needed
            }))}
            data={JSON.parse(dataExploration?.data || '[]')}
            onAddFilter={handleAddFilter}
            onRemoveFilter={handleRemoveFilter}
            filters={filters}
            onRemoveAllFilters={handleRemoveAllFilters}
          />

          {/* Group By and Aggregation Form */}
          <GroupByAggregationForm
            columns={columns.map(col => ({
              field: col,
              headerName: col,
              type: 'string', // Assume string for simplicity; adjust if needed
            }))}
            groupBy={groupBy}
            aggregations={aggregations}
            onSubmit={(newGroupBy, newAggregations) => {
              setGroupBy(newGroupBy);
              setAggregations(newAggregations);
            }}
            onClear={handleClear} // Pass handleClear to the form

          />
        </Grid>

        <Grid item xs={12} sm={8} md={9}>
          <Tabs value={tabValue} onChange={handleChangeTab} aria-label="data tabs" centered>
            <Tab label="Data Table" icon={<TableChartIcon />} />
            <Tab label="Charts" icon={<AddchartIcon />} />
          </Tabs>
          {tabValue === 0 && (
            <>
              {error && <Typography color="error">Error: {error}</Typography>}
              <TableExpand
                data={JSON.parse(dataExploration?.data || '[]')}
                columns={dataExploration?.columns}
                datetimeColumn={""}
              />
            </>
          )}
          {tabValue === 1 && (
            <>
              {error && <Typography color="error">Error: {error}</Typography>}
              <Typography>PAME LIGO TO LINE</Typography>
              <div>
         <h4>Filtered Data:</h4>
         <pre>{JSON.stringify(filteredData, null, 2)}</pre>
       </div>
            </>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default DataExplorationComponent;






//////DOULEUEI

// import React, { useEffect, useState } from "react";
// import { useAppDispatch, useAppSelector } from "../../../store/store";
// import { fetchDataExploration } from "../../../store/slices/dataExplorationSlice";
// import DataTable from "./DataTable/DataTable";
// import { Box, Typography, CircularProgress, Pagination } from "@mui/material";
// import { grey } from "@mui/material/colors";

// const DataExplorationComponent = () => {
//   const dispatch = useAppDispatch();
//   const { dataExploration, loading, error, initLoading } = useAppSelector(state => state.dataExploration);

//   const [columns, setColumns] = useState<string[]>([]);
//   const [currentData, setCurrentData] = useState<any[]>([]); // Data for the current page
//   const [currentPage, setCurrentPage] = useState(1); // Track current page
//   const [offset, setOffset] = useState(0); // Track the current offset for fetching data
//   const rowsPerPage = 100; // Number of rows per page
//   const [totalPages, setTotalPages] = useState(1); // Track total pages based on totalItems
//   const [maxFetchedPage, setMaxFetchedPage] = useState(10); // Track when new data needs to be fetched (after 10 pages)
//   useEffect(() => {
//     const payload = {
//       datasetId: 'file:///Users/admin/Desktop/airports.csv',
//       columns: [],
//       filters: [],
//       limit: 1000, // Always fetch 1000 rows at a time
//       offset: 0, // Initial fetch starts at offset 0
//       groupBy: [],
//       aggregation: {},
//     };
//     dispatch(fetchDataExploration(payload));
//   }, [dispatch]);
//   // Set total pages once dataExploration.totalItems is available
//   useEffect(() => {
//     if (dataExploration && dataExploration.totalItems) {
//       setTotalPages(Math.ceil(dataExploration.totalItems / rowsPerPage));
//     }
//   }, [dataExploration]);

//   // Populate available columns and set initial data when data is fetched
//   useEffect(() => {
//     if (dataExploration && dataExploration.originalColumns && dataExploration.data) {
//       const availableColumns = dataExploration.originalColumns.map((col: any) => col.name);
//       setColumns(availableColumns);

//       // Set data for the current page (slice of 100 rows)
//       const fetchedData = JSON.parse(dataExploration.data);
//       const startIdx = (currentPage - 1) % 10 * rowsPerPage; // Calculate the start index within the fetched 1000 rows
//       const pageData = fetchedData.slice(startIdx, startIdx + rowsPerPage);
//       setCurrentData(pageData);
//     }
//   }, [dataExploration, currentPage]);

//   // Fetch data when necessary (only when we move beyond the currently fetched 1000 rows)
//   useEffect(() => {
//     if (currentPage > maxFetchedPage) {
//       const newOffset = offset + 1000; // Increment offset by 1000 for the next batch
//       setOffset(newOffset);
//       setMaxFetchedPage(maxFetchedPage + 10); // Update maxFetchedPage after fetching another 1000 rows

//       // Trigger data fetch for the next 1000 rows
//       const payload = {
//         datasetId: 'file:///Users/admin/Desktop/airports.csv',
//         columns: [],
//         filters: [],
//         limit: 1000, // Always fetch 1000 rows at a time
//         offset: newOffset, // Set offset dynamically
//         groupBy: [],
//         aggregation: {},
//       };
//       dispatch(fetchDataExploration(payload));
//     }
//   }, [currentPage, maxFetchedPage, offset, dispatch]);

//   const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
//     setCurrentPage(page);
//   };

//   if (loading || initLoading) {
//     return (
//       <Box sx={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
//         <CircularProgress size={"5rem"} />
//         <Typography fontSize={"1.5rem"} color={grey[500]}>Initializing page...</Typography>
//       </Box>
//     );
//   }

//   // Render error state
//   if (error) {
//     return <Typography color="error">Error: {error}</Typography>;
//   }

//   return (
//     <>
//       {error && <Typography color="error">Error: {error}</Typography>}
//       <DataTable
//         data={currentData}
//         columns={dataExploration?.columns}
//         datetimeColumn={""}
//       />
//       {/* Custom Pagination Footer */}
//       <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
//         <Pagination
//           count={totalPages}
//           page={currentPage}
//           onChange={handlePageChange}
//           color="primary"
//         />
//       </Box>
//     </>
//   );
// };

// export default DataExplorationComponent;


