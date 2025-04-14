// ///////ORIGINAL
import React, { useEffect, useState } from 'react';
import {
  DataGrid, GridColDef, GridToolbar, GridToolbarColumnsButton, GridToolbarContainer,
  GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton, GridFilterModel
} from '@mui/x-data-grid';
import { Box, Paper, Button } from '@mui/material';

interface DataTableProps {
  data: any[];
  columns: any[];
  datetimeColumn: string;
  // onFilteredDataChange?: (filteredData: any[]) => void;  // New prop to notify filtered data
}

const DataTable: React.FC<DataTableProps> = ({ data, columns, datetimeColumn }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showAllColumns, setShowAllColumns] = useState(true);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });

  const tableStyle = {
    height: isMaximized ? '90vh' : isVisible ? 400 : '50px',
    width: '100%'
  };

  const CustomToolbar = () => {
    const toggleColumns = () => {
      setShowAllColumns(!showAllColumns);
    };

    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center  ', padding: 1 }}>
        <GridToolbarColumnsButton />
        <GridToolbarExport/>
        {/* <Button onClick={toggleColumns} variant="text" color="primary" size="small">
          {showAllColumns ? 'Show Selected Columns' : 'Show All Columns'}
        </Button> */}
      </Box>
    );
  };

  const rows = data.map((row, index) => ({
    id: row[datetimeColumn] ?? index, // Use index as fallback if datetimeColumn is null or undefined
    ...row,
  }));

  // Notify the parent component of the filtered data
  // const handleFilterChange = (filterModel: GridFilterModel) => {
  //   setFilterModel(filterModel);
  //   if (onFilteredDataChange) {
  //     const filteredRows = rows.filter((row) => {
  //       // Filter logic based on the filterModel
  //       return filterModel.items.every((filterItem) => {
  //         const fieldValue = row[filterItem.field];
  //         if (filterItem.operator === 'contains') {
  //           return fieldValue && fieldValue.includes(filterItem.value);
  //         }
  //         // Add more filtering logic if needed for other operators
  //         return true;
  //       });
  //     });
  //     onFilteredDataChange(filteredRows);
  //   }
  // };
  

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
              columns.map((col: any) => ({
                field: typeof col === 'string' ? col : (col as { name: string }).name,
                headerName: typeof col === 'string' ? col : (col as { name: string }).name,
                width: 200,
                type: (typeof col === 'string' ? 'string' : (col as { type: 'string' | 'number' | 'date' | 'boolean' }).type),
              }))
            }
            // filterModel={filterModel}
            // onFilterModelChange={handleFilterChange} // Capture filter changes
            slots={{
              toolbar: CustomToolbar,
            }}
            // paginationModel={{ page:1 ,pageSize: 5 }}
            
            
            // disableDensitySelector
            
            hideFooter
          />
        </Box>
      )}
    </Paper>
  );
};

export default DataTable;


















///////PLAY PLAY
// import React, {useState } from 'react';
// import {DataGrid } from '@mui/x-data-grid';
// import { Box, Paper} from '@mui/material';
// interface DataTableProps {
//   data: any[];
//   columns: any[];
//   datetimeColumn: string;
// }
// const DataTable: React.FC<DataTableProps> = ({ data, columns, datetimeColumn }) => {
//   const [isVisible, setIsVisible] = useState(true);
//   const [isMaximized, setIsMaximized] = useState(false);
//   const tableStyle = {
//     height: isMaximized ? '90vh' : isVisible ? 400 : '50px',
//     width: '100%'
//   };
//   const rows = data.map((row, index) => ({
//     id: row[datetimeColumn] ?? index, // Use index as fallback if datetimeColumn is null or undefined
//     ...row,
//   }));
//   return (
//     <Paper className="Category-Item" sx={{
//       borderRadius: 2,
//       width: "inherit",
//       display: "flex",
//       flexDirection: "column",
//       rowGap: 0,
//       minWidth: "300px",
//       height: "100%",
//     }}>
//       {isVisible && (
//         <Box sx={{ ...tableStyle }}>
//           <DataGrid
//             rows={rows}
//             columns={
//               columns.map((col: any) => ({
//                 field: typeof col === 'string' ? col : (col as { name: string }).name,
//                 headerName: typeof col === 'string' ? col : (col as { name: string }).name,
//                 width: 200,
//                 type: (typeof col === 'string' ? 'string' : (col as { type: 'string' | 'number' | 'date' | 'boolean' }).type),
//               }))
//             }
//           />
//         </Box>
//       )}
//     </Paper>
//   );
// };
// export default DataTable;













