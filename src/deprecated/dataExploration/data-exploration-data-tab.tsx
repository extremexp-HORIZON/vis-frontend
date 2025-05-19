import { Box, Paper } from "@mui/material";
import DatasetTreeView from "./dataset-tree-view";
import type { RootState} from "../../store/store";
import { useAppSelector } from "../../store/store";
import DataExplorationComponent from "../../app/Tasks/DataExplorationTask/ComponentContainer/DataExplorationComponent";
import { useSearchParams } from "react-router-dom";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded"
import InfoMessage from "../../shared/components/InfoMessage"


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
            <Paper elevation={2} sx={{width: "20%", height: "99%", overflow: "auto"}}>
                {tab && <DatasetTreeView />}
            </Paper>
            <Paper elevation={2} sx={{width: "99%", height: "99%"}}>
                <DataExplorationComponent/>
            </Paper>
        </Box>
    )
}

export default DataTab;