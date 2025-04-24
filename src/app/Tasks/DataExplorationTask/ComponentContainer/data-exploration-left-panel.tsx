import { useAppSelector } from "../../../../store/store"
import ChartButtonGroup from "../ChartControls/data-exploration-chart-button-group"
import FilterBuilder from "./data-exploration-filter-builder"

import BarChartControlPanel from "../ChartControls/data-exploration-bar-control"
import { Box, Stack, Typography } from "@mui/material"
import ViewColumnIcon from "@mui/icons-material/ViewColumn"
import { grey } from "@mui/material/colors"
import FilterAltIcon from "@mui/icons-material/FilterAlt"
import ColumnsPanel from "./data-exploration-columns-panel"

const LeftPanel = () => {
  return (
    <Box sx={{ 
      display: 'flex',
      justifyContent: 'flex-end', // This pushes content to the right
      width: '100%'
    }}>
        <Stack direction="row" spacing={1}>
           <ColumnsPanel/>
           <FilterBuilder/>

        <ChartButtonGroup />

     
        </Stack>
    </Box>


  )
}

export default LeftPanel
