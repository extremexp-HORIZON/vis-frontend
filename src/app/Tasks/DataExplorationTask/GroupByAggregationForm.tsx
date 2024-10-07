// import React, { useState } from "react";
// import {
//   Box,
//   Button,
//   Chip,
//   FormControl,
//   Grid,
//   InputLabel,
//   MenuItem,
//   Popover,
//   Select,
//   Typography,
//   Tooltip,
//   Badge,
//   Checkbox,
//   ListItemText,
// } from "@mui/material";
// import FilterAltIcon from "@mui/icons-material/FilterAlt";
// import FilterListIcon from "@mui/icons-material/FilterList";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import { createTheme, ThemeProvider } from "@mui/material";

// interface IGroupByAggregationFormProps {
//   columns: { field: string; headerName: string; type: string }[];
//   groupBy: string[];
//   aggregations: { [key: string]: string[] };
//   onSubmit: (groupBy: string[], aggregations: { [key: string]: string[] }) => void;
  
// }

// const GroupByAggregationForm: React.FC<IGroupByAggregationFormProps> = ({
//   columns,
//   groupBy,
//   aggregations,
//   onSubmit
// }) => {
//   const [selectedGroupBy, setSelectedGroupBy] = useState<string[]>(groupBy);
//   const [aggregationList, setAggregationList] = useState<Array<{ column: string; measures: string[] }>>([]);
//   const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

//   const theme = createTheme({
//     palette: {
//       primary: { main: "#1976d2" },
//       secondary: { main: "#dc004e" },
//     },
//     typography: {
//       fontFamily: "Arial",
//       h6: { fontWeight: 600 },
//     },
//     components: {
//       MuiButton: {
//         styleOverrides: {
//           root: { borderRadius: "20px" },
//         },
//       },
//     },
//   });

//   const handleGroupByChange = (event: any) => {
//     setSelectedGroupBy(event.target.value as string[]);
//   };

//   const addAggregation = () => {
//     setAggregationList([...aggregationList, { column: "", measures: [] }]);
//   };

//   const handleAggregationColumnChange = (index: number, column: string) => {
//     const updatedAggregationList = [...aggregationList];
//     updatedAggregationList[index].column = column;
//     setAggregationList(updatedAggregationList);
//   };

//   const handleAggregationMeasuresChange = (index: number, measures: string[]) => {
//     const updatedAggregationList = [...aggregationList];
//     updatedAggregationList[index].measures = measures;
//     setAggregationList(updatedAggregationList);
//   };

//   const handleDeleteGroupBy = (group: string) => {
//     const updatedGroupBy = selectedGroupBy.filter(item => item !== group);
//     setSelectedGroupBy(updatedGroupBy);
//   };

//   const handleDeleteAggregation = (index: number) => {
//     const updatedAggregationList = aggregationList.filter((_, i) => i !== index);
//     setAggregationList(updatedAggregationList);
//   };

//   const handleSubmit = (event: React.FormEvent) => {
//     event.preventDefault();
//     const selectedAggregations = aggregationList.reduce((acc, { column, measures }) => {
//       if (column) {
//         acc[column] = measures;
//       }
//       return acc;
//     }, {} as { [key: string]: string[] });

//     onSubmit(selectedGroupBy, selectedAggregations);
//     handlePopoverClose(); // Close popover on submit
//   };

//   const handlePopoverOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handlePopoverClose = () => {
//     setAnchorEl(null);
//   };

//   const open = Boolean(anchorEl);
//   const id = open ? 'group-by-aggregation-popover' : undefined;

//   return (
//     <ThemeProvider theme={theme}>
//       <Box sx={{ p: 2 }}>
//         {/* Filter Button */}
//         <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid #ccc`, mb: 2 }}>
//           <Tooltip title="Open Group By and Aggregation Tool">
//             <Button aria-describedby={id} variant="text" onClick={handlePopoverOpen} size="small">
//               <FilterListIcon />
//               <Typography sx={{ ml: 1 }}>Group By & Aggregations</Typography>
//             </Button>
//           </Tooltip>
//           {selectedGroupBy.length > 0 && (
//             <Badge color="secondary" badgeContent={selectedGroupBy.length} sx={{ ml: 2 }}>
//               <FilterAltIcon color="primary" />
//             </Badge>
//           )}
//         </Box>

//         {/* Popover for the Group By and Aggregation Form */}
//         <Popover
//           id={id}
//           open={open}
//           anchorEl={anchorEl}
//           onClose={handlePopoverClose}
//           anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
//         >
//           <Box sx={{ p: 2, width: '400px' }}>
//             {/* Display selected Group By items */}
//             <Box mb={2}>
//               <Typography variant="h6">Selected Group By</Typography>
//               <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                 {selectedGroupBy.map((group) => (
//                   <Chip
//                     key={group}
//                     label={group}
//                     onDelete={() => handleDeleteGroupBy(group)}
//                     color="primary"
//                   />
//                 ))}
//               </Box>
//             </Box>

//             {/* Display selected Aggregations */}
//             <Box mb={2}>
//               <Typography variant="h6">Selected Aggregations</Typography>
//               <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                 {aggregationList.map((agg, index) => (
//                   <Chip
//                     key={index}
//                     label={`${agg.column}: ${agg.measures.join(", ")}`}
//                     onDelete={() => handleDeleteAggregation(index)}
//                     color="secondary"
//                   />
//                 ))}
//               </Box>
//             </Box>

//             <form onSubmit={handleSubmit}>
//               <Grid container spacing={3}>
//                 {/* Group By Section */}
//                 <Grid item xs={12}>
//                   <Typography variant="h6">Group By</Typography>
//                   <FormControl fullWidth sx={{ mt: 2 }}>
//                     <InputLabel>Group By Columns</InputLabel>
//                     <Select
//                       multiple
//                       value={selectedGroupBy}
//                       onChange={handleGroupByChange}
//                       renderValue={(selected) => (
//                         <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                           {selected.map((value) => (
//                             <Chip key={value} label={value} />
//                           ))}
//                         </Box>
//                       )}
//                     >
//                       {columns.map((column) => (
//                         <MenuItem key={column.field} value={column.field}>
//                           <Checkbox checked={selectedGroupBy.includes(column.field)} />
//                           <ListItemText primary={column.headerName} />
//                         </MenuItem>
//                       ))}
//                     </Select>
//                   </FormControl>
//                 </Grid>

//                 {/* Aggregations Section */}
//                 <Grid item xs={12}>
//                   <Typography variant="h6">Aggregations</Typography>
//                   {aggregationList.map((agg, index) => (
//                     <Box key={index} sx={{ display: "flex", alignItems: "center", mb: 2 }}>
//                       {/* Select column */}
//                       <FormControl sx={{ mr: 2, width: "40%" }}>
//                         <InputLabel>Select Column</InputLabel>
//                         <Select
//                           value={agg.column}
//                           onChange={(e) => handleAggregationColumnChange(index, e.target.value as string)}
//                         >
//                           {columns.map((column) => (
//                             <MenuItem key={column.field} value={column.field}>
//                               {column.headerName}
//                             </MenuItem>
//                           ))}
//                         </Select>
//                       </FormControl>

//                       {/* Select measures */}
//                       {agg.column && (
//                         <FormControl sx={{ width: "50%" }}>
//                           <InputLabel>Select Measures</InputLabel>
//                           <Select
//                             multiple
//                             value={agg.measures}
//                             onChange={(e) => handleAggregationMeasuresChange(index, e.target.value as string[])}
//                             renderValue={(selected) => selected.join(", ")}
//                           >
//                             {["avg", "min", "max", "count"].map((aggFunc) => (
//                               <MenuItem key={aggFunc} value={aggFunc}>
//                                 <Checkbox checked={agg.measures.includes(aggFunc)} />
//                                 <ListItemText primary={aggFunc} />
//                               </MenuItem>
//                             ))}
//                           </Select>
//                         </FormControl>
//                       )}
//                     </Box>
//                   ))}

//                   {/* Button to add another aggregation */}
//                   <Button
//                     variant="outlined"
//                     color="secondary"
//                     onClick={addAggregation}
//                     sx={{ mt: 2 }}
//                   >
//                     Add Another Column for Aggregation
//                   </Button>
//                 </Grid>
//               </Grid>

//               {/* Submit Button */}
//               <Box sx={{ textAlign: "right", mt: 3 }}>
//                 <Button variant="contained" color="primary" type="submit">
//                   Fetch Aggregated Data
//                 </Button>
//               </Box>
//             </form>
//           </Box>
//         </Popover>
//       </Box>
//     </ThemeProvider>
//   );
// };

// export default GroupByAggregationForm;



import React, { useState } from "react";
import {
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Popover,
  Select,
  Typography,
  Tooltip,
  Badge,
  Checkbox,
  ListItemText,
} from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FilterListIcon from "@mui/icons-material/FilterList";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { createTheme, ThemeProvider } from "@mui/material";

interface IGroupByAggregationFormProps {
  columns: { field: string; headerName: string; type: string }[];
  groupBy: string[];
  aggregations: { [key: string]: string[] };
  onSubmit: (groupBy: string[], aggregations: { [key: string]: string[] }) => void;
  onClear: () => void; // Add onClear prop to handle clear action
}

const GroupByAggregationForm: React.FC<IGroupByAggregationFormProps> = ({
  columns,
  groupBy,
  aggregations,
  onSubmit,
  onClear // Receive onClear prop
}) => {
  const [selectedGroupBy, setSelectedGroupBy] = useState<string[]>(groupBy);
  const [aggregationList, setAggregationList] = useState<Array<{ column: string; measures: string[] }>>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const theme = createTheme({
    palette: {
      primary: { main: "#1976d2" },
      secondary: { main: "#dc004e" },
    },
    typography: {
      fontFamily: "Arial",
      h6: { fontWeight: 600 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: "20px" },
        },
      },
    },
  });

  const handleGroupByChange = (event: any) => {
    setSelectedGroupBy(event.target.value as string[]);
  };

  const addAggregation = () => {
    setAggregationList([...aggregationList, { column: "", measures: [] }]);
  };

  const handleAggregationColumnChange = (index: number, column: string) => {
    const updatedAggregationList = [...aggregationList];
    updatedAggregationList[index].column = column;
    setAggregationList(updatedAggregationList);
  };

  const handleAggregationMeasuresChange = (index: number, measures: string[]) => {
    const updatedAggregationList = [...aggregationList];
    updatedAggregationList[index].measures = measures;
    setAggregationList(updatedAggregationList);
  };

  const handleDeleteGroupBy = (group: string) => {
    const updatedGroupBy = selectedGroupBy.filter(item => item !== group);
    setSelectedGroupBy(updatedGroupBy);
  };

  const handleDeleteAggregation = (index: number) => {
    const updatedAggregationList = aggregationList.filter((_, i) => i !== index);
    setAggregationList(updatedAggregationList);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const selectedAggregations = aggregationList.reduce((acc, { column, measures }) => {
      if (column) {
        acc[column] = measures;
      }
      return acc;
    }, {} as { [key: string]: string[] });

    onSubmit(selectedGroupBy, selectedAggregations);
    handlePopoverClose(); // Close popover on submit
  };

  const handlePopoverOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  // Function to clear all selections
  const handleClearAll = () => {
    setSelectedGroupBy([]);
    setAggregationList([]);
    onClear(); // Call the onClear prop to notify parent
  };

  const open = Boolean(anchorEl);
  const id = open ? 'group-by-aggregation-popover' : undefined;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 2 }}>
        {/* Filter Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid #ccc`, mb: 2 }}>
          <Tooltip title="Open Group By and Aggregation Tool">
            <Button aria-describedby={id} variant="text" onClick={handlePopoverOpen} size="small">
              <FilterListIcon />
              <Typography sx={{ ml: 1 }}>Group By & Aggregations</Typography>
            </Button>
          </Tooltip>
          {selectedGroupBy.length > 0 && (
            <Badge color="secondary" badgeContent={selectedGroupBy.length} sx={{ ml: 2 }}>
              <FilterAltIcon color="primary" />
            </Badge>
          )}
        </Box>

        {/* Popover for the Group By and Aggregation Form */}
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Box sx={{ p: 2, width: '400px' }}>
            {/* Display selected Group By items */}
            <Box mb={2}>
              <Typography variant="h6">Selected Group By</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selectedGroupBy.map((group) => (
                  <Chip
                    key={group}
                    label={group}
                    onDelete={() => handleDeleteGroupBy(group)}
                    color="primary"
                  />
                ))}
              </Box>
            </Box>

            {/* Display selected Aggregations */}
            <Box mb={2}>
              <Typography variant="h6">Selected Aggregations</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {aggregationList.map((agg, index) => (
                  <Chip
                    key={index}
                    label={`${agg.column}: ${agg.measures.join(", ")}`}
                    onDelete={() => handleDeleteAggregation(index)}
                    color="secondary"
                  />
                ))}
              </Box>
            </Box>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Group By Section */}
                <Grid item xs={12}>
                  <Typography variant="h6">Group By</Typography>
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Group By Columns</InputLabel>
                    <Select
                      multiple
                      value={selectedGroupBy}
                      onChange={handleGroupByChange}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} />
                          ))}
                        </Box>
                      )}
                    >
                      {columns.map((column) => (
                        <MenuItem key={column.field} value={column.field}>
                          <Checkbox checked={selectedGroupBy.includes(column.field)} />
                          <ListItemText primary={column.headerName} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Aggregations Section */}
                <Grid item xs={12}>
                  <Typography variant="h6">Aggregations</Typography>
                  {aggregationList.map((agg, index) => (
                    <Box key={index} sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      {/* Select column */}
                      <FormControl sx={{ mr: 2, width: "40%" }}>
                        <InputLabel>Select Column</InputLabel>
                        <Select
                          value={agg.column}
                          onChange={(e) => handleAggregationColumnChange(index, e.target.value as string)}
                        >
                          {columns.map((column) => (
                            <MenuItem key={column.field} value={column.field}>
                              {column.headerName}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {/* Select measures */}
                      {agg.column && (
                        <FormControl sx={{ width: "50%" }}>
                          <InputLabel>Select Measures</InputLabel>
                          <Select
                            multiple
                            value={agg.measures}
                            onChange={(e) => handleAggregationMeasuresChange(index, e.target.value as string[])}
                            renderValue={(selected) => selected.join(", ")}
                          >
                            {["avg", "min", "max", "count"].map((aggFunc) => (
                              <MenuItem key={aggFunc} value={aggFunc}>
                                <Checkbox checked={agg.measures.includes(aggFunc)} />
                                <ListItemText primary={aggFunc} />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}

                      {/* Remove Aggregation Button */}
                      <Button onClick={() => handleDeleteAggregation(index)} color="error">
                        Remove
                      </Button>
                    </Box>
                  ))}
                  <Button onClick={addAggregation} variant="outlined">Add Aggregation</Button>
                </Grid>
              </Grid>

              {/* Clear All Button */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button onClick={handleClearAll} variant="outlined" color="warning">Clear All</Button>
                <Button type="submit" variant="contained">Submit</Button>
              </Box>
            </form>
          </Box>
        </Popover>
      </Box>
    </ThemeProvider>
  );
};

export default GroupByAggregationForm;
