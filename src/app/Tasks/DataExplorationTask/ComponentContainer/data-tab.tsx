import { Box } from "@mui/material";
import DatasetTable from "../DataTable/dataset-table";
import { RootState, useAppSelector } from "../../../../store/store";
import DataExplorationComponent from "./DataExplorationComponent";
import { useSearchParams } from "react-router-dom";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded"
import InfoMessage from "../../../../shared/components/InfoMessage"


const DataTab = () => {
    const { tab } = useAppSelector((state: RootState) => state.workflowPage)
    const [searchParams] = useSearchParams()
    const task = searchParams.get("task")

    const dataAssets = !task ? (
        tab?.workflowConfiguration.dataAssets
      ) : (
        tab?.workflowConfiguration.dataAssets?.filter(asset => asset.task === task)
      )
    
      if (!dataAssets?.length) (
        <InfoMessage 
            message="No data assets available."
            type="info"
            icon={<ReportProblemRoundedIcon sx={{ fontSize: 40, color: "info.main" }} />}
            fullHeight
        />
      )

    return (
        <Box sx={{ display: "flex",flexDirection:"row", gap: 2, height: "100%"}}>
            <Box sx={{width: "25%", height: "99%"}}>
                {tab && <DatasetTable />}
            </Box>
            <Box sx={{width: "75%", height: "99%"}}>
                <DataExplorationComponent/>
            </Box>
        </Box>
    )
}

export default DataTab;