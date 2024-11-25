import React, {useState } from 'react';
import { DataGrid, GridToolbarColumnsButton, GridToolbarExport, GridFilterModel} from '@mui/x-data-grid';
import { Box, Paper ,IconButton, Popper, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; // Import close icon

import { mean, std, min, max, } from 'mathjs'; // Use this library for numeric calculations
import { VisualColumn } from '../../../../shared/models/dataexploration.model';


interface DataTableProps {
  data: any;
  columns: VisualColumn[];
  datetimeColumn: string;
//   onFilteredDataChange?: (filteredData: any[]) => void;  // New prop to notify filtered data
}

const TableExpand: React.FC<DataTableProps> = ({ data, columns, datetimeColumn }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showAllColumns, setShowAllColumns] = useState(true);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [statistics, setStatistics] = useState<{ min: number; max: number; avg: number; std: number } | null>(null);
  const [columnType, setColumnType] = useState<string | null>(null);

  

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

  const rows = data.map((row: any, index: number) => ({
    id: row[datetimeColumn] ?? index, // Use index as fallback if datetimeColumn is null or undefined
    ...row,
  }));

  const calculateStatistics = (field: string) => {
    const columnData = rows.map((row: any) => row[field]).filter((value: any) => value !== undefined);
    return {
      min: min(columnData) as number,
      max: max(columnData) as number,
      avg: mean(columnData) as number,
      std: Number(std(columnData)) as number
    };
  };

  const handleCellClick = (params: any, event: React.MouseEvent<HTMLElement>) => {
    const columnField = params.field;
    const columnDefinition = columns.find((col) => col.name === columnField);
    const cellAnchor = event.currentTarget;

    if (columnDefinition?.type === 'DOUBLE' || columnDefinition?.type === 'FLOAT' || columnDefinition?.type === 'INTEGER') {
      setStatistics(calculateStatistics(columnField)); // Calculate statistics for numeric columns
      setColumnType(columnDefinition.type); // Store the column type
      setAnchorEl(cellAnchor);
    } else {
      setStatistics(null); // Clear statistics for non-numeric columns
      setColumnType(columnDefinition ? columnDefinition.type : "N/A");
      setAnchorEl(cellAnchor);
    }
  };

  // Function to close the popper
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Notify the parent component of the filtered data
//   const handleFilterChange = (filterModel: GridFilterModel) => {
//     setFilterModel(filterModel);
//     if (onFilteredDataChange) {
//       const filteredRows = rows.filter((row) => {
//         // Filter logic based on the filterModel
//         return filterModel.items.every((filterItem) => {
//           const fieldValue = row[filterItem.field];
//           if (filterItem.operator === 'contains') {
//             return fieldValue && fieldValue.includes(filterItem.value);
//           }
//           // Add more filtering logic if needed for other operators
//           return true;
//         });
//       });
//       onFilteredDataChange(filteredRows);
//     }
//   };
  

  return (
    <Paper className="Category-Item" sx={{
      borderRadius: 2,
      width: "inherit",
      display: "flex",
      flexDirection: "column",
      rowGap: 0,
      minWidth: "300px",
    }}>
      {isVisible && (
        <Box sx={{ ...tableStyle, overflowX: 'auto' }}> {/* Enable horizontal scrolling */}
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
            filterModel={filterModel}
            // onFilterModelChange={handleFilterChange} // Capture filter changes
            onCellClick={handleCellClick} // Handle cell click for statistics
            disableColumnMenu
            hideFooter
            disableColumnSelector

            slots={{
              toolbar: CustomToolbar,
            }}
          />
        </Box>
      )}
      <Popper
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        placement="bottom-start"
        style={{ zIndex: 1000, padding: "10px" }}
      >
        <Paper style={{ width: 300, padding: 10 }}>
          <IconButton
            onClick={handleClose}
            style={{ position: 'absolute', right: 10, top: 10 }}
          >
            <CloseIcon />
          </IconButton>
          {statistics ? (
            <>
              <Typography variant="subtitle1">
                Type: {columnType}
              </Typography>
              <DataGrid
                rows={[
                  {
                    id: 1,
                    min: statistics.min,
                    max: statistics.max,
                    avg: statistics.avg,
                    std: statistics.std
                  }
                ]}
                columns={[
                  { field: "min", headerName: "Min", width: 80 },
                  { field: "max", headerName: "Max", width: 80 },
                  { field: "avg", headerName: "Avg", width: 80 },
                  { field: "std", headerName: "Std", width: 80 }
                ]}
                // autoHeight
                hideFooter
                hideFooterSelectedRowCount
                hideFooterPagination
                disableColumnMenu
                disableColumnFilter
                disableColumnSorting
                disableColumnSelector
              />
            </>
          ) : (
            <Typography variant="subtitle1">
  Type: {columnType }
</Typography>
          )}
        </Paper>
      </Popper>

    </Paper>
  );
};

export default TableExpand;