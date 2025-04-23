import type { RootState} from "../../../store/store";
import { useAppSelector } from "../../../store/store"
import WorkflowParameterDistribution from "./workflow-parameter-distribution"
import {IconButton, Paper, Tooltip, Typography } from "@mui/material"
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded'

import theme from "../../../mui-theme"
import { useParams } from "react-router-dom"
import type { IRun } from "../../../shared/models/experiment/run.model"
import { setCache } from "../../../shared/utils/localStorageCache"


const  WorkflowParameter = () => {
    const { workflows } = useAppSelector((state: RootState) => state.progressPage)
    const { tab } = useAppSelector(state => state.workflowPage)
    const selectedParam = tab?.dataTaskTable.selectedItem?.data
    const {experimentId} = useParams()

    const filteredWorkflows = workflows.data?.filter(w => w.status !== "SCHEDULED").filter(w => w.params.find(param => 
        param.name === selectedParam.name && param.value === selectedParam.value))
    
    const handleOpenComparison = (filteredWorkflows: IRun[]) => {
    
        const workflowIds = filteredWorkflows?.map(workflow => workflow.id);
        const compareKey = `compare-${Date.now()}`
        setCache(compareKey, { workflowIds }, 1 * 60 * 1000);

        window.open(`/${experimentId}/monitoring?tab=1&compareId=${compareKey}`, "_blank");
    }
    
    return (
        <>
            <Paper sx={{mb:1, display: "flex", flexDirection: "row", alignItems: "center"}}>
                {
                    filteredWorkflows.length > 1 ? (
                        <Typography variant="subtitle1">
                            This workflow uses "{selectedParam.name}: {selectedParam.value}". In total {filteredWorkflows.length} workflows are using this configuration.
                        </Typography>
                    ) : (
                        <Typography variant="subtitle1">
                            This workflow uses "{selectedParam.name}: {selectedParam.value}". In total {filteredWorkflows.length} workflow is using this configuration.
                        </Typography>
                    )
                }
                <Tooltip title="compare" placement="right">
                  <IconButton onClick={() => handleOpenComparison(filteredWorkflows)}>
                    <CompareArrowsRoundedIcon style={{color: theme.palette.primary.main }} />
                  </IconButton>
                </Tooltip>
            </Paper>
            <WorkflowParameterDistribution />            
        </>
    )
}

export default WorkflowParameter