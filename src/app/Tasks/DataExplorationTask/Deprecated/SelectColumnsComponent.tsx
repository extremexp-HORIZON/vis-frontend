// // // // import React from 'react';
// // // // import { Box, FormControl, InputLabel, Select, MenuItem, Chip, OutlinedInput, Typography } from '@mui/material';

// // // // const SelectColumnsComponent = ({ selectableColumns, selectedColumns, handleColumnChange }) => {
// // // //   return (
// // // //     <Box sx={{ p: 2 }}>
// // // //       <FormControl fullWidth>
// // // //         <InputLabel>Columns</InputLabel>
// // // //         <Select
// // // //           multiple
// // // //           value={selectedColumns}
// // // //           onChange={handleColumnChange}
// // // //           input={<OutlinedInput label="Columns" />}
// // // //           renderValue={(selected) => (
// // // //             <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
// // // //               {selected.map((value) => (
// // // //                 <Chip key={value} label={value} />
// // // //               ))}
// // // //             </Box>
// // // //           )}
// // // //         >
// // // //           {selectableColumns.map((column) => (
// // // //             <MenuItem key={column.field} value={column.field}>
// // // //               {column.headerName}
// // // //             </MenuItem>
// // // //           ))}
// // // //         </Select>
// // // //       </FormControl>
// // // //     </Box>
// // // //   );
// // // // };

// // // // export default SelectColumnsComponent;


// // // import React from 'react';
// // // import { Box, FormControl, InputLabel, Select, MenuItem, Chip, OutlinedInput, Grid, Typography } from '@mui/material';

// // // const SelectColumnsComponent = ({ selectableColumns, selectedColumns, handleColumnChange }) => {
// // //   return (
// // //     <Box sx={{ p: 2 }}>
// // //       <Typography variant="h6" sx={{ mb: 1 }}>Measures</Typography>
// // //       <FormControl fullWidth>
// // //         <InputLabel>Add Measure</InputLabel>
// // //         <Select
// // //           multiple
// // //           value={selectedColumns}
// // //           onChange={handleColumnChange}
// // //           MenuProps={{ PaperProps: { style: { maxHeight: 224, width: 250 } } }}

// // //           input={<OutlinedInput label="Add Measure" />}
// // //           renderValue={(selected) => (
// // //             <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
// // //               {selected.map((value) => (
// // //                 <Chip key={value} label={value} onDelete={() => handleColumnChange({ target: { value: selectedColumns.filter(col => col !== value) } })} />
// // //               ))}
// // //             </Box>
// // //           )}
// // //         >
// // //           {selectableColumns.map((column) => (
// // //             <MenuItem key={column.field} value={column.field}>
// // //               {column.headerName}
// // //             </MenuItem>
// // //           ))}
// // //         </Select>
// // //       </FormControl>
// // //     </Box>
// // //   );
// // // };

// // // export default SelectColumnsComponent;

// // import React from 'react';
// // import { Box, FormControl, InputLabel, Select,Button, MenuItem, Chip, OutlinedInput, Typography } from '@mui/material';
// // import { grey } from '@mui/material/colors';
// // import ClearIcon from '@mui/icons-material/Clear';
// // import FilterAltIcon from '@mui/icons-material/FilterAlt';
// // import ViewWeekIcon from '@mui/icons-material/ViewWeek';
// // const SelectColumnsComponent = ({ selectableColumns, selectedColumns, handleColumnChange }) => {
// //   const handleDelete = (value) => {
// //     handleColumnChange({ target: { value: selectedColumns.filter(col => col !== value) } });
// //   };

// //   return (
   
// //      <Box sx={{ p: 2 }}>
// //       <Box sx={{ px: 1.5, py: 0.5, display: "flex", alignItems: "center", borderBottom: `1px solid ${grey[400]}` }}>
           
// //             <ViewWeekIcon/>
// //             <Typography fontSize={"1rem"} fontWeight={600} sx={{ ml: 1 }}> {/* Add margin left for spacing */}
// //        Measures
// //     </Typography>
// //     </Box>
// //       <FormControl fullWidth>
// //         <InputLabel>Add Measure</InputLabel>
// //         <Select
// //           multiple
// //           value={[]}
// //           onChange={(e) => {
// //             const value = e.target.value;
// //             handleColumnChange({ target: { value: [...selectedColumns, ...value] } });
// //           }}
// //           MenuProps={{ PaperProps: { style: { maxHeight: 224, width: 250 } } }}
// //           input={<OutlinedInput label="Add Measure" />}
// //         >
// //           {selectableColumns.map((column) => (
// //             <MenuItem key={column.field} value={column.field}>
// //               {column.headerName}
// //             </MenuItem>
// //           ))}
// //         </Select>
// //       </FormControl>
// //       <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
// //         {selectedColumns.map((value) => (
// //           <Chip
// //             key={value}
// //             label={value}
// //             onDelete={() => handleDelete(value)}
// //             sx={{ margin: '2px' }}
// //           />
// //         ))}
// //       </Box>
// //     </Box>
// //   );
// // };

// // export default SelectColumnsComponent;



// import React from 'react';
// import { Box, FormControl, InputLabel, Select, MenuItem, Chip, OutlinedInput, Typography } from '@mui/material';
// import { grey } from '@mui/material/colors';

// import ViewWeekIcon from '@mui/icons-material/ViewWeek';

// const SelectColumnsComponent = ({ selectableColumns, selectedColumns, handleColumnChange }) => {
//   const handleDelete = (value: any) => {
//     handleColumnChange({ target: { value: selectedColumns.filter((col: any) => col !== value) } });
//   };

//   return (
//     <Box sx={{ p: 2 }}>
//       <Box sx={{ px: 1.5, py: 0.5, display: "flex", alignItems: "center", borderBottom: `1px solid ${grey[400]}` }}>
//         <ViewWeekIcon />
//         <Typography fontSize={"1rem"} fontWeight={600} sx={{ ml: 1 }}> {/* Add margin left for spacing */}
//           Measures
//         </Typography>
//       </Box>
//       <FormControl fullWidth>
//         <InputLabel>Add Measure</InputLabel>
//         <Select
//           multiple
//           value={[]}
//           onChange={(e) => {
//             const value = e.target.value;
//             handleColumnChange({ target: { value: [...selectedColumns, ...value] } });
//           }}
//           MenuProps={{ PaperProps: { style: { maxHeight: 224, width: 250 } } }}
//           input={<OutlinedInput label="Add Measure" />}
//         >
//           {selectableColumns
//             .filter((column: { field: any; }) => !selectedColumns.includes(column.field))
//             .map((column: { field: React.Key | readonly string[] | null | undefined; headerName: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }) => (
//               <MenuItem key={column.field} value={column.field}>
//                 {column.headerName}
//               </MenuItem>
//             ))}
//         </Select>
//       </FormControl>
//       <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
//         {selectedColumns.map((value: boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.Key | null | undefined) => (
//           <Chip
//             key={value}
//             label={value}
//             onDelete={() => handleDelete(value)}
//             sx={{ margin: '2px' }}
            
//           />
//         ))}
//       </Box>
//     </Box>
//   );
// };

// export default SelectColumnsComponent;


import React, { ChangeEvent } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Chip, OutlinedInput, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';

interface Column {
  field: string;
  headerName: string;
}

interface SelectColumnsComponentProps {
  selectableColumns: Column[];
  selectedColumns: string[];
  handleColumnChange: (event: ChangeEvent<{ value: unknown }>) => void;
}

const SelectColumnsComponent: React.FC<SelectColumnsComponentProps> = ({ selectableColumns, selectedColumns, handleColumnChange }) => {
  const handleDelete = (value: string) => {
    handleColumnChange({ target: { value: selectedColumns.filter(col => col !== value) } } as ChangeEvent<{ value: unknown }>);
  };

  return (
    <Box sx={{ p: 2 }}>
        <Box sx={{ px: 1.5, py: 0.5, display: "flex", alignItems: "center", borderBottom: `1px solid ${grey[400]}` }}>
        <ViewWeekIcon />
        <Typography fontSize={"1rem"} fontWeight={600} sx={{ ml: 1, textTransform:"none"}}>
        Measures

          </Typography>          
      </Box>
      <FormControl fullWidth>
        <InputLabel>Add Measure</InputLabel>
        <Select
          multiple
          value={[]}
          onChange={(e) => {
            const value = e.target.value as string[];
            handleColumnChange({ target: { value: [...selectedColumns, ...value] } } as ChangeEvent<{ value: unknown }>);
          }}
          MenuProps={{ PaperProps: { style: { maxHeight: 224, width: 250 } } }}
          input={<OutlinedInput label="Add Measure" />}
        >
          {selectableColumns
            .filter(column => !selectedColumns.includes(column.field))
            .map((column) => (
              <MenuItem key={column.field} value={column.field}>
                {column.headerName}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
        {selectedColumns.map((value) => (
          <Chip
            key={value}
            label={value}
            onDelete={() => handleDelete(value)}
            sx={{ margin: '2px' }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default SelectColumnsComponent;
