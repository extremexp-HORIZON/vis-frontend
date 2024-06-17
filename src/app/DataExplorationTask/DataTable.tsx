
import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { Box, Button, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import MinimizeIcon from '@mui/icons-material/Minimize';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import { grey } from '@mui/material/colors';
import { VegaLite } from 'react-vega';
import InfoIcon from "@mui/icons-material/Info"



interface DataTableProps {
  data: any[];
  columns: GridColDef[];
  onUpdateData: (newData: any[]) => void;
  onResetData: () => void;  // Add this line

}


const DataTable: React.FC<DataTableProps> = ({ data, columns,onUpdateData,onResetData }) => {
  const rows = data.map((row, index) => ({
    id: index + 1,
    ...row,
  }));
  const [selectedRows, setSelectedRows] = React.useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);

  const handleMinimize = () => {
    setIsVisible(!isVisible); // Toggles visibility
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized); // Toggles maximization for the table
  };

  const tableStyle = isMaximized ? { height: '90vh', width: '100%' } : { height: 400, width: '99%' };
  useEffect(() => {
    console.log('Data:', data); // Log the current state of data
  }, [data]);

  useEffect(() => {
    console.log('Columns:', columns); // Log the current state of columns
  }, [columns]);

  if (!isVisible) return <IconButton onClick={handleMinimize}><MinimizeIcon /></IconButton>;

  const CustomToolbar = ({ onUpdateData, selectedRows, onResetData }) => {
   
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 1 }}>
        <GridToolbar />
        
        {/* <Button
        variant="text"
        color="primary"
        onClick={() => onUpdateData(selectedRows)}
        // style={{ margin: '0 20px' }}
        size="small"

        >
          Show Selected
        </Button> */}
        {/* <Button
        variant="text"
        color="primary"
        onClick={onResetData}  // This uses the onResetData function passed as a prop
        // style={{ margin: '0 20px' }}
        size="small"
        >
          Reset View
        </Button> */}
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

<Box sx={{ px: 1.5, py: 0.5, display: "flex", alignItems: "center", borderBottom: `1px solid ${grey[400]}` }}>


    <Typography fontSize={"1rem"} fontWeight={600}>
        Dataset Viewer
    </Typography>
    <Box sx={{ flex: 1 }} />

<Tooltip title={"Description not available"}>
  <IconButton>
    <InfoIcon />
  </IconButton>
</Tooltip>
<IconButton onClick={handleMinimize} size="large">
        <MinimizeIcon />
      </IconButton>
      <IconButton onClick={handleMaximize} size="large">
        {isMaximized ? <FullscreenIcon /> : <FullscreenIcon />}
      </IconButton>
</Box>
{isVisible && (
<Box sx={{...tableStyle  }}>



      <DataGrid
        rows={rows}
        columns={columns}
        // checkboxSelection
        slots={{
          toolbar: () => <CustomToolbar onUpdateData={onUpdateData} selectedRows={selectedRows} onResetData={onResetData}  // Pass the reset function as a prop
          />
        }}
        onRowSelectionModelChange={(ids) => {
          const selectedIDs = new Set(ids);
          const selectedRows = rows.filter((row) =>
            selectedIDs.has(row.id),
          );
          setSelectedRows(selectedRows);
        }}
        {...rows}
      />
    </Box>
)}

    </Paper>
  );

};

export default DataTable;