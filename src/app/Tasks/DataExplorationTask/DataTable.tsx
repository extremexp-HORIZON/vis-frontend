
import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { Box, Paper } from '@mui/material';




interface DataTableProps {
  data: any[];
  columns: GridColDef[];
}


const DataTable: React.FC<DataTableProps> = ({ data, columns }) => {
  const rows = data.map((row, index) => ({
    id: index + 1,
    ...row,
  }));
  // const [selectedRows, setSelectedRows] = React.useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);

  

  const tableStyle = {
    height: isMaximized ? '90vh' : isVisible ? 400 : '50px', // Minimized height should be lesser
    width: '100%'
  };
    useEffect(() => {
    console.log('Data:', data); // Log the current state of data
  }, [data]);

  useEffect(() => {
    console.log('Columns:', columns); // Log the current state of columns
  }, [columns]);


  
  const CustomToolbar = () => {
   
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 1 }}>
        <GridToolbar />
     </Box>
    );
  };
  


 
  return (
    <Paper className="Category-Item"
    elevation={2}
    sx={{
      borderRadius: 2,
      width: "inherit",
      display: "flex",
      flexDirection: "column",
      rowGap: 0,
      minWidth: "300px",
      height: "100%",
    }}>

{isVisible && (
<Box sx={{...tableStyle  }}>



      <DataGrid
        rows={rows}
        columns={columns}
        // checkboxSelection
        slots={{
          toolbar: () => <CustomToolbar />
        }}
        onRowSelectionModelChange={(ids) => {
          const selectedIDs = new Set(ids);
          const selectedRows = rows.filter((row) =>
            selectedIDs.has(row.id),
          );
          // setSelectedRows([...selectedRows]);
        }}
        {...rows}
      />
    </Box>
)}
    </Paper>
  );
};
export default DataTable;


