
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { fetchDataExploration } from "../../../store/slices/dataExplorationSlice";
import DataTable from "./DataTable";
import FilterForm from "./FilterForm";
import GroupByAggregationForm from "./GroupByAggregationForm";
import { IFilter } from "../../../shared/models/dataexploration.model";
import { Grid, Box, Typography, IconButton, CircularProgress, Tabs, Tab } from "@mui/material";
import { grey } from "@mui/material/colors";
import CloseIcon from '@mui/icons-material/Close';
import TableChartIcon from '@mui/icons-material/TableChart';
import AddchartIcon from '@mui/icons-material/Addchart';

const DataExplorationComponent = () => {
  const dispatch = useAppDispatch();
  const { dataExploration, loading, error, initLoading } = useAppSelector(state => state.dataExploration);
  
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [groupBy, setGroupBy] = useState<string[]>([]);
  const [aggregations, setAggregations] = useState<{ [key: string]: string[] }>({});
  const [columns, setColumns] = useState<string[]>([]);
  const [filters, setFilters] = useState<IFilter[]>([]);
  const [tabValue, setTabValue] = useState(0);

  // Fetch initial data when component mounts
//   useEffect(() => {
//     const initialPayload = {
//       datasetId: 'file:///Users/admin/Desktop/airports.csv',
//       columns: [],
//       filters: [],
//       limit: 1000,
//       offset: 0,
//       groupBy: [],
//       aggregation: {},
//     };
    
//     dispatch(fetchDataExploration(initialPayload));
//   }, [dispatch]);

  // Populate available columns when data is fetched
  useEffect(() => {
    if (dataExploration && dataExploration.originalColumns) {
      const availableColumns = dataExploration.originalColumns.map((col: any) => col.name);
      setColumns(availableColumns);
    }
  }, [dataExploration]);

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

  // Handle form submission for groupBy and aggregations
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      datasetId: 'file:///Users/admin/Desktop/airports.csv',
      columns: [],
      filters,
      limit: 1000,
      offset: 0,
      groupBy,
      aggregation: aggregations,
    };

    if (groupBy.length === 0 && Object.keys(aggregations).length === 0) {
      alert("Please select at least one Group By column or Aggregation function.");
      return;
    }

    dispatch(fetchDataExploration(payload));
  };

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
              <DataTable
                data={JSON.parse(dataExploration?.data || '[]')}
                columns={dataExploration?.columns}
                datetimeColumn={""}
                onFilteredDataChange={setFilteredData}
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
