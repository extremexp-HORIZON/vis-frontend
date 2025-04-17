import { RootState, useAppDispatch, useAppSelector } from "../../../store/store"
import WorkflowParameterDistribution from "./workflow-parameter-distribution"
import { Box, IconButton, Paper, Tooltip, Typography } from "@mui/material"
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded'
import { setSelectedTab, setWorkflowsTable, toggleWorkflowSelection } from "../../../store/slices/monitorPageSlice"

import theme from "../../../mui-theme"
import { useNavigate, useParams } from "react-router-dom"
import { IRun } from "../../../shared/models/experiment/run.model"


const  WorkflowParameter = () => {
    const { workflows } = useAppSelector((state: RootState) => state.progressPage)
    const { tab } = useAppSelector(state => state.workflowPage)
    const selectedParam = tab?.dataTaskTable.selectedItem?.data
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const {experimentId} = useParams()

    const filteredWorkflows = workflows.data?.filter(w => w.status === "COMPLETED").filter(w => w.params.find(param => 
        param.name === selectedParam.name && param.value === selectedParam.value))
    
    const handleOpenComparison = (filteredWorkflows: IRun[]) => {
    
        filteredWorkflows.forEach(workflow => {
            dispatch(toggleWorkflowSelection(workflow.id))
        })
        const workflowIds = filteredWorkflows?.map(workflow => workflow.id);

        dispatch(setWorkflowsTable({ selectedWorkflows: workflowIds }))
        dispatch(setSelectedTab(1))
        navigate(`/${experimentId}/monitoring`)
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