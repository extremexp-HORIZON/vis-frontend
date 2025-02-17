import LinearProgress from '@mui/material/LinearProgress';
import { useAppSelector } from "../../../store/store"
import { Box, Typography } from '@mui/material';
import type { RootState } from "../../../store/store"

export default function ProgressBar({workflowStatus, workflowId} : {workflowStatus : string, workflowId : string}) {
    const { workflows } = useAppSelector(
        (state: RootState) => state.progressPage,
    )
    let progressValue
    const workflow = workflows.data.find(workflow => workflow.workflowId === workflowId)
    if (workflowStatus === "completed" || workflowStatus === "failed") {
        progressValue = 100
    } else {
        if (workflow?.tasks === undefined) {
            progressValue = 0
        } else { 
            const completedTasks = workflow?.tasks.filter(task => task.end !== undefined).length
            progressValue = (completedTasks / workflow?.tasks.length) * 100
        }
    }
    const color = workflowStatus === "completed" ? "success" : workflowStatus === "running" ? "primary" : "error"
    return (
        <Box sx={{ display:"flex", alignItems:"center", justifyContent: "center", width:"100%", flexDirection:"column", height:"100%" }}>
            <Typography variant="body2">{workflowStatus}</Typography>
            <Box sx={{width:"100%"}}>
                <LinearProgress sx={{ borderRadius: 4}} color={color} value={progressValue} variant="determinate"/>
            </Box>
        </Box>
    )
}