import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridToolbar, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton } from '@mui/x-data-grid';
import { Box, Paper, Button } from '@mui/material';

interface DataTableProps {
  data: any[];
  columns: GridColDef[];
  selectedColumns: string[];
  datetimeColumn: string;
}

const DataTable: React.FC<DataTableProps> = ({ data, columns, selectedColumns, datetimeColumn }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showAllColumns, setShowAllColumns] = useState(true);

  const tableStyle = {
    height: isMaximized ? '90vh' : isVisible ? 400 : '50px',
    width: '100%'
  };

  useEffect(() => {
    console.log('Data:', data);
  }, [data]);

  useEffect(() => {
    console.log('Columns:', columns);
  }, [columns]);

  // const CustomToolbar = () => {
  //   const toggleColumns = () => {
  //     setShowAllColumns(!showAllColumns);
  //   };

  //   return (
  //     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 1 }}>
  //       <GridToolbar />
  //       <Button onClick={toggleColumns} variant="text" color="primary" size="small">
  //         {showAllColumns ? 'Show Selected Columns' : 'Show All Columns'}
  //       </Button>
  //     </Box>
  //   );
  // };

  const rows = data.map((row, index) => ({
    id: row[datetimeColumn] ?? index, // Use index as fallback if datetimeColumn is null or undefined
    ...row,
  }));

  return (
    <Paper className="Category-Item" sx={{
      borderRadius: 2,
      width: "inherit",
      display: "flex",
      flexDirection: "column",
      rowGap: 0,
      minWidth: "300px",
      height: "100%",
    }}>
      {isVisible && (
        <Box sx={{ ...tableStyle }}>
          <DataGrid
            rows={rows}
            columns={
              showAllColumns
                ? columns
                : [ // Only show datetimeColumn and selected columns
                    ...columns.filter(col => col.field === datetimeColumn),
                    ...columns.filter(col => selectedColumns.includes(col.field))
                  ]
            }
            slots={{
              toolbar: CustomToolbar,
            }}
          />
        </Box>
      )}
    </Paper>
  );
};

export default DataTable;

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton slotProps={{
         
          button: { variant: 'outlined' },
        }} />
      {/* <GridToolbarFilterButton /> */}
      {/* <GridToolbarDensitySelector
        slotProps={{ tooltip: { title: 'Change density' } }}
      /> */}
      {/* <Box sx={{ flexGrow: 1 }} /> */}
      <GridToolbarExport
        slotProps={{
          tooltip: { title: 'Export data' },
          button: { variant: 'outlined' },
        }}
      />
    </GridToolbarContainer>
  );
}