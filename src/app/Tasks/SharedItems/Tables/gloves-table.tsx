import React from "react";
import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";
import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material";

interface DataObject {
  [key: string]: {
    index: number;
    values: string[];
    colour: string | null;
  };
}

interface EffCostActions {
  [key: string]: {
    eff: number;
    cost: number;
  };
}

interface DataTableProps {
  title: string;
  data: DataObject;
  eff_cost_actions?: EffCostActions;
}

const GlovesTable: React.FC<DataTableProps> = ({ title, data, eff_cost_actions }) => {
  // Extract the keys of the data object
  const keys = Object.keys(data);

  // Create rows dynamically, including effectiveness and cost if available
  const rows: GridRowsProp = data[keys[0]].values.map((_, index) => {
    const row: { id: number; [key: string]: string | number } = { id: index + 1 }; // Each row needs a unique ID
    keys.forEach((key) => {
      row[key] = data[key].values[index];
    });

    // Merge eff_cost_actions data if available
    if (eff_cost_actions && eff_cost_actions[index + 1]) {
      row["eff"] = (eff_cost_actions[index + 1].eff * 100).toFixed(2); // Effectiveness as percentage
      row["cost"] = eff_cost_actions[index + 1].cost.toFixed(2); // Cost
    }

    return row;
  });

  // Create columns dynamically
  const columns: GridColDef[] = [
    { field: "id", headerName: "Action ID", flex: 0.5, minWidth: 100 }, // Add ID as the first column
    { field: "eff", headerName: "Effectiveness (%)", flex: 1, minWidth: 150 },
    { field: "cost", headerName: "Cost", flex: 1, minWidth: 100 },
    ...keys.map((key) => ({
      field: key,
      headerName: key.replace(/_/g, " "), // Format header names for better readability
      flex: 1,
      minWidth:150,
      renderCell: (params) => {
        const value = params.value;
        const numValue = parseFloat(value);

        // Check if the value is positive or negative to decide the arrow color and orientation
        const isPositive = !isNaN(numValue) && numValue > 0;
        const isNegative = !isNaN(numValue) && numValue < 0;

        return (
          <Box display="flex" alignItems="center">
            <Typography variant="body2">{value}</Typography>
            {isPositive && <ArrowDropUp style={{ color: "green" }} />}
            {isNegative && <ArrowDropDown style={{ color: "red" }} />}
          </Box>
        );
      },
    })),
    
  ];

  return (
    <Box>
      {/* Title */}
      <Box display="flex" alignItems="center" mb={2}>
        <Typography variant="h6" sx={{ fontWeight: "bold", padding: 1 }}>
          {title}
        </Typography>
      </Box>

      {/* DataGrid */}
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        disableSelectionOnClick
        autoHeight
      />
    </Box>
  );
};

export default GlovesTable;
