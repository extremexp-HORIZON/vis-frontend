import React, { useState } from 'react';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, OutlinedInput, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, SelectChangeEvent } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

interface ScatterControlsProps {
    selectedColumns: string[];
    handleChange: (event: SelectChangeEvent<string[]>) => void;
    selectableColumns: { field: string; headerName: string }[];
    setShowStatistics: (showStatistics: boolean) => void;
    showStatistics: boolean;
    handleReset: () => void;
    zoomable: 'yes' | 'no';
    setZoomable: (zoomable: 'yes' | 'no') => void;
}

const ScatterControls: React.FC<ScatterControlsProps> = ({
    selectedColumns, handleChange, selectableColumns,
     showStatistics, handleReset, setShowStatistics,
     zoomable,setZoomable
}) => {
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleOpenDialog = () => {
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    const handleSelect = (value: string) => {
        handleChange({ target: { value: [...selectedColumns, value] } } as any);
    };

    const handleChipDelete = (value: string) => {
        handleChange({ target: { value: selectedColumns.filter(col => col !== value) } } as any);
    };

    return (
        <Box sx={{ width: "99%", px: 1, py:2 }}>
            <IconButton onClick={handleOpenDialog} aria-label="toggle-select" size="small">
                <MenuIcon />
            </IconButton>

            <Dialog open={dialogOpen} onClose={handleCloseDialog}>
                <DialogTitle>Select Columns</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth>
                        {/* <InputLabel id="select-columns-label"></InputLabel> */}
                        <Select
                            labelId="select-columns-label"
                            multiple
                            value={selectedColumns}
                            onChange={(event) => handleChange(event as any)}
                            input={<OutlinedInput id="select-columns" label="" />}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 224,
                                        width: 250,
                                    },
                                },
                            }}
                            renderValue={(selected) => 'Select Columns'}
                        >
                            {selectableColumns.map((column) => (
                                <MenuItem key={column.field} value={column.field}>
                                    {column.headerName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                        {selectedColumns.map((value) => (
                            <Chip key={value} label={value} onDelete={() => handleChipDelete(value)} />
                        ))}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Close</Button>
                </DialogActions>
            </Dialog>
            <Button
                variant="text"
                onClick={handleReset}
                sx={{ ml: 2 }}
                size="small"
            >
                Reset View
            </Button>
            <Button
                variant="text"
                onClick={() => setShowStatistics(!showStatistics)}
                sx={{ ml: 2 }}
                size="small"

            >
                {showStatistics ? 'Hide Statistics' : 'Show Statistics'}
            </Button>
            <Button
                variant={zoomable === 'no' ? 'contained' : 'outlined'}
                onClick={() => setZoomable(zoomable === 'no' ? 'yes' : 'no')}
                color="primary"
                sx={{ ml: 1 }}
                size="small"
            >
                Brush
            </Button>
        </Box>
    );
};

export default ScatterControls;


// import React, { useState } from 'react';
// import { Box, Button, FormControl, InputLabel, MenuItem, Select, OutlinedInput, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, Switch } from '@mui/material';
// import MenuIcon from '@mui/icons-material/Menu';

// interface ScatterControlsProps {
//   selectedColumns: string[];
//   handleChange: (event: React.ChangeEvent<{ value: string[] }>) => void;
//   selectableColumns: { field: string; headerName: string }[];
//   setShowStatistics: (showStatistics: boolean) => void;
//   showStatistics: boolean;
//   handleReset: () => void;
//   zoomable: 'yes' | 'no';
//   setZoomable: (zoomable: 'yes' | 'no') => void;
//   setColorColumn: (column: string | null) => void;
//   colorColumn: string | null;
//   setSizeColumn: (column: string | null) => void;
//   sizeColumn: string | null;
//   setAddRegression: (add: boolean) => void;
//   addRegression: boolean;
// }

// const ScatterControls: React.FC<ScatterControlsProps> = ({
//   selectedColumns, handleChange, selectableColumns, showStatistics, handleReset, setShowStatistics,
//   zoomable, setZoomable, setColorColumn, colorColumn, setSizeColumn, sizeColumn, setAddRegression, addRegression
// }) => {
//   const [dialogOpen, setDialogOpen] = useState(false);

//   const handleOpenDialog = () => {
//     setDialogOpen(true);
//   };

//   const handleCloseDialog = () => {
//     setDialogOpen(false);
//   };

//   const handleSelect = (value: string) => {
//     handleChange({ target: { value: [...selectedColumns, value] } } as any);
//   };

//   const handleChipDelete = (value: string) => {
//     handleChange({ target: { value: selectedColumns.filter(col => col !== value) } } as any);
//   };

//   return (
//     <Box sx={{ width: "99%", px: 1, py: 2 }}>
//       <IconButton onClick={handleOpenDialog} aria-label="toggle-select" size="small">
//         <MenuIcon />
//       </IconButton>

//       <Dialog open={dialogOpen} onClose={handleCloseDialog}>
//         <DialogTitle>Select Columns</DialogTitle>
//         <DialogContent>
//           <FormControl fullWidth>
//             <Select
//               labelId="select-columns-label"
//               multiple
//               value={selectedColumns}
//               onChange={(event) => handleChange(event as any)}
//               input={<OutlinedInput id="select-columns" label="" />}
//               MenuProps={{
//                 PaperProps: {
//                   style: {
//                     maxHeight: 224,
//                     width: 250,
//                   },
//                 },
//               }}
//               renderValue={(selected) => 'Select Columns'}
//             >
//               {selectableColumns.map((column) => (
//                 <MenuItem key={column.field} value={column.field}>
//                   {column.headerName}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//           <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
//             {selectedColumns.map((value) => (
//               <Chip key={value} label={value} onDelete={() => handleChipDelete(value)} />
//             ))}
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseDialog}>Close</Button>
//         </DialogActions>
//       </Dialog>
//       <FormControl fullWidth sx={{ mt: 1 }}>
//         <InputLabel id="color-column-label">Color Column</InputLabel>
//         <Select
//           labelId="color-column-label"
//           value={colorColumn || ''}
//           onChange={(event) => setColorColumn(event.target.value || null)}
//           input={<OutlinedInput id="color-column" label="Color Column" />}
//         >
//           <MenuItem value=""><em>None</em></MenuItem>
//           {selectableColumns.map((column) => (
//             <MenuItem key={column.field} value={column.field}>
//               {column.headerName}
//             </MenuItem>
//           ))}
//         </Select>
//       </FormControl>
//       <FormControl fullWidth sx={{ mt: 1 }}>
//         <InputLabel id="size-column-label">Size Column</InputLabel>
//         <Select
//           labelId="size-column-label"
//           value={sizeColumn || ''}
//           onChange={(event) => setSizeColumn(event.target.value || null)}
//           input={<OutlinedInput id="size-column" label="Size Column" />}
//         >
//           <MenuItem value=""><em>None</em></MenuItem>
//           {selectableColumns.map((column) => (
//             <MenuItem key={column.field} value={column.field}>
//               {column.headerName}
//             </MenuItem>
//           ))}
//         </Select>
//       </FormControl>
//       <FormControlLabel
//         control={<Switch checked={addRegression} onChange={(event) => setAddRegression(event.target.checked)} />}
//         label="Add Regression Line"
//       />
//       <Button
//         variant="text"
//         onClick={handleReset}
//         sx={{ mt: 2 }}
//         size="small"
//       >
//         Reset View
//       </Button>
//       <Button
//         variant="text"
//         onClick={() => setShowStatistics(!showStatistics)}
//         sx={{ mt: 2 }}
//       >
//         {showStatistics ? 'Hide Statistics' : 'Show Statistics'}
//       </Button>
//       <Button
//         variant={zoomable === 'yes' ? 'contained' : 'outlined'}
//         onClick={() => setZoomable(zoomable === 'yes' ? 'no' : 'yes')}
//         color="primary"
//         sx={{ mt: 2 }}
//         size="small"
//       >
//         Zoomable
//       </Button>
//     </Box>
//   );
// };

// export default ScatterControls;

