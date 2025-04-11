import { Box } from "@mui/material";
import DataTable from "../DataTable/data-table";
import { RootState, useAppSelector } from "../../../../store/store";


const DataTab = () => {
    const { tab } = useAppSelector((state: RootState) => state.workflowPage) 
    return (
        <Box sx={{ display: "flex",flexDirection:"row", gap: 2, height: "100%"}}>
            <Box sx={{width: "20%", height: "99%"}}>
                {tab && <DataTable />}
            </Box>
            <Box sx={{width: "80%"}}>
            </Box>
        </Box>
    )
}

export default DataTab;