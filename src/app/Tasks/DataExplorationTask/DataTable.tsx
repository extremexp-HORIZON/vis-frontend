
import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { Box, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import MinimizeIcon from '@mui/icons-material/Minimize';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import { grey } from '@mui/material/colors';
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
  // const [selectedRows, setSelectedRows] = React.useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);

  const handleToggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized); // Toggles maximization for the table
  };

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


  // const CustomToolbar = ({ onUpdateData, selectedRows, onResetData }) => {
   
  //   return (
  //     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 1 }}>
  //       <GridToolbar />
        
  //       {/* <Button
  //       variant="text"
  //       color="primary"
  //       onClick={() => onUpdateData(selectedRows)}
  //       // style={{ margin: '0 20px' }}
  //       size="small"

  //       >
  //         Show Selected
  //       </Button> */}
  //       {/* <Button
  //       variant="text"
  //       color="primary"
  //       onClick={onResetData}  // This uses the onResetData function passed as a prop
  //       // style={{ margin: '0 20px' }}
  //       size="small"
  //       >
  //         Reset View
  //       </Button> */}
  //    </Box>
  //   );
  // };
  
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
<IconButton onClick={handleToggleVisibility} size="large">
          {isVisible ? <MinimizeIcon /> : <MinimizeIcon />}
        </IconButton>
        <IconButton onClick={handleMaximize} size="large">
          <FullscreenIcon />
        </IconButton>
</Box>
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


