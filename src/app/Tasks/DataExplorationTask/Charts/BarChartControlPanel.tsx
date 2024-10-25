// // import React, { useState } from 'react';
// // import { Box, TextField, MenuItem, Chip, Button, createTheme, ThemeProvider } from '@mui/material';

// // interface BarChartControlPanelProps {
// //   originalColumns: Array<{ name: string; type: string }>;
// //   barGroupBy: string[];
// //   setBarGroupBy: (value: string[]) => void;
// //   barAggregation: { [key: string]: string[] };
// //   setBarAggregation: (value: { [key: string]: string[] }) => void;
// //   onFetchBarChartData: () => void;
// // }

// // const BarChartControlPanel: React.FC<BarChartControlPanelProps> = ({
// //   originalColumns,
// //   barGroupBy,
// //   setBarGroupBy,
// //   barAggregation,
// //   setBarAggregation,
// //   onFetchBarChartData,
// // }) => {
// //   const [selectedColumn, setSelectedColumn] = useState<string | null>(null); // State to hold the selected column

// //   const handleAggregationChange = (event: React.ChangeEvent<{ value: unknown }>) => {
// //     const value = event.target.value as string[]; // Get the selected aggregation rules
// //     if (!selectedColumn) return;

// //     setBarAggregation((prev) => ({
// //       ...prev,
// //       [selectedColumn]: value,
// //     }));
// //   };

// //   const handleGroupByChange = (selected: string[]) => {
// //     if (selected.includes('Not Group')) {
// //       setBarGroupBy([]); // Clear previous selections
// //     } else {
// //       setBarGroupBy(selected); // Update with selected values
// //     }
// //   };

// //   const getAggregationOptions = () => {
// //     if (!selectedColumn) return [];
    
// //     // Find the selected column in originalColumns
// //     const column = originalColumns.find(col => col.name === selectedColumn);
// //     if (!column) return [];

// //     // Return aggregation options based on column type
// //     return column.type === 'DOUBLE' || column.type === 'FLOAT' || column.type === 'INTEGER'
// //       ? ['avg', 'min', 'max', 'count'] 
// //       : ['count'];
// //   };

// //   const aggregationOptions = getAggregationOptions();
// //   const theme = createTheme({
// //     palette: {
// //       primary: {
// //         main: '#1976d2',
// //       },
// //       secondary: {
// //         main: '#dc004e',
// //       },
// //     },
// //     typography: {
// //       fontFamily: 'Arial',
// //       h6: {
// //         fontWeight: 600,
// //       },
// //    },
// //     components: {
// //       MuiButton: {
// //         styleOverrides: {
// //           root: {
// //             borderRadius: '20px',  // Example of button customization
// //           },
// //         },
// //       },
// //     },
// //   });
// //   return (
// //     <ThemeProvider theme={theme}>
// //     <Box sx={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
// //       <Box sx={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
// //         <TextField
// //           select
// //           label="Category"
// //           value={barGroupBy}
// //           variant="outlined"
// //           onChange={(e) => handleGroupByChange(Array.isArray(e.target.value) ? e.target.value : [])}

// //           SelectProps={{
// //             multiple: true,
// //             renderValue: (selected:any) => (
// //               <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
// //                 {(selected as string[]).map((value) => (
// //                   <Chip key={value} label={value} onDelete={() => handleGroupByChange(selected.filter((s: string) => s !== value))} />
// //                 ))}
// //               </Box>
// //             ),
// //             MenuProps: {
// //               PaperProps: {
// //                 style: {
// //                   maxHeight: 224,
// //                   width: 250,
// //                 },
// //               },
// //             },
// //           }}
// //           sx={{ width: '300px' }} // Set a fixed width for the Group By dropdown
// //         >
// //           <MenuItem value="Not Group">Not Group</MenuItem>
// //           {originalColumns.map((col) => (
// //             <MenuItem key={col.name} value={col.name}>
// //               {col.name}
// //             </MenuItem>
// //           ))}
// //         </TextField>

// //         <Box>
// //           <TextField
// //             select
// //             label="Value"
// //             value={selectedColumn}
// //             onChange={(e) => setSelectedColumn(e.target.value)}
// //             variant="outlined"
// //             SelectProps={{
// //               MenuProps: { PaperProps: { style: { maxHeight: 224, width: 250 } } }
// //             }}
// //             sx={{ width: '300px' }} // Set a fixed width for the Value dropdown
// //           >
// //             {originalColumns.map((col) => (
// //               <MenuItem key={col.name} value={col.name}>
// //                 {col.name}
// //               </MenuItem>
// //             ))}
// //           </TextField>
// //         </Box>

// //         {selectedColumn && (
// //           <Box >
// //             <TextField
// //               select
// //               label="Select Aggregations"
// //               value={barAggregation[selectedColumn] || []}
// //               onChange={handleAggregationChange}
// //               variant="outlined"
// //               SelectProps={{
// //                 multiple: true,
// //                 renderValue: (selected) => (
// //                   <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
// //                     {(selected as string[]).map((value) => (
// //                       <Chip key={value} label={value} onDelete={() => handleAggregationChange({ target: { value: (selected as string[]).filter(v => v !== value) } })} />
// //                     ))}
// //                   </Box>
// //                 ),
// //               }}
// //               sx={{ width: '300px' }} // Set a fixed width for the Aggregation dropdown
// //             >
// //               {aggregationOptions.map((rule) => (
// //                 <MenuItem key={rule} value={rule}>
// //                   {rule.charAt(0).toUpperCase() + rule.slice(1)} {/* Capitalize first letter */}
// //                 </MenuItem>
// //               ))}
// //             </TextField>
// //           </Box>
// //         )}
// //         <Button variant="contained" color="primary"  onClick={onFetchBarChartData}>
// //           Aggregate
// //         </Button>
// //       </Box>

// //     </Box>
// //     </ThemeProvider>
// //   );
// // };

// // export default BarChartControlPanel;




// import React, { useState } from "react"
// import {
//   Box,
//   TextField,
//   MenuItem,
//   Chip,
//   Button,
//   Select,
//   InputLabel,
//   FormControl,
//   createTheme,
//   ThemeProvider,
// } from "@mui/material"

// interface BarChartControlPanelProps {
//   originalColumns: Array<{ name: string; type: string }>
//   barGroupBy: string[]
//   setBarGroupBy: (value: string[]) => void
//   barAggregation: { [key: string]: string[] }
//   setBarAggregation: (value: { [key: string]: string[] }) => void
//   onFetchBarChartData: () => void
// }

// const BarChartControlPanel: React.FC<BarChartControlPanelProps> = ({
//   originalColumns,
//   barGroupBy,
//   setBarGroupBy,
//   barAggregation,
//   setBarAggregation,
//   onFetchBarChartData,
// }) => {
//   const [selectedColumn, setSelectedColumn] = useState<string | null>(null) // Selected column for aggregation

//   // Handler for updating aggregation rules for a column
//   const handleAggregationChange = (event: React.ChangeEvent<{ value: unknown }>) => {
//     const value = event.target.value as string[]
//     if (!selectedColumn) return
//     setBarAggregation((prev) => ({
//       ...prev,
//       [selectedColumn]: value,
//     }))
//   }

//   // Handler for setting group-by columns
//   const handleGroupByChange = (selected: string[]) => {
//     setBarGroupBy(selected.includes("Not Group") ? [] : selected)
//   }

//   // Determines aggregation options based on column type
//   const getAggregationOptions = () => {
//     if (!selectedColumn) return []
//     const column = originalColumns.find((col) => col.name === selectedColumn)
//     return column?.type === "DOUBLE" || column?.type === "FLOAT" || column?.type === "INTEGER"
//       ? ["avg", "min", "max", "count"]
//       : ["count"]
//   }

//   const aggregationOptions = getAggregationOptions()

//   // Custom theme
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
//         styleOverrides: { root: { borderRadius: "20px" } },
//       },
//     },
//   })

//   return (
//     <ThemeProvider theme={theme}>
//       <Box sx={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
//         <Box sx={{ display: "flex", gap: "1rem", alignItems: "center" }}>
//           {/* Group By Selection */}
//           <FormControl sx={{ width: "300px" }}>
//             <InputLabel>Category</InputLabel>
//             <Select
//               label="Category"
//               multiple
//               value={barGroupBy}
//               onChange={(e) => handleGroupByChange(e.target.value as string[])}
//               renderValue={(selected: any) => (
//                 <Box sx={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
//                   {selected.map((value: string) => (
//                     <Chip
//                       key={value}
//                       label={value}
//                       onDelete={() => handleGroupByChange(barGroupBy.filter((s) => s !== value))}
//                     />
//                   ))}
//                 </Box>
//               )}
//               MenuProps={{
//                 PaperProps: {
//                   style: { maxHeight: 224, width: 250 },
//                 },
//               }}
//             >
//               <MenuItem value="Not Group">Not Group</MenuItem>
//               {originalColumns.map((col) => (
//                 <MenuItem key={col.name} value={col.name}>
//                   {col.name}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>

//           {/* Value Selection */}
//           <FormControl sx={{ width: "300px" }}>
//             <InputLabel>Value</InputLabel>
//             <Select
//               label="Value"
//               value={selectedColumn || ""}
//               onChange={(e) => setSelectedColumn(e.target.value as string)}
//               MenuProps={{ PaperProps: { style: { maxHeight: 224, width: 250 } } }}
//             >
//               {originalColumns.map((col) => (
//                 <MenuItem key={col.name} value={col.name}>
//                   {col.name}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>

//           {/* Aggregation Selection */}
//           {selectedColumn && (
//             <FormControl sx={{ width: "300px" }}>
//               <InputLabel>Aggregations</InputLabel>
//               <Select
//                 label="Aggregations"
//                 multiple
//                 value={barAggregation[selectedColumn] || []}
//                 onChange={handleAggregationChange}
//                 renderValue={(selected: any) => (
//                   <Box sx={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
//                     {selected.map((value: string) => (
//                       <Chip
//                         key={value}
//                         label={value}
//                         onDelete={() =>
//                           handleAggregationChange({
//                             target: { value: (selected as string[]).filter((v) => v !== value) },
//                           } as any)
//                         }
//                       />
//                     ))}
//                   </Box>
//                 )}
//               >
//                 {aggregationOptions.map((rule) => (
//                   <MenuItem key={rule} value={rule}>
//                     {rule.charAt(0).toUpperCase() + rule.slice(1)}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           )}

//           {/* Fetch Data Button */}
//           <Button variant="contained" color="primary" onClick={onFetchBarChartData}>
//             Aggregate
//           </Button>
//         </Box>
//       </Box>
//     </ThemeProvider>
//   )
// }

// export default BarChartControlPanel


import React, { useState } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Chip,
  Button,
  Select,
  InputLabel,
  FormControl,
  createTheme,
  ThemeProvider,
  Typography,
} from "@mui/material";

interface BarChartControlPanelProps {
  originalColumns: Array<{ name: string; type: string }>;
  barGroupBy: string[];
  setBarGroupBy: (value: string[]) => void;
  barAggregation: { [key: string]: string[] };
  setBarAggregation: (value: { [key: string]: string[] }) => void;
  onFetchBarChartData: () => void;
}

const BarChartControlPanel: React.FC<BarChartControlPanelProps> = ({
  originalColumns,
  barGroupBy,
  setBarGroupBy,
  barAggregation,
  setBarAggregation,
  onFetchBarChartData,
}) => {
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null); // Selected column for aggregation

  // Handler for updating aggregation rules for a column
  const handleAggregationChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string[];
    if (!selectedColumn) return;
    setBarAggregation((prev) => ({
      ...prev,
      [selectedColumn]: value,
    }));
  };

  // Handler for setting group-by columns
  const handleGroupByChange = (selected: string[]) => {
    setBarGroupBy(selected.includes("Not Group") ? [] : selected);
  };

  // Determines aggregation options based on column type
  const getAggregationOptions = () => {
    if (!selectedColumn) return [];
    const column = originalColumns.find((col) => col.name === selectedColumn);
    return column?.type === "DOUBLE" || column?.type === "FLOAT" || column?.type === "INTEGER"
      ? ["avg", "min", "max", "count"]
      : ["count"];
  };

  const aggregationOptions = getAggregationOptions();

  // Custom theme
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
        styleOverrides: { root: { borderRadius: "20px" } },
      },
    },
  });

  // Function to remove a specific aggregation rule
  const handleRemoveAggregation = (column: string, rule: string) => {
    setBarAggregation((prev) => ({
      ...prev,
      [column]: prev[column].filter((r) => r !== rule),
    }));
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <Box sx={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {/* Group By Selection */}
          <FormControl sx={{ width: "300px" }}>
            <InputLabel>Category</InputLabel>
            <Select
              label="Category"
              multiple
              value={barGroupBy}
              onChange={(e) => handleGroupByChange(e.target.value as string[])}
              renderValue={(selected: any) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {selected.map((value: string) => (
                    <Chip
                      key={value}
                      label={value}
                      onDelete={() => handleGroupByChange(barGroupBy.filter((s) => s !== value))}
                    />
                  ))}
                </Box>
              )}
              MenuProps={{
                PaperProps: {
                  style: { maxHeight: 224, width: 250 },
                },
              }}
            >
              <MenuItem value="Not Group">Not Group</MenuItem>
              {originalColumns.map((col) => (
                <MenuItem key={col.name} value={col.name}>
                  {col.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Value Selection */}
          <FormControl sx={{ width: "300px" }}>
            <InputLabel>Value</InputLabel>
            <Select
              label="Value"
              value={selectedColumn || ""}
              onChange={(e) => setSelectedColumn(e.target.value as string)}
              MenuProps={{ PaperProps: { style: { maxHeight: 224, width: 250 } } }}
            >
              {originalColumns.map((col) => (
                <MenuItem key={col.name} value={col.name}>
                  {col.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Aggregation Selection */}
          {selectedColumn && (
            <FormControl sx={{ width: "300px" }}>
              <InputLabel>Aggregations</InputLabel>
              <Select
                label="Aggregations"
                multiple
                value={barAggregation[selectedColumn] || []}
                onChange={handleAggregationChange}
                renderValue={(selected: any) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {selected.map((value: string) => (
                      <Chip
                        key={value}
                        label={value}
                        onDelete={() =>
                          handleAggregationChange({
                            target: { value: (selected as string[]).filter((v) => v !== value) },
                          } as any)
                        }
                      />
                    ))}
                  </Box>
                )}
              >
                {aggregationOptions.map((rule) => (
                  <MenuItem key={rule} value={rule}>
                    {rule.charAt(0).toUpperCase() + rule.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Fetch Data Button */}
          <Button variant="contained" color="primary" onClick={onFetchBarChartData}>
            Aggregate
          </Button>
        </Box>

        {/* Display selected aggregations with chips */}
        <Box sx={{ marginTop: "1rem" }}>
          <Typography variant="h6">Selected Aggregations:</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {Object.keys(barAggregation).map((column) =>
              barAggregation[column].map((rule) => (
                <Chip
                  key={`${column}-${rule}`}
                  label={`${column}: ${rule}`}
                  onDelete={() => handleRemoveAggregation(column, rule)}
                />
              ))
            )}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default BarChartControlPanel;
